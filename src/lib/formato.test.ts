import { describe, expect, it } from 'vitest';
import { eur, eurMenos, piezas, porcentajeRebaja } from './formato';

describe('formato', () => {
  it('formatea céntimos en euros a la española', () => {
    expect(eur(1200)).toBe('12,00 €');
    expect(eur(2265)).toBe('22,65 €');
    expect(eur(0)).toBe('0,00 €');
    expect(eur(123456)).toBe('1234,56 €');
    expect(eur(1234567)).toBe('12.345,67 €');
    expect(eurMenos(330)).toBe('−3,30 €');
  });

  it('calcula el porcentaje de rebaja', () => {
    expect(porcentajeRebaja(2800, 2200)).toBe(21);
    expect(porcentajeRebaja(null, 2200)).toBe(0);
    expect(porcentajeRebaja(2000, 2200)).toBe(0);
  });

  it('cuenta piezas', () => {
    expect(piezas(1)).toBe('1 pieza');
    expect(piezas(3)).toBe('3 piezas');
  });
});
