// Precio que se paga por una pieza. Las rebajas automáticas de categoría
// se enseñan ya aplicadas en tarjeta, ficha, botón y datos estructurados,
// y la cesta y `calcular_pedido` las restan con el mismo redondeo por
// unidad, así que lo que se ve es lo que se cobra.

import type { Foto, Producto, Promocion, RebajaProducto, Variante } from './tipos';

/** Una promoción con fecha de fin vale hasta el final de ese día. */
function vigenteEl(promocion: Pick<Promocion, 'hasta'>, dia: string): boolean {
  return promocion.hasta === null || promocion.hasta >= dia;
}

/**
 * Rebaja automática que se aplica a una categoría sin condiciones: sin
 * código, en porcentaje y sin importe mínimo. Si hay varias, la mayor.
 * `dia` es la fecha de hoy en Madrid (AAAA-MM-DD).
 */
export function rebajaDeCategoria(
  categoria: Producto['categoria'],
  promociones: readonly Promocion[],
  dia: string,
): RebajaProducto | null {
  let mejor: Promocion | null = null;
  for (const p of promociones) {
    if (p.codigo || p.tipo !== 'porcentaje' || p.categoria !== categoria || p.minimo > 0 || p.valor <= 0) continue;
    if (!vigenteEl(p, dia)) continue;
    if (!mejor || p.valor > mejor.valor) mejor = p;
  }
  return mejor && { nombre: mejor.nombre, porcentaje: mejor.valor, hasta: mejor.hasta };
}

/** Lo que se descuenta de una unidad. Se redondea por unidad para que
 *  dos piezas cuesten siempre el doble que una. */
export function rebajaPorUnidad(precio: number, porcentaje: number): number {
  return Math.round((precio * porcentaje) / 100);
}

export interface PrecioVenta {
  /** Lo que se paga por unidad, en céntimos. */
  final: number;
  /** Precio tachado, o null si no hay rebaja. */
  anterior: number | null;
  /** Porcentaje que se enseña junto al tachado (0 si no hay). */
  porcentaje: number;
  /** Rebaja automática que explica el descuento, si es esa la razón. */
  rebaja: RebajaProducto | null;
}

/**
 * Precio final y precio tachado. Con rebaja automática, el tachado es el
 * de catálogo y no se acumula con `antes`: así nunca aparecen dos
 * descuentos encadenados.
 */
export function precioVenta(producto: Pick<Producto, 'precio' | 'antes' | 'rebaja'>): PrecioVenta {
  const { precio, antes, rebaja } = producto;
  if (rebaja && rebaja.porcentaje > 0) {
    return {
      final: precio - rebajaPorUnidad(precio, rebaja.porcentaje),
      anterior: precio,
      porcentaje: rebaja.porcentaje,
      rebaja,
    };
  }
  if (antes !== null && antes > precio) {
    return { final: precio, anterior: antes, porcentaje: Math.round((100 * (antes - precio)) / antes), rebaja: null };
  }
  return { final: precio, anterior: null, porcentaje: 0, rebaja: null };
}

/** Foto de una variante, o la principal del producto si no tiene propia. */
export function fotoVariante(producto: { fotos: readonly Foto[] }, variante: Pick<Variante, 'foto'> | undefined): Foto | null {
  return variante?.foto ?? producto.fotos[0] ?? null;
}
