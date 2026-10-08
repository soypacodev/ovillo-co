// Catálogo leído de Supabase con la clave anónima: RLS solo deja ver lo
// publicado. Los filtros sencillos viajan a la base de datos para traer
// menos filas; la búsqueda y el orden final usan las mismas funciones
// puras que la semilla, para que ambos orígenes respondan igual.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Categoria, Producto } from '@/lib/catalogo/tipos';
import { aplicarFiltros, elegirRelacionados, RANGOS_PRECIO, type FiltrosCatalogo } from './filtros';
import type { FuenteCatalogo } from './fuente';
import {
  aCategoria,
  aCupon,
  aMetodoEnvio,
  aProducto,
  aPromocion,
  SELECT_CATEGORIA,
  SELECT_ENVIO,
  SELECT_PRODUCTO,
  SELECT_PROMOCION,
} from './supabase/mapeo';

interface ErrorSupabase {
  message: string;
}

/** Desenvuelve la respuesta y convierte los errores en excepciones legibles. */
function filas(respuesta: { data: unknown; error: ErrorSupabase | null }, que: string): unknown[] {
  if (respuesta.error) throw new Error(`No se pudo leer ${que}: ${respuesta.error.message}`);
  const { data } = respuesta;
  if (data === null) return [];
  return Array.isArray(data) ? data : [data];
}

/** Rangos de precio como filtro «or» de PostgREST. */
function filtroRangos(ids: NonNullable<FiltrosCatalogo['rangos']>): string {
  return RANGOS_PRECIO.filter((r) => ids.includes(r.id))
    .map((r) => (r.max === null ? `precio.gte.${r.min}` : `and(precio.gte.${r.min},precio.lte.${r.max})`))
    .join(',');
}

export function crearFuenteSupabase(cliente: SupabaseClient, urlSupabase: string): FuenteCatalogo {
  const aProductos = (lista: unknown[]): Producto[] => lista.map((f) => aProducto(f, urlSupabase));

  async function categorias(): Promise<Categoria[]> {
    const respuesta = await cliente.from('categorias').select(SELECT_CATEGORIA).order('posicion');
    return filas(respuesta, 'las categorías').map((f) => aCategoria(f, urlSupabase));
  }

  async function todosLosProductos(): Promise<Producto[]> {
    const respuesta = await cliente
      .from('productos')
      .select(SELECT_PRODUCTO)
      .eq('estado', 'publicado')
      .order('posicion');
    return aProductos(filas(respuesta, 'los productos'));
  }

  return {
    origen: 'supabase',

    categorias,

    async categoria(slug) {
      const respuesta = await cliente.from('categorias').select(SELECT_CATEGORIA).eq('slug', slug).maybeSingle();
      const [fila] = filas(respuesta, 'la categoría');
      return fila ? aCategoria(fila, urlSupabase) : null;
    },

    async productos(filtros = {}) {
      let consulta = cliente.from('productos').select(SELECT_PRODUCTO).eq('estado', 'publicado');

      if (filtros.categorias?.length) consulta = consulta.in('categoria.slug', [...filtros.categorias]);
      if (filtros.rangos?.length) consulta = consulta.or(filtroRangos(filtros.rangos));
      if (filtros.extras?.includes('encargo')) consulta = consulta.eq('encargo', true);
      if (filtros.extras?.includes('novedades')) consulta = consulta.eq('novedad', true);
      if (filtros.extras?.includes('ofertas')) consulta = consulta.not('antes', 'is', null);

      // Las categorías solo hacen falta para buscar también por su nombre.
      const [respuesta, cats] = await Promise.all([
        consulta.order('posicion'),
        filtros.busqueda?.trim() ? categorias() : Promise.resolve([]),
      ]);
      return aplicarFiltros(aProductos(filas(respuesta, 'los productos')), filtros, cats);
    },

    async producto(slug) {
      const respuesta = await cliente
        .from('productos')
        .select(SELECT_PRODUCTO)
        .eq('slug', slug)
        .eq('estado', 'publicado')
        .maybeSingle();
      const [fila] = filas(respuesta, 'el producto');
      return fila ? aProducto(fila, urlSupabase) : null;
    },

    async relacionados(slug, cantidad = 4) {
      return elegirRelacionados(await todosLosProductos(), slug, cantidad);
    },

    async promociones() {
      const respuesta = await cliente.from('promociones').select(SELECT_PROMOCION).is('codigo', null).order('nombre');
      return filas(respuesta, 'las promociones').map(aPromocion);
    },

    async cupon(codigo) {
      if (!codigo.trim()) return null;
      const respuesta = await cliente.rpc('buscar_cupon', { p_codigo: codigo });
      const [fila] = filas(respuesta, 'el cupón');
      return fila ? aCupon(fila) : null;
    },

    async metodosEnvio() {
      const respuesta = await cliente.from('metodos_envio').select(SELECT_ENVIO).order('posicion');
      return filas(respuesta, 'los métodos de envío').map(aMetodoEnvio);
    },
  };
}
