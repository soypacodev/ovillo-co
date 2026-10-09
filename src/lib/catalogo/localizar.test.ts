// Aplicación de las traducciones del catálogo: cambian los textos, nunca
// las claves, los precios ni el stock.

import { describe, expect, it } from 'vitest';
import { CATEGORIAS_T, PRODUCTOS_T } from '@/datos/semilla-traducida';
import type { IdiomaTraducido } from './tipos';
import { localizarCategoria, localizarProducto, rotuloVariante } from './localizar';

const IDIOMAS: IdiomaTraducido[] = ['en', 'fr', 'de'];
const manta = PRODUCTOS_T.find((p) => p.slug === 'manta-estrella')!;

describe('localizarProducto', () => {
  it('en inglés cambia el nombre y los textos', () => {
    const p = localizarProducto(manta, 'en');
    expect(p.nombre).toBe('Star blanket');
    expect(p.etiquetaVariante).toBe('Colour');
    for (const campo of ['corto', 'largo', 'historia', 'cuidados', 'medidas'] as const) {
      expect(p[campo], campo).not.toBe(manta[campo]);
    }
    expect(p.materiales).not.toEqual(manta.materiales);
    expect(p.personalizable?.etiqueta).toBe('Embroidered initials');
    expect(p.personalizable?.max).toBe(manta.personalizable?.max);
    expect(p.fotos[0].alt).not.toBe(manta.fotos[0].alt);
    expect(p.variantes[0].foto?.alt).toBe(p.fotos[0].alt);
  });

  it('no cambia slugs, precios, stock ni el nombre de las variantes', () => {
    for (const original of PRODUCTOS_T) {
      for (const idioma of IDIOMAS) {
        const p = localizarProducto(original, idioma);
        expect(p.slug).toBe(original.slug);
        expect(p.categoria).toBe(original.categoria);
        expect(p.precio).toBe(original.precio);
        expect(p.antes).toBe(original.antes);
        expect(p.fotos.map((f) => f.src)).toEqual(original.fotos.map((f) => f.src));
        expect(p.variantes.map((v) => [v.nombre, v.stock, v.color])).toEqual(
          original.variantes.map((v) => [v.nombre, v.stock, v.color]),
        );
      }
    }
  });

  it('pone el rótulo traducido de cada variante', () => {
    const bolso = localizarProducto(PRODUCTOS_T.find((p) => p.slug === 'bolso-red-mercado')!, 'en');
    expect(bolso.variantes.map((v) => [v.nombre, v.rotulo])).toEqual([
      ['Crudo', 'Natural'],
      ['Rosa palo', 'Dusty pink'],
    ]);
    expect(bolso.variantes.map(rotuloVariante)).toEqual(['Natural', 'Dusty pink']);
  });

  it('en español deja los textos como están y no manda traducciones', () => {
    for (const original of PRODUCTOS_T) {
      const p = localizarProducto(original, 'es');
      expect(p).not.toHaveProperty('traducciones');
      expect(p.nombre).toBe(original.nombre);
      expect(p.largo).toBe(original.largo);
      expect(p.variantes.every((v) => v.rotulo === undefined)).toBe(true);
    }
    expect(localizarProducto(manta, 'en')).not.toHaveProperty('traducciones');
  });

  it('todos los productos están traducidos por completo en los tres idiomas', () => {
    for (const p of PRODUCTOS_T) {
      for (const idioma of IDIOMAS) {
        const t = p.traducciones?.[idioma];
        const donde = `${p.slug} · ${idioma}`;
        expect(t, donde).toBeDefined();
        for (const campo of ['nombre', 'etiquetaVariante', 'corto', 'largo', 'cuidados', 'medidas'] as const) {
          expect(t?.[campo], `${donde} · ${campo}`).toBeTruthy();
        }
        if (p.etiqueta !== null) expect(t?.etiqueta, `${donde} · etiqueta`).toBeTruthy();
        if (p.historia !== null) expect(t?.historia, `${donde} · historia`).toBeTruthy();
        expect(t?.materiales?.length, `${donde} · materiales`).toBe(p.materiales.length);
        if (p.contenido) expect(t?.contenido?.length, `${donde} · contenido`).toBe(p.contenido.length);
        if (p.personalizable) {
          expect(t?.personalizable?.etiqueta, `${donde} · personalizable`).toBeTruthy();
          expect(t?.personalizable?.ejemplo, `${donde} · personalizable`).toBeTruthy();
          expect(t?.personalizable?.pista, `${donde} · personalizable`).toBeTruthy();
        }
        expect(Object.keys(t?.variantes ?? {}).sort(), `${donde} · variantes`).toEqual(
          p.variantes.map((v) => v.nombre).sort(),
        );
        expect(t?.fotos?.length, `${donde} · fotos`).toBe(p.fotos.length);
        expect(t?.fotos?.every(Boolean), `${donde} · fotos`).toBe(true);

        const l = localizarProducto(p, idioma);
        expect(l.variantes.every((v) => v.rotulo), `${donde} · rótulos`).toBe(true);
      }
    }
  });
});

describe('localizarCategoria', () => {
  it('traduce nombre, texto y alt sin tocar el slug ni la foto', () => {
    const original = CATEGORIAS_T.find((c) => c.slug === 'hogar')!;
    const c = localizarCategoria(original, 'en');
    expect(c).toMatchObject({ slug: 'hogar', nombre: 'Home', texto: 'Cushions and baskets.' });
    expect(c.foto.src).toBe(original.foto.src);
    expect(c.foto.alt).not.toBe(original.foto.alt);
    expect(c).not.toHaveProperty('traducciones');
  });

  it('en español no cambia nada salvo quitar las traducciones', () => {
    for (const original of CATEGORIAS_T) {
      const sin = { ...original };
      delete sin.traducciones;
      expect(localizarCategoria(original, 'es')).toEqual(sin);
    }
  });

  it('todas las categorías están traducidas en los tres idiomas', () => {
    for (const c of CATEGORIAS_T) {
      for (const idioma of IDIOMAS) {
        const t = c.traducciones?.[idioma];
        expect(t?.nombre && t.texto && t.alt, `${c.slug} · ${idioma}`).toBeTruthy();
      }
    }
  });
});
