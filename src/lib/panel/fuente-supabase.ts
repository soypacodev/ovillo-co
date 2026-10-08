// Panel con Supabase. Pedidos, clientes, encargos y mensajes se leen con
// las funciones panel_*, que comprueban el rol y enmascaran los datos
// personales según quién mira; el catálogo, de sus tablas (RLS deja leerlo
// entero a admin y a demo). Todo con la sesión de quien abre el panel,
// nunca con la clave de servicio.

import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { SlugCategoria } from '@/lib/catalogo/tipos';
import { urlFoto } from '@/lib/datos/supabase/mapeo';
import { ESTADOS_PRODUCTO } from './estados';
import {
  fichaEncargo,
  fichaPedido,
  filaCliente,
  filaEncargo,
  filaMensaje,
  filaPedido,
  filaResumen,
  filaStockBajo,
  filaVentaDia,
  type FichaProductoPanel,
  type FilaProductoPanel,
  type Pagina,
} from './filas';
import type { FuentePanel } from './fuente';

/** Lo que tarda en caducar el enlace firmado de una foto de encargo. */
const SEGUNDOS_FOTO = 10 * 60;

class ErrorPanel extends Error {}

function comprobar<T>(resultado: { data: T | null; error: { message: string; code?: string } | null }, que: string): T {
  if (resultado.error) throw new ErrorPanel(`No se pudo leer ${que}: ${resultado.error.message}`);
  return resultado.data as T;
}

function pagina<T extends { total_filas: number }>(filas: T[]): Pagina<T> {
  return { filas, total: filas[0]?.total_filas ?? 0 };
}

const SELECT_PRODUCTO_PANEL = `
  id, slug, nombre, tipo, estado, precio, antes, destacado, novedad, encargo, dias, etiqueta,
  corto, largo, historia, materiales, cuidados, medidas, contenido,
  personalizacion_etiqueta, personalizacion_ejemplo, personalizacion_max, personalizacion_pista, posicion,
  categoria:categorias!productos_categoria_id_fkey!inner(slug),
  variantes!variantes_producto_id_fkey(id, nombre, color, sku, stock, activa, posicion),
  fotos:fotos_producto!fotos_producto_producto_id_fkey(id, ruta, alt, posicion)
`;

const textoONulo = z.string().nullable();
const filaProductoBd = z.object({
  id: z.string(),
  slug: z.string(),
  nombre: z.string(),
  tipo: z.enum(['simple', 'pack']),
  estado: z.enum(ESTADOS_PRODUCTO),
  precio: z.number().int(),
  antes: z.number().int().nullable(),
  destacado: z.boolean(),
  novedad: z.boolean(),
  encargo: z.boolean(),
  dias: z.number().int().nullable(),
  etiqueta: textoONulo,
  corto: z.string(),
  largo: z.string(),
  historia: textoONulo,
  materiales: z.array(z.string()),
  cuidados: z.string(),
  medidas: z.string(),
  contenido: z.array(z.string()).nullable(),
  personalizacion_etiqueta: textoONulo,
  personalizacion_ejemplo: textoONulo,
  personalizacion_max: z.number().int().nullable(),
  personalizacion_pista: textoONulo,
  categoria: z.object({ slug: z.enum(['amigurumis', 'bebe', 'accesorios', 'hogar', 'packs']) satisfies z.ZodType<SlugCategoria> }),
  variantes: z.array(
    z.object({
      id: z.string(),
      nombre: z.string(),
      color: z.string(),
      sku: textoONulo,
      stock: z.number().int(),
      activa: z.boolean(),
      posicion: z.number().int(),
    }),
  ),
  fotos: z.array(z.object({ id: z.string(), ruta: z.string(), alt: z.string(), posicion: z.number().int() })),
});

const porPosicion = (a: { posicion: number }, b: { posicion: number }) => a.posicion - b.posicion;

function aFicha(fila: unknown, urlSupabase: string): FichaProductoPanel {
  const f = filaProductoBd.parse(fila);
  const fotos = [...f.fotos].sort(porPosicion);
  return {
    ...f,
    categoria: f.categoria.slug,
    foto: fotos[0] ? urlFoto(fotos[0].ruta, urlSupabase) : null,
    variantes: [...f.variantes]
      .sort(porPosicion)
      .map((v) => ({ id: v.id, nombre: v.nombre, color: v.color, sku: v.sku, stock: v.stock, activa: v.activa })),
    fotos: fotos.map(({ id, ruta, alt }) => ({ id, ruta, alt, url: urlFoto(ruta, urlSupabase) })),
  };
}

export function crearFuenteSupabase(bd: SupabaseClient, urlSupabase: string): FuentePanel {
  return {
    modo: 'supabase',

    async resumen() {
      const filas = comprobar(await bd.rpc('panel_resumen'), 'el resumen');
      return filaResumen.parse(Array.isArray(filas) ? filas[0] : filas);
    },

    async ventasPorDia(dias = 30) {
      return z.array(filaVentaDia).parse(comprobar(await bd.rpc('panel_ventas_por_dia', { p_dias: dias }), 'las ventas'));
    },

    async stockBajo(umbral = 1) {
      return z.array(filaStockBajo).parse(comprobar(await bd.rpc('panel_stock_bajo', { p_umbral: umbral }), 'el stock'));
    },

    async pedidos({ estado, busqueda, limite, desplazamiento }) {
      const datos = comprobar(
        await bd.rpc('panel_pedidos', {
          p_estado: estado ?? null,
          p_busqueda: busqueda || null,
          p_limite: limite,
          p_desplazamiento: desplazamiento,
        }),
        'los pedidos',
      );
      return pagina(z.array(filaPedido).parse(datos));
    },

    async pedido(id) {
      const datos = comprobar(await bd.rpc('panel_pedido', { p_id: id }), 'el pedido');
      return datos ? fichaPedido.parse(datos) : null;
    },

    async clientes({ limite, desplazamiento }) {
      const datos = comprobar(
        await bd.rpc('panel_clientes', { p_limite: limite, p_desplazamiento: desplazamiento }),
        'los clientes',
      );
      return pagina(z.array(filaCliente).parse(datos));
    },

    async encargos({ estado, limite, desplazamiento }) {
      const datos = comprobar(
        await bd.rpc('panel_encargos', { p_estado: estado ?? null, p_limite: limite, p_desplazamiento: desplazamiento }),
        'los encargos',
      );
      return pagina(z.array(filaEncargo).parse(datos));
    },

    async encargo(id) {
      const datos = comprobar(await bd.rpc('panel_encargo', { p_id: id }), 'el encargo');
      if (!datos) return null;
      const ficha = fichaEncargo.parse(datos);
      // La firma la valida Storage con la sesión: demo solo obtiene enlace
      // para las fotos de los encargos ficticios.
      let urls: { ruta: string; url: string }[] = [];
      if (ficha.fotos.length) {
        const { data } = await bd.storage.from('encargos').createSignedUrls(ficha.fotos, SEGUNDOS_FOTO);
        urls = (data ?? []).flatMap((f) => (f.signedUrl && f.path ? [{ ruta: f.path, url: f.signedUrl }] : []));
      }
      return { ...ficha, urls_fotos: urls };
    },

    async mensajes({ estado, limite, desplazamiento }) {
      const datos = comprobar(
        await bd.rpc('panel_mensajes', { p_estado: estado ?? null, p_limite: limite, p_desplazamiento: desplazamiento }),
        'los mensajes',
      );
      return pagina(z.array(filaMensaje).parse(datos));
    },

    async productos(): Promise<FilaProductoPanel[]> {
      const datos = comprobar(
        await bd.from('productos').select(SELECT_PRODUCTO_PANEL).order('posicion').order('nombre'),
        'los productos',
      );
      return (datos ?? []).map((f) => aFicha(f, urlSupabase));
    },

    async producto(slug) {
      const datos = comprobar(
        await bd.from('productos').select(SELECT_PRODUCTO_PANEL).eq('slug', slug).maybeSingle(),
        'el producto',
      );
      return datos ? aFicha(datos, urlSupabase) : null;
    },
  };
}
