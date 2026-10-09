'use client';

import Image from 'next/image';
import { ContadorUnidades } from '@/componentes/cesta/contador-unidades';
import type { LineaCesta } from '@/lib/cesta/tipos';
import { eur } from '@/lib/formato';
import { textos } from '@/lib/i18n';
import { useIdioma, useTextos } from '@/lib/i18n/cliente';
import { Enlace } from '@/lib/i18n/enlace';
import { rutas } from '@/lib/rutas';

const T = textos(
  {
    bordado: (texto: string) => ` · bordado «${texto}»`,
    encargo: (dias: number) => `Se teje al pedir · ${dias} días`,
    listo: 'Listo para enviar',
    quitar: 'quitar',
    quitarOculto: (nombre: string) => ` ${nombre} de la cesta`,
    antes: 'Antes ',
    cadaUna: (importe: string) => `${importe} cada una`,
  },
  {
    en: {
      bordado: (texto: string) => ` · embroidered “${texto}”`,
      encargo: (dias: number) => `Made to order · ${dias} days`,
      listo: 'Ready to ship',
      quitar: 'remove',
      quitarOculto: (nombre: string) => ` ${nombre} from your basket`,
      antes: 'Was ',
      cadaUna: (importe: string) => `${importe} each`,
    },
    fr: {
      bordado: (texto: string) => ` · brodé «\u00a0${texto}\u00a0»`,
      encargo: (dias: number) => `Crocheté à la commande · ${dias} jours`,
      listo: 'Prêt à expédier',
      quitar: 'retirer',
      quitarOculto: (nombre: string) => ` ${nombre} du panier`,
      antes: 'Avant ',
      cadaUna: (importe: string) => `${importe} l’unité`,
    },
    de: {
      bordado: (texto: string) => ` · bestickt mit „${texto}“`,
      encargo: (dias: number) => `Wird auf Bestellung gehäkelt · ${dias} Tage`,
      listo: 'Versandbereit',
      quitar: 'entfernen',
      quitarOculto: (nombre: string) => ` (${nombre})`,
      antes: 'Vorher ',
      cadaUna: (importe: string) => `${importe} pro Stück`,
    },
  },
);

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
  const t = useTextos(T);
  const idioma = useIdioma();
  return (
    <li className="fila-art">
      <Enlace className="fila-foto" href={href} tabIndex={-1} aria-hidden="true">
        {l.foto && <Image src={l.foto.src} alt="" fill sizes="(max-width: 620px) 76px, 96px" />}
      </Enlace>
      <div>
        <h3 className="fila-nom">
          <Enlace href={href}>{l.nombre}</Enlace>
        </h3>
        <p className="mini mt-1">
          {l.rotulo ?? l.variante}
          {l.personalizacion && t.bordado(l.personalizacion)}
        </p>
        {l.encargo && l.dias ? (
          <p className="mini-2">{t.encargo(l.dias)}</p>
        ) : (
          <p className="mini-2 listo">{t.listo}</p>
        )}
        <div className="fila-acciones">
          <ContadorUnidades valor={l.uds} max={max} nombre={l.nombre} alCambiar={alCambiar} />
          <button type="button" className="boton-texto" onClick={alQuitar}>
            {t.quitar}
            <span className="oculto-vis">{t.quitarOculto(l.nombre)}</span>
          </button>
        </div>
      </div>
      <div className="precio-col">
        {/* El precio ya rebajado, como en la ficha; el tachado, el de catálogo. */}
        <p className="precio">{eur(l.precio * l.uds - rebaja, idioma)}</p>
        {rebaja > 0 && (
          <p className="mini-2 antes">
            <span className="oculto-vis">{t.antes}</span>
            {eur(l.precio * l.uds, idioma)}
          </p>
        )}
        {l.uds > 1 && <p className="mini-2">{t.cadaUna(eur((l.precio * l.uds - rebaja) / l.uds, idioma))}</p>}
      </div>
    </li>
  );
}
