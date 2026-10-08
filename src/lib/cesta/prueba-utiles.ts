// Ayudas compartidas por las pruebas de la cesta.

import { PRODUCTOS } from '@/datos/semilla';
import type { Producto } from '@/lib/catalogo/tipos';
import { anadirProducto } from './lineas';
import { CESTA_VACIA, type EstadoCesta, type OpcionesAnadir } from './tipos';

export const FECHA = new Date('2026-07-01T12:00:00Z');

export function producto(slug: string): Producto {
  const p = PRODUCTOS.find((x) => x.slug === slug);
  if (!p) throw new Error(`No existe ${slug}`);
  return p;
}

/** Cesta con varias piezas, añadidas en orden. */
export function cestaCon(...piezas: [string, OpcionesAnadir?][]): EstadoCesta {
  return piezas.reduce(
    (estado, [slug, opciones]) => anadirProducto(estado, producto(slug), opciones).estado,
    CESTA_VACIA,
  );
}
