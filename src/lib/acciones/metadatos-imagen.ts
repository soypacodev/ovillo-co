// Quita los metadatos de una foto antes de guardarla. Las del móvil llevan
// en EXIF las coordenadas GPS, la fecha y el modelo del teléfono, y el
// bucket «productos» sirve el archivo original a cualquiera: sin esto, una
// foto subida desde casa diría dónde está la casa. Se recorre el formato a
// mano para no añadir una dependencia de procesado de imágenes.

import type { TipoImagen } from './fotos';

const ascii = (texto: string) => Array.from(texto, (c) => c.charCodeAt(0));
const igual = (bytes: Uint8Array, desde: number, firma: readonly number[]) =>
  desde + firma.length <= bytes.length && firma.every((b, i) => bytes[desde + i] === b);

function unir(trozos: Uint8Array[]): Uint8Array {
  const salida = new Uint8Array(trozos.reduce((t, c) => t + c.length, 0));
  let pos = 0;
  for (const c of trozos) {
    salida.set(c, pos);
    pos += c.length;
  }
  return salida;
}

/* ------------------------------------------------------------------
   JPEG
   ------------------------------------------------------------------ */

const EXIF = ascii('Exif\0\0');

/** Orientación (1–8) del EXIF, o null si no la trae. */
function orientacion(bytes: Uint8Array, inicio: number, fin: number): number | null {
  const tiff = inicio + EXIF.length;
  if (tiff + 8 > fin) return null;
  const le = bytes[tiff] === 0x49;
  const u16 = (p: number) => (le ? bytes[p] | (bytes[p + 1] << 8) : (bytes[p] << 8) | bytes[p + 1]);
  const u32 = (p: number) =>
    le
      ? (bytes[p] | (bytes[p + 1] << 8) | (bytes[p + 2] << 16) | (bytes[p + 3] << 24)) >>> 0
      : ((bytes[p] << 24) | (bytes[p + 1] << 16) | (bytes[p + 2] << 8) | bytes[p + 3]) >>> 0;
  const ifd = tiff + u32(tiff + 4);
  if (ifd + 2 > fin) return null;
  const entradas = u16(ifd);
  for (let i = 0; i < entradas; i++) {
    const e = ifd + 2 + i * 12;
    if (e + 12 > fin) return null;
    if (u16(e) === 0x0112) {
      const valor = u16(e + 8);
      return valor >= 1 && valor <= 8 ? valor : null;
    }
  }
  return null;
}

/** APP1 con un EXIF que solo dice cómo girar la foto: sin él, las del
 *  móvil se verían tumbadas. */
function exifSoloOrientacion(valor: number): Uint8Array {
  const datos = [
    ...EXIF,
    ...ascii('MM'), 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08, // cabecera TIFF, IFD0 en el byte 8
    0x00, 0x01, // una entrada
    0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, valor, 0x00, 0x00, // orientación, SHORT
    0x00, 0x00, 0x00, 0x00, // sin más IFD
  ];
  const largo = datos.length + 2;
  return new Uint8Array([0xff, 0xe1, largo >> 8, largo & 0xff, ...datos]);
}

/** Segmentos que se quedan: JFIF (APP0), perfil de color (APP2), Adobe
 *  (APP14) y todo lo que no es APPn ni comentario. */
const segmentoUtil = (marcador: number) =>
  !(marcador >= 0xe1 && marcador <= 0xef && marcador !== 0xe2 && marcador !== 0xee) && marcador !== 0xfe;

function limpiarJpeg(bytes: Uint8Array): Uint8Array | null {
  if (!igual(bytes, 0, [0xff, 0xd8])) return null;
  const trozos: Uint8Array[] = [bytes.subarray(0, 2)];
  let giro: number | null = null;
  let pos = 2;

  while (pos < bytes.length) {
    if (bytes[pos] !== 0xff) return null;
    let marcador = bytes[pos + 1];
    // Bytes de relleno 0xFF entre segmentos.
    while (marcador === 0xff) marcador = bytes[++pos + 1];
    if (marcador === undefined) return null;
    // A partir del inicio de la imagen (SOS) o del final (EOI) solo hay datos.
    if (marcador === 0xda || marcador === 0xd9) {
      // El EXIF va detrás de JFIF (APP0) si lo hay, como espera ese estándar.
      if (giro && giro !== 1) trozos.splice(trozos[1]?.[1] === 0xe0 ? 2 : 1, 0, exifSoloOrientacion(giro));
      trozos.push(bytes.subarray(pos));
      return unir(trozos);
    }
    if (marcador === 0x01 || (marcador >= 0xd0 && marcador <= 0xd7)) {
      trozos.push(bytes.subarray(pos, pos + 2));
      pos += 2;
      continue;
    }
    if (pos + 4 > bytes.length) return null;
    const fin = pos + 2 + ((bytes[pos + 2] << 8) | bytes[pos + 3]);
    if (fin > bytes.length || fin < pos + 4) return null;
    if (marcador === 0xe1 && igual(bytes, pos + 4, EXIF)) giro ??= orientacion(bytes, pos + 4, fin);
    if (segmentoUtil(marcador)) trozos.push(bytes.subarray(pos, fin));
    pos = fin;
  }
  return null;
}

/* ------------------------------------------------------------------
   PNG
   ------------------------------------------------------------------ */

/** Trozos de texto, EXIF y fecha: nada de eso hace falta para pintarla. */
const TROZOS_PNG_FUERA = new Set(['eXIf', 'tEXt', 'zTXt', 'iTXt', 'tIME']);

function limpiarPng(bytes: Uint8Array): Uint8Array | null {
  const trozos: Uint8Array[] = [bytes.subarray(0, 8)];
  let pos = 8;
  while (pos < bytes.length) {
    if (pos + 12 > bytes.length) return null;
    const largo = ((bytes[pos] << 24) | (bytes[pos + 1] << 16) | (bytes[pos + 2] << 8) | bytes[pos + 3]) >>> 0;
    const fin = pos + 12 + largo;
    if (fin > bytes.length) return null;
    const tipo = String.fromCharCode(...bytes.subarray(pos + 4, pos + 8));
    if (!TROZOS_PNG_FUERA.has(tipo)) trozos.push(bytes.subarray(pos, fin));
    pos = fin;
    if (tipo === 'IEND') return unir(trozos);
  }
  return null;
}

/* ------------------------------------------------------------------
   WebP
   ------------------------------------------------------------------ */

const BANDERAS_METADATOS_WEBP = 0x08 | 0x04; // EXIF y XMP en la cabecera VP8X

function limpiarWebp(bytes: Uint8Array): Uint8Array | null {
  const trozos: Uint8Array[] = [];
  let pos = 12;
  while (pos < bytes.length) {
    if (pos + 8 > bytes.length) return null;
    const tipo = String.fromCharCode(...bytes.subarray(pos, pos + 4));
    const largo = (bytes[pos + 4] | (bytes[pos + 5] << 8) | (bytes[pos + 6] << 16) | (bytes[pos + 7] << 24)) >>> 0;
    const fin = pos + 8 + largo + (largo % 2);
    if (pos + 8 + largo > bytes.length) return null;
    if (tipo === 'VP8X') {
      const copia = bytes.slice(pos, Math.min(fin, bytes.length));
      copia[8] &= ~BANDERAS_METADATOS_WEBP;
      trozos.push(copia);
    } else if (tipo !== 'EXIF' && tipo !== 'XMP ') {
      trozos.push(bytes.subarray(pos, Math.min(fin, bytes.length)));
    }
    pos = fin;
  }
  const cuerpo = unir(trozos);
  const tam = cuerpo.length + 4;
  const cabecera = new Uint8Array([...ascii('RIFF'), tam & 0xff, (tam >> 8) & 0xff, (tam >> 16) & 0xff, (tam >>> 24) & 0xff, ...ascii('WEBP')]);
  return unir([cabecera, cuerpo]);
}

/**
 * La misma imagen sin metadatos (salvo la orientación de los JPEG), o null
 * si el archivo está mal formado y no se puede recorrer con seguridad.
 */
export function sinMetadatos(bytes: Uint8Array, tipo: TipoImagen): Uint8Array | null {
  if (tipo === 'image/jpeg') return limpiarJpeg(bytes);
  if (tipo === 'image/png') return limpiarPng(bytes);
  return limpiarWebp(bytes);
}
