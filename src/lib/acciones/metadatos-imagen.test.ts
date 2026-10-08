import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { sinMetadatos } from './metadatos-imagen';

const ascii = (texto: string) => Array.from(texto, (c) => c.charCodeAt(0));
const PRIVADO = 'GPS 36.7213 -4.4214 iPhone de casa';

function contiene(bytes: Uint8Array, texto: string): boolean {
  return Buffer.from(bytes).includes(Buffer.from(texto, 'latin1'));
}

function segmento(marcador: number, datos: number[]): number[] {
  const largo = datos.length + 2;
  return [0xff, marcador, largo >> 8, largo & 0xff, ...datos];
}

/** EXIF en «Motorola» con la orientación y, detrás, texto que no debe sobrevivir. */
function exif(orientacion: number): number[] {
  return [
    ...ascii('Exif\0\0'),
    ...ascii('MM'), 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08,
    0x00, 0x01,
    0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, orientacion, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    ...ascii(PRIVADO),
  ];
}

describe('fotos sin metadatos', () => {
  const foto = new Uint8Array(readFileSync(new URL('../../../public/fotos/portada.jpg', import.meta.url)));
  const inicioImagen = Buffer.from(foto).indexOf(Buffer.from([0xff, 0xda]));

  it('un JPEG pierde el EXIF, el XMP y los comentarios, pero conserva la imagen y el giro', () => {
    const conDatos = new Uint8Array([
      0xff, 0xd8,
      ...segmento(0xe1, exif(6)),
      ...segmento(0xe1, ascii(`http://ns.adobe.com/xap/1.0/\0<x:xmpmeta>${PRIVADO}</x:xmpmeta>`)),
      ...segmento(0xfe, ascii(PRIVADO)),
      ...foto.subarray(2),
    ]);
    const limpia = sinMetadatos(conDatos, 'image/jpeg');
    expect(limpia).not.toBeNull();
    const r = limpia as Uint8Array;
    expect(contiene(r, PRIVADO)).toBe(false);
    expect(contiene(r, 'xmpmeta')).toBe(false);
    // La orientación sigue ahí para que la foto del móvil no salga tumbada.
    expect(Buffer.from(r).includes(Buffer.from([0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, 0x06]))).toBe(true);
    // Los datos de la imagen llegan intactos.
    const tramo = foto.subarray(inicioImagen);
    expect(Buffer.from(r.subarray(r.length - tramo.length)).equals(Buffer.from(tramo))).toBe(true);
  });

  it('sin giro que conservar, el JPEG se queda sin EXIF', () => {
    const conDatos = new Uint8Array([0xff, 0xd8, ...segmento(0xe1, exif(1)), ...foto.subarray(2)]);
    const r = sinMetadatos(conDatos, 'image/jpeg') as Uint8Array;
    expect(contiene(r, 'Exif')).toBe(false);
  });

  it('un JPEG mal formado no se guarda', () => {
    expect(sinMetadatos(new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0x40, 0x00, 0x01]), 'image/jpeg')).toBeNull();
    expect(sinMetadatos(foto.subarray(0, inicioImagen), 'image/jpeg')).toBeNull();
  });

  it('un PNG pierde los trozos de texto y EXIF', () => {
    const trozo = (tipo: string, datos: number[]) => {
      const n = datos.length;
      return [n >>> 24, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff, ...ascii(tipo), ...datos, 0, 0, 0, 0];
    };
    const png = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ...trozo('IHDR', [0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0]),
      ...trozo('tEXt', ascii(`Comment\0${PRIVADO}`)),
      ...trozo('eXIf', exif(6).slice(6)),
      ...trozo('IDAT', [1, 2, 3]),
      ...trozo('IEND', []),
    ]);
    const r = sinMetadatos(png, 'image/png') as Uint8Array;
    expect(contiene(r, PRIVADO)).toBe(false);
    expect(['IHDR', 'IDAT', 'IEND'].every((t) => contiene(r, t))).toBe(true);
    expect(sinMetadatos(png.subarray(0, png.length - 12), 'image/png')).toBeNull();
  });

  it('un WebP pierde EXIF y XMP y lo dice en su cabecera', () => {
    const trozo = (tipo: string, datos: number[]) => {
      const n = datos.length;
      return [...ascii(tipo), n & 0xff, (n >> 8) & 0xff, 0, 0, ...datos, ...(n % 2 ? [0] : [])];
    };
    const cuerpo = [
      ...ascii('WEBP'),
      ...trozo('VP8X', [0x08 | 0x04, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
      ...trozo('VP8L', [0x2f, 0, 0, 0, 0]),
      ...trozo('EXIF', exif(6).slice(6)),
      ...trozo('XMP ', ascii(PRIVADO)),
    ];
    const n = cuerpo.length;
    const webp = new Uint8Array([...ascii('RIFF'), n & 0xff, (n >> 8) & 0xff, 0, 0, ...cuerpo]);
    const r = sinMetadatos(webp, 'image/webp') as Uint8Array;
    expect(contiene(r, PRIVADO)).toBe(false);
    expect(contiene(r, 'VP8L')).toBe(true);
    expect(r[20] & 0x0c).toBe(0);
    expect(new DataView(r.buffer, r.byteOffset).getUint32(4, true)).toBe(r.length - 8);
  });
});
