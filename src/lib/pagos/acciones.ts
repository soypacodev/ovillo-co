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
import { conIdioma, textos } from '@/lib/i18n';
import { idiomaActual } from '@/lib/i18n/servidor';
import { origenSitio } from '@/lib/origen';
import { crearEsquemaPedido, erroresPorCampo } from './esquema';
import { localizarPedido } from './localizar';
import { direccionDeDatos, resumenDemo } from './resumen';
import { recalcularPedido } from './servidor';
import { crearSesionPago, stripeConfigurado } from './stripe';
import { ErrorPedido, mensajeError, type PedidoCalculado, type ResultadoConfirmar } from './tipos';

const T = textos(
  {
    revisa: 'Revisa los campos marcados.',
    intentos: 'Demasiados intentos seguidos. Espera unos minutos y vuelve a probar.',
    comprobar: 'No hemos podido comprobar el pedido. Inténtalo de nuevo en un momento.',
    cuponInactivo: (c: string | null) => `El código ${c} ya no está activo. Quítalo de la cesta para seguir.`,
    cuponMinimo: (c: string | null) => `Tu cesta ya no llega al mínimo del código ${c}. Quítalo para seguir.`,
    cambioPrecio: (total: string) => `Algún precio ha cambiado y el total es ahora ${total}. Revisa el resumen antes de pagar.`,
    pasarela: 'La pasarela de pago no responde. Inténtalo de nuevo en un momento.',
  },
  {
    en: {
      revisa: 'Please check the highlighted fields.',
      intentos: 'Too many attempts in a row. Wait a few minutes and try again.',
      comprobar: 'We couldn’t check your order. Please try again in a moment.',
      cuponInactivo: (c: string | null) => `The code ${c} is no longer active. Remove it from your basket to continue.`,
      cuponMinimo: (c: string | null) => `Your basket no longer reaches the minimum for the code ${c}. Remove it to continue.`,
      cambioPrecio: (total: string) => `A price has changed and the total is now ${total}. Please check the summary before paying.`,
      pasarela: 'The payment gateway isn’t responding. Please try again in a moment.',
    },
    fr: {
      revisa: 'Vérifiez les champs signalés.',
      intentos: 'Trop de tentatives d’affilée. Patientez quelques minutes et réessayez.',
      comprobar: 'Nous n’avons pas pu vérifier la commande. Réessayez dans un instant.',
      cuponInactivo: (c: string | null) => `Le code ${c} n’est plus actif. Retirez-le du panier pour continuer.`,
      cuponMinimo: (c: string | null) => `Votre panier n’atteint plus le minimum du code ${c}. Retirez-le pour continuer.`,
      cambioPrecio: (total: string) =>
        `Un prix a changé et le total est désormais de ${total}. Vérifiez le récapitulatif avant de payer.`,
      pasarela: 'La passerelle de paiement ne répond pas. Réessayez dans un instant.',
    },
    de: {
      revisa: 'Bitte prüfen Sie die markierten Felder.',
      intentos: 'Zu viele Versuche hintereinander. Warten Sie ein paar Minuten und versuchen Sie es erneut.',
      comprobar: 'Wir konnten die Bestellung nicht prüfen. Bitte versuchen Sie es gleich noch einmal.',
      cuponInactivo: (c: string | null) =>
        `Der Code ${c} ist nicht mehr gültig. Entfernen Sie ihn aus dem Warenkorb, um fortzufahren.`,
      cuponMinimo: (c: string | null) =>
        `Ihr Warenkorb erreicht den Mindestbetrag für den Code ${c} nicht mehr. Entfernen Sie ihn, um fortzufahren.`,
      cambioPrecio: (total: string) =>
        `Ein Preis hat sich geändert, der Gesamtbetrag ist jetzt ${total}. Bitte prüfen Sie die Übersicht vor dem Bezahlen.`,
      pasarela: 'Der Zahlungsdienst antwortet nicht. Bitte versuchen Sie es gleich noch einmal.',
    },
  },
);

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

/**
 * Valida y recalcula el pedido; si el total coincide con `totalVisto`,
 * devuelve la URL de Stripe o, en modo demostración, la confirmación
 * con su resumen. Cualquier discrepancia vuelve como error, sin cobrar.
 */
export async function confirmarPedido(entrada: unknown): Promise<ResultadoConfirmar> {
  const idioma = await idiomaActual();
  const t = T[idioma];
  const validado = crearEsquemaPedido(idioma).safeParse(entrada);
  if (!validado.success) {
    const errores = erroresPorCampo(validado.error.issues);
    const deDatos = Object.fromEntries(
      Object.entries(errores).filter(([campo]) => !CAMPOS_PEDIDO.has(campo.split('.')[0])),
    );
    if (Object.keys(deDatos).length) {
      return { ok: false, tipo: 'datos', mensaje: t.revisa, errores: deDatos };
    }
    return { ok: false, tipo: 'cesta', codigo: 'CANTIDAD_NO_VALIDA', mensaje: mensajeError('CANTIDAD_NO_VALIDA', idioma) };
  }

  const { datos, lineas, cupon, totalVisto } = validado.data;
  if (!limitador.permitir(origenPeticion(await headers()))) {
    return { ok: false, tipo: 'servidor', mensaje: t.intentos };
  }

  let pedido: PedidoCalculado;
  try {
    pedido = await recalcularPedido({ lineas, cupon, envio: datos.envio });
  } catch (error) {
    if (error instanceof ErrorPedido) {
      return { ok: false, tipo: 'cesta', codigo: error.codigo, mensaje: mensajeError(error.codigo, idioma) };
    }
    console.error('No se pudo recalcular el pedido', error);
    return { ok: false, tipo: 'servidor', mensaje: t.comprobar };
  }

  if (pedido.avisoCupon) {
    return {
      ok: false,
      tipo: 'cesta',
      codigo: 'CUPON',
      mensaje: pedido.avisoCupon === 'NO_VALIDO' ? t.cuponInactivo(cupon) : t.cuponMinimo(cupon),
    };
  }

  // Nunca se cobra un importe distinto del que se ha enseñado.
  if (pedido.total !== totalVisto) {
    return {
      ok: false,
      tipo: 'cesta',
      codigo: 'CAMBIO_DE_PRECIO',
      mensaje: t.cambioPrecio(eur(pedido.total, idioma)),
    };
  }

  if (!stripeConfigurado()) {
    const fuente = catalogo(idioma);
    const [metodos, local] = await Promise.all([fuente.metodosEnvio(), localizarPedido(pedido, idioma, fuente)]);
    const plazo = metodos.find((m) => m.id === pedido.metodoEnvio.id)?.plazo ?? '';
    const numero = referencia('DEMO');
    return {
      ok: true,
      modo: 'demo',
      url: conIdioma(`/gracias?pedido=${numero}`, idioma),
      resumen: resumenDemo(numero, datos, local, plazo, undefined, idioma),
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
      idioma,
    );
    return { ok: true, modo: 'stripe', url };
  } catch (error) {
    console.error('No se pudo crear la sesión de pago', error);
    return { ok: false, tipo: 'servidor', mensaje: t.pasarela };
  }
}
