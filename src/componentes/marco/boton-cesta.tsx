'use client';

import { IcoCesta } from '@/componentes/iconos';
import { useCesta } from '@/lib/cesta/contexto';
import { piezas } from '@/lib/formato';
import { textos } from '@/lib/i18n';
import { useIdioma, useTextos } from '@/lib/i18n/cliente';

const T = textos(
  { ver: (cuantas: string) => `Ver la cesta, ${cuantas}`, vacia: 'Ver la cesta, vacía' },
  {
    en: { ver: (cuantas: string) => `View basket, ${cuantas}`, vacia: 'View basket, empty' },
    fr: { ver: (cuantas: string) => `Voir le panier, ${cuantas}`, vacia: 'Voir le panier, vide' },
    de: { ver: (cuantas: string) => `Warenkorb ansehen, ${cuantas}`, vacia: 'Warenkorb ansehen, leer' },
  },
);

export function BotonCesta() {
  const { unidades, abrir, abierta } = useCesta();
  const idioma = useIdioma();
  const t = useTextos(T);
  return (
    <button
      type="button"
      className="icono"
      onClick={abrir}
      aria-haspopup="dialog"
      aria-expanded={abierta}
      aria-controls="cajon-cesta"
      aria-label={unidades ? t.ver(piezas(unidades, idioma)) : t.vacia}
    >
      <IcoCesta />
      {unidades > 0 && (
        // La clave cambia con el número: el globito se vuelve a montar y late.
        <span key={unidades} className="globo late" aria-hidden="true">
          {unidades > 99 ? '99+' : unidades}
        </span>
      )}
    </button>
  );
}
