// Lectura y escritura de la cesta guardada. Lo que hay en localStorage
// puede venir de una versión anterior, estar a medias o haberse editado
// a mano, así que se valida campo a campo y lo que no encaja se descarta
// en lugar de romper la página.

import type { Foto, SlugCategoria } from '@/lib/catalogo/tipos';
import { idLinea } from './lineas';
import { CESTA_VACIA, MAX_UDS_LINEA, type EstadoCesta, type LineaCesta } from './tipos';

const VERSION_CESTA = 1;

export interface CestaGuardada {
  v: typeof VERSION_CESTA;
  lineas: LineaCesta[];
  cupon: string | null;
}

const CATEGORIAS: readonly SlugCategoria[] = ['amigurumis', 'bebe', 'accesorios', 'hogar', 'packs'];
const COLOR_NEUTRO = '#EFEAE2';

type Registro = Record<string, unknown>;

function esRegistro(x: unknown): x is Registro {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function texto(x: unknown, max = 200): string | null {
  return typeof x === 'string' && x.trim() && x.length <= max ? x.trim() : null;
}

function entero(x: unknown, min: number, max: number): number | null {
  const n = typeof x === 'string' ? Number(x) : x;
  return typeof n === 'number' && Number.isInteger(n) && n >= min && n <= max ? n : null;
}

function foto(x: unknown): Foto | null {
  if (!esRegistro(x)) return null;
  const src = texto(x.src, 500);
  // Solo rutas propias: una URL externa no debe colarse en un <img>.
  if (!src || !src.startsWith('/') || src.startsWith('//')) return null;
  return { src, alt: typeof x.alt === 'string' ? x.alt : '' };
}

function normalizarLinea(x: unknown): LineaCesta | null {
  if (!esRegistro(x)) return null;
  const slug = texto(x.slug, 120);
  const nombre = texto(x.nombre);
  const variante = texto(x.variante, 120);
  const precio = entero(x.precio, 0, 10_000_000);
  const uds = entero(x.uds, 1, 999);
  const categoria = CATEGORIAS.find((c) => c === x.categoria);
  if (!slug || !nombre || !variante || precio === null || uds === null || !categoria) return null;

  const personalizacion = typeof x.personalizacion === 'string' ? x.personalizacion.trim().slice(0, 40) : '';
  // Las cestas antiguas no guardaban el stock: se limita al tope por
  // línea y la sincronización con el catálogo lo corrige después.
  const stock = entero(x.stock, 0, 9999) ?? MAX_UDS_LINEA;
  const encargo = x.encargo === true;

  return {
    id: idLinea(slug, variante, personalizacion),
    slug,
    nombre,
    categoria,
    variante,
    color: texto(x.color, 40) ?? COLOR_NEUTRO,
    foto: foto(x.foto),
    precio,
    encargo,
    dias: encargo ? entero(x.dias, 1, 365) : null,
    stock,
    personalizacion,
    uds: Math.min(uds, MAX_UDS_LINEA, Math.max(stock, 1)),
  };
}

function normalizarLineas(lista: unknown): LineaCesta[] {
  if (!Array.isArray(lista)) return [];
  const porId = new Map<string, LineaCesta>();
  for (const bruta of lista.slice(0, 100)) {
    const linea = normalizarLinea(bruta);
    if (!linea) continue;
    const previa = porId.get(linea.id);
    if (previa) previa.uds = Math.min(MAX_UDS_LINEA, previa.uds + linea.uds);
    else porId.set(linea.id, linea);
  }
  return [...porId.values()];
}

/**
 * Convierte lo guardado en un estado válido. Admite el formato actual
 * (`{ v: 1, lineas, cupon }`) y el antiguo, una lista suelta de líneas; una
 * versión futura desconocida se ignora para no interpretarla mal.
 */
export function normalizarCesta(dato: unknown): EstadoCesta {
  if (Array.isArray(dato)) {
    const lineas = normalizarLineas(dato);
    return lineas.length ? { lineas, cupon: null } : CESTA_VACIA;
  }
  if (!esRegistro(dato) || dato.v !== VERSION_CESTA) return CESTA_VACIA;
  const lineas = normalizarLineas(dato.lineas);
  if (!lineas.length) return CESTA_VACIA;
  const cupon = texto(dato.cupon, 40);
  return { lineas, cupon: cupon ? cupon.toUpperCase() : null };
}

/** Lo que se escribe en localStorage, siempre con la versión actual. */
export function serializarCesta(estado: EstadoCesta): CestaGuardada {
  return { v: VERSION_CESTA, lineas: estado.lineas, cupon: estado.cupon };
}
