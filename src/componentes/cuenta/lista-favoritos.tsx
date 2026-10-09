'use client';

import type { ReactNode } from 'react';
import { useCesta, useFavoritos } from '@/lib/cesta/contexto';
import { textos } from '@/lib/i18n';
import { useTextos } from '@/lib/i18n/cliente';
import { Enlace } from '@/lib/i18n/enlace';
import { rutas } from '@/lib/rutas';

const T = textos(
  {
    cargando: 'Cargando tus favoritos…',
    vacio: 'Aún no has guardado nada.',
    pulsa: (entreDispositivos: boolean) =>
      `Pulsa el corazón de cualquier pieza y aparecerá aquí${entreDispositivos ? ', en este y en tus otros dispositivos.' : '.'}`,
    verTienda: 'Ver la tienda',
    guardadas: (n: number) => (n === 1 ? '1 pieza guardada' : `${n} piezas guardadas`),
  },
  {
    en: {
      cargando: 'Loading your favourites…',
      vacio: "You haven't saved anything yet.",
      pulsa: (entreDispositivos: boolean) =>
        `Tap the heart on any item and it will appear here${entreDispositivos ? ', on this and your other devices.' : '.'}`,
      verTienda: 'Visit the shop',
      guardadas: (n: number) => (n === 1 ? '1 item saved' : `${n} items saved`),
    },
    fr: {
      cargando: 'Chargement de vos favoris…',
      vacio: 'Vous n’avez encore rien enregistré.',
      pulsa: (entreDispositivos: boolean) =>
        `Touchez le cœur de n’importe quel article et il apparaîtra ici${entreDispositivos ? ', sur cet appareil comme sur les autres.' : '.'}`,
      verTienda: 'Voir la boutique',
      guardadas: (n: number) => (n === 1 ? '1 article enregistré' : `${n} articles enregistrés`),
    },
    de: {
      cargando: 'Ihre Favoriten werden geladen…',
      vacio: 'Sie haben noch nichts gespeichert.',
      pulsa: (entreDispositivos: boolean) =>
        `Tippen Sie bei einem beliebigen Artikel auf das Herz, dann erscheint er hier${entreDispositivos ? ' – auf diesem und Ihren anderen Geräten.' : '.'}`,
      verTienda: 'Zum Shop',
      guardadas: (n: number) => (n === 1 ? '1 Artikel gespeichert' : `${n} Artikel gespeichert`),
    },
  },
);

/** Las tarjetas llegan pintadas desde el servidor; aquí solo se eligen
 *  las de la lista de favoritos, que es la misma en el navegador y en la
 *  cuenta. Al quitar un corazón, la tarjeta desaparece al momento. */
export function ListaFavoritos({
  tarjetas,
  entreDispositivos = true,
}: {
  tarjetas: Record<string, ReactNode>;
  /** Con cuentas, la lista también se guarda en la cuenta. */
  entreDispositivos?: boolean;
}) {
  const t = useTextos(T);
  const { hidratada } = useCesta();
  const { favoritos } = useFavoritos();
  const visibles = [...favoritos].reverse().filter((slug) => tarjetas[slug]);

  if (!hidratada) return <p className="mini">{t.cargando}</p>;
  if (!visibles.length) {
    return (
      <div className="caja-cl cuenta-vacia">
        <p>{t.vacio}</p>
        <p className="mini mt-2">{t.pulsa(entreDispositivos)}</p>
        <Enlace className="btn btn-1 mt-5" href={rutas.tienda}>
          {t.verTienda}
        </Enlace>
      </div>
    );
  }
  return (
    <>
      <p className="mini" aria-live="polite">
        {t.guardadas(visibles.length)}
      </p>
      <div className="rejilla rejilla-4 mt-5">
        {visibles.map((slug) => (
          <div key={slug} style={{ display: 'contents' }}>
            {tarjetas[slug]}
          </div>
        ))}
      </div>
    </>
  );
}
