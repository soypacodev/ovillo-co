import { describe, expect, it } from 'vitest';
import { PRODUCTOS } from '@/datos/semilla';
import { diaMadrid, inicioDiaMadrid, inicioMesMadrid } from '@/lib/fechas';
import { crearFuenteLocal } from './fuente-local';
import { filaCliente, filaEncargo, filaMensaje, filaPedido, filaResumen, filaStockBajo, filaVentaDia, fichaPedido } from './filas';

// Un día fijo para que todo sea reproducible: 8 de octubre, 18:00 en Málaga.
const AHORA = new Date('2026-10-08T16:00:00Z');
const fuente = crearFuenteLocal(() => AHORA);
const TODO = { limite: 200, desplazamiento: 0 };

describe('fechas de Málaga', () => {
  it('cuentan el día y el mes en hora de Madrid', () => {
    expect(diaMadrid(new Date('2026-10-07T22:30:00Z'))).toBe('2026-10-08');
    expect(inicioDiaMadrid(AHORA).toISOString()).toBe('2026-10-07T22:00:00.000Z');
    expect(inicioMesMadrid(AHORA).toISOString()).toBe('2026-09-30T22:00:00.000Z');
    expect(inicioMesMadrid(new Date('2026-01-15T12:00:00Z'), -1).toISOString()).toBe('2025-11-30T23:00:00.000Z');
  });
});

describe('fuente local del panel', () => {
  it('devuelve lo mismo que las funciones panel_* (mismas columnas)', async () => {
    filaResumen.parse(await fuente.resumen());
    for (const f of await fuente.ventasPorDia()) filaVentaDia.parse(f);
    for (const f of await fuente.stockBajo()) filaStockBajo.strict().parse(f);
    for (const f of (await fuente.pedidos(TODO)).filas) filaPedido.strict().parse(f);
    for (const f of (await fuente.clientes(TODO)).filas) filaCliente.strict().parse(f);
    for (const f of (await fuente.encargos(TODO)).filas) filaEncargo.strict().parse(f);
    for (const f of (await fuente.mensajes(TODO)).filas) filaMensaje.strict().parse(f);
  });

  it('trae los datos de seed-demo.sql: 25 pedidos en los 6 estados, 6 encargos y 7 mensajes', async () => {
    const { filas, total } = await fuente.pedidos(TODO);
    expect(total).toBe(25);
    expect(new Set(filas.map((p) => p.estado)).size).toBe(6);
    expect((await fuente.encargos(TODO)).total).toBe(6);
    expect((await fuente.mensajes(TODO)).total).toBe(7);
    expect(filas.every((p) => p.email.endsWith('@ejemplo.com'))).toBe(true);
  });

  it('es determinista: el mismo día da exactamente lo mismo', async () => {
    const otra = crearFuenteLocal(() => AHORA);
    expect(await otra.pedidos(TODO)).toEqual(await fuente.pedidos(TODO));
    expect(await otra.resumen()).toEqual(await fuente.resumen());
  });

  it('los importes cuadran como en la base de datos', async () => {
    for (const { id } of (await fuente.pedidos(TODO)).filas) {
      const p = fichaPedido.parse(await fuente.pedido(id));
      expect(p.total).toBe(p.subtotal - p.descuento_automatico - p.descuento_cupon + p.envio);
      expect(p.lineas.reduce((s, l) => s + l.precio_unitario * l.cantidad, 0)).toBe(p.subtotal);
      expect(p.lineas.reduce((s, l) => s + l.descuento, 0)).toBe(p.descuento_automatico);
      expect(p.eventos.at(-1)?.estado).toBe(p.estado);
    }
  });

  it('el resumen sale de los pedidos', async () => {
    const r = await fuente.resumen();
    const { filas } = await fuente.pedidos(TODO);
    const mes = inicioMesMadrid(AHORA).toISOString();
    const delMes = filas.filter((p) => p.creado_en >= mes && !['cancelado', 'reembolsado'].includes(p.estado));
    expect(r.pedidos_mes).toBe(delMes.length);
    expect(r.ventas_mes).toBe(delMes.reduce((s, p) => s + p.total, 0));
    expect(r.pedidos_pendientes).toBe(filas.filter((p) => p.estado === 'pagado' || p.estado === 'en_preparacion').length);
    expect(r.encargos_nuevos).toBe(2);
    expect(r.mensajes_nuevos).toBe(3);
  });

  it('ventas por día: 30 días hasta hoy, sumando lo vendido', async () => {
    const dias = await fuente.ventasPorDia(30);
    expect(dias).toHaveLength(30);
    expect(dias.at(-1)?.dia).toBe('2026-10-08');
    expect(dias[0].dia).toBe('2026-09-09');
    const vendidos = (await fuente.pedidos(TODO)).filas.filter(
      (p) => p.creado_en >= inicioDiaMadrid(new Date('2026-09-09T12:00:00Z')).toISOString() && !['cancelado', 'reembolsado'].includes(p.estado),
    );
    expect(dias.reduce((s, d) => s + d.ventas, 0)).toBe(vendidos.reduce((s, p) => s + p.total, 0));
  });

  it('filtra, busca y pagina como panel_pedidos()', async () => {
    const pagados = await fuente.pedidos({ ...TODO, estado: 'pagado' });
    expect(pagados.filas.every((p) => p.estado === 'pagado')).toBe(true);
    expect((await fuente.pedidos({ ...TODO, busqueda: 'LUCIA.MARTIN' })).total).toBe(3);
    const pagina2 = await fuente.pedidos({ limite: 10, desplazamiento: 20 });
    expect(pagina2.filas).toHaveLength(5);
    expect(pagina2.total).toBe(25);
    const fechas = (await fuente.pedidos(TODO)).filas.map((p) => p.creado_en);
    expect([...fechas].sort().reverse()).toEqual(fechas);
  });

  it('stock bajo y productos salen del catálogo', async () => {
    const bajo = await fuente.stockBajo(1);
    const esperado = PRODUCTOS.flatMap((p) => p.variantes).filter((v) => v.stock <= 1).length;
    expect(bajo).toHaveLength(esperado);
    expect(bajo[0].stock).toBe(0);
    expect(await fuente.productos()).toHaveLength(PRODUCTOS.length);
    expect((await fuente.producto('manta-estrella'))?.personalizacion_max).toBe(PRODUCTOS.find((p) => p.slug === 'manta-estrella')?.personalizable?.max);
    expect(await fuente.producto('no-existe')).toBeNull();
  });

  it('clientes agrupados por correo, con lo gastado sin cancelaciones', async () => {
    const { filas } = await fuente.clientes(TODO);
    expect(filas).toHaveLength(12);
    const lucia = filas.find((c) => c.email === 'lucia.martin@ejemplo.com');
    expect(lucia?.pedidos).toBe(3);
  });
});
