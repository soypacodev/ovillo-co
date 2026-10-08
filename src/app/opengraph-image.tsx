import { ImageResponse } from 'next/og';
import { comoJpeg, fotoRecortada, fuenteTitulares, TAMANO_COMPARTIR, TIPO_COMPARTIR } from '@/lib/compartir/imagen';

// Imagen para compartir la tienda en redes y mensajería cuando una página
// no tiene una propia (las fichas componen la suya con foto y precio).

export const alt = 'Ovillo & Co. · Crochet hecho a mano en Málaga';
export const size = TAMANO_COMPARTIR;
export const contentType = TIPO_COMPARTIR;

const FOTO = { ancho: 390, alto: 570 };

export default async function ImagenCompartir() {
  const [fuente, foto] = await Promise.all([
    fuenteTitulares(),
    fotoRecortada('/fotos/portada.jpg', FOTO.ancho, FOTO.alto, 0.38),
  ]);

  const png = new ImageResponse(
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
          {foto && (
            <img
              src={foto}
              alt=""
              width={FOTO.ancho}
              height={FOTO.alto}
              style={{ borderRadius: `${FOTO.ancho / 2}px ${FOTO.ancho / 2}px 0 0` }}
            />
          )}
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: 'Fraunces', data: fuente, style: 'normal', weight: 400 }] },
  );
  return comoJpeg(png);
}
