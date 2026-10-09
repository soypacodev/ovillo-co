// Stripe en modo prueba: crear la sesión de pago y leerla al volver.
// El entorno rechaza cualquier clave que no sea de prueba.
import 'server-only';

import Stripe from 'stripe';
import { catalogo } from '@/lib/datos';
import { configuracionSupabase } from '@/lib/datos/entorno';
import { PATRON_CLAVE_STRIPE, entornoStripe } from '@/lib/datos/entorno-servidor';
import { clienteServicio } from '@/lib/datos/supabase/servicio';
import { conIdioma, textos, type Idioma } from '@/lib/i18n';
import { localizarPedido } from './localizar';
import { deMetadatos, aMetadatos, type DatosSesion } from './metadatos';
import { direccionEnLinea, nombreDescuento } from './resumen';
import type { PedidoCalculado, ResumenPedido } from './tipos';

// Lo que ve la clienta en la pantalla de pago de Stripe.
const T = textos(
  {
    bordado: (texto: string) => `bordado «${texto}»`,
    encargo: (dias: number) => `se teje al pedir (${dias} días)`,
    gratis: (envio: string) => `${envio} (gratis)`,
    descuento: 'Descuento',
  },
  {
    en: {
      bordado: (texto: string) => `embroidered “${texto}”`,
      encargo: (dias: number) => `made to order (${dias} days)`,
      gratis: (envio: string) => `${envio} (free)`,
      descuento: 'Discount',
    },
    fr: {
      bordado: (texto: string) => `brodé «\u00a0${texto}\u00a0»`,
      encargo: (dias: number) => `crocheté à la commande (${dias} jours)`,
      gratis: (envio: string) => `${envio} (offerte)`,
      descuento: 'Remise',
    },
    de: {
      bordado: (texto: string) => `bestickt mit „${texto}“`,
      encargo: (dias: number) => `wird auf Bestellung gehäkelt (${dias} Tage)`,
      gratis: (envio: string) => `${envio} (kostenlos)`,
      descuento: 'Rabatt',
    },
  },
);

/** Sin una clave secreta de prueba completa la tienda funciona en modo
 *  demostración, sin cobrar. */
export function stripeConfigurado(): boolean {
  return PATRON_CLAVE_STRIPE.test(process.env.STRIPE_SECRET_KEY?.trim() ?? '');
}

let cliente: Stripe | undefined;

/** Cliente de Stripe compartido. Lanza si la clave no es de prueba. */
export function clienteStripe(): Stripe {
  cliente ??= new Stripe(entornoStripe().STRIPE_SECRET_KEY, {
    appInfo: { name: 'Ovillo & Co. (demo)' },
    maxNetworkRetries: 2,
  });
  return cliente;
}

/** Stripe solo muestra imágenes con URL pública y segura. */
function imagenPublica(src: string | undefined, origen: string): string[] | undefined {
  if (!src) return undefined;
  const url = new URL(src, origen);
  return url.protocol === 'https:' && url.hostname !== 'localhost' ? [url.href] : undefined;
}

/** Precio por unidad con la rebaja automática: la rebaja se redondea por
 *  unidad, así que la división siempre es exacta. */
function precioFinalUnidad(linea: { total: number; cantidad: number; slug: string }): number {
  const unidad = linea.total / linea.cantidad;
  if (!Number.isInteger(unidad)) throw new Error(`La línea de ${linea.slug} no se reparte por unidades.`);
  return unidad;
}

const recorta = (texto: string, max: number) => (texto.length > max ? `${texto.slice(0, max - 1)}…` : texto);

/** Descripción del pago en Stripe: así el dueño lo encuentra por el número de pedido. */
export function descripcionPago(numero: string): string {
  return `Pedido ${numero} · Ovillo & Co. (tienda de demostración)`;
}

/**
 * Crea la sesión de Stripe Checkout con los importes del servidor y
 * devuelve su URL. Caduca a los 45 minutos. Si Stripe calcula otro
 * total, la sesión se cancela y se lanza un error. La pantalla de pago y
 * los nombres de las piezas van en `idioma`; los metadatos y la
 * descripción del pago, en español, para el dueño.
 */
export async function crearSesionPago(
  pedido: PedidoCalculado,
  datos: DatosSesion & { email: string },
  origen: string,
  idioma: Idioma = 'es',
): Promise<string> {
  const stripe = clienteStripe();
  const t = T[idioma];
  // Solo cambian los nombres: los importes son los del pedido recalculado.
  const local = await localizarPedido(pedido, idioma);
  // Las rebajas automáticas ya van en el precio de cada pieza, como en la
  // tienda; el cupón de Stripe solo lleva el código de descuento.
  const descuento = pedido.descuentoCupon;
  const rotulo = nombreDescuento(0, pedido.descuentoCupon, pedido.codigoCupon);
  const rotuloVisible = nombreDescuento(0, pedido.descuentoCupon, pedido.codigoCupon, idioma);

  // Un cupón de un solo uso por sesión con el importe ya calculado: así
  // Stripe cobra exactamente lo que ha decidido el servidor.
  let descuentos: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
  if (descuento > 0) {
    const cupon = await stripe.coupons.create({
      amount_off: descuento,
      currency: 'eur',
      duration: 'once',
      max_redemptions: 1,
      name: recorta(rotuloVisible, 40),
      metadata: { referencia: datos.referencia },
    });
    descuentos = [{ coupon: cupon.id }];
  }

  const gratis = pedido.envio === 0 && pedido.metodoEnvio.id !== 'recogida';
  const sesion = await stripe.checkout.sessions.create({
    mode: 'payment',
    locale: idioma,
    currency: 'eur',
    customer_email: datos.email,
    client_reference_id: datos.referencia,
    line_items: local.lineas.map((l) => ({
      quantity: l.cantidad,
      price_data: {
        currency: 'eur',
        unit_amount: precioFinalUnidad(l),
        product_data: {
          name: l.nombre,
          description: [
            l.rotulo ?? l.variante,
            l.personalizacion && t.bordado(l.personalizacion),
            l.encargo && l.dias && t.encargo(l.dias),
          ]
            .filter(Boolean)
            .join(' · '),
          images: imagenPublica(l.foto?.src, origen),
          metadata: {
            slug: l.slug,
            variante: l.variante,
            personalizacion: l.personalizacion,
            foto: l.foto?.src ?? '',
          },
        },
      },
    })),
    discounts: descuentos,
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: pedido.envio, currency: 'eur' },
          display_name: gratis ? t.gratis(local.metodoEnvio.nombre) : local.metodoEnvio.nombre,
        },
      },
    ],
    metadata: { ...aMetadatos(datos), ...(descuento > 0 && { descuento: rotulo }) },
    payment_intent_data: {
      description: descripcionPago(datos.referencia),
      metadata: { referencia: datos.referencia },
    },
    success_url: `${origen}${conIdioma('/gracias', idioma)}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origen}${conIdioma('/pago', idioma)}?cancelado=1`,
    expires_at: Math.floor(Date.now() / 1000) + 45 * 60,
  });

  if (sesion.amount_total !== pedido.total) {
    // No debería ocurrir nunca; si ocurre, mejor no dejar pagar.
    await stripe.checkout.sessions.expire(sesion.id).catch(() => undefined);
    throw new Error(`Stripe calcula ${sesion.amount_total} y el servidor ${pedido.total}.`);
  }
  if (!sesion.url) throw new Error('Stripe no ha devuelto la URL de pago.');
  return sesion.url;
}

const PATRON_SESION = /^cs_test_[A-Za-z0-9]{10,200}$/;

/** Número definitivo si el webhook ya registró el pedido en la base de datos. */
async function numeroRegistrado(sesionId: string): Promise<string | null> {
  if (!configuracionSupabase()) return null;
  try {
    const { data } = await clienteServicio()
      .from('pedidos')
      .select('numero')
      .eq('stripe_sesion_id', sesionId)
      .maybeSingle<{ numero: string }>();
    return data?.numero ?? null;
  } catch {
    return null;
  }
}

/**
 * Resumen de una sesión de Stripe para la página de confirmación, con los
 * textos en `idioma`. null si no existe, no es de esta tienda o no se ha
 * completado.
 */
export async function leerSesion(sesionId: string, idioma: Idioma = 'es'): Promise<ResumenPedido | null> {
  if (!PATRON_SESION.test(sesionId)) return null;
  let sesion: Stripe.Checkout.Session;
  try {
    sesion = await clienteStripe().checkout.sessions.retrieve(sesionId, {
      expand: ['line_items.data.price.product'],
    });
  } catch {
    return null;
  }
  const datos = deMetadatos(sesion.metadata);
  if (!datos || sesion.status !== 'complete') return null;

  const fuente = catalogo(idioma);
  const [metodos, numero] = await Promise.all([fuente.metodosEnvio(), numeroRegistrado(sesion.id)]);
  const metodo = metodos.find((m) => m.id === datos.envio);
  const descuento = sesion.total_details?.amount_discount ?? 0;
  const envio = sesion.total_details?.amount_shipping ?? 0;

  let lineas: ResumenPedido['lineas'] = (sesion.line_items?.data ?? []).map((item) => {
    const producto = item.price?.product;
    const meta = producto && typeof producto === 'object' && !('deleted' in producto) ? producto.metadata : {};
    return {
      slug: meta.slug ?? '',
      nombre: item.description ?? '',
      variante: meta.variante ?? '',
      foto: meta.foto?.startsWith('/') || meta.foto?.startsWith('https://') ? { src: meta.foto, alt: '' } : null,
      cantidad: item.quantity ?? 1,
      total: item.amount_subtotal,
      personalizacion: meta.personalizacion ?? '',
    };
  });

  // Los nombres de las piezas ya llegan traducidos de Stripe; el de la
  // variante se busca en el catálogo del idioma.
  if (idioma !== 'es') {
    const slugs = [...new Set(lineas.map((l) => l.slug).filter(Boolean))];
    const productos = await Promise.all(slugs.map((slug) => fuente.producto(slug).catch(() => null)));
    const rotulos = new Map(
      productos.flatMap((p) => (p ? p.variantes.map((v) => [`${p.slug}|${v.nombre}`, v.rotulo] as const) : [])),
    );
    lineas = lineas.map((l) => {
      const rotulo = rotulos.get(`${l.slug}|${l.variante}`);
      return rotulo ? { ...l, rotulo } : l;
    });
  }

  return {
    numero: numero ?? datos.referencia,
    fecha: new Date(sesion.created * 1000).toISOString(),
    email: sesion.customer_details?.email ?? sesion.customer_email ?? '',
    modo: 'stripe',
    estado: sesion.payment_status === 'unpaid' ? 'pendiente' : 'pagado',
    nombre: datos.nombre,
    telefono: datos.telefono,
    envio: { id: datos.envio, nombre: metodo?.nombre ?? datos.envio, plazo: metodo?.plazo ?? '' },
    direccion: direccionEnLinea(datos.direccion),
    regalo: datos.regalo,
    dedicatoria: datos.dedicatoria,
    nota: datos.nota,
    lineas,
    subtotal: sesion.amount_subtotal ?? 0,
    descuento,
    nombreDescuento:
      idioma === 'es'
        ? (sesion.metadata?.descuento ?? T.es.descuento)
        : descuento > 0 && datos.cupon
          ? nombreDescuento(0, descuento, datos.cupon, idioma)
          : T[idioma].descuento,
    envioImporte: envio,
    total: sesion.amount_total ?? 0,
    diasConfeccion: datos.diasConfeccion,
  };
}
