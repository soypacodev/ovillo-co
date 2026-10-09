// Punto de entrada del acceso a datos. El origen se elige solo: con
// NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY se lee de
// Supabase; sin ellas, de la semilla local, y la tienda funciona igual.

import {
  localizarCategoria,
  localizarEnvio,
  localizarProducto,
  localizarPromocion,
} from '@/lib/catalogo/localizar';
import type { Idioma } from '@/lib/i18n/idiomas';
import { configuracionSupabase } from './entorno';
import { aplicarFiltros } from './filtros';
import type { FuenteCatalogo } from './fuente';
import { crearFuenteSupabase } from './fuente-supabase';
import { fuenteSemilla } from './fuente-semilla';
import { clientePublico } from './supabase/publico';

let fuente: FuenteCatalogo | undefined;

function fuenteBase(): FuenteCatalogo {
  if (fuente) return fuente;
  const config = configuracionSupabase();
  fuente = config ? crearFuenteSupabase(clientePublico(), config.url) : fuenteSemilla;
  return fuente;
}

/**
 * Catálogo de esta instalación en un idioma (por defecto, español). Los
 * textos salen ya traducidos; slugs, nombres de variante, precios y stock
 * no cambian, así que la cesta, Stripe y la base de datos no se enteran.
 */
export function catalogo(idioma: Idioma = 'es'): FuenteCatalogo {
  const base = fuenteBase();
  const productos = (lista: Awaited<ReturnType<FuenteCatalogo['productos']>>) =>
    lista.map((p) => localizarProducto(p, idioma));
  const categorias = async () => (await base.categorias()).map((c) => localizarCategoria(c, idioma));

  return {
    origen: base.origen,
    categorias,
    async categoria(slug) {
      const c = await base.categoria(slug);
      return c && localizarCategoria(c, idioma);
    },
    async productos(filtros = {}) {
      if (idioma === 'es' || !filtros.busqueda?.trim()) return productos(await base.productos(filtros));
      // La búsqueda tiene que encontrar «blanket» en inglés: se busca sobre
      // los textos ya traducidos, con la misma función que en español.
      const [todos, cats] = await Promise.all([base.productos({ ...filtros, busqueda: '' }), categorias()]);
      return aplicarFiltros(productos(todos), filtros, cats);
    },
    async producto(slug) {
      const p = await base.producto(slug);
      return p && localizarProducto(p, idioma);
    },
    async relacionados(slug, cantidad) {
      return productos(await base.relacionados(slug, cantidad));
    },
    async promociones() {
      return (await base.promociones()).map((p) => localizarPromocion(p, idioma));
    },
    async cupon(codigo) {
      const c = await base.cupon(codigo);
      return c && localizarPromocion(c, idioma);
    },
    async metodosEnvio() {
      return (await base.metodosEnvio()).map((m) => localizarEnvio(m, idioma));
    },
  };
}

export type { FuenteCatalogo } from './fuente';
export { enOferta, leerFiltros, stockTotal, type FiltrosCatalogo, type ParametrosBusqueda } from './filtros';
