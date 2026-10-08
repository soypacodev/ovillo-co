// Filas de Supabase → tipos del catálogo. Cada fila se valida con zod al
// entrar: si el esquema y el código se desincronizan, falla aquí con un
// mensaje claro en vez de pintar una ficha a medias.

import { z } from 'zod';
import type {
  Categoria,
  Foto,
  MetodoEnvio,
  Producto,
  Promocion,
  SlugCategoria,
} from '@/lib/catalogo/tipos';

const slugCategoria = z.enum(['amigurumis', 'bebe', 'accesorios', 'hogar', 'packs']) satisfies z.ZodType<SlugCategoria>;
const entero = z.number().int();
const textoONulo = z.string().nullable();

/**
 * Columnas que pide cada consulta; van junto a su esquema para que no
 * discrepen. Las relaciones llevan el nombre de su clave ajena porque
 * fotos_producto apunta a la vez a productos y a variantes, y PostgREST
 * no sabría por qué camino unir. supabase/pruebas/rls.sql comprueba que
 * esos nombres existen.
 */
export const SELECT_CATEGORIA = 'slug, nombre, texto, foto_ruta, foto_alt';

export const SELECT_PRODUCTO = `
  slug, nombre, tipo, precio, antes, variante_etiqueta, destacado, novedad, encargo, dias, etiqueta,
  corto, largo, historia, materiales, cuidados, medidas,
  personalizacion_etiqueta, personalizacion_ejemplo, personalizacion_max, personalizacion_pista,
  contenido, posicion,
  categoria:categorias!productos_categoria_id_fkey!inner(slug),
  variantes!variantes_producto_id_fkey(nombre, color, stock, foto_ruta, posicion),
  fotos:fotos_producto!fotos_producto_producto_id_fkey(ruta, alt, posicion)
`;

export const SELECT_PROMOCION =
  'nombre, tipo, valor, codigo, minimo, hasta, categoria:categorias!promociones_categoria_id_fkey(slug)';

export const SELECT_ENVIO = 'id, nombre, precio, gratis_desde, plazo';

const filaCategoria = z.object({
  slug: slugCategoria,
  nombre: z.string(),
  texto: z.string(),
  foto_ruta: z.string(),
  foto_alt: z.string(),
});

const filaProducto = z.object({
  slug: z.string(),
  nombre: z.string(),
  tipo: z.enum(['simple', 'pack']),
  precio: entero,
  antes: entero.nullable(),
  variante_etiqueta: z.string(),
  destacado: z.boolean(),
  novedad: z.boolean(),
  encargo: z.boolean(),
  dias: entero.nullable(),
  etiqueta: textoONulo,
  corto: z.string(),
  largo: z.string(),
  historia: textoONulo,
  materiales: z.array(z.string()),
  cuidados: z.string(),
  medidas: z.string(),
  personalizacion_etiqueta: textoONulo,
  personalizacion_ejemplo: textoONulo,
  personalizacion_max: entero.nullable(),
  personalizacion_pista: textoONulo,
  contenido: z.array(z.string()).nullable(),
  posicion: entero,
  categoria: z.object({ slug: slugCategoria }),
  variantes: z.array(
    z.object({ nombre: z.string(), color: z.string(), stock: entero, foto_ruta: textoONulo, posicion: entero }),
  ),
  fotos: z.array(z.object({ ruta: z.string(), alt: z.string(), posicion: entero })),
});

const tipoPromocion = z.enum(['porcentaje', 'fijo', 'envio']);

const filaPromocion = z.object({
  nombre: z.string(),
  tipo: tipoPromocion,
  valor: entero,
  codigo: textoONulo,
  minimo: entero,
  hasta: textoONulo,
  categoria: z.object({ slug: slugCategoria }).nullable(),
});

/** Lo que devuelve la función buscar_cupon(). */
const filaCupon = z.object({
  nombre: z.string(),
  tipo: tipoPromocion,
  valor: entero,
  codigo: z.string(),
  minimo: entero,
  categoria: slugCategoria.nullable(),
  hasta: textoONulo,
});

const filaEnvio = z.object({
  id: z.enum(['ordinario', 'express', 'recogida']),
  nombre: z.string(),
  precio: entero,
  gratis_desde: entero.nullable(),
  plazo: z.string(),
});

/**
 * Las rutas que empiezan por «/» o por http se usan tal cual (fotos en
 * public/ o en otro dominio); el resto son rutas del bucket «productos».
 */
export function urlFoto(ruta: string, urlSupabase: string): string {
  if (ruta.startsWith('/') || /^https?:\/\//.test(ruta)) return ruta;
  const camino = ruta.split('/').map(encodeURIComponent).join('/');
  return `${urlSupabase.replace(/\/+$/, '')}/storage/v1/object/public/productos/${camino}`;
}

const porPosicion = (a: { posicion: number }, b: { posicion: number }) => a.posicion - b.posicion;

/** Fila de `categorias` → Categoria. Lanza si la fila no tiene la forma esperada. */
export function aCategoria(fila: unknown, urlSupabase: string): Categoria {
  const f = filaCategoria.parse(fila);
  return {
    slug: f.slug,
    nombre: f.nombre,
    texto: f.texto,
    foto: { src: urlFoto(f.foto_ruta, urlSupabase), alt: f.foto_alt },
  };
}

/** Fila de `productos` con sus variantes y fotos → Producto, todo ordenado por posición. */
export function aProducto(fila: unknown, urlSupabase: string): Producto {
  const f = filaProducto.parse(fila);
  const fotos: Foto[] = [...f.fotos]
    .sort(porPosicion)
    .map((foto) => ({ src: urlFoto(foto.ruta, urlSupabase), alt: foto.alt }));

  // La foto de una variante es una de la galería (y comparte su texto
  // alternativo); si no está en ella, se describe con el nombre.
  const fotoVariante = (ruta: string | null, variante: string): Foto | undefined => {
    if (!ruta) return undefined;
    const src = urlFoto(ruta, urlSupabase);
    return fotos.find((foto) => foto.src === src) ?? { src, alt: `${f.nombre}, ${variante}` };
  };

  const producto: Producto = {
    slug: f.slug,
    nombre: f.nombre,
    categoria: f.categoria.slug,
    tipo: f.tipo,
    precio: f.precio,
    antes: f.antes,
    etiquetaVariante: f.variante_etiqueta,
    destacado: f.destacado,
    novedad: f.novedad,
    encargo: f.encargo,
    dias: f.dias,
    etiqueta: f.etiqueta,
    corto: f.corto,
    largo: f.largo,
    historia: f.historia,
    materiales: f.materiales,
    cuidados: f.cuidados,
    medidas: f.medidas,
    fotos,
    variantes: [...f.variantes]
      .sort(porPosicion)
      .map((v) => {
        const foto = fotoVariante(v.foto_ruta, v.nombre);
        return { nombre: v.nombre, color: v.color, stock: v.stock, ...(foto && { foto }) };
      }),
  };

  if (f.personalizacion_etiqueta !== null && f.personalizacion_max !== null) {
    producto.personalizable = {
      etiqueta: f.personalizacion_etiqueta,
      ejemplo: f.personalizacion_ejemplo ?? '',
      max: f.personalizacion_max,
      pista: f.personalizacion_pista ?? '',
    };
  }
  if (f.contenido !== null) producto.contenido = f.contenido;

  return producto;
}

/** Fila de `promociones` (rebaja automática) → Promocion. */
export function aPromocion(fila: unknown): Promocion {
  const f = filaPromocion.parse(fila);
  return {
    nombre: f.nombre,
    tipo: f.tipo,
    valor: f.valor,
    codigo: f.codigo,
    minimo: f.minimo,
    categoria: f.categoria?.slug ?? null,
    hasta: f.hasta,
  };
}

/** Resultado de buscar_cupon() → Promocion. */
export function aCupon(fila: unknown): Promocion {
  const f = filaCupon.parse(fila);
  return {
    nombre: f.nombre,
    tipo: f.tipo,
    valor: f.valor,
    codigo: f.codigo,
    minimo: f.minimo,
    categoria: f.categoria,
    hasta: f.hasta,
  };
}

/** Fila de `metodos_envio` → MetodoEnvio. */
export function aMetodoEnvio(fila: unknown): MetodoEnvio {
  const f = filaEnvio.parse(fila);
  return { id: f.id, nombre: f.nombre, precio: f.precio, gratisDesde: f.gratis_desde, plazo: f.plazo };
}
