import { describe, expect, it } from 'vitest';
import { tipografia } from './tipografia';

describe('tipografia', () => {
  it('pone raya corta en los intervalos de cifras', () => {
    expect(tipografia('Sale en 24-48 h')).toBe('Sale en 24–48 h');
    expect(tipografia('3-5 días laborables')).toBe('3–5 días laborables');
    expect(tipografia('25 – 50 €')).toBe('25–50\u00A0€');
  });

  it('une la cifra con su unidad', () => {
    expect(tipografia('desde 50 € y un 10 %')).toBe('desde 50 € y un 10 %');
    expect(tipografia('a 30 °C')).toBe('a 30 °C');
    expect(tipografia('10 × 10 cm')).toBe('10 × 10 cm');
  });

  it('no toca palabras que empiezan como una unidad', () => {
    expect(tipografia('3 horas y 2 manos')).toBe('3 horas y 2 manos');
  });
});
