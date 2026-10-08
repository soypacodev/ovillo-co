// Tipos del catálogo. Los nombres coinciden con las columnas de la base de
// datos (supabase/migrations) para que cambiar de origen no obligue a
// reescribir componentes. Los importes van siempre en céntimos.

export type SlugCategoria = 'amigurumis' | 'bebe' | 'accesorios' | 'hogar' | 'packs';

export interface Categoria {
  slug: SlugCategoria;
  nombre: string;
  texto: string;
  foto: Foto;
}

export interface Foto {
  /** Ruta pública, p. ej. `/fotos/productos/manta-estrella-1.jpg`. */
  src: string;
  alt: string;
}

export interface Variante {
  nombre: string;
  /** Color de muestra para el selector. */
  color: string;
  stock: number;
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
  /** Precio actual en céntimos. */
  precio: number;
  /** Precio anterior en céntimos, si está rebajado. */
  antes: number | null;
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
}

export interface MetodoEnvio {
  id: 'ordinario' | 'express' | 'recogida';
  nombre: string;
  precio: number;
  gratisDesde: number | null;
  plazo: string;
}

export interface PreguntaFrecuente {
  p: string;
  r: string;
}
