'use client';

// Iconos de la cabecera que dependen del navegador: los favoritos guardados
// y el buscador, que en la propia tienda enfoca el campo sin recargar.

import { IcoFavoritos, IcoLupa } from '@/componentes/iconos';
import { useFavoritos } from '@/lib/cesta/contexto';
import { piezas } from '@/lib/formato';
import { textos } from '@/lib/i18n';
import { useIdioma, useRuta, useTextos } from '@/lib/i18n/cliente';
import { Enlace } from '@/lib/i18n/enlace';
import { rutas } from '@/lib/rutas';

const T = textos(
  { buscar: 'Buscar en la tienda', favoritos: 'Tus favoritos', menuFavoritos: 'Favoritos' },
  {
    en: { buscar: 'Search the shop', favoritos: 'Your favourites', menuFavoritos: 'Favourites' },
    fr: { buscar: 'Rechercher dans la boutique', favoritos: 'Vos favoris', menuFavoritos: 'Favoris' },
    de: { buscar: 'Im Shop suchen', favoritos: 'Ihre Favoriten', menuFavoritos: 'Favoriten' },
  },
);

/** Evento con el que la cabecera pide a la tienda que enfoque el buscador. */
export const EVENTO_BUSCAR = 'ovillo:buscar';
/** Ancla que pide lo mismo al llegar a la tienda desde otra página. */
export const ANCLA_BUSCAR = 'buscar';

export function EnlaceBuscar({ className = 'icono' }: { className?: string }) {
  const ruta = useRuta();
  const t = useTextos(T);
  return (
    <Enlace
      className={className}
      href={`${rutas.tienda}#${ANCLA_BUSCAR}`}
      aria-label={t.buscar}
      onClick={(e) => {
        if (ruta !== rutas.tienda) return;
        e.preventDefault();
        window.dispatchEvent(new Event(EVENTO_BUSCAR));
      }}
    >
      <IcoLupa />
    </Enlace>
  );
}

export function EnlaceFavoritos({ className = 'icono' }: { className?: string }) {
  const { favoritos } = useFavoritos();
  const idioma = useIdioma();
  const t = useTextos(T);
  const n = favoritos.length;
  return (
    <Enlace className={className} href={rutas.favoritos} aria-label={n ? `${t.favoritos}, ${piezas(n, idioma)}` : t.favoritos}>
      <IcoFavoritos />
      {n > 0 && (
        <span key={n} className="globo late" aria-hidden="true">
          {n > 99 ? '99+' : n}
        </span>
      )}
    </Enlace>
  );
}

/** Para el menú móvil: «Favoritos (3)». */
export function TextoFavoritos() {
  const { favoritos } = useFavoritos();
  const t = useTextos(T);
  return (
    <>
      {t.menuFavoritos}
      {favoritos.length > 0 && <span className="cuenta-menu"> ({favoritos.length})</span>}
    </>
  );
}
