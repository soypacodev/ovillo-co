'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCesta } from '@/lib/cesta/contexto';
import type { LineaCesta as Linea } from '@/lib/cesta/tipos';
import { eur } from '@/lib/formato';
import { rutas } from '@/lib/rutas';
import { ContadorUnidades } from './contador-unidades';

/** Línea compacta del cajón: miniatura, datos, unidades y precio. */
export function LineaCesta({ linea, alNavegar }: { linea: Linea; alNavegar?: () => void }) {
  const { fijarUnidades, quitar, maxUnidades, totales } = useCesta();
  const rebaja = totales.rebajaPorLinea[linea.id] ?? 0;
  const href = rutas.producto(linea.slug);

  return (
    <li className="linea">
      <Link className="mini-foto" href={href} onClick={alNavegar} tabIndex={-1} aria-hidden="true">
        {linea.foto && <Image src={linea.foto.src} alt="" fill sizes="70px" />}
      </Link>
      <div>
        <p className="linea-nom">
          <Link href={href} onClick={alNavegar}>
            {linea.nombre}
          </Link>
        </p>
        <p className="mini">
          {linea.variante}
          {linea.personalizacion && ` · «${linea.personalizacion}»`}
        </p>
        {linea.encargo && linea.dias && <p className="mini-2">Se teje al pedir · {linea.dias} días</p>}
        <ContadorUnidades
          valor={linea.uds}
          min={0}
          max={maxUnidades(linea.id)}
          nombre={linea.nombre}
          alCambiar={(n) => (n < 1 ? quitar(linea.id) : fijarUnidades(linea.id, n))}
        />
      </div>
      <div className="linea-precio">
        {/* El precio ya rebajado, como en la ficha; el tachado, el de catálogo. */}
        <p className="precio">{eur(linea.precio * linea.uds - rebaja)}</p>
        {rebaja > 0 && (
          <p className="mini-2 antes">
            <span className="oculto-vis">Antes </span>
            {eur(linea.precio * linea.uds)}
          </p>
        )}
        <button type="button" className="boton-texto" onClick={() => quitar(linea.id)}>
          quitar<span className="oculto-vis"> {linea.nombre}</span>
        </button>
      </div>
    </li>
  );
}
