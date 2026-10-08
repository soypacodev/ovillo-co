// Qué hacer con cada evento de Stripe, separado de la red y de la base
// de datos para poder probarlo con dependencias falsas.
//
// Códigos de respuesta: 2xx cuando el evento queda resuelto (aunque sea
// ignorándolo) y 5xx cuando algo transitorio falla y conviene que Stripe
// lo reintente. Un pedido cobrado que no se puede servir (sin stock,
// importes que no cuadran) se reembolsa y se anota: reintentar no
// lo arreglaría.

import type Stripe from 'stripe';
import { lineasParaBaseDeDatos } from './recalculo';
import { deMetadatos, type DatosSesion } from './metadatos';
import { direccionParaBaseDeDatos, notaParaPedido } from './resumen';
import type { CodigoError } from './tipos';

export interface DatosRegistro {
  p_evento_stripe: string;
  p_sesion_stripe: string;
  p_pago_stripe: string | null;
  p_importe_cobrado: number;
  p_email: string;
  p_lineas: ReturnType<typeof lineasParaBaseDeDatos>;
  p_cupon: string | null;
  p_envio: string;
  p_nombre: string | null;
  p_telefono: string | null;
  p_direccion: ReturnType<typeof direccionParaBaseDeDatos>;
  p_nota: string | null;
  p_usuario: string | null;
}

export type ResultadoRegistro =
  | { ok: true; pedidoId: string }
  /** El pedido no se puede crear por una regla de negocio: hay que devolver el dinero. */
  | { ok: false; permanente: true; codigo: CodigoError | string }
  | { ok: false; permanente: false; error: string };

export interface DependenciasWebhook {
  /** false cuando no hay base de datos: el pedido vive solo en Stripe. */
  hayBaseDeDatos: boolean;
  yaProcesado: (eventoId: string) => Promise<boolean>;
  registrar: (datos: DatosRegistro) => Promise<ResultadoRegistro>;
  reembolsar: (pagoId: string, sesionId: string, motivo: string) => Promise<void>;
  anotar: (eventoId: string, tipo: string) => Promise<void>;
  /** Marca como reembolsado el pedido de ese pago; devuelve cuántos cambia. */
  marcarReembolsado: (pagoId: string) => Promise<number>;
}

export interface RespuestaWebhook {
  estado: number;
  mensaje: string;
}

type EventoDeCobro = Stripe.CheckoutSessionCompletedEvent | Stripe.CheckoutSessionAsyncPaymentSucceededEvent;

const esEventoDeCobro = (evento: Stripe.Event): evento is EventoDeCobro =>
  evento.type === 'checkout.session.completed' || evento.type === 'checkout.session.async_payment_succeeded';

function datosRegistro(evento: Stripe.Event, sesion: Stripe.Checkout.Session, datos: DatosSesion): DatosRegistro {
  const pago = typeof sesion.payment_intent === 'string' ? sesion.payment_intent : (sesion.payment_intent?.id ?? null);
  return {
    p_evento_stripe: evento.id,
    p_sesion_stripe: sesion.id,
    p_pago_stripe: pago,
    p_importe_cobrado: sesion.amount_total ?? 0,
    p_email: sesion.customer_details?.email ?? sesion.customer_email ?? '',
    p_lineas: lineasParaBaseDeDatos(datos.lineas),
    p_cupon: datos.cupon,
    p_envio: datos.envio,
    p_nombre: datos.nombre || null,
    p_telefono: datos.telefono || null,
    p_direccion: direccionParaBaseDeDatos(datos.nombre, datos.telefono, datos.direccion),
    p_nota: notaParaPedido(datos.regalo, datos.dedicatoria, datos.nota),
    p_usuario: datos.usuario ?? null,
  };
}

/** Un reembolso hecho desde el panel de Stripe también se ve en el panel
 *  de la tienda. Los parciales no cambian el estado: el pedido sigue en pie. */
async function procesarReembolso(cargo: Stripe.Charge, deps: DependenciasWebhook): Promise<RespuestaWebhook> {
  if (!cargo.refunded) return { estado: 200, mensaje: 'Reembolso parcial: el pedido no cambia.' };
  const pago = typeof cargo.payment_intent === 'string' ? cargo.payment_intent : (cargo.payment_intent?.id ?? null);
  if (!pago || !deps.hayBaseDeDatos) return { estado: 200, mensaje: 'Reembolso sin pedido que actualizar.' };
  const cambiados = await deps.marcarReembolsado(pago);
  return { estado: 200, mensaje: cambiados ? 'Pedido marcado como reembolsado.' : 'Ningún pedido pendiente de marcar.' };
}

/**
 * Registra el pedido de una sesión pagada (o lo reembolsa si no se puede
 * servir) y refleja los reembolsos completos. Es idempotente: un evento
 * repetido no crea otro pedido.
 */
export async function procesarEvento(evento: Stripe.Event, deps: DependenciasWebhook): Promise<RespuestaWebhook> {
  // La tienda solo trabaja en modo prueba: un evento real no es suyo.
  if (evento.livemode) return { estado: 200, mensaje: 'Evento en modo real ignorado.' };
  if (evento.type === 'charge.refunded') return procesarReembolso(evento.data.object, deps);
  if (!esEventoDeCobro(evento)) {
    return { estado: 200, mensaje: `Evento ${evento.type} ignorado.` };
  }

  const sesion = evento.data.object;
  // Con pagos diferidos la sesión se completa antes de cobrar: el pedido
  // se registra cuando llegue async_payment_succeeded.
  if (sesion.payment_status !== 'paid') {
    return { estado: 200, mensaje: 'Pago aún pendiente: se espera la confirmación.' };
  }

  const datos = deMetadatos(sesion.metadata);
  if (!datos) return { estado: 200, mensaje: 'La sesión no es de esta tienda.' };

  if (!deps.hayBaseDeDatos) {
    console.info(`Pedido ${datos.referencia} pagado en Stripe (${sesion.id}); sin base de datos donde guardarlo.`);
    return { estado: 200, mensaje: 'Pago recibido; no hay base de datos configurada.' };
  }

  if (await deps.yaProcesado(evento.id)) {
    return { estado: 200, mensaje: 'Evento ya procesado.' };
  }

  const resultado = await deps.registrar(datosRegistro(evento, sesion, datos));
  if (resultado.ok) {
    return { estado: 200, mensaje: `Pedido registrado (${resultado.pedidoId}).` };
  }
  if (!resultado.permanente) {
    console.error('No se pudo registrar el pedido; Stripe lo reintentará', resultado.error);
    return { estado: 500, mensaje: 'Error temporal al registrar el pedido.' };
  }

  const pago = datosRegistro(evento, sesion, datos).p_pago_stripe;
  if (!pago) {
    console.error(`Pedido ${datos.referencia} cobrado sin pago asociado y sin poder registrarse: ${resultado.codigo}`);
    return { estado: 500, mensaje: 'Cobro sin identificador de pago.' };
  }
  try {
    await deps.reembolsar(pago, sesion.id, resultado.codigo);
    await deps.anotar(evento.id, `reembolso:${resultado.codigo}`);
  } catch (error) {
    console.error('No se pudo completar el reembolso', error);
    return { estado: 500, mensaje: 'Error al reembolsar; Stripe lo reintentará.' };
  }
  console.warn(`Pedido ${datos.referencia} reembolsado: ${resultado.codigo}`);
  return { estado: 200, mensaje: `Pedido no registrado (${resultado.codigo}); importe reembolsado.` };
}
