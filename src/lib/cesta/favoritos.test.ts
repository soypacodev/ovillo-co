import { describe, expect, it } from 'vitest';
import { alternarFavorito, esFavorito, normalizarFavoritos } from './favoritos';

describe('favoritos', () => {
  it('alterna guardar y quitar', () => {
    const a = alternarFavorito([], 'manta-estrella');
    expect(a).toEqual({ favoritos: ['manta-estrella'], guardado: true });
    expect(esFavorito(a.favoritos, 'manta-estrella')).toBe(true);
    expect(alternarFavorito(a.favoritos, 'manta-estrella')).toEqual({ favoritos: [], guardado: false });
  });

  it('normaliza lo leído del almacenamiento', () => {
    expect(normalizarFavoritos(null)).toEqual([]);
    expect(normalizarFavoritos({ a: 1 })).toEqual([]);
    expect(normalizarFavoritos(['a', 'a', 3, '', 'b'])).toEqual(['a', 'b']);
  });
});
