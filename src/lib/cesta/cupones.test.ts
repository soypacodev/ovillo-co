import { describe, expect, it } from 'vitest';
import { aplicarCupon, quitarCupon, validarCupon } from './cupones';
import { FECHA, cestaCon } from './prueba-utiles';
import { CESTA_VACIA } from './tipos';

describe('cupones', () => {
  const cesta = cestaCon(['manta-estrella']);

  it('aplica un código válido sin importar mayúsculas ni espacios', () => {
    const { estado, resultado } = aplicarCupon(cesta, '  hola10 ', undefined, FECHA);
    expect(resultado.ok).toBe(true);
    expect(estado.cupon).toBe('HOLA10');
  });

  it('explica por qué no se aplica', () => {
    expect(validarCupon('', cesta.lineas, undefined, FECHA)).toMatchObject({ ok: false, motivo: 'vacio' });
    expect(validarCupon('REGALO', cesta.lineas, undefined, FECHA)).toMatchObject({
      ok: false,
      motivo: 'no-existe',
      mensaje: 'Ese código no existe o ya no está activo.',
    });
    const pequena = cestaCon(['pulpito-reversible']);
    const r = validarCupon('PRIMERA5', pequena.lineas, undefined, FECHA);
    expect(r).toMatchObject({ ok: false, motivo: 'minimo' });
    expect(r.mensaje).toContain('20,00');
    expect(r.mensaje).toContain('2,00');
  });

  it('mide el mínimo tras la rebaja automática', () => {
    // 22,00 − 15 % = 18,70: no llega a los 20 € de PRIMERA5.
    const bolso = cestaCon(['bolso-red-mercado']);
    expect(validarCupon('PRIMERA5', bolso.lineas, undefined, FECHA).ok).toBe(false);
  });

  it('un código rechazado no cambia la cesta', () => {
    const { estado } = aplicarCupon(cesta, 'NADA', undefined, FECHA);
    expect(estado).toBe(cesta);
  });

  it('quita el cupón', () => {
    const conCupon = { ...cesta, cupon: 'HOLA10' };
    expect(quitarCupon(conCupon).cupon).toBeNull();
    expect(quitarCupon(cesta)).toBe(cesta);
    expect(quitarCupon({ lineas: [], cupon: 'HOLA10' })).toBe(CESTA_VACIA);
  });
});
