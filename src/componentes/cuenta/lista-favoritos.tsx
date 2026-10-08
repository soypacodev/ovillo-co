'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useCesta, useFavoritos } from '@/lib/cesta/contexto';
import { rutas } from '@/lib/rutas';

/** Las tarjetas llegan pintadas desde el servidor; aquí solo se eligen
 *  las de la lista de favoritos, que es la misma en el navegador y en la
 *  cuenta. Al quitar un corazón, la tarjeta desaparece al momento. */
export function ListaFavoritos({ tarjetas }: { tarjetas: Record<string, ReactNode> }) {
  const { hidratada } = useCesta();
  const { favoritos } = useFavoritos();
  const visibles = [...favoritos].reverse().filter((slug) => tarjetas[slug]);

  if (!hidratada) return <p className="mini">Cargando tus favoritos…</p>;
  if (!visibles.length) {
    return (
      <div className="caja-cl cuenta-vacia">
        <p>Aún no has guardado nada.</p>
        <p className="mini mt-2">Pulsa el corazón de cualquier pieza y aparecerá aquí, en este y en tus otros dispositivos.</p>
        <Link className="btn btn-1 mt-5" href={rutas.tienda}>
          Ver la tienda
        </Link>
      </div>
    );
  }
  return (
    <>
      <p className="mini" aria-live="polite">
        {visibles.length === 1 ? '1 pieza guardada' : `${visibles.length} piezas guardadas`}
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
