import { describe, expect, it } from 'vitest';
import { conIdioma, IDIOMAS } from '@/lib/i18n/idiomas';
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

  it('admite rutas con prefijo de idioma', () => {
    expect(destinoSeguro('/en/cuenta')).toBe('/en/cuenta');
    expect(destinoSeguro('/fr/cuenta/pedidos?pagina=2')).toBe('/fr/cuenta/pedidos?pagina=2');
    expect(destinoSeguro('/de')).toBe('/de');
  });

  it('no deja colar otro dominio detrás del prefijo de idioma', () => {
    for (const malo of ['/en//malo.example', '/fr/\\malo.example', '/de/.//malo.example', '/en/a/..//malo.example']) {
      expect(destinoSeguro(malo)).toBe('/cuenta');
    }
  });

  it('el destino sigue siendo interno al pasarlo a cualquier idioma', () => {
    for (const valor of ['/en/cuenta', '/en//malo.example', '/es//malo.example', '/fr/\\malo.example', '/panel']) {
      for (const idioma of IDIOMAS) {
        const destino = conIdioma(destinoSeguro(valor), idioma);
        expect(destino.startsWith('/')).toBe(true);
        expect(destino.startsWith('//')).toBe(false);
      }
    }
  });

  it('codifica el destino en la URL de entrar', () => {
    expect(conSiguiente('/entrar', '/cuenta/pedidos')).toBe('/entrar?siguiente=%2Fcuenta%2Fpedidos');
    expect(conSiguiente('/en/entrar', '/en/cuenta')).toBe('/en/entrar?siguiente=%2Fen%2Fcuenta');
  });
});
