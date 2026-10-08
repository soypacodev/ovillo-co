'use server';

// Confirmación del pedido. Es una función de servidor: cualquiera puede
// llamarla con un POST, así que no se fía de nada de lo que llega. Valida
// los datos, recalcula el pedido con el catálogo y, solo si el total
// coincide con el que vio la clienta, abre el pago en Stripe (modo
// prueba) o, sin Stripe configurado, crea un pedido de demostración.

import { headers } from 'next/headers';
import { crearLimitador, origenPeticion } from '@/lib/acciones/limite';
import { usuarioActual } from '@/lib/cuentas/sesion';
import { catalogo } from '@/lib/datos';
import { anioMadrid } from '@/lib/fechas';
import { eur } from '@/lib/formato';
import { origenSitio } from '@/lib/origen';
import { esquemaPedido, erroresPorCampo } from './esquema';
import { direccionDeDatos, resumenDemo } from './resumen';
import { recalcularPedido } from './servidor';
import { crearSesionPago, stripeConfigurado } from './stripe';
import { ErrorPedido, MENSAJES_ERROR, type PedidoCalculado, type ResultadoConfirmar } from './tipos';

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** «DEMO-2026-7K3QXA»: sin letras que se confundan (O/0, I/1). */
function referencia(prefijo: string): string {
  const azar = crypto.getRandomValues(new Uint8Array(6));
  const sufijo = Array.from(azar, (n) => ALFABETO[n % ALFABETO.length]).join('');
  return `${prefijo}-${anioMadrid()}-${sufijo}`;
}

const CAMPOS_PEDIDO = new Set(['lineas', 'cupon', 'totalVisto']);

// Cada intento con Stripe crea una sesión y, si hay descuento, un cupón:
// se frena a quien lo lance en bucle desde una misma conexión.
const limitador = crearLimitador({ maximo: 20, ventana: 10 * 60 * 1000 });

export async function confirmarPedido(entrada: unknown): Promise<ResultadoConfirmar> {
  const validado = esquemaPedido.safeParse(entrada);
  if (!validado.success) {
    const errores = erroresPorCampo(validado.error.issues);
    const deDatos = Object.fromEntries(
      Object.entries(errores).filter(([campo]) => !CAMPOS_PEDIDO.has(campo.split('.')[0])),
    );
    if (Object.keys(deDatos).length) {
      return { ok: false, tipo: 'datos', mensaje: 'Revisa los campos marcados.', errores: deDatos };
    }
    return { ok: false, tipo: 'cesta', codigo: 'CANTIDAD_NO_VALIDA', mensaje: MENSAJES_ERROR.CANTIDAD_NO_VALIDA };
  }

  const { datos, lineas, cupon, totalVisto } = validado.data;
  if (!limitador.permitir(origenPeticion(await headers()))) {
    return { ok: false, tipo: 'servidor', mensaje: 'Demasiados intentos seguidos. Espera unos minutos y vuelve a probar.' };
  }

  let pedido: PedidoCalculado;
  try {
    pedido = await recalcularPedido({ lineas, cupon, envio: datos.envio });
  } catch (error) {
    if (error instanceof ErrorPedido) {
      return { ok: false, tipo: 'cesta', codigo: error.codigo, mensaje: MENSAJES_ERROR[error.codigo] };
    }
    console.error('No se pudo recalcular el pedido', error);
    return { ok: false, tipo: 'servidor', mensaje: 'No hemos podido comprobar el pedido. Inténtalo de nuevo en un momento.' };
  }

  if (pedido.avisoCupon) {
    return {
      ok: false,
      tipo: 'cesta',
      codigo: 'CUPON',
      mensaje:
        pedido.avisoCupon === 'NO_VALIDO'
          ? `El código ${cupon} ya no está activo. Quítalo de la cesta para seguir.`
          : `Tu cesta ya no llega al mínimo del código ${cupon}. Quítalo para seguir.`,
    };
  }

  // Nunca se cobra un importe distinto del que se ha enseñado.
  if (pedido.total !== totalVisto) {
    return {
      ok: false,
      tipo: 'cesta',
      codigo: 'CAMBIO_DE_PRECIO',
      mensaje: `Algún precio ha cambiado y el total es ahora ${eur(pedido.total)}. Revisa el resumen antes de pagar.`,
    };
  }

  const metodos = await catalogo().metodosEnvio();
  const plazo = metodos.find((m) => m.id === pedido.metodoEnvio.id)?.plazo ?? '';

  if (!stripeConfigurado()) {
    const numero = referencia('DEMO');
    return {
      ok: true,
      modo: 'demo',
      url: `/gracias?pedido=${numero}`,
      resumen: resumenDemo(numero, datos, pedido, plazo),
    };
  }

  try {
    const url = await crearSesionPago(
      pedido,
      {
        referencia: referencia('OV'),
        email: datos.email,
        lineas,
        cupon: pedido.codigoCupon,
        envio: datos.envio,
        nombre: `${datos.nombre} ${datos.apellidos}`,
        telefono: datos.telefono,
        direccion: direccionDeDatos(datos),
        regalo: datos.regalo,
        dedicatoria: datos.regalo ? datos.dedicatoria : '',
        nota: datos.nota,
        diasConfeccion: pedido.diasConfeccion,
        usuario: (await usuarioActual())?.id ?? null,
      },
      await origenSitio(),
    );
    return { ok: true, modo: 'stripe', url };
  } catch (error) {
    console.error('No se pudo crear la sesión de pago', error);
    return { ok: false, tipo: 'servidor', mensaje: 'La pasarela de pago no responde. Inténtalo de nuevo en un momento.' };
  }
}
