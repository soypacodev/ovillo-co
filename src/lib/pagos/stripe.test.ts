import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { claveFicticia } from './claves-ficticias';
import { crearSesionPago, stripeConfigurado } from './stripe';
import type { PedidoCalculado } from './tipos';

vi.mock('server-only', () => ({}));

const { crearSesion } = vi.hoisted(() => ({ crearSesion: vi.fn() }));

vi.mock('stripe', () => ({
  default: class {
    coupons = { create: vi.fn(async () => ({ id: 'cupon_prueba' })) };
    checkout = { sessions: { create: crearSesion, expire: vi.fn(async () => undefined) } };
  },
}));

// Catálogo inventado: así la prueba no depende de las traducciones reales.
vi.mock('@/lib/datos', () => ({
  catalogo: (idioma = 'es') => ({
    producto: async (slug: string) =>
      slug === 'manta-estrella'
        ? {
            slug,
            nombre: idioma === 'en' ? 'Star blanket' : 'Manta estrella',
            variantes: [{ nombre: 'Menta', ...(idioma === 'en' && { rotulo: 'Mint' }) }],
          }
        : null,
    metodosEnvio: async () => [{ id: 'ordinario', nombre: idioma === 'en' ? 'Standard delivery' : 'Envío ordinario' }],
  }),
}));

describe('¿hay Stripe configurado?', () => {
  const anterior = process.env.STRIPE_SECRET_KEY;
  afterEach(() => {
    process.env.STRIPE_SECRET_KEY = anterior;
  });

  it('el valor de .env.example sin rellenar deja la tienda en modo demostración', () => {
    for (const valor of ['', '   ', 'sk_test_', 'sk_test_corta', claveFicticia('sk_live', 'ClaveRealQueNuncaDebeFuncionar1234')]) {
      process.env.STRIPE_SECRET_KEY = valor;
      expect(stripeConfigurado()).toBe(false);
    }
  });

  it('una clave de prueba completa activa el pago con Stripe', () => {
    process.env.STRIPE_SECRET_KEY = claveFicticia('sk_test', '51AbCdEfGhIjKlMnOpQrStUvWxYz0123456789');
    expect(stripeConfigurado()).toBe(true);
  });
});

describe('sesión de pago en el idioma de la clienta', () => {
  const PEDIDO: PedidoCalculado = {
    lineas: [
      {
        slug: 'manta-estrella',
        nombre: 'Manta estrella',
        variante: 'Menta',
        color: null,
        foto: null,
        precioUnitario: 6500,
        cantidad: 1,
        descuento: 0,
        total: 6500,
        personalizacion: 'Lola',
        encargo: true,
        dias: 10,
      },
    ],
    subtotal: 6500,
    descuentoAutomatico: 0,
    descuentoCupon: 0,
    codigoCupon: null,
    avisoCupon: null,
    envio: 0,
    metodoEnvio: { id: 'ordinario', nombre: 'Envío ordinario' },
    total: 6500,
    diasConfeccion: 10,
  };
  const DATOS = {
    referencia: 'OV-2026-ABC234',
    email: 'ana@correo.example',
    lineas: [{ slug: 'manta-estrella', variante: 'Menta', cantidad: 1, personalizacion: 'Lola' }],
    cupon: null,
    envio: 'ordinario' as const,
    nombre: 'Ana Pérez',
    telefono: '',
    direccion: null,
    regalo: false,
    dedicatoria: '',
    nota: '',
    diasConfeccion: 10,
    usuario: null,
  };
  const entorno = { ...process.env };

  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = claveFicticia('sk_test', '51AbCdEfGhIjKlMnOpQrStUvWxYz0123456789');
    process.env.STRIPE_WEBHOOK_SECRET = claveFicticia('whsec', 'AbCdEfGhIjKlMnOpQrStUvWxYz012345');
    crearSesion.mockReset();
    crearSesion.mockResolvedValue({ id: 'cs_test_1', amount_total: PEDIDO.total, url: 'https://checkout.stripe.com/x' });
  });
  afterEach(() => {
    process.env = { ...entorno };
  });

  const parametros = () => crearSesion.mock.calls[0][0];

  it('en inglés: locale, nombres traducidos y vuelta a las páginas en inglés', async () => {
    await crearSesionPago(PEDIDO, DATOS, 'https://tienda.example', 'en');
    const p = parametros();
    expect(p.locale).toBe('en');
    expect(p.success_url).toBe('https://tienda.example/en/gracias?session_id={CHECKOUT_SESSION_ID}');
    expect(p.cancel_url).toBe('https://tienda.example/en/pago?cancelado=1');
    const linea = p.line_items[0].price_data;
    expect(linea.unit_amount).toBe(6500);
    expect(linea.product_data.name).toBe('Star blanket');
    expect(linea.product_data.description).toBe('Mint · embroidered “Lola” · made to order (10 days)');
    // Las claves y lo que lee el dueño siguen en español.
    expect(linea.product_data.metadata.variante).toBe('Menta');
    expect(p.payment_intent_data.description).toBe('Pedido OV-2026-ABC234 · Ovillo & Co. (tienda de demostración)');
    expect(p.shipping_options[0].shipping_rate_data.display_name).toBe('Standard delivery (free)');
  });

  it('en español todo queda como siempre', async () => {
    await crearSesionPago(PEDIDO, DATOS, 'https://tienda.example');
    const p = parametros();
    expect(p.locale).toBe('es');
    expect(p.success_url).toBe('https://tienda.example/gracias?session_id={CHECKOUT_SESSION_ID}');
    expect(p.cancel_url).toBe('https://tienda.example/pago?cancelado=1');
    expect(p.line_items[0].price_data.product_data.name).toBe('Manta estrella');
    expect(p.line_items[0].price_data.product_data.description).toBe('Menta · bordado «Lola» · se teje al pedir (10 días)');
    expect(p.shipping_options[0].shipping_rate_data.display_name).toBe('Envío ordinario (gratis)');
  });
});
