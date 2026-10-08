import type {
  Foto,
  MetodoEnvio,
  Producto,
  Promocion,
  SlugCategoria,
} from '@/lib/catalogo/tipos';

/** Máximo de unidades por línea, igual que el selector de la ficha (1-9). */
export const MAX_UDS_LINEA = 9;

/**
 * Lo mínimo de un producto que hace falta para meterlo en la cesta. Una
 * tarjeta puede pasar solo esto al cliente en lugar del producto entero.
 */
export type ProductoCesta = Pick<
  Producto,
  | 'slug'
  | 'nombre'
  | 'categoria'
  | 'precio'
  | 'antes'
  | 'rebaja'
  | 'encargo'
  | 'dias'
  | 'variantes'
  | 'etiquetaVariante'
  | 'personalizable'
> & { fotos: Foto[] };

/**
 * Línea de la cesta. Guarda una copia de los datos del producto en el
 * momento de añadirlo para poder pintar el cajón sin consultar el
 * catálogo; el servidor vuelve a validar precios y stock al pagar.
 */
export interface LineaCesta {
  /** Producto + variante + personalización: la misma pieza con otras
   *  iniciales es otra línea. */
  id: string;
  slug: string;
  nombre: string;
  categoria: SlugCategoria;
  variante: string;
  color: string;
  foto: Foto | null;
  /** Precio unitario en céntimos. */
  precio: number;
  encargo: boolean;
  dias: number | null;
  /** Stock de la variante cuando se añadió. */
  stock: number;
  personalizacion: string;
  uds: number;
}

export interface EstadoCesta {
  lineas: LineaCesta[];
  /** Código escrito por la clienta, en mayúsculas. */
  cupon: string | null;
}

export const CESTA_VACIA: EstadoCesta = Object.freeze({ lineas: [], cupon: null }) as EstadoCesta;

export interface OpcionesAnadir {
  /** Nombre o índice de la variante. Sin indicar, la primera con stock. */
  variante?: string | number;
  uds?: number;
  personalizacion?: string;
}

export type ResultadoAnadir =
  | { tipo: 'anadido'; uds: number; linea: LineaCesta }
  /** Solo cabían algunas unidades (o ninguna más) por el stock. */
  | { tipo: 'limitado'; uds: number; maximo: number; linea: LineaCesta | null }
  | { tipo: 'agotado' }
  | { tipo: 'sin-variante' };

export interface OpcionesTotales {
  promociones?: readonly Promocion[];
  envios?: readonly MetodoEnvio[];
  envioId?: MetodoEnvio['id'];
  umbralEnvioGratis?: number;
  /** Para comprobar la caducidad de las promociones. */
  fecha?: Date;
}

export interface RebajaAplicada {
  nombre: string;
  importe: number;
}

export interface Totales {
  unidades: number;
  subtotal: number;
  /** Rebajas automáticas por categoría, una entrada por promoción. */
  rebajasAuto: RebajaAplicada[];
  rebajaAuto: number;
  /** Rebaja automática de cada línea, por id, para mostrarla junto a ella. */
  rebajaPorLinea: Record<string, number>;
  /** Promoción del cupón si existe y está activa, aplique o no. */
  promocionCupon: Promocion | null;
  rebajaCupon: number;
  envioGratisCupon: boolean;
  /** El cupón existe pero la cesta no llega a su mínimo. */
  cuponFaltaMinimo: number;
  /** Subtotal menos todas las rebajas. */
  base: number;
  metodo: MetodoEnvio;
  envio: number;
  total: number;
  faltaEnvioGratis: number;
  /** El código de descuento deja la cesta por debajo del umbral del envío
   *  gratis que sin él sí alcanzaba. */
  cuponQuitaEnvioGratis: boolean;
  /** 0-100, para la barra de progreso. */
  progresoEnvioGratis: number;
  /** Días del encargo más largo, o null si todo está hecho. */
  plazoEncargo: number | null;
}

export type ResultadoCupon =
  | { ok: true; codigo: string; promocion: Promocion; mensaje: string }
  | { ok: false; motivo: 'vacio' | 'no-existe' | 'minimo'; mensaje: string };
