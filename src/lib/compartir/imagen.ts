// Utilidades para las imágenes que se ven al compartir un enlace. ImageResponse
// solo genera PNG, y un PNG con una foto dentro pasa de 400 KB: WhatsApp deja
// de previsualizar por encima de unos 300 KB. Por eso la foto entra ya
// recortada a su tamaño final y el resultado se vuelve a comprimir en JPEG.

import 'server-only';
import { readFile } from 'node:fs/promises';
import { join, normalize, sep } from 'node:path';
import sharp from 'sharp';

export const TAMANO_COMPARTIR = { width: 1200, height: 630 };
export const TIPO_COMPARTIR = 'image/jpeg';

const CARPETA_PUBLICA = join(process.cwd(), 'public');

/** Tipografía de los titulares, recortada a los caracteres del español. */
export function fuenteTitulares(): Promise<Buffer> {
  return readFile(join(process.cwd(), 'src/fuentes/fraunces-og.woff'));
}

/** Lee una foto de /public o, si es una URL https (fotos subidas a
 *  Supabase), la descarga. null si no se puede: la imagen sale sin foto. */
async function leerFoto(src: string): Promise<Buffer | null> {
  try {
    if (src.startsWith('/')) {
      const ruta = normalize(join(CARPETA_PUBLICA, src));
      if (!ruta.startsWith(CARPETA_PUBLICA + sep)) return null;
      return await readFile(ruta);
    }
    if (!src.startsWith('https://')) return null;
    const respuesta = await fetch(src, { signal: AbortSignal.timeout(5000) });
    if (!respuesta.ok) return null;
    return Buffer.from(await respuesta.arrayBuffer());
  } catch {
    return null;
  }
}

/** Foto recortada al hueco que ocupa, como data URL lista para <img>.
 *  `enfoque` es la posición horizontal del recorte (0 izquierda, 1 derecha);
 *  sin ella, sharp busca la zona con más detalle. */
export async function fotoRecortada(src: string, ancho: number, alto: number, enfoque?: number): Promise<string | null> {
  const original = await leerFoto(src);
  if (!original) return null;
  try {
    const foto = sharp(original).rotate();
    if (enfoque === undefined) {
      foto.resize(ancho, alto, { fit: 'cover', position: 'attention' });
    } else {
      const { width = ancho, height = alto } = await sharp(original).rotate().metadata();
      const escala = Math.max(ancho / width, alto / height);
      const [w, h] = [Math.round(width * escala), Math.round(height * escala)];
      foto.resize(w, h).extract({
        left: Math.round((w - ancho) * enfoque),
        top: Math.round((h - alto) / 2),
        width: ancho,
        height: alto,
      });
    }
    const jpeg = await foto.jpeg({ quality: 90 }).toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString('base64')}`;
  } catch {
    return null;
  }
}

/** Pasa el PNG de ImageResponse a JPEG progresivo: de ~430 KB a ~100 KB. */
export async function comoJpeg(png: Response): Promise<Response> {
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer()))
    .flatten({ background: '#F8F6F2' })
    .jpeg({ quality: 80, mozjpeg: true, progressive: true })
    .toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: {
      'Content-Type': TIPO_COMPARTIR,
      // Un día en la CDN: si cambia un precio, la tarjeta se pone al día sola.
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
