// Las dos fuentes del catálogo marcan cada producto con la rebaja
// automática vigente de su categoría, para que tarjetas, ficha, filtros
// y datos estructurados enseñen el precio final.

import { rebajaDeCategoria } from '@/lib/catalogo/precio';
import type { Producto, Promocion } from '@/lib/catalogo/tipos';
import { diaMadrid } from '@/lib/fechas';

export function conRebajas(productos: readonly Producto[], promociones: readonly Promocion[], fecha = new Date()): Producto[] {
  const dia = diaMadrid(fecha);
  return productos.map((p) => ({ ...p, rebaja: rebajaDeCategoria(p.categoria, promociones, dia) }));
}
