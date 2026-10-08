import { describe, expect, it } from 'vitest';
import type { Promocion } from '@/lib/catalogo/tipos';
import { PROMOCIONES } from '@/datos/semilla';
import { precioVenta } from '@/lib/catalogo/precio';
import { anadirProducto } from './lineas';
import { FECHA, cestaCon, producto } from './prueba-utiles';
import { CESTA_VACIA } from './tipos';
import { promocionVigente, totales } from './totales';

describe('totales', () => {
  it('una cesta vacía no cobra envío', () => {
    const t = totales([], null, { fecha: FECHA });
    expect(t).toMatchObject({ subtotal: 0, envio: 0, total: 0, unidades: 0, plazoEncargo: null });
  });

  it('bolso: rebaja de accesorios y envío ordinario (22,65 €)', () => {
    const { lineas } = cestaCon(['bolso-red-mercado']);
    const t = totales(lineas, null, { fecha: FECHA });
    expect(t.subtotal).toBe(2200);
    expect(t.rebajaAuto).toBe(330);
    expect(t.rebajasAuto).toEqual([{ nombre: 'Rebajas de accesorios', importe: 330 }]);
    expect(t.rebajaPorLinea[lineas[0].id]).toBe(330);
    expect(t.envio).toBe(395);
    expect(t.total).toBe(2265);
    expect(t.faltaEnvioGratis).toBe(5000 - 1870);
    expect(t.progresoEnvioGratis).toBe(37);
  });

  it('manta + bolso: envío gratis al pasar de 50 € tras la rebaja (83,70 €)', () => {
    const { lineas } = cestaCon(['manta-estrella'], ['bolso-red-mercado']);
    const t = totales(lineas, null, { fecha: FECHA });
    expect(t.subtotal).toBe(8700);
    expect(t.envio).toBe(0);
    expect(t.total).toBe(8370);
    expect(t.faltaEnvioGratis).toBe(0);
    expect(t.progresoEnvioGratis).toBe(100);
    expect(t.plazoEncargo).toBe(12);
  });

  it('el envío urgente no tiene umbral gratis (90,65 €)', () => {
    const { lineas } = cestaCon(['manta-estrella'], ['bolso-red-mercado']);
    const t = totales(lineas, null, { envioId: 'express', fecha: FECHA });
    expect(t.metodo.id).toBe('express');
    expect(t.envio).toBe(695);
    expect(t.total).toBe(9065);
  });

  it('la recogida en el taller es gratis', () => {
    const { lineas } = cestaCon(['cervatillo-dormilon']);
    expect(totales(lineas, null, { envioId: 'recogida', fecha: FECHA }).envio).toBe(0);
  });

  it('HOLA10 sobre 130 € deja 117 €', () => {
    const { lineas } = cestaCon(['manta-estrella', { variante: 'Menta' }], ['manta-estrella', { variante: 'Rosa' }]);
    const t = totales(lineas, 'HOLA10', { fecha: FECHA });
    expect(t.subtotal).toBe(13000);
    expect(t.rebajaCupon).toBe(1300);
    expect(t.total).toBe(11700);
  });

  it('el cupón se calcula después de la rebaja automática', () => {
    const { lineas } = cestaCon(['bolso-red-mercado', { uds: 2 }]);
    const t = totales(lineas, 'hola10', { fecha: FECHA });
    // 44,00 − 6,60 = 37,40 → −3,74 = 33,66 + 3,95
    expect(t.rebajaAuto).toBe(660);
    expect(t.rebajaCupon).toBe(374);
    expect(t.total).toBe(3366 + 395);
  });

  it('PRIMERA5 resta 5 € y ENVIOGRATIS anula el envío', () => {
    const { lineas } = cestaCon(['cervatillo-dormilon', { uds: 2 }]);
    expect(totales(lineas, 'PRIMERA5', { fecha: FECHA }).total).toBe(4800 - 500 + 395);
    const t = totales(lineas, 'ENVIOGRATIS', { fecha: FECHA });
    expect(t.envioGratisCupon).toBe(true);
    expect(t.envio).toBe(0);
    expect(t.faltaEnvioGratis).toBe(0);
    expect(t.total).toBe(4800);
  });

  it('un cupón que no llega al mínimo no descuenta y dice cuánto falta', () => {
    // El bolso se queda en 18,70 € con la rebaja de accesorios.
    const { lineas } = cestaCon(['bolso-red-mercado']);
    const t = totales(lineas, 'PRIMERA5', { fecha: FECHA });
    expect(t.rebajaCupon).toBe(0);
    expect(t.promocionCupon?.codigo).toBe('PRIMERA5');
    expect(t.cuponFaltaMinimo).toBe(130);
  });

  it('un cupón desconocido se ignora', () => {
    const { lineas } = cestaCon(['cervatillo-dormilon']);
    const t = totales(lineas, 'NOEXISTE', { fecha: FECHA });
    expect(t.promocionCupon).toBeNull();
    expect(t.total).toBe(2400 + 395);
  });

  it('la rebaja automática se redondea por unidad: la cesta cuadra con el precio de la ficha', () => {
    // 19,90 € − 15 % = 16,91 € la unidad (la rebaja de 2,985 € se redondea a 2,99 €).
    const bolso = { ...producto('bolso-red-mercado'), precio: 1990 };
    const { lineas } = anadirProducto(CESTA_VACIA, bolso, { uds: 3 }).estado;
    const t = totales(lineas, null, { fecha: FECHA });
    const final = precioVenta({ ...bolso, rebaja: { nombre: 'Rebajas de accesorios', porcentaje: 15, hasta: null } }).final;
    expect(final).toBe(1691);
    expect(t.rebajaAuto).toBe(3 * 299);
    expect(t.subtotal - t.rebajaAuto).toBe(3 * final);
  });

  it('avisa si el código deja la cesta por debajo del envío gratis (el umbral cuenta tras descuentos)', () => {
    // Cojín 34,00 € + bolso 18,70 € = 52,70 €: envío gratis. Con HOLA10, 47,43 €.
    const { lineas } = cestaCon(['cojin-relieve'], ['bolso-red-mercado']);
    expect(totales(lineas, null, { fecha: FECHA })).toMatchObject({ envio: 0, cuponQuitaEnvioGratis: false });
    const t = totales(lineas, 'HOLA10', { fecha: FECHA });
    expect(t).toMatchObject({ base: 4743, envio: 395, faltaEnvioGratis: 257, cuponQuitaEnvioGratis: true });
    // ENVIOGRATIS no quita nada, y sin llegar al umbral tampoco hay nada que perder.
    expect(totales(lineas, 'ENVIOGRATIS', { fecha: FECHA }).cuponQuitaEnvioGratis).toBe(false);
    expect(totales(cestaCon(['cojin-relieve']).lineas, 'HOLA10', { fecha: FECHA }).cuponQuitaEnvioGratis).toBe(false);
  });

  it('una rebaja automática caducada no se aplica', () => {
    const promociones: Promocion[] = PROMOCIONES.map((p) => (p.codigo ? p : { ...p, hasta: '2026-06-30' }));
    const { lineas } = cestaCon(['bolso-red-mercado']);
    expect(totales(lineas, null, { promociones, fecha: FECHA }).rebajaAuto).toBe(0);
    expect(totales(lineas, null, { promociones, fecha: new Date('2026-06-30T20:00:00Z') }).rebajaAuto).toBe(330);
  });

  it('con dos rebajas para la misma categoría gana la mayor, sin acumular', () => {
    const extra: Promocion = { ...PROMOCIONES[0], nombre: 'Rebaja grande', valor: 30 };
    const { lineas } = cestaCon(['bolso-red-mercado']);
    const t = totales(lineas, null, { promociones: [...PROMOCIONES, extra], fecha: FECHA });
    expect(t.rebajaAuto).toBe(660);
    expect(t.rebajasAuto).toEqual([{ nombre: 'Rebaja grande', importe: 660 }]);
  });
});

describe('promocionVigente', () => {
  it('vale hasta el final del día indicado', () => {
    const p = { ...PROMOCIONES[0], hasta: '2026-07-01' };
    expect(promocionVigente(p, FECHA)).toBe(true);
    expect(promocionVigente(p, new Date('2026-07-02T08:00:00Z'))).toBe(false);
    expect(promocionVigente({ ...p, hasta: null }, FECHA)).toBe(true);
  });

  it('el día termina a medianoche de Madrid, como en la base de datos', () => {
    const p = { ...PROMOCIONES[0], hasta: '2026-07-01' };
    // 23:30 del 1 de julio en Madrid (UTC+2): aún vale.
    expect(promocionVigente(p, new Date('2026-07-01T21:30:00Z'))).toBe(true);
    // 00:30 del 2 de julio en Madrid, aunque en UTC siga siendo día 1.
    expect(promocionVigente(p, new Date('2026-07-01T22:30:00Z'))).toBe(false);
  });
});
