'use client';

import Image from 'next/image';
import { useCesta } from '@/lib/cesta/contexto';
import type { LineaCesta as Linea } from '@/lib/cesta/tipos';
import { eur } from '@/lib/formato';
import { textos } from '@/lib/i18n';
import { useIdioma, useTextos } from '@/lib/i18n/cliente';
import { Enlace } from '@/lib/i18n/enlace';
import { rutas } from '@/lib/rutas';
import { ContadorUnidades } from './contador-unidades';

const T = textos(
  {
    personalizacion: (texto: string) => ` · «${texto}»`,
    encargo: (dias: number) => `Se teje al pedir · ${dias} días`,
    antes: 'Antes ',
    quitar: 'quitar',
  },
  {
    en: {
      personalizacion: (texto: string) => ` · “${texto}”`,
      encargo: (dias: number) => `Made to order · ${dias} days`,
      antes: 'Was ',
      quitar: 'remove',
    },
    fr: {
      personalizacion: (texto: string) => ` · «\u00a0${texto}\u00a0»`,
      encargo: (dias: number) => `Crocheté à la commande · ${dias} jours`,
      antes: 'Avant ',
      quitar: 'retirer',
    },
    de: {
      personalizacion: (texto: string) => ` · „${texto}“`,
      encargo: (dias: number) => `Wird auf Bestellung gehäkelt · ${dias} Tage`,
      antes: 'Vorher ',
      quitar: 'entfernen',
    },
  },
);

/** Línea compacta del cajón: miniatura, datos, unidades y precio. */
export function LineaCesta({ linea, alNavegar }: { linea: Linea; alNavegar?: () => void }) {
  const { fijarUnidades, quitar, maxUnidades, totales } = useCesta();
  const rebaja = totales.rebajaPorLinea[linea.id] ?? 0;
  const href = rutas.producto(linea.slug);
  const t = useTextos(T);
  const idioma = useIdioma();

  return (
    <li className="linea">
      <Enlace className="mini-foto" href={href} onClick={alNavegar} tabIndex={-1} aria-hidden="true">
        {linea.foto && <Image src={linea.foto.src} alt="" fill sizes="70px" />}
      </Enlace>
      <div>
        <p className="linea-nom">
          <Enlace href={href} onClick={alNavegar}>
            {linea.nombre}
          </Enlace>
        </p>
        <p className="mini">
          {linea.rotulo ?? linea.variante}
          {linea.personalizacion && t.personalizacion(linea.personalizacion)}
        </p>
        {linea.encargo && linea.dias && <p className="mini-2">{t.encargo(linea.dias)}</p>}
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
        <p className="precio">{eur(linea.precio * linea.uds - rebaja, idioma)}</p>
        {rebaja > 0 && (
          <p className="mini-2 antes">
            <span className="oculto-vis">{t.antes}</span>
            {eur(linea.precio * linea.uds, idioma)}
          </p>
        )}
        <button type="button" className="boton-texto" onClick={() => quitar(linea.id)}>
          {t.quitar}
          <span className="oculto-vis"> {linea.nombre}</span>
        </button>
      </div>
    </li>
  );
}
