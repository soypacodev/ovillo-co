import { describe, expect, it } from 'vitest';
import { conSiguiente, destinoSeguro } from './redireccion';

describe('destino después de entrar', () => {
  it('admite rutas internas con su búsqueda', () => {
    expect(destinoSeguro('/cuenta/pedidos?pagina=2')).toBe('/cuenta/pedidos?pagina=2');
    expect(destinoSeguro('/panel')).toBe('/panel');
  });

  it('nunca manda a otra web', () => {
    for (const malo of ['https://malo.example', '//malo.example', '/\\malo.example', 'javascript:alert(1)', '', null, 42]) {
      expect(destinoSeguro(malo)).toBe('/cuenta');
    }
  });

  it('no se deja engañar por rutas que se normalizan a otro dominio', () => {
    for (const malo of ['/.//malo.example', '/a/..//malo.example', '/./\\malo.example', '/\t/malo.example']) {
      expect(destinoSeguro(malo)).toBe('/cuenta');
    }
  });

  it('codifica el destino en la URL de entrar', () => {
    expect(conSiguiente('/entrar', '/cuenta/pedidos')).toBe('/entrar?siguiente=%2Fcuenta%2Fpedidos');
  });
});
