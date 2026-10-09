// Operaciones sobre la cesta. Todas son puras: reciben un estado y
// devuelven otro nuevo, sin tocar el almacenamiento ni el DOM.

import { fotoVariante } from '@/lib/catalogo/precio';
import type { Producto } from '@/lib/catalogo/tipos';
import {
  CESTA_VACIA,
  MAX_UDS_LINEA,
  type EstadoCesta,
  type LineaCesta,
  type OpcionesAnadir,
  type ProductoCesta,
  type ResultadoAnadir,
} from './tipos';

/** Identificador estable de la línea: la misma pieza con otras iniciales es otra línea. */
export function idLinea(slug: string, variante: string, personalizacion: string): string {
  return `${slug}|${variante}|${personalizacion}`;
}

/** Total de piezas de la cesta, para el contador de la cabecera. */
export function unidades(lineas: readonly LineaCesta[]): number {
  return lineas.reduce((suma, l) => suma + l.uds, 0);
}

/**
 * Deja la personalización como se va a bordar: sin espacios sobrantes y
 * con el límite de caracteres del producto. Si el producto no admite
 * personalización, se descarta.
 */
export function limpiarPersonalizacion(
  producto: Pick<ProductoCesta, 'personalizable'>,
  texto: string | undefined,
): string {
  if (!producto.personalizable || !texto) return '';
  const limpio = texto.replace(/\s+/g, ' ').trim();
  return Array.from(limpio).slice(0, producto.personalizable.max).join('').trim();
}

/** Unidades de una variante repartidas entre todas sus líneas
 *  (con y sin personalización comparten el mismo stock). */
function unidadesDeVariante(
  lineas: readonly LineaCesta[],
  slug: string,
  variante: string,
): number {
  return lineas
    .filter((l) => l.slug === slug && l.variante === variante)
    .reduce((suma, l) => suma + l.uds, 0);
}

/** Máximo de unidades que puede tener una línea sin pasarse del stock
 *  de su variante ni del tope por línea. */
export function maxUnidadesLinea(lineas: readonly LineaCesta[], linea: LineaCesta): number {
  const enOtras = unidadesDeVariante(lineas, linea.slug, linea.variante) - linea.uds;
  return Math.max(0, Math.min(MAX_UDS_LINEA, linea.stock - enOtras));
}

function elegirVariante(producto: ProductoCesta, variante: OpcionesAnadir['variante']) {
  if (typeof variante === 'number') return producto.variantes[variante];
  if (typeof variante === 'string') return producto.variantes.find((v) => v.nombre === variante);
  return producto.variantes.find((v) => v.stock > 0) ?? producto.variantes[0];
}

function enteroPositivo(n: number | undefined, porDefecto: number): number {
  return Number.isFinite(n) ? Math.max(0, Math.floor(n as number)) : porDefecto;
}

/**
 * Añade unidades de una variante. Si ya hay una línea igual, la suma ahí;
 * si no caben todas por stock o por el tope por línea, añade las que
 * caben y lo indica con `tipo: 'limitado'`.
 */
export function anadirProducto(
  estado: EstadoCesta,
  producto: ProductoCesta,
  opciones: OpcionesAnadir = {},
): { estado: EstadoCesta; resultado: ResultadoAnadir } {
  const variante = elegirVariante(producto, opciones.variante);
  if (!variante) return { estado, resultado: { tipo: 'sin-variante' } };
  if (variante.stock <= 0) return { estado, resultado: { tipo: 'agotado' } };

  const pedidas = Math.max(1, enteroPositivo(opciones.uds, 1));
  const personalizacion = limpiarPersonalizacion(producto, opciones.personalizacion);
  const id = idLinea(producto.slug, variante.nombre, personalizacion);
  const existente = estado.lineas.find((l) => l.id === id);

  const enCesta = unidadesDeVariante(estado.lineas, producto.slug, variante.nombre);
  const udsLinea = existente?.uds ?? 0;
  const caben = Math.max(0, Math.min(variante.stock - enCesta, MAX_UDS_LINEA - udsLinea));
  const anadidas = Math.min(pedidas, caben);
  const maximo = Math.min(variante.stock, MAX_UDS_LINEA);

  if (anadidas === 0) {
    return { estado, resultado: { tipo: 'limitado', uds: 0, maximo, linea: existente ?? null } };
  }

  // Los datos del producto se refrescan también en una línea existente:
  // así un precio o un stock actualizados llegan a la cesta al volver a añadir.
  const linea: LineaCesta = {
    id,
    slug: producto.slug,
    nombre: producto.nombre,
    categoria: producto.categoria,
    variante: variante.nombre,
    ...(variante.rotulo && { rotulo: variante.rotulo }),
    color: variante.color,
    foto: fotoVariante(producto, variante),
    precio: producto.precio,
    encargo: producto.encargo,
    dias: producto.dias,
    stock: variante.stock,
    personalizacion,
    uds: udsLinea + anadidas,
  };

  const lineas = existente
    ? estado.lineas.map((l) => (l.id === id ? linea : l))
    : [...estado.lineas, linea];

  const nuevo = { ...estado, lineas };
  const resultado: ResultadoAnadir =
    anadidas < pedidas
      ? { tipo: 'limitado', uds: anadidas, maximo, linea }
      : { tipo: 'anadido', uds: anadidas, linea };
  return { estado: nuevo, resultado };
}

/** Fija las unidades de una línea dentro de sus límites. Con 0 o menos
 *  la línea desaparece. */
export function fijarUnidades(estado: EstadoCesta, id: string, uds: number): EstadoCesta {
  const linea = estado.lineas.find((l) => l.id === id);
  if (!linea) return estado;
  const pedidas = enteroPositivo(uds, linea.uds);
  if (pedidas < 1) return quitarLinea(estado, id);
  const nuevas = Math.min(pedidas, maxUnidadesLinea(estado.lineas, linea));
  if (nuevas < 1) return quitarLinea(estado, id);
  if (nuevas === linea.uds) return estado;
  return {
    ...estado,
    lineas: estado.lineas.map((l) => (l.id === id ? { ...l, uds: nuevas } : l)),
  };
}

/** Suma o resta unidades (±1 en el contador) con los mismos límites que `fijarUnidades`. */
export function cambiarUnidades(estado: EstadoCesta, id: string, delta: number): EstadoCesta {
  const linea = estado.lineas.find((l) => l.id === id);
  if (!linea) return estado;
  return fijarUnidades(estado, id, linea.uds + delta);
}

/** Quita una línea; si era la última, la cesta vuelve a estar vacía y sin cupón. */
export function quitarLinea(estado: EstadoCesta, id: string): EstadoCesta {
  const lineas = estado.lineas.filter((l) => l.id !== id);
  if (lineas.length === estado.lineas.length) return estado;
  // Sin líneas, un cupón guardado ya no tiene sentido.
  return lineas.length ? { ...estado, lineas } : CESTA_VACIA;
}

export function vaciarCesta(): EstadoCesta {
  return CESTA_VACIA;
}

/**
 * Pone la cesta al día con el catálogo: precios, nombres y stock nuevos,
 * fuera lo que ya no existe o se ha agotado y unidades recortadas al
 * stock disponible. La usan la cesta completa y el pago antes de cobrar.
 */
export function sincronizarConCatalogo(
  estado: EstadoCesta,
  productos: readonly Pick<Producto, keyof ProductoCesta>[],
): EstadoCesta {
  const porSlug = new Map(productos.map((p) => [p.slug, p]));
  const restante = new Map<string, number>();
  const lineas: LineaCesta[] = [];

  for (const l of estado.lineas) {
    const p = porSlug.get(l.slug);
    const v = p?.variantes.find((x) => x.nombre === l.variante);
    if (!p || !v) continue;
    const clave = `${l.slug}|${l.variante}`;
    const quedan = restante.get(clave) ?? v.stock;
    const personalizacion = limpiarPersonalizacion(p, l.personalizacion);
    const id = idLinea(l.slug, l.variante, personalizacion);
    // Dos líneas que se funden (p. ej. al recortar la personalización)
    // comparten el tope por línea: solo cuentan las unidades que caben.
    const repetida = lineas.find((x) => x.id === id);
    const uds = Math.min(l.uds, quedan, MAX_UDS_LINEA - (repetida?.uds ?? 0));
    if (uds < 1) continue;
    restante.set(clave, quedan - uds);
    if (repetida) {
      repetida.uds += uds;
      continue;
    }
    const resto = { ...l };
    delete resto.rotulo;
    lineas.push({
      ...resto,
      id,
      nombre: p.nombre,
      ...(v.rotulo && { rotulo: v.rotulo }),
      categoria: p.categoria,
      color: v.color,
      foto: fotoVariante(p, v) ?? l.foto,
      precio: p.precio,
      encargo: p.encargo,
      dias: p.dias,
      stock: v.stock,
      personalizacion,
      uds,
    });
  }
  return lineas.length ? { ...estado, lineas } : CESTA_VACIA;
}
