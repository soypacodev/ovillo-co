import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

// Imagen para compartir la tienda en redes y mensajería cuando una página
// no tiene foto propia (las fichas usan la foto del producto).

export const alt = 'Ovillo & Co. · Crochet hecho a mano en Málaga';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function ImagenCompartir() {
  const [fuente, foto] = await Promise.all([
    readFile(join(process.cwd(), 'src/fuentes/fraunces-og.woff')),
    readFile(join(process.cwd(), 'public/fotos/portada.jpg')),
  ]);
  const fotoDatos = `data:image/jpeg;base64,${foto.toString('base64')}`;

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#F8F6F2', color: '#152C41' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 64px 0 80px' }}>
          <div style={{ fontSize: 26, letterSpacing: 4, textTransform: 'uppercase', color: '#50687F' }}>
            Taller de crochet · Málaga
          </div>
          <div style={{ fontFamily: 'Fraunces', fontSize: 92, lineHeight: 1.05, color: '#28618F', marginTop: 24 }}>
            Ovillo &amp; Co.
          </div>
          <div style={{ fontFamily: 'Fraunces', fontSize: 38, lineHeight: 1.25, marginTop: 24 }}>
            Piezas hechas a mano, de una en una
          </div>
          <div style={{ fontSize: 22, color: '#50687F', marginTop: 40 }}>Tienda de demostración</div>
        </div>
        <div style={{ width: 460, display: 'flex', alignItems: 'flex-end', padding: '60px 70px 0 0' }}>
          <img
            src={fotoDatos}
            alt=""
            width={390}
            height={570}
            style={{ objectFit: 'cover', objectPosition: '38% 50%', borderRadius: '195px 195px 0 0' }}
          />
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: 'Fraunces', data: fuente, style: 'normal', weight: 400 }] },
  );
}
