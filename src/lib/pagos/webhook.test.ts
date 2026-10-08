import Stripe from 'stripe';
import { claveFicticia } from './claves-ficticias';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { aMetadatos, deMetadatos, type DatosSesion } from './metadatos';
import { procesarEvento, type DatosRegistro, type DependenciasWebhook, type ResultadoRegistro } from './webhook';

vi.mock('server-only', () => ({}));

const SECRETO = claveFicticia('whsec', 'SecretoDePruebaDeLaTiendaOvillo1234');

const DATOS: DatosSesion = {
  referencia: 'OV-2026-ABCDEF',
  lineas: [
    { slug: 'manta-estrella', variante: 'Menta', cantidad: 1, personalizacion: 'A.M.' },
    { slug: 'bolso-red-mercado', variante: 'Crudo', cantidad: 2, personalizacion: '' },
  ],
  cupon: 'HOLA10',
  envio: 'ordinario',
  nombre: 'Ana Pérez',
  telefono: '600 000 000',
  direccion: { calle: 'Calle Larios 1', piso: '2.º B', cp: '29005', ciudad: 'Málaga', provincia: 'Málaga' },
  regalo: true,
  dedicatoria: 'Para Lola',
  nota: '',
  diasConfeccion: 12,
  usuario: '00000000-0000-4000-8000-00000000000a',
};

function evento(tipo: string, sesion: Partial<Stripe.Checkout.Session> = {}): Stripe.Event {
  return {
    id: 'evt_prueba_1',
    object: 'event',
    type: tipo,
    api_version: '2026-09-30.endive',
    created: 1_790_000_000,
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    data: {
      object: {
        id: 'cs_test_a1b2c3d4e5f6',
        object: 'checkout.session',
        amount_total: 11475,
        payment_status: 'paid',
        status: 'complete',
        payment_intent: 'pi_prueba_1',
        customer_details: { email: 'ana@correo.example' },
        metadata: aMetadatos(DATOS),
        ...sesion,
      },
    },
  } as unknown as Stripe.Event;
}

function dependencias(registro: ResultadoRegistro = { ok: true, pedidoId: 'pedido-1' }, procesado = false) {
  const registros: DatosRegistro[] = [];
  const reembolsos: string[][] = [];
  const anotaciones: string[][] = [];
  const marcados: string[] = [];
  const deps: DependenciasWebhook = {
    hayBaseDeDatos: true,
    yaProcesado: vi.fn(async () => procesado),
    registrar: vi.fn(async (datos: DatosRegistro) => {
      registros.push(datos);
      return registro;
    }),
    reembolsar: vi.fn(async (pago: string, sesion: string, motivo: string) => {
      reembolsos.push([pago, sesion, motivo]);
    }),
    anotar: vi.fn(async (id: string, tipo: string) => {
      anotaciones.push([id, tipo]);
    }),
    marcarReembolsado: vi.fn(async (pago: string) => {
      marcados.push(pago);
      return 1;
    }),
  };
  return { deps, registros, reembolsos, anotaciones, marcados };
}

describe('metadatos de la sesión', () => {
  it('ida y vuelta sin perder nada', () => {
    expect(deMetadatos(aMetadatos(DATOS))).toEqual(DATOS);
  });

  it('reparte las líneas largas en trozos de 500 caracteres', () => {
    const muchas = Array.from({ length: 40 }, (_, i) => ({
      slug: `pieza-con-un-nombre-bastante-largo-${i}`,
      variante: 'Variante con nombre largo',
      cantidad: 1,
      personalizacion: 'ABCD',
    }));
    const metadatos = aMetadatos({ ...DATOS, lineas: muchas });
    expect(Object.values(metadatos).every((v) => v.length <= 500)).toBe(true);
    expect(Object.keys(metadatos).length).toBeLessThanOrEqual(50);
    expect(deMetadatos(metadatos)?.lineas).toEqual(muchas);
  });

  it('ignora sesiones que no son de la tienda', () => {
    expect(deMetadatos({ referencia: 'x' })).toBeNull();
    expect(deMetadatos(null)).toBeNull();
  });
});

describe('procesar eventos de Stripe', () => {
  it('registra el pedido con lo cobrado y los datos de la sesión', async () => {
    const { deps, registros } = dependencias();
    const r = await procesarEvento(evento('checkout.session.completed'), deps);
    expect(r.estado).toBe(200);
    expect(registros).toHaveLength(1);
    expect(registros[0]).toMatchObject({
      p_evento_stripe: 'evt_prueba_1',
      p_sesion_stripe: 'cs_test_a1b2c3d4e5f6',
      p_pago_stripe: 'pi_prueba_1',
      p_importe_cobrado: 11475,
      p_email: 'ana@correo.example',
      p_cupon: 'HOLA10',
      p_envio: 'ordinario',
      p_lineas: [
        { producto: 'manta-estrella', variante: 'Menta', cantidad: 1, personalizacion: 'A.M.' },
        { producto: 'bolso-red-mercado', variante: 'Crudo', cantidad: 2, personalizacion: null },
      ],
    });
    expect(registros[0].p_direccion).toMatchObject({ linea1: 'Calle Larios 1', codigo_postal: '29005', pais: 'ES' });
    expect(registros[0].p_nota).toContain('Dedicatoria: «Para Lola»');
    expect(registros[0].p_usuario).toBe(DATOS.usuario);
  });

  it('es idempotente: un evento repetido no se vuelve a registrar', async () => {
    const { deps, registros } = dependencias(undefined, true);
    const r = await procesarEvento(evento('checkout.session.completed'), deps);
    expect(r.estado).toBe(200);
    expect(registros).toHaveLength(0);
  });

  it('con pago diferido espera a async_payment_succeeded', async () => {
    const { deps, registros } = dependencias();
    const pendiente = await procesarEvento(evento('checkout.session.completed', { payment_status: 'unpaid' }), deps);
    expect(pendiente.estado).toBe(200);
    expect(registros).toHaveLength(0);
    await procesarEvento(evento('checkout.session.async_payment_succeeded'), deps);
    expect(registros).toHaveLength(1);
  });

  it('si falta stock después de cobrar, reembolsa y lo anota', async () => {
    const { deps, reembolsos, anotaciones } = dependencias({ ok: false, permanente: true, codigo: 'SIN_STOCK' });
    const r = await procesarEvento(evento('checkout.session.completed'), deps);
    expect(r.estado).toBe(200);
    expect(reembolsos).toEqual([['pi_prueba_1', 'cs_test_a1b2c3d4e5f6', 'SIN_STOCK']]);
    expect(anotaciones).toEqual([['evt_prueba_1', 'reembolso:SIN_STOCK']]);
  });

  it('un fallo temporal devuelve 500 para que Stripe reintente', async () => {
    const { deps, reembolsos } = dependencias({ ok: false, permanente: false, error: 'timeout' });
    const r = await procesarEvento(evento('checkout.session.completed'), deps);
    expect(r.estado).toBe(500);
    expect(reembolsos).toHaveLength(0);
  });

  it('ignora eventos en modo real aunque lleguen firmados', async () => {
    const { deps, registros } = dependencias();
    const real = { ...evento('checkout.session.completed'), livemode: true } as Stripe.Event;
    expect((await procesarEvento(real, deps)).estado).toBe(200);
    expect(registros).toHaveLength(0);
  });

  it('un reembolso total desde Stripe marca el pedido; uno parcial no', async () => {
    const cargo = (refunded: boolean) =>
      ({
        ...evento('charge.refunded'),
        data: { object: { id: 'ch_1', object: 'charge', refunded, payment_intent: 'pi_prueba_1' } },
      }) as unknown as Stripe.Event;
    const { deps, marcados } = dependencias();
    expect((await procesarEvento(cargo(false), deps)).estado).toBe(200);
    expect(marcados).toHaveLength(0);
    expect((await procesarEvento(cargo(true), deps)).estado).toBe(200);
    expect(marcados).toEqual(['pi_prueba_1']);
  });

  it('ignora otros eventos y sesiones ajenas', async () => {
    const { deps, registros } = dependencias();
    expect((await procesarEvento(evento('customer.created'), deps)).estado).toBe(200);
    expect((await procesarEvento(evento('checkout.session.completed', { metadata: {} }), deps)).estado).toBe(200);
    expect(registros).toHaveLength(0);
  });
});

describe('ruta del webhook', () => {
  const entorno = { ...process.env };
  const stripe = new Stripe(claveFicticia('sk_test', 'ClaveDePruebaDeLaTiendaOvillo1234'));

  beforeAll(() => {
    process.env.STRIPE_SECRET_KEY = claveFicticia('sk_test', 'ClaveDePruebaDeLaTiendaOvillo1234');
    process.env.STRIPE_WEBHOOK_SECRET = SECRETO;
  });
  afterAll(() => {
    process.env = entorno;
  });
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
  });

  const peticion = (cuerpo: string, firma?: string) =>
    new Request('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: cuerpo,
      headers: firma ? { 'stripe-signature': firma } : {},
    });

  it('acepta un evento con firma válida', async () => {
    const { POST } = await import('@/app/api/stripe/webhook/route');
    const cuerpo = JSON.stringify(evento('checkout.session.completed'));
    const firma = stripe.webhooks.generateTestHeaderString({ payload: cuerpo, secret: SECRETO });
    const respuesta = await POST(peticion(cuerpo, firma));
    expect(respuesta.status).toBe(200);
  });

  it('rechaza una firma falsa', async () => {
    const { POST } = await import('@/app/api/stripe/webhook/route');
    const cuerpo = JSON.stringify(evento('checkout.session.completed'));
    const firma = stripe.webhooks.generateTestHeaderString({ payload: cuerpo, secret: claveFicticia('whsec', 'OtroSecretoQueNoEsElDeLaTienda5678') });
    expect((await POST(peticion(cuerpo, firma))).status).toBe(400);
  });

  it('rechaza un cuerpo alterado después de firmar', async () => {
    const { POST } = await import('@/app/api/stripe/webhook/route');
    const cuerpo = JSON.stringify(evento('checkout.session.completed'));
    const firma = stripe.webhooks.generateTestHeaderString({ payload: cuerpo, secret: SECRETO });
    const alterado = cuerpo.replace('11475', '1');
    expect((await POST(peticion(alterado, firma))).status).toBe(400);
  });

  it('rechaza un cuerpo desmesurado antes de comprobar la firma', async () => {
    const { POST } = await import('@/app/api/stripe/webhook/route');
    const cuerpo = 'x'.repeat(300 * 1024);
    const firma = stripe.webhooks.generateTestHeaderString({ payload: cuerpo, secret: SECRETO });
    expect((await POST(peticion(cuerpo, firma))).status).toBe(413);
  });

  it('rechaza una petición sin firma', async () => {
    const { POST } = await import('@/app/api/stripe/webhook/route');
    expect((await POST(peticion('{}'))).status).toBe(400);
  });
});
