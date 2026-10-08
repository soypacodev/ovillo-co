// Filtros, búsqueda y orden del catálogo como funciones puras. Las usan
// las dos fuentes de datos, así que la semilla y Supabase devuelven
// exactamente el mismo resultado para la misma consulta.

import { precioVenta } from '@/lib/catalogo/precio';
import type { Categoria, Producto, SlugCategoria } from '@/lib/catalogo/tipos';

export const ORDENES = [
  { id: 'destacados', texto: 'Destacados primero' },
  { id: 'nuevo', texto: 'Novedades primero' },
  { id: 'barato', texto: 'Precio: de menor a mayor' },
  { id: 'caro', texto: 'Precio: de mayor a menor' },
  { id: 'az', texto: 'Nombre A–Z' },
] as const;

export type Orden = (typeof ORDENES)[number]['id'];

/**
 * Rangos del precio final (con las rebajas ya aplicadas), en céntimos y
 * con los dos extremos incluidos. Están elegidos para el catálogo real:
 * detalles hasta 20 €, la mayoría de piezas entre 20 y 30 €, conjuntos
 * hasta 50 € y las mantas por encima.
 */
export const RANGOS_PRECIO = [
  { id: 'hasta-20', texto: 'Hasta 20 €', min: 0, max: 2000 },
  { id: '20-30', texto: '20–30 €', min: 2001, max: 3000 },
  { id: '30-50', texto: '30–50 €', min: 3001, max: 5000 },
  { id: 'desde-50', texto: 'Más de 50 €', min: 5001, max: null },
] as const;

type RangoPrecio = (typeof RANGOS_PRECIO)[number]['id'];

export const EXTRAS = [
  { id: 'stock', texto: 'Listo para enviar' },
  { id: 'encargo', texto: 'Por encargo' },
  { id: 'ofertas', texto: 'En oferta' },
  { id: 'novedades', texto: 'Novedades' },
] as const;

type FiltroExtra = (typeof EXTRAS)[number]['id'];

/** Todos los filtros son acumulables; una lista vacía no filtra. */
export interface FiltrosCatalogo {
  categorias?: readonly SlugCategoria[];
  rangos?: readonly RangoPrecio[];
  extras?: readonly FiltroExtra[];
  busqueda?: string;
  orden?: Orden;
}

/**
 * Texto comparable: sin tildes, sin mayúsculas y con la puntuación
 * convertida en espacios («Cojín, relieve» → «cojin relieve»).
 */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Unidades hechas sumando todos los colores. */
export function stockTotal(producto: Producto): number {
  return producto.variantes.reduce((suma, v) => suma + v.stock, 0);
}

/** Lo que ya está hecho y queda en el taller sale en 24–48 h. */
function listoParaEnviar(producto: Producto): boolean {
  return !producto.encargo && stockTotal(producto) > 0;
}

/** Rebajado: tiene precio tachado, ya sea por la rebaja automática de su
 *  categoría o porque su precio anterior era mayor. */
export function enOferta(producto: Producto): boolean {
  return precioVenta(producto).anterior !== null;
}

/** Lo que se paga por una unidad, que es lo que filtran y ordenan los precios. */
const precioFinal = (producto: Producto) => precioVenta(producto).final;

function enRango(precio: number, id: RangoPrecio): boolean {
  const rango = RANGOS_PRECIO.find((r) => r.id === id);
  if (!rango) return false;
  return precio >= rango.min && (rango.max === null || precio <= rango.max);
}

const CUMPLE_EXTRA: Record<FiltroExtra, (p: Producto) => boolean> = {
  stock: listoParaEnviar,
  encargo: (p) => p.encargo,
  ofertas: enOferta,
  novedades: (p) => p.novedad,
};

/**
 * Cada palabra buscada tiene que aparecer en el nombre, los textos o la
 * categoría del producto, en cualquier orden.
 */
function coincideBusqueda(producto: Producto, palabras: string[], categorias: readonly Categoria[]): boolean {
  if (palabras.length === 0) return true;
  const categoria = categorias.find((c) => c.slug === producto.categoria);
  const pajar = normalizarTexto(
    [producto.nombre, producto.corto, producto.largo, producto.categoria, categoria?.nombre ?? ''].join(' '),
  );
  return palabras.every((palabra) => pajar.includes(palabra));
}

const POR_NOMBRE = new Intl.Collator('es', { sensitivity: 'base' });

const COMPARADORES: Record<Orden, (a: Producto, b: Producto) => number> = {
  destacados: (a, b) =>
    Number(b.destacado) - Number(a.destacado) ||
    Number(stockTotal(b) > 0) - Number(stockTotal(a) > 0),
  nuevo: (a, b) => Number(b.novedad) - Number(a.novedad),
  barato: (a, b) => precioFinal(a) - precioFinal(b),
  caro: (a, b) => precioFinal(b) - precioFinal(a),
  az: (a, b) => POR_NOMBRE.compare(a.nombre, b.nombre),
};

function filtrarProductos(
  productos: readonly Producto[],
  filtros: FiltrosCatalogo,
  categorias: readonly Categoria[],
): Producto[] {
  const { categorias: cats = [], rangos = [], extras = [], busqueda = '' } = filtros;
  const palabras = normalizarTexto(busqueda).split(' ').filter(Boolean);

  return productos.filter(
    (p) =>
      (cats.length === 0 || cats.includes(p.categoria)) &&
      (rangos.length === 0 || rangos.some((r) => enRango(precioFinal(p), r))) &&
      extras.every((e) => CUMPLE_EXTRA[e](p)) &&
      coincideBusqueda(p, palabras, categorias),
  );
}

/** Orden estable: a igualdad de criterio se respeta el orden del catálogo. */
function ordenarProductos(productos: readonly Producto[], orden: Orden = 'destacados'): Producto[] {
  return [...productos].sort(COMPARADORES[orden]);
}

/** Filtra y ordena los productos según `filtros`. */
export function aplicarFiltros(
  productos: readonly Producto[],
  filtros: FiltrosCatalogo,
  categorias: readonly Categoria[],
): Producto[] {
  return ordenarProductos(filtrarProductos(productos, filtros, categorias), filtros.orden);
}

/**
 * Categorías que acompañan bien a cada una: lo de bebé va con muñecos y
 * packs de regalo, lo de casa con los packs de cocina, etc.
 */
const COMPLEMENTARIAS: Record<SlugCategoria, readonly SlugCategoria[]> = {
  amigurumis: ['bebe', 'packs'],
  bebe: ['amigurumis', 'packs'],
  accesorios: ['hogar'],
  hogar: ['packs', 'accesorios'],
  packs: ['bebe', 'hogar'],
};

/**
 * «También te puede gustar» y «Se lleva bien con…»: primero la misma
 * categoría y después las complementarias, siempre sin el propio
 * producto y con lo disponible delante. Si no hay bastantes con sentido,
 * devuelve menos antes que rellenar con piezas que no pegan.
 */
export function elegirRelacionados(productos: readonly Producto[], slug: string, cantidad = 4): Producto[] {
  const actual = productos.find((p) => p.slug === slug);
  if (!actual) return [];
  const otros = ordenarProductos(
    productos.filter((p) => p.slug !== slug),
    'destacados',
  );
  const categorias = [actual.categoria, ...COMPLEMENTARIAS[actual.categoria]];
  const disponibleAntes = (a: Producto, b: Producto) => Number(stockTotal(b) > 0) - Number(stockTotal(a) > 0);
  return categorias
    .flatMap((categoria) => otros.filter((p) => p.categoria === categoria).sort(disponibleAntes))
    .slice(0, Math.max(0, cantidad));
}

// ------------------------------------------------------------
// URL ⇄ filtros. La URL refleja los filtros para poder compartir un
// enlace ya filtrado: ?cat=accesorios&precio=20-30&filtro=ofertas&q=manta&orden=barato
// ------------------------------------------------------------

export type ParametrosBusqueda = Record<string, string | string[] | undefined>;

const SLUGS_CATEGORIA: readonly SlugCategoria[] = ['amigurumis', 'bebe', 'accesorios', 'hogar', 'packs'];

function valores(parametro: string | string[] | undefined): string[] {
  const lista = Array.isArray(parametro) ? parametro : parametro ? [parametro] : [];
  return lista.flatMap((v) => v.split(',')).map((v) => v.trim()).filter(Boolean);
}

function soloValidos<T extends string>(lista: string[], validos: readonly T[]): T[] {
  return [...new Set(lista)].filter((v): v is T => (validos as readonly string[]).includes(v));
}

/** Lee los filtros de `searchParams` e ignora cualquier valor desconocido. */
export function leerFiltros(parametros: ParametrosBusqueda): FiltrosCatalogo {
  const orden = valores(parametros.orden)[0];
  const q = parametros.q;
  return {
    categorias: soloValidos(valores(parametros.cat), SLUGS_CATEGORIA),
    rangos: soloValidos(
      valores(parametros.precio),
      RANGOS_PRECIO.map((r) => r.id),
    ),
    extras: soloValidos(
      valores(parametros.filtro),
      EXTRAS.map((e) => e.id),
    ),
    busqueda: (Array.isArray(q) ? q[0] : q)?.trim().slice(0, 80) ?? '',
    orden: ORDENES.some((o) => o.id === orden) ? (orden as Orden) : 'destacados',
  };
}

/** El camino inverso, omitiendo lo que está por defecto. */
export function filtrosAParametros(filtros: FiltrosCatalogo): URLSearchParams {
  const p = new URLSearchParams();
  if (filtros.categorias?.length) p.set('cat', filtros.categorias.join(','));
  if (filtros.rangos?.length) p.set('precio', filtros.rangos.join(','));
  if (filtros.extras?.length) p.set('filtro', filtros.extras.join(','));
  if (filtros.busqueda?.trim()) p.set('q', filtros.busqueda.trim());
  if (filtros.orden && filtros.orden !== 'destacados') p.set('orden', filtros.orden);
  return p;
}
