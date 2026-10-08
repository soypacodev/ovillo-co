import { describe, expect, it } from 'vitest';
import { MAX_FAVORITOS } from '@/lib/cesta/favoritos';
import { cambiosFavoritos, fusionarFavoritos } from './favoritos';

describe('fusión de favoritos al entrar', () => {
  it('une las dos listas sin repetir: primero los de la cuenta', () => {
    expect(fusionarFavoritos(['b', 'c'], ['a', 'b'])).toEqual({ favoritos: ['a', 'b', 'c'], subir: ['c'] });
  });

  it('con una de las dos vacía se queda con la otra', () => {
    expect(fusionarFavoritos([], ['a'])).toEqual({ favoritos: ['a'], subir: [] });
    expect(fusionarFavoritos(['a'], [])).toEqual({ favoritos: ['a'], subir: ['a'] });
  });

  it('tolera lo que haya en localStorage, por raro que sea', () => {
    expect(fusionarFavoritos('no es una lista', ['a'])).toEqual({ favoritos: ['a'], subir: [] });
    expect(fusionarFavoritos([1, null, 'a', 'a', ''], null)).toEqual({ favoritos: ['a'], subir: ['a'] });
  });

  it('respeta el máximo y no sube lo que se queda fuera', () => {
    const remotos = Array.from({ length: MAX_FAVORITOS }, (_, i) => `r${i}`);
    const r = fusionarFavoritos(['nuevo'], remotos);
    expect(r.favoritos).toHaveLength(MAX_FAVORITOS);
    expect(r.favoritos.at(-1)).toBe('nuevo');
    expect(r.subir).toEqual(['nuevo']);
  });

  it('calcula qué guardar y qué quitar en la cuenta', () => {
    expect(cambiosFavoritos(['a', 'b'], ['b', 'c'])).toEqual({ anadir: ['c'], quitar: ['a'] });
    expect(cambiosFavoritos(['a'], ['a'])).toEqual({ anadir: [], quitar: [] });
  });
});
