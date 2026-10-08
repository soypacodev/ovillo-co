import { describe, expect, it } from 'vitest';
import { CATEGORIAS, ENVIOS, PRODUCTOS, PROMOCIONES } from '@/datos/semilla';
import { aCategoria, aMetodoEnvio, aProducto, aPromocion, urlFoto } from './mapeo';

const URL_SUPABASE = 'https://ejemplo.supabase.co';

describe('mapeo de filas de Supabase', () => {
  it('una fila con la forma de la base de datos da el mismo producto que la semilla', () => {
    for (const p of PRODUCTOS) {
      // Variantes y fotos desordenadas: el mapeo las ordena por posición.
      const fila = {
        slug: p.slug,
        nombre: p.nombre,
        tipo: p.tipo,
        precio: p.precio,
        antes: p.antes,
        destacado: p.destacado,
        novedad: p.novedad,
        encargo: p.encargo,
        dias: p.dias,
        etiqueta: p.etiqueta,
        corto: p.corto,
        largo: p.largo,
        historia: p.historia,
        materiales: p.materiales,
        cuidados: p.cuidados,
        medidas: p.medidas,
        personalizacion_etiqueta: p.personalizable?.etiqueta ?? null,
        personalizacion_ejemplo: p.personalizable?.ejemplo ?? null,
        personalizacion_max: p.personalizable?.max ?? null,
        personalizacion_pista: p.personalizable?.pista ?? null,
        contenido: p.contenido ?? null,
        posicion: 0,
        categoria: { slug: p.categoria },
        variantes: p.variantes.map((v, i) => ({ ...v, posicion: i })).reverse(),
        fotos: p.fotos.map((f, i) => ({ ruta: f.src, alt: f.alt, posicion: i })).reverse(),
      };
      expect(aProducto(fila, URL_SUPABASE)).toEqual(p);
    }
  });

  it('categorías, promociones y envíos', () => {
    const c = CATEGORIAS[0];
    expect(
      aCategoria({ slug: c.slug, nombre: c.nombre, texto: c.texto, foto_ruta: c.foto.src, foto_alt: c.foto.alt }, URL_SUPABASE),
    ).toEqual(c);

    const pr = PROMOCIONES[0];
    expect(aPromocion({ ...pr, categoria: pr.categoria ? { slug: pr.categoria } : null })).toEqual(pr);

    const e = ENVIOS[0];
    expect(aMetodoEnvio({ id: e.id, nombre: e.nombre, precio: e.precio, gratis_desde: e.gratisDesde, plazo: e.plazo })).toEqual(e);
  });

  it('una fila que no encaja con el esquema falla con claridad', () => {
    expect(() => aMetodoEnvio({ id: 'teletransporte', nombre: 'X', precio: 1, gratis_desde: null, plazo: '' })).toThrow();
    expect(() => aCategoria({ slug: 'amigurumis' }, URL_SUPABASE)).toThrow();
  });

  it('resuelve las rutas de las fotos', () => {
    expect(urlFoto('/fotos/productos/a.jpg', URL_SUPABASE)).toBe('/fotos/productos/a.jpg');
    expect(urlFoto('https://cdn.example/a.jpg', URL_SUPABASE)).toBe('https://cdn.example/a.jpg');
    expect(urlFoto('manta estrella/1.webp', `${URL_SUPABASE}/`)).toBe(
      `${URL_SUPABASE}/storage/v1/object/public/productos/manta%20estrella/1.webp`,
    );
  });
});
