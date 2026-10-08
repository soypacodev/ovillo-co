// Reconoce el formato de una imagen por su firma (los primeros bytes),
// que no depende de la extensión ni del tipo que declare el navegador.

export type TipoImagen = 'image/jpeg' | 'image/png' | 'image/webp';

/** Extensión con la que se guarda cada tipo: nunca la del nombre original. */
export const EXTENSION_IMAGEN: Record<TipoImagen, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const empiezaPor = (bytes: Uint8Array, firma: readonly number[], desde = 0) =>
  bytes.length >= desde + firma.length && firma.every((b, i) => bytes[desde + i] === b);

/** JPEG, PNG o WebP según la firma del archivo; null si no es ninguno. */
export function tipoDeImagen(bytes: Uint8Array): TipoImagen | null {
  if (empiezaPor(bytes, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (empiezaPor(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  // RIFF····WEBP
  if (empiezaPor(bytes, [0x52, 0x49, 0x46, 0x46]) && empiezaPor(bytes, [0x57, 0x45, 0x42, 0x50], 8)) {
    return 'image/webp';
  }
  return null;
}
