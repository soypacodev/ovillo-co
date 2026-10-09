import { ImageResponse } from 'next/og';
import { comoJpeg, fotoRecortada, fuenteTitulares, TAMANO_COMPARTIR, TIPO_COMPARTIR } from '@/lib/compartir/imagen';
import { textos } from '@/lib/i18n';
import { idiomaActual } from '@/lib/i18n/servidor';

// Imagen para compartir la tienda en redes y mensajería cuando una página
// no tiene una propia (las fichas componen la suya con foto y precio).
// Next la sirve sin prefijo de idioma, así que sale en el idioma que el
// proxy decida para quien la pide; sin cookie ni preferencia, en español.

export const alt = 'Ovillo & Co. · Crochet hecho a mano en Málaga';
export const size = TAMANO_COMPARTIR;
export const contentType = TIPO_COMPARTIR;

const FOTO = { ancho: 390, alto: 570 };

const T = textos(
  {
    eyebrow: 'Taller de crochet · Málaga',
    lema: 'Piezas hechas a mano, de una en una',
    demo: 'Tienda de demostración',
  },
  {
    en: { eyebrow: 'Crochet workshop · Málaga', lema: 'Pieces made by hand, one at a time', demo: 'Demo shop' },
    fr: {
      eyebrow: 'Atelier de crochet · Málaga',
      lema: 'Des pièces faites main, une à une',
      demo: 'Boutique de démonstration',
    },
    de: { eyebrow: 'Häkelwerkstatt · Málaga', lema: 'Von Hand gefertigt, Stück für Stück', demo: 'Demo-Shop' },
  },
);

export default async function ImagenCompartir() {
  const t = T[await idiomaActual()];
  const [fuente, foto] = await Promise.all([
    fuenteTitulares(),
    fotoRecortada('/fotos/portada.jpg', FOTO.ancho, FOTO.alto, 0.38),
  ]);

  const png = new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#F8F6F2', color: '#152C41' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 64px 0 80px' }}>
          <div style={{ fontSize: 26, letterSpacing: 4, textTransform: 'uppercase', color: '#50687F' }}>
            {t.eyebrow}
          </div>
          <div style={{ fontFamily: 'Fraunces', fontSize: 92, lineHeight: 1.05, color: '#28618F', marginTop: 24 }}>
            Ovillo &amp; Co.
          </div>
          <div style={{ fontFamily: 'Fraunces', fontSize: 38, lineHeight: 1.25, marginTop: 24 }}>
            {t.lema}
          </div>
          <div style={{ fontSize: 22, color: '#50687F', marginTop: 40 }}>{t.demo}</div>
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
