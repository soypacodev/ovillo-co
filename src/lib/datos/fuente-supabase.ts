// Catálogo leído de Supabase con la clave anónima: RLS solo deja ver lo
// publicado. Los filtros sencillos viajan a la base de datos para traer
// menos filas; la búsqueda y el orden final usan las mismas funciones
// puras que la semilla, para que ambos orígenes respondan igual.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Categoria, Producto } from '@/lib/catalogo/tipos';
import type { Promocion } from '@/lib/catalogo/tipos';
import { aplicarFiltros, elegirRelacionados } from './filtros';
import type { FuenteCatalogo } from './fuente';
import { conRebajas } from './rebajas';
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

/** Fuente del catálogo sobre un cliente anónimo de Supabase. */
export function crearFuenteSupabase(cliente: SupabaseClient, urlSupabase: string): FuenteCatalogo {
  const aProductos = (lista: unknown[]): Producto[] => lista.map((f) => aProducto(f, urlSupabase));

  async function categorias(): Promise<Categoria[]> {
    const respuesta = await cliente.from('categorias').select(SELECT_CATEGORIA).order('posicion');
    return filas(respuesta, 'las categorías').map((f) => aCategoria(f, urlSupabase));
  }

  async function promociones(): Promise<Promocion[]> {
    const respuesta = await cliente.from('promociones').select(SELECT_PROMOCION).is('codigo', null).order('nombre');
    return filas(respuesta, 'las promociones').map(aPromocion);
  }

  async function todosLosProductos(): Promise<Producto[]> {
    const [respuesta, rebajas] = await Promise.all([
      cliente.from('productos').select(SELECT_PRODUCTO).eq('estado', 'publicado').order('posicion'),
      promociones(),
    ]);
    return conRebajas(aProductos(filas(respuesta, 'los productos')), rebajas);
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

      // Precio y ofertas dependen de la rebaja automática: se filtran aquí,
      // con el precio final, y no en la base de datos.
      if (filtros.categorias?.length) consulta = consulta.in('categoria.slug', [...filtros.categorias]);
      if (filtros.extras?.includes('encargo')) consulta = consulta.eq('encargo', true);
      if (filtros.extras?.includes('novedades')) consulta = consulta.eq('novedad', true);

      // Las categorías solo hacen falta para buscar también por su nombre.
      const [respuesta, rebajas, cats] = await Promise.all([
        consulta.order('posicion'),
        promociones(),
        filtros.busqueda?.trim() ? categorias() : Promise.resolve([]),
      ]);
      return aplicarFiltros(conRebajas(aProductos(filas(respuesta, 'los productos')), rebajas), filtros, cats);
    },

    async producto(slug) {
      const [respuesta, rebajas] = await Promise.all([
        cliente.from('productos').select(SELECT_PRODUCTO).eq('slug', slug).eq('estado', 'publicado').maybeSingle(),
        promociones(),
      ]);
      const [fila] = filas(respuesta, 'el producto');
      return fila ? conRebajas([aProducto(fila, urlSupabase)], rebajas)[0] : null;
    },

    async relacionados(slug, cantidad = 4) {
      return elegirRelacionados(await todosLosProductos(), slug, cantidad);
    },

    promociones,

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
