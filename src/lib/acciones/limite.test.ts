import { describe, expect, it } from 'vitest';
import { tipoDeImagen } from './fotos';
import { crearLimitador, origenPeticion } from './limite';

describe('límite de envíos', () => {
  it('deja pasar hasta el máximo y frena el siguiente', () => {
    const limite = crearLimitador({ maximo: 2, ventana: 1000 });
    expect(limite.permitir('a', 0)).toBe(true);
    expect(limite.permitir('a', 10)).toBe(true);
    expect(limite.permitir('a', 20)).toBe(false);
    expect(limite.permitir('b', 20)).toBe(true);
  });

  it('vuelve a dejar pasar cuando caduca la ventana', () => {
    const limite = crearLimitador({ maximo: 1, ventana: 1000 });
    expect(limite.permitir('a', 0)).toBe(true);
    expect(limite.permitir('a', 999)).toBe(false);
    expect(limite.permitir('a', 1000)).toBe(true);
  });

  it('toma la IP que pone el proxy, no la que puede inventar el cliente', () => {
    // El cliente manda «1.2.3.4» y el proxy añade detrás la IP real.
    expect(origenPeticion(new Headers({ 'x-forwarded-for': '1.2.3.4, 203.0.113.7' }))).toBe('203.0.113.7');
    expect(origenPeticion(new Headers({ 'x-forwarded-for': '5.6.7.8, 203.0.113.7' }))).toBe('203.0.113.7');
    expect(origenPeticion(new Headers({ 'x-real-ip': '198.51.100.2', 'x-forwarded-for': '1.2.3.4' }))).toBe('198.51.100.2');
    expect(origenPeticion(new Headers())).toBe('anonimo');
  });
});

describe('firma de las imágenes', () => {
  it('reconoce JPEG, PNG y WebP', () => {
    expect(tipoDeImagen(new Uint8Array([0xff, 0xd8, 0xff, 0xdb]))).toBe('image/jpeg');
    expect(tipoDeImagen(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe('image/png');
    const webp = new TextEncoder().encode('RIFF\0\0\0\0WEBPVP8 ');
    expect(tipoDeImagen(webp)).toBe('image/webp');
  });

  it('no se deja engañar por la extensión ni por archivos cortos', () => {
    expect(tipoDeImagen(new TextEncoder().encode('GIF89a'))).toBeNull();
    expect(tipoDeImagen(new TextEncoder().encode('RIFF\0\0\0\0WAVE'))).toBeNull();
    expect(tipoDeImagen(new Uint8Array([0xff, 0xd8]))).toBeNull();
  });
});
