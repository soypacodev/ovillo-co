import type { Totales } from '@/lib/cesta/tipos';
import { eur } from '@/lib/formato';
import { textos } from '@/lib/i18n';
import { useIdioma, useTextos } from '@/lib/i18n/cliente';

const T = textos(
  {
    conseguido: '¡Envío gratis conseguido!',
    conCodigo: 'Con este código te faltan ',
    faltan: 'Te faltan ',
    paraGratis: ' para el envío gratis',
    camino: 'Camino al envío gratis',
  },
  {
    en: {
      conseguido: 'You’ve got free delivery!',
      conCodigo: 'With this code you’re ',
      faltan: 'You’re ',
      paraGratis: ' away from free delivery',
      camino: 'Progress towards free delivery',
    },
    fr: {
      conseguido: 'Livraison offerte !',
      conCodigo: 'Avec ce code, il vous manque ',
      faltan: 'Il vous manque ',
      paraGratis: ' pour la livraison offerte',
      camino: 'Progression vers la livraison offerte',
    },
    de: {
      conseguido: 'Kostenloser Versand erreicht!',
      conCodigo: 'Mit diesem Code fehlen Ihnen noch ',
      faltan: 'Es fehlen nur noch ',
      paraGratis: ' bis zum kostenlosen Versand',
      camino: 'Fortschritt zum kostenlosen Versand',
    },
  },
);

/** Progreso hacia el envío gratis. */
export function BarraEnvioGratis({ totales }: { totales: Totales }) {
  const t = useTextos(T);
  const idioma = useIdioma();
  if (totales.faltaEnvioGratis <= 0) {
    return <p className="mini conseguido">{t.conseguido}</p>;
  }
  return (
    <div className="progreso">
      <p className="mini">
        {totales.cuponQuitaEnvioGratis ? t.conCodigo : t.faltan}
        <b>{eur(totales.faltaEnvioGratis, idioma)}</b>
        {t.paraGratis}
      </p>
      <div
        className="barra"
        role="progressbar"
        aria-label={t.camino}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={totales.progresoEnvioGratis}
      >
        <i style={{ width: `${totales.progresoEnvioGratis}%` }} />
      </div>
    </div>
  );
}
