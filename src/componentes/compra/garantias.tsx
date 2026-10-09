import type { ReactNode } from 'react';
import { IcoCamion, IcoCorazonG, IcoOk, IcoSobre, IcoTijeras } from '@/componentes/iconos';
import { ENVIO_GRATIS_DESDE } from '@/datos/semilla';
import { eur } from '@/lib/formato';
import { textos } from '@/lib/i18n';
import { useIdioma, useTextos } from '@/lib/i18n/cliente';

const T = textos(
  {
    envioGratis: (importe: string) => `Envío gratis a partir de ${importe}`,
    aMano: 'Tejido a mano, pieza por pieza',
    avisos: 'Te avisamos por correo en cada paso',
    devolucion: '14 días para devolverlo',
    sinCargos: 'Sin cargos ocultos: el total es el total',
    escribimos: 'Te escribimos cuando empezamos y cuando sale',
    devolucionPago: '14 días para devolverlo (salvo personalizados)',
  },
  {
    en: {
      envioGratis: (importe: string) => `Free delivery on orders over ${importe}`,
      aMano: 'Crocheted by hand, one piece at a time',
      avisos: 'We email you at every step',
      devolucion: '14 days to return it',
      sinCargos: 'No hidden charges: the total is the total',
      escribimos: 'We write to you when we start and when it ships',
      devolucionPago: '14 days to return it (except personalised items)',
    },
    fr: {
      envioGratis: (importe: string) => `Livraison offerte dès ${importe}`,
      aMano: 'Crocheté à la main, pièce par pièce',
      avisos: 'Nous vous prévenons par e-mail à chaque étape',
      devolucion: '14 jours pour le retourner',
      sinCargos: 'Aucun frais caché : le total, c’est le total',
      escribimos: 'Nous vous écrivons quand nous commençons et quand il part',
      devolucionPago: '14 jours pour le retourner (sauf articles personnalisés)',
    },
    de: {
      envioGratis: (importe: string) => `Kostenloser Versand ab ${importe}`,
      aMano: 'Von Hand gehäkelt, Stück für Stück',
      avisos: 'Wir informieren Sie bei jedem Schritt per E-Mail',
      devolucion: '14 Tage Rückgaberecht',
      sinCargos: 'Keine versteckten Kosten: Der Gesamtbetrag ist der Gesamtbetrag',
      escribimos: 'Wir schreiben Ihnen, wenn wir anfangen und wenn es verschickt wird',
      devolucionPago: '14 Tage Rückgaberecht (außer personalisierte Stücke)',
    },
  },
);

export function Garantias({ en }: { en: 'cesta' | 'pago' }) {
  const t = useTextos(T);
  const idioma = useIdioma();
  // Importe redondo sin decimales: «50 €», «€50».
  const umbral = eur(ENVIO_GRATIS_DESDE, idioma).replace(/[,.]00(?!\d)/, '');
  const lista: [ReactNode, string][] =
    en === 'cesta'
      ? [
          [<IcoCamion key="i" />, t.envioGratis(umbral)],
          [<IcoTijeras key="i" />, t.aMano],
          [<IcoSobre key="i" />, t.avisos],
          [<IcoCorazonG key="i" />, t.devolucion],
        ]
      : [
          [<IcoOk key="i" />, t.sinCargos],
          [<IcoSobre key="i" />, t.escribimos],
          [<IcoCorazonG key="i" />, t.devolucionPago],
        ];
  return (
    <div className="caja-cl">
      <ul className="garantias">
        {lista.map(([icono, texto]) => (
          <li key={texto}>
            {icono}
            {texto}
          </li>
        ))}
      </ul>
    </div>
  );
}
