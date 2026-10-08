'use client';

// Iconos de la cabecera que dependen del navegador: los favoritos guardados
// y el buscador, que en la propia tienda enfoca el campo sin recargar.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IcoFavoritos, IcoLupa } from '@/componentes/iconos';
import { useFavoritos } from '@/lib/cesta/contexto';
import { piezas } from '@/lib/formato';
import { rutas } from '@/lib/rutas';

/** Evento con el que la cabecera pide a la tienda que enfoque el buscador. */
export const EVENTO_BUSCAR = 'ovillo:buscar';
/** Ancla que pide lo mismo al llegar a la tienda desde otra página. */
export const ANCLA_BUSCAR = 'buscar';

export function EnlaceBuscar({ className = 'icono' }: { className?: string }) {
  const ruta = usePathname();
  return (
    <Link
      className={className}
      href={`${rutas.tienda}#${ANCLA_BUSCAR}`}
      aria-label="Buscar en la tienda"
      onClick={(e) => {
        if (ruta !== rutas.tienda) return;
        e.preventDefault();
        window.dispatchEvent(new Event(EVENTO_BUSCAR));
      }}
    >
      <IcoLupa />
    </Link>
  );
}

export function EnlaceFavoritos({ className = 'icono' }: { className?: string }) {
  const { favoritos } = useFavoritos();
  const n = favoritos.length;
  return (
    <Link className={className} href={rutas.favoritos} aria-label={n ? `Tus favoritos, ${piezas(n)}` : 'Tus favoritos'}>
      <IcoFavoritos />
      {n > 0 && (
        <span key={n} className="globo late" aria-hidden="true">
          {n > 99 ? '99+' : n}
        </span>
      )}
    </Link>
  );
}

/** Para el menú móvil: «Favoritos (3)». */
export function TextoFavoritos() {
  const { favoritos } = useFavoritos();
  return (
    <>
      Favoritos
      {favoritos.length > 0 && <span className="cuenta-menu"> ({favoritos.length})</span>}
    </>
  );
}
