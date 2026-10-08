// Un único sitio para la aritmética del dinero: el cajón, la cesta y el
// pago llaman a la misma función y no pueden discrepar. Todo en céntimos.
//
// Orden: subtotal → rebaja automática por categoría → cupón sobre lo que
// queda → envío (gratis si lo que queda supera el umbral).

import type { MetodoEnvio, Promocion } from '@/lib/catalogo/tipos';
import { ENVIO_GRATIS_DESDE, ENVIOS, PROMOCIONES } from '@/datos/semilla';
import { diaMadrid } from '@/lib/fechas';
import { unidades } from './lineas';
import type { LineaCesta, OpcionesTotales, RebajaAplicada, Totales } from './tipos';

/** Una promoción con fecha de fin vale hasta el final de ese día en
 *  Madrid, igual que en la base de datos (no hasta medianoche en UTC). */
export function promocionVigente(promocion: Promocion, fecha: Date = new Date()): boolean {
  if (!promocion.hasta) return true;
  return diaMadrid(fecha) <= promocion.hasta;
}

export function normalizarCodigo(codigo: string | null | undefined): string {
  return (codigo ?? '').trim().toUpperCase();
}

export function buscarCupon(
  codigo: string | null | undefined,
  promociones: readonly Promocion[] = PROMOCIONES,
  fecha: Date = new Date(),
): Promocion | null {
  const c = normalizarCodigo(codigo);
  if (!c) return null;
  return promociones.find((p) => p.codigo === c && promocionVigente(p, fecha)) ?? null;
}

function porcentaje(importe: number, valor: number): number {
  return Math.round((importe * valor) / 100);
}

export function totales(
  lineas: readonly LineaCesta[],
  cupon: string | null,
  opciones: OpcionesTotales = {},
): Totales {
  const {
    promociones = PROMOCIONES,
    envios = ENVIOS,
    envioId = 'ordinario',
    umbralEnvioGratis = ENVIO_GRATIS_DESDE,
    fecha = new Date(),
  } = opciones;

  const subtotal = lineas.reduce((suma, l) => suma + l.precio * l.uds, 0);

  // Rebajas automáticas: sin código y ligadas a una categoría. Si dos
  // coinciden en la misma línea, gana la mayor; no se acumulan.
  const automaticas = promociones.filter(
    (p) => !p.codigo && p.categoria && p.tipo === 'porcentaje' && promocionVigente(p, fecha) && subtotal >= p.minimo,
  );
  const rebajaPorLinea: Record<string, number> = {};
  const porPromocion = new Map<string, number>();
  for (const l of lineas) {
    let mejor: Promocion | null = null;
    for (const p of automaticas) {
      if (p.categoria === l.categoria && (!mejor || p.valor > mejor.valor)) mejor = p;
    }
    if (!mejor) continue;
    const rebaja = porcentaje(l.precio * l.uds, mejor.valor);
    if (rebaja <= 0) continue;
    rebajaPorLinea[l.id] = rebaja;
    porPromocion.set(mejor.nombre, (porPromocion.get(mejor.nombre) ?? 0) + rebaja);
  }
  const rebajasAuto: RebajaAplicada[] = [...porPromocion].map(([nombre, importe]) => ({ nombre, importe }));
  const rebajaAuto = rebajasAuto.reduce((suma, r) => suma + r.importe, 0);

  // El cupón se calcula sobre lo que queda tras la rebaja automática.
  const trasAuto = subtotal - rebajaAuto;
  const promocionCupon = buscarCupon(cupon, promociones, fecha);
  let rebajaCupon = 0;
  let envioGratisCupon = false;
  let cuponFaltaMinimo = 0;
  if (promocionCupon && lineas.length) {
    if (trasAuto < promocionCupon.minimo) {
      cuponFaltaMinimo = promocionCupon.minimo - trasAuto;
    } else if (promocionCupon.tipo === 'porcentaje') {
      rebajaCupon = porcentaje(trasAuto, promocionCupon.valor);
    } else if (promocionCupon.tipo === 'fijo') {
      rebajaCupon = Math.min(promocionCupon.valor, trasAuto);
    } else {
      envioGratisCupon = true;
    }
  }

  const base = trasAuto - rebajaCupon;
  const metodo: MetodoEnvio = envios.find((e) => e.id === envioId) ?? envios[0] ?? ENVIOS[0];

  let envio = metodo.precio;
  if (!lineas.length || envioGratisCupon) envio = 0;
  if (metodo.gratisDesde !== null && base >= metodo.gratisDesde) envio = 0;

  const conseguido = envioGratisCupon || base >= umbralEnvioGratis;
  const faltaEnvioGratis = conseguido ? 0 : umbralEnvioGratis - base;
  const progresoEnvioGratis = conseguido
    ? 100
    : Math.max(0, Math.min(100, Math.round((100 * base) / umbralEnvioGratis)));

  const dias = lineas.filter((l) => l.encargo && l.dias).map((l) => l.dias as number);

  return {
    unidades: unidades(lineas),
    subtotal,
    rebajasAuto,
    rebajaAuto,
    rebajaPorLinea,
    promocionCupon,
    rebajaCupon,
    envioGratisCupon,
    cuponFaltaMinimo,
    base,
    metodo,
    envio,
    total: base + envio,
    faltaEnvioGratis,
    progresoEnvioGratis,
    plazoEncargo: dias.length ? Math.max(...dias) : null,
  };
}
