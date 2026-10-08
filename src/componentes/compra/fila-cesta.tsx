'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ContadorUnidades } from '@/componentes/cesta/contador-unidades';
import type { LineaCesta } from '@/lib/cesta/tipos';
import { eur } from '@/lib/formato';
import { rutas } from '@/lib/rutas';

export interface PropsFilaCesta {
  linea: LineaCesta;
  max: number;
  rebaja: number;
  alCambiar: (uds: number) => void;
  alQuitar: () => void;
}

/** Línea de la cesta completa: más aire y más detalle que la del cajón. */
export function FilaCesta({ linea: l, max, rebaja, alCambiar, alQuitar }: PropsFilaCesta) {
  const href = rutas.producto(l.slug);
  return (
    <li className="fila-art">
      <Link className="fila-foto" href={href} tabIndex={-1} aria-hidden="true">
        {l.foto && <Image src={l.foto.src} alt="" fill sizes="(max-width: 620px) 76px, 96px" />}
      </Link>
      <div>
        <h3 className="fila-nom">
          <Link href={href}>{l.nombre}</Link>
        </h3>
        <p className="mini mt-1">
          {l.variante}
          {l.personalizacion && ` · bordado «${l.personalizacion}»`}
        </p>
        {l.encargo && l.dias ? (
          <p className="mini-2">Se teje al pedir · {l.dias} días</p>
        ) : (
          <p className="mini-2 listo">Listo para enviar</p>
        )}
        <div className="fila-acciones">
          <ContadorUnidades valor={l.uds} max={max} nombre={l.nombre} alCambiar={alCambiar} />
          <button type="button" className="boton-texto" onClick={alQuitar}>
            quitar<span className="oculto-vis"> {l.nombre} de la cesta</span>
          </button>
        </div>
      </div>
      <div className="precio-col">
        <p className="precio">{eur(l.precio * l.uds)}</p>
        {l.uds > 1 && <p className="mini-2">{eur(l.precio)} cada una</p>}
        {rebaja > 0 && <p className="dto">−{eur(rebaja)} de rebaja</p>}
      </div>
    </li>
  );
}
