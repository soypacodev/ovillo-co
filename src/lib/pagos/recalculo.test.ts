import { createClient } from '@supabase/supabase-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { esquemaPedido, type DatosPedido, type LineaEntrada } from './esquema';
import { calcularConCatalogo, calcularConSupabase } from './recalculo';
import { ErrorPedido } from './tipos';

vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({ headers: async () => new Headers({ origin: 'http://localhost:3000' }) }));

const linea = (slug: string, variante: string, cantidad = 1, personalizacion = ''): LineaEntrada => ({
  slug,
  variante,
  cantidad,
  personalizacion,
});

const BOLSO = linea('bolso-red-mercado', 'Crudo');
const MANTA = linea('manta-estrella', 'Menta');

function calcular(lineas: LineaEntrada[], cupon: string | null = null, envio: 'ordinario' | 'express' | 'recogida' = 'ordinario') {
  return calcularConCatalogo({ lineas: lineas.map((l) => ({ personalizacion: '', ...l })), cupon, envio });
}

function codigoDe(fn: () => unknown): string | undefined {
  try {
    fn();
  } catch (error) {
    if (error instanceof ErrorPedido) return error.codigo;
    throw error;
  }
  return undefined;
}

describe('recálculo con el catálogo de la semilla', () => {
  it('usa los precios del catálogo aunque el navegador mande otros', () => {
    const manipulada = esquemaPedido.shape.lineas.parse([{ ...BOLSO, precio: 1, total: 1 }]);
    expect(manipulada[0]).not.toHaveProperty('precio');
    const pedido = calcular(manipulada);
    expect(pedido.lineas[0].precioUnitario).toBe(2200);
    // Bolso 22,00 € − 15 % de rebaja automática + 3,95 € de envío.
    expect(pedido.descuentoAutomatico).toBe(330);
    expect(pedido.total).toBe(2265);
  });

  it('cuadra con los ejemplos comprobados en el navegador', () => {
    expect(calcular([MANTA, BOLSO]).total).toBe(8370);
    expect(calcular([MANTA, BOLSO], null, 'express').total).toBe(9065);
  });

  it('el envío ordinario es gratis desde 50 € después de descuentos', () => {
    expect(calcular([linea('cojin-relieve', 'Crudo y beis')]).envio).toBe(395);
    const pedido = calcular([MANTA]);
    expect(pedido.envio).toBe(0);
    expect(pedido.total).toBe(6500);
    // El urgente no tiene umbral.
    expect(calcular([MANTA], null, 'express').envio).toBe(695);
    expect(calcular([BOLSO], null, 'recogida').envio).toBe(0);
  });

  it('el cupón ENVIOGRATIS quita el envío por debajo del umbral', () => {
    const pedido = calcular([linea('cojin-relieve', 'Crudo y beis')], 'enviogratis');
    expect(pedido.envio).toBe(0);
    expect(pedido.codigoCupon).toBe('ENVIOGRATIS');
    expect(pedido.total).toBe(3400);
  });

  it('aplica HOLA10 sobre lo que queda tras la rebaja automática', () => {
    const pedido = calcular([linea('manta-estrella', 'Menta'), linea('manta-estrella', 'Rosa')], 'HOLA10');
    expect(pedido.subtotal).toBe(13000);
    expect(pedido.descuentoCupon).toBe(1300);
    expect(pedido.total).toBe(11700);
  });

  it('un cupón inexistente no rebaja nada y se avisa', () => {
    const pedido = calcular([MANTA], 'REGALO100');
    expect(pedido.avisoCupon).toBe('NO_VALIDO');
    expect(pedido.descuentoCupon).toBe(0);
    expect(pedido.codigoCupon).toBeNull();
    expect(pedido.total).toBe(6500);
  });

  it('un cupón sin el mínimo no se aplica', () => {
    const pedido = calcular([BOLSO], 'PRIMERA5');
    // Bolso con rebaja: 18,70 €, por debajo de los 20 € que pide PRIMERA5.
    expect(pedido.avisoCupon).toBe('MINIMO_NO_ALCANZADO');
    expect(pedido.descuentoCupon).toBe(0);
  });

  it('rechaza más unidades de las que hay en stock', () => {
    expect(codigoDe(() => calcular([linea('manta-estrella', 'Menta', 2)]))).toBe('SIN_STOCK');
    expect(codigoDe(() => calcular([linea('scrunchies-degradado', 'Degradado rojo')]))).toBe('SIN_STOCK');
  });

  it('suma el stock de la misma variante aunque la personalización sea distinta', () => {
    const lineas = [linea('manta-estrella', 'Menta', 1, 'A.M.'), linea('manta-estrella', 'Menta', 1, 'L.R.')];
    expect(codigoDe(() => calcular(lineas))).toBe('SIN_STOCK');
  });

  it('rechaza productos, colores y personalizaciones que no existen', () => {
    expect(codigoDe(() => calcular([linea('submarino', 'Amarillo')]))).toBe('PRODUCTO_NO_DISPONIBLE');
    expect(codigoDe(() => calcular([linea('bolso-red-mercado', 'Fucsia')]))).toBe('VARIANTE_NO_DISPONIBLE');
    expect(codigoDe(() => calcular([linea('bolso-red-mercado', 'Crudo', 1, 'AB')]))).toBe('PERSONALIZACION_NO_ADMITIDA');
    expect(codigoDe(() => calcular([linea('manta-estrella', 'Menta', 1, 'ABCDE')]))).toBe('PERSONALIZACION_DEMASIADO_LARGA');
    expect(codigoDe(() => calcular([]))).toBe('CESTA_VACIA');
  });
});

describe('esquema del pedido', () => {
  it('no acepta cantidades fuera de rango ni líneas repetidas', () => {
    expect(esquemaPedido.shape.lineas.safeParse([{ ...BOLSO, cantidad: 0 }]).success).toBe(false);
    expect(esquemaPedido.shape.lineas.safeParse([{ ...BOLSO, cantidad: 1.5 }]).success).toBe(false);
    expect(esquemaPedido.shape.lineas.safeParse([BOLSO, BOLSO]).success).toBe(false);
  });
});

describe('recálculo con Supabase', () => {
  function clienteFalso(respuesta: { status: number; cuerpo: unknown }) {
    const llamadas: { url: string; cuerpo: unknown }[] = [];
    const fetchFalso: typeof fetch = async (entrada, init) => {
      llamadas.push({ url: String(entrada), cuerpo: JSON.parse(String(init?.body)) });
      return new Response(JSON.stringify(respuesta.cuerpo), {
        status: respuesta.status,
        headers: { 'Content-Type': 'application/json' },
      });
    };
    const cliente = createClient('https://ejemplo.supabase.co', 'clave-de-servicio-de-prueba-larga', {
      auth: { persistSession: false },
      global: { fetch: fetchFalso },
    });
    return { cliente, llamadas };
  }

  it('manda solo slug, variante, cantidad y personalización', async () => {
    const { cliente, llamadas } = clienteFalso({
      status: 200,
      cuerpo: {
        lineas: [
          {
            producto_slug: 'bolso-red-mercado',
            nombre_producto: 'Bolso de red para el mercado',
            nombre_variante: 'Crudo',
            color: '#EDE6DA',
            foto_ruta: 'bolso/1.jpg',
            precio_unitario: 2200,
            cantidad: 1,
            descuento: 330,
            total: 1870,
            personalizacion: null,
            encargo: false,
            dias: null,
          },
        ],
        subtotal: 2200,
        descuento_automatico: 330,
        descuento_cupon: 0,
        envio: 395,
        total: 2265,
        promocion_id: null,
        codigo_cupon: null,
        aviso_cupon: null,
        metodo_envio_id: 'ordinario',
        metodo_envio_nombre: 'Envío ordinario',
        dias_confeccion: null,
      },
    });
    const pedido = await calcularConSupabase(cliente, 'https://ejemplo.supabase.co', {
      lineas: [{ ...BOLSO, personalizacion: '' }],
      cupon: null,
      envio: 'ordinario',
    });
    expect(llamadas[0].url).toContain('/rest/v1/rpc/calcular_pedido');
    expect(llamadas[0].cuerpo).toEqual({
      p_lineas: [{ producto: 'bolso-red-mercado', variante: 'Crudo', cantidad: 1, personalizacion: null }],
      p_cupon: null,
      p_envio: 'ordinario',
    });
    expect(pedido.total).toBe(2265);
    expect(pedido.lineas[0].foto?.src).toBe(
      'https://ejemplo.supabase.co/storage/v1/object/public/productos/bolso/1.jpg',
    );
  });

  it('convierte los errores de la función en errores de pedido', async () => {
    const { cliente } = clienteFalso({
      status: 400,
      cuerpo: { code: 'P0001', message: 'SIN_STOCK', details: null, hint: null },
    });
    await expect(
      calcularConSupabase(cliente, 'https://ejemplo.supabase.co', { lineas: [{ ...MANTA, personalizacion: '' }], cupon: null, envio: 'ordinario' }),
    ).rejects.toMatchObject({ codigo: 'SIN_STOCK' });
  });
});

describe('confirmar el pedido sin Stripe (modo demostración)', () => {
  const DATOS: DatosPedido = {
    email: 'ana@correo.example',
    nombre: 'Ana',
    apellidos: 'Pérez',
    telefono: '',
    envio: 'ordinario',
    calle: 'Calle Larios 1',
    piso: '',
    cp: '29005',
    ciudad: 'Málaga',
    provincia: 'Málaga',
    regalo: false,
    dedicatoria: '',
    nota: '',
    acepta: true,
  };

  let claveAnterior: string | undefined;
  beforeEach(() => {
    claveAnterior = process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY;
  });
  afterEach(() => {
    if (claveAnterior !== undefined) process.env.STRIPE_SECRET_KEY = claveAnterior;
  });

  it('crea un pedido de demostración con los importes del servidor', async () => {
    const { confirmarPedido } = await import('./acciones');
    const r = await confirmarPedido({ datos: DATOS, lineas: [BOLSO], cupon: null, totalVisto: 2265 });
    expect(r).toMatchObject({ ok: true, modo: 'demo' });
    if (!r.ok || r.modo !== 'demo') return;
    expect(r.url).toMatch(/^\/gracias\?pedido=DEMO-\d{4}-[A-Z2-9]{6}$/);
    expect(r.resumen.total).toBe(2265);
    expect(r.resumen.direccion).toBe('Calle Larios 1, 29005 Málaga, Málaga');
  });

  it('no sigue si el total que vio la clienta no es el del catálogo', async () => {
    const { confirmarPedido } = await import('./acciones');
    const r = await confirmarPedido({
      datos: DATOS,
      lineas: [{ ...BOLSO, precio: 100 }],
      cupon: null,
      totalVisto: 100,
    });
    expect(r).toMatchObject({ ok: false, tipo: 'cesta', codigo: 'CAMBIO_DE_PRECIO' });
  });

  it('devuelve los errores de los datos por campo', async () => {
    const { confirmarPedido } = await import('./acciones');
    const r = await confirmarPedido({
      datos: { ...DATOS, email: 'ana', cp: '28001', acepta: false },
      lineas: [BOLSO],
      cupon: null,
      totalVisto: 2265,
    });
    expect(r.ok).toBe(false);
    if (r.ok || r.tipo !== 'datos') throw new Error('Se esperaban errores de datos');
    expect(Object.keys(r.errores).sort()).toEqual(['acepta', 'cp', 'email']);
    expect(r.errores.cp).toBe('Ese código postal es de Madrid.');
  });

  it('avisa del stock insuficiente sin crear nada', async () => {
    const { confirmarPedido } = await import('./acciones');
    const r = await confirmarPedido({
      datos: DATOS,
      lineas: [{ ...MANTA, cantidad: 3 }],
      cupon: null,
      totalVisto: 19500,
    });
    expect(r).toMatchObject({ ok: false, tipo: 'cesta', codigo: 'SIN_STOCK' });
  });

  it('avisa si el cupón no vale', async () => {
    const { confirmarPedido } = await import('./acciones');
    const r = await confirmarPedido({ datos: DATOS, lineas: [MANTA], cupon: 'falso', totalVisto: 6500 });
    expect(r).toMatchObject({ ok: false, tipo: 'cesta', codigo: 'CUPON' });
  });

  // Va la última: el límite cuenta también los intentos de las pruebas anteriores.
  it('frena a quien confirma pedidos en bucle desde la misma conexión', async () => {
    const { confirmarPedido } = await import('./acciones');
    const intento = () => confirmarPedido({ datos: DATOS, lineas: [BOLSO], cupon: null, totalVisto: 2265 });
    const resultados = [];
    for (let i = 0; i < 25; i++) resultados.push(await intento());
    expect(resultados.at(-1)).toMatchObject({ ok: false, tipo: 'servidor', mensaje: expect.stringMatching(/Demasiados intentos/) });
  });
});
