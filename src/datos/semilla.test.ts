// Coherencia del catálogo de ejemplo: lo que se enseña tiene que poder
// comprarse y cada variante tiene que verse.

import { describe, expect, it } from 'vitest';
import { CATEGORIAS, PRODUCTOS, PROMOCIONES } from './semilla';

describe('catálogo de ejemplo', () => {
  it('cada variante tiene una foto de la galería de su producto', () => {
    for (const p of PRODUCTOS) {
      for (const v of p.variantes) {
        expect(v.foto, `${p.nombre} · ${v.nombre}`).toBeDefined();
        expect(p.fotos.map((f) => f.src)).toContain(v.foto?.src);
      }
    }
  });

  it('la foto de cada categoría es de una pieza que se vende en ella', () => {
    for (const c of CATEGORIAS) {
      const fotos = PRODUCTOS.filter((p) => p.categoria === c.slug).flatMap((p) => p.fotos.map((f) => f.src));
      expect(fotos, c.nombre).toContain(c.foto.src);
    }
  });

  it('lo que se teje por encargo no se anuncia como recién hecho', () => {
    const contradicciones = PRODUCTOS.filter((p) => p.encargo && /reci[eé]n/i.test(p.etiqueta ?? ''));
    expect(contradicciones).toEqual([]);
  });

  it('un precio tachado no se suma a una rebaja automática de su categoría', () => {
    const rebajadas = new Set(PROMOCIONES.filter((pr) => !pr.codigo && pr.categoria).map((pr) => pr.categoria));
    expect(rebajadas.size).toBeGreaterThan(0);
    expect(PRODUCTOS.filter((p) => rebajadas.has(p.categoria) && p.antes !== null).map((p) => p.slug)).toEqual([]);
  });

  it('las tallas y los modelos se eligen por nombre y todos los encargos tienen plazo', () => {
    for (const p of PRODUCTOS) {
      if (p.encargo) expect(p.dias, p.nombre).not.toBeNull();
      if (p.etiquetaVariante !== 'Color') expect(new Set(p.variantes.map((v) => v.nombre)).size).toBe(p.variantes.length);
    }
  });
});
