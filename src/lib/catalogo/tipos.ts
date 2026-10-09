// Tipos del catálogo. Los nombres coinciden con las columnas de la base de
// datos (supabase/migrations) para que cambiar de origen no obligue a
// reescribir componentes. Los importes van siempre en céntimos.
//
// Los textos están en español. Las traducciones viajan aparte, en
// `traducciones`, y `catalogo(idioma)` las aplica antes de pintar
// (src/lib/catalogo/localizar.ts). Lo que falte en un idioma sale en español.

import type { Idioma } from '@/lib/i18n/idiomas';

/** Idiomas a los que se traduce el catálogo (el español es el original). */
export type IdiomaTraducido = Exclude<Idioma, 'es'>;
export type Traducciones<T> = Partial<Record<IdiomaTraducido, T>>;

export interface TraduccionCategoria {
  nombre?: string;
  texto?: string;
  /** Texto alternativo de la foto. */
  alt?: string;
}

export interface TraduccionProducto {
  nombre?: string;
  etiquetaVariante?: string;
  etiqueta?: string;
  corto?: string;
  largo?: string;
  historia?: string;
  materiales?: string[];
  cuidados?: string;
  medidas?: string;
  contenido?: string[];
  personalizable?: { etiqueta?: string; ejemplo?: string; pista?: string };
  /** Nombre visible de cada variante, por su nombre en español. */
  variantes?: Record<string, string>;
  /** Textos alternativos de las fotos, en el orden de la galería. */
  fotos?: string[];
}

export interface TraduccionTexto {
  nombre?: string;
}

export interface TraduccionEnvio {
  nombre?: string;
  plazo?: string;
}

export type SlugCategoria = 'amigurumis' | 'bebe' | 'accesorios' | 'hogar' | 'packs';

export interface Categoria {
  slug: SlugCategoria;
  nombre: string;
  texto: string;
  foto: Foto;
  traducciones?: Traducciones<TraduccionCategoria>;
}

export interface Foto {
  /** Ruta pública, p. ej. `/fotos/productos/manta-estrella-1.jpg`. */
  src: string;
  alt: string;
}

export interface Variante {
  /** Nombre en español: identifica la variante en la cesta, en Stripe y en la base de datos. */
  nombre: string;
  /** Nombre que se enseña en el idioma de la página; sin él, `nombre`. */
  rotulo?: string;
  /** Color de muestra para el selector. */
  color: string;
  stock: number;
  /** Foto que enseña esta variante. Varias variantes pueden compartirla
   *  (dos tallas del mismo color); sin ella se usa la primera del producto. */
  foto?: Foto;
}

/** Rebaja automática de la categoría, ya aplicada al precio que se enseña. */
export interface RebajaProducto {
  nombre: string;
  traducciones?: Traducciones<TraduccionTexto>;
  porcentaje: number;
  /** Último día (AAAA-MM-DD), o null si no caduca. */
  hasta: string | null;
}

export interface Personalizacion {
  etiqueta: string;
  ejemplo: string;
  max: number;
  pista: string;
}

export interface Producto {
  slug: string;
  nombre: string;
  categoria: SlugCategoria;
  tipo: 'simple' | 'pack';
  /** Precio de catálogo en céntimos, antes de rebajas automáticas. */
  precio: number;
  /** Precio anterior en céntimos, si está rebajado. */
  antes: number | null;
  /** Qué distingue a las variantes en el selector: «Color», «Talla», «Modelo». */
  etiquetaVariante: string;
  /** La pone la fuente de datos con las promociones vigentes; el precio
   *  final que se paga sale de `precioVenta()`. */
  rebaja?: RebajaProducto | null;
  destacado: boolean;
  novedad: boolean;
  /** Se teje al pedir: no hay unidades hechas. */
  encargo: boolean;
  /** Días de confección si es por encargo. */
  dias: number | null;
  etiqueta: string | null;
  corto: string;
  largo: string;
  historia: string | null;
  materiales: string[];
  cuidados: string;
  medidas: string;
  fotos: Foto[];
  variantes: Variante[];
  personalizable?: Personalizacion;
  /** Solo en los packs: qué incluye. */
  contenido?: string[];
  traducciones?: Traducciones<TraduccionProducto>;
}

export type TipoPromocion = 'porcentaje' | 'fijo' | 'envio';

export interface Promocion {
  nombre: string;
  tipo: TipoPromocion;
  /** Porcentaje (1-100) o céntimos, según el tipo. */
  valor: number;
  /** Sin código: se aplica sola. */
  codigo: string | null;
  /** Importe mínimo en céntimos. */
  minimo: number;
  categoria: SlugCategoria | null;
  /** Fecha de fin en ISO (AAAA-MM-DD), o null si no caduca. */
  hasta: string | null;
  traducciones?: Traducciones<TraduccionTexto>;
}

export interface MetodoEnvio {
  id: 'ordinario' | 'express' | 'recogida';
  nombre: string;
  precio: number;
  gratisDesde: number | null;
  plazo: string;
  traducciones?: Traducciones<TraduccionEnvio>;
}

export interface PreguntaFrecuente {
  p: string;
  r: string;
}
