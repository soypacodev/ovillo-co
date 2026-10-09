// El catálogo en el idioma de la página. Los datos se guardan en español
// con sus traducciones al lado; aquí se eligen los textos y se quitan las
// traducciones para no mandar al navegador los cuatro idiomas.
//
// Lo que no cambia nunca: slugs, nombres de variante en español (son la
// clave en la cesta, en Stripe y en la base de datos), precios y stock.

import type { Idioma } from '@/lib/i18n/idiomas';
import type {
  Categoria,
  MetodoEnvio,
  Producto,
  Promocion,
  RebajaProducto,
  Traducciones,
  TraduccionTexto,
} from './tipos';

/** Copia sin la clave `traducciones`. */
function sinTraducciones<T extends { traducciones?: unknown }>(valor: T): Omit<T, 'traducciones'> {
  const copia = { ...valor };
  delete copia.traducciones;
  return copia;
}

const traduccion = <T>(t: Traducciones<T> | undefined, idioma: Idioma): T | undefined =>
  idioma === 'es' ? undefined : t?.[idioma];

/** Texto traducido si existe y no está vacío; si no, el original. */
const o = <T>(traducido: T | undefined | null, original: T): T =>
  traducido === undefined || traducido === null || traducido === '' ? original : traducido;

export function localizarCategoria(c: Categoria, idioma: Idioma): Categoria {
  const t = traduccion(c.traducciones, idioma);
  return {
    ...sinTraducciones(c),
    nombre: o(t?.nombre, c.nombre),
    texto: o(t?.texto, c.texto),
    foto: { ...c.foto, alt: o(t?.alt, c.foto.alt) },
  };
}

function localizarRebaja(r: RebajaProducto | null | undefined, idioma: Idioma): RebajaProducto | null | undefined {
  if (!r) return r;
  return { ...sinTraducciones(r), nombre: o(traduccion(r.traducciones, idioma)?.nombre, r.nombre) };
}

export function localizarProducto(p: Producto, idioma: Idioma): Producto {
  const t = traduccion(p.traducciones, idioma);
  // Las fotos de las variantes son de la galería: se traducen por su ruta.
  const altPorRuta = new Map(p.fotos.map((f, i) => [f.src, o(t?.fotos?.[i], f.alt)]));
  const foto = <F extends { src: string; alt: string }>(f: F): F => ({ ...f, alt: altPorRuta.get(f.src) ?? f.alt });

  const producto: Producto = {
    ...sinTraducciones(p),
    nombre: o(t?.nombre, p.nombre),
    etiquetaVariante: o(t?.etiquetaVariante, p.etiquetaVariante),
    etiqueta: p.etiqueta === null ? null : o(t?.etiqueta, p.etiqueta),
    corto: o(t?.corto, p.corto),
    largo: o(t?.largo, p.largo),
    historia: p.historia === null ? null : o(t?.historia, p.historia),
    materiales: t?.materiales?.length === p.materiales.length ? [...t.materiales] : [...p.materiales],
    cuidados: o(t?.cuidados, p.cuidados),
    medidas: o(t?.medidas, p.medidas),
    fotos: p.fotos.map(foto),
    variantes: p.variantes.map((v) => {
      const rotulo = t?.variantes?.[v.nombre];
      const variante = { ...v, ...(v.foto && { foto: foto(v.foto) }) };
      delete variante.rotulo;
      return rotulo ? { ...variante, rotulo } : variante;
    }),
  };
  if (p.rebaja !== undefined) producto.rebaja = localizarRebaja(p.rebaja, idioma);
  if (p.personalizable) {
    producto.personalizable = {
      ...p.personalizable,
      etiqueta: o(t?.personalizable?.etiqueta, p.personalizable.etiqueta),
      ejemplo: o(t?.personalizable?.ejemplo, p.personalizable.ejemplo),
      pista: o(t?.personalizable?.pista, p.personalizable.pista),
    };
  }
  if (p.contenido) {
    producto.contenido = t?.contenido?.length === p.contenido.length ? [...t.contenido] : [...p.contenido];
  }
  return producto;
}

export function localizarPromocion(p: Promocion, idioma: Idioma): Promocion {
  return { ...sinTraducciones(p), nombre: o(traduccion<TraduccionTexto>(p.traducciones, idioma)?.nombre, p.nombre) };
}

export function localizarEnvio(m: MetodoEnvio, idioma: Idioma): MetodoEnvio {
  const t = traduccion(m.traducciones, idioma);
  return { ...sinTraducciones(m), nombre: o(t?.nombre, m.nombre), plazo: o(t?.plazo, m.plazo) };
}

/** Nombre visible de una variante. */
export const rotuloVariante = (v: { nombre: string; rotulo?: string }) => v.rotulo ?? v.nombre;
