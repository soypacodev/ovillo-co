// Contrato de lectura del catálogo. Las páginas dependen de esta interfaz
// y no de dónde salen los datos: la semilla local o Supabase.

import type {
  Categoria,
  MetodoEnvio,
  Producto,
  Promocion,
  SlugCategoria,
} from '@/lib/catalogo/tipos';
import type { FiltrosCatalogo } from './filtros';

type OrigenCatalogo = 'semilla' | 'supabase';

export interface FuenteCatalogo {
  readonly origen: OrigenCatalogo;

  /** Categorías visibles, en el orden del menú. */
  categorias(): Promise<Categoria[]>;
  categoria(slug: SlugCategoria): Promise<Categoria | null>;

  /** Productos publicados, filtrados y ordenados (por defecto, destacados primero). */
  productos(filtros?: FiltrosCatalogo): Promise<Producto[]>;
  /** null si no existe o no está publicado. */
  producto(slug: string): Promise<Producto | null>;
  /** «También te puede gustar»: primero la misma categoría. */
  relacionados(slug: string, cantidad?: number): Promise<Producto[]>;

  /** Rebajas automáticas vigentes. Los cupones no se listan nunca. */
  promociones(): Promise<Promocion[]>;
  /** Un cupón concreto si existe y está vigente; el mínimo lo valora la cesta. */
  cupon(codigo: string): Promise<Promocion | null>;

  metodosEnvio(): Promise<MetodoEnvio[]>;
}
