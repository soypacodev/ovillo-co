import { ImageResponse } from 'next/og';
import { precioVenta } from '@/lib/catalogo/precio';
import { catalogo, stockTotal } from '@/lib/datos';
import { comoJpeg, fotoRecortada, fuenteTitulares, TAMANO_COMPARTIR, TIPO_COMPARTIR } from '@/lib/compartir/imagen';
import { eur } from '@/lib/formato';
import { textos } from '@/lib/i18n';
import { idiomaActual } from '@/lib/i18n/servidor';

// Tarjeta de cada pieza al compartir su enlace: foto, nombre y precio en
// 1200 × 630, que es lo que WhatsApp, Telegram y las redes enseñan en grande.

export const alt = 'Pieza de crochet de Ovillo & Co. con su nombre y su precio';
export const size = TAMANO_COMPARTIR;
export const contentType = TIPO_COMPARTIR;

// Next sirve esta imagen en la ruta sin prefijo de idioma: sale en el
// idioma que decida el proxy para quien la pide (cookie o navegador).
const T = textos(
  {
    porEncargo: (dias: number | null) => `Por encargo · ${dias ?? 'unos'} días de confección`,
    listo: 'Listo para enviar en 24–48 h',
    agotada: 'Agotada · avisamos cuando vuelva',
    pie: 'Hecho a mano · Tienda de demostración',
  },
  {
    en: {
      porEncargo: (dias: number | null) => `Custom order · ${dias ?? 'a few'} days to make`,
      listo: 'Ready to ship in 24–48 h',
      agotada: 'Sold out · we’ll let you know when it’s back',
      pie: 'Handmade · Demo shop',
    },
    fr: {
      porEncargo: (dias: number | null) => `Sur mesure · ${dias ?? 'quelques'}\u00a0jours de confection`,
      listo: 'Prêt à expédier sous 24–48 h',
      agotada: 'Épuisé · nous vous prévenons de son retour',
      pie: 'Fait main · Boutique de démonstration',
    },
    de: {
      porEncargo: (dias: number | null) => `Auftragsarbeit · ${dias ?? 'einige'} Tage Fertigung`,
      listo: 'Versandfertig in 24–48 h',
      agotada: 'Ausverkauft · wir benachrichtigen Sie, wenn es wieder da ist',
      pie: 'Handgemacht · Demo-Shop',
    },
  },
);

const FOTO = { ancho: 460, alto: 570 };
const AZUL = '#28618F';
const TINTA = '#152C41';
const GRIS = '#50687F';

export default async function ImagenPieza({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const idioma = await idiomaActual();
  const t = T[idioma];
  const [producto, fuente] = await Promise.all([catalogo(idioma).producto(slug), fuenteTitulares()]);
  if (!producto) return new Response(null, { status: 404 });

  const portada = producto.fotos[0];
  const foto = portada ? await fotoRecortada(portada.src, FOTO.ancho, FOTO.alto) : null;
  const nombre = producto.nombre;
  // El mismo precio que la ficha, con la rebaja automática ya aplicada.
  const precio = precioVenta(producto);
  const disponibilidad = producto.encargo
    ? t.porEncargo(producto.dias)
    : stockTotal(producto) > 0
      ? t.listo
      : t.agotada;

  const png = new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#F8F6F2', color: TINTA }}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px 56px 56px 80px',
          }}
        >
          <div style={{ fontSize: 24, letterSpacing: 4, textTransform: 'uppercase', color: GRIS }}>
            Ovillo &amp; Co. · Málaga
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontFamily: 'Fraunces',
                fontSize: nombre.length > 28 ? 60 : 72,
                lineHeight: 1.08,
                color: TINTA,
              }}
            >
              {nombre}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 32 }}>
              <div style={{ fontFamily: 'Fraunces', fontSize: 64, color: AZUL }}>{eur(precio.final, idioma)}</div>
              {precio.anterior !== null && precio.porcentaje > 0 && (
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <div style={{ fontSize: 30, color: GRIS, textDecoration: 'line-through', marginLeft: 24 }}>
                    {eur(precio.anterior, idioma)}
                  </div>
                  <div
                    style={{
                      fontSize: 26,
                      color: '#FFFFFF',
                      background: '#B5523A',
                      borderRadius: 999,
                      padding: '4px 16px',
                      marginLeft: 18,
                    }}
                  >
                    {`−${precio.porcentaje} %`}
                  </div>
                </div>
              )}
            </div>
            <div style={{ fontSize: 28, color: GRIS, marginTop: 18 }}>{disponibilidad}</div>
          </div>
          <div style={{ fontSize: 22, color: GRIS }}>{t.pie}</div>
        </div>
        <div style={{ width: FOTO.ancho + 70, display: 'flex', alignItems: 'flex-end', padding: '60px 70px 0 0' }}>
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
