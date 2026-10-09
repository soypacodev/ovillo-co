'use client';

// Cajón lateral de la cesta. Se abre al añadir algo o con el icono de
// la cabecera y se cierra con Escape, con el velo o con la X.

import { useRef } from 'react';
import { IcoCerrar, Ovillo } from '@/componentes/iconos';
import { usePanelModal } from '@/componentes/use-panel-modal';
import { useCesta } from '@/lib/cesta/contexto';
import { textos } from '@/lib/i18n';
import { useTextos } from '@/lib/i18n/cliente';
import { Enlace } from '@/lib/i18n/enlace';
import { rutas } from '@/lib/rutas';
import { BarraEnvioGratis } from './barra-envio-gratis';
import { FormularioCupon } from './formulario-cupon';
import { LineaCesta } from './linea-cesta';
import { ResumenTotales } from './resumen-totales';

const T = textos(
  {
    titulo: 'Tu cesta',
    cerrar: 'Cerrar la cesta',
    vacia: 'Todavía no has cogido nada.',
    verTienda: 'Ver la tienda',
    piezas: 'Piezas en la cesta',
    plazo: (dias: number) => `Hay piezas que se tejen al pedir: el pedido sale en unos ${dias} días.`,
    pagar: 'Ir a pagar',
    completa: 'Ver la cesta completa',
  },
  {
    en: {
      titulo: 'Your basket',
      cerrar: 'Close the basket',
      vacia: 'You haven’t picked anything yet.',
      verTienda: 'Browse the shop',
      piezas: 'Items in your basket',
      plazo: (dias: number) => `Some items are made to order: your order ships in about ${dias} days.`,
      pagar: 'Go to checkout',
      completa: 'View the full basket',
    },
    fr: {
      titulo: 'Votre panier',
      cerrar: 'Fermer le panier',
      vacia: 'Vous n’avez encore rien choisi.',
      verTienda: 'Voir la boutique',
      piezas: 'Articles du panier',
      plazo: (dias: number) =>
        `Certaines pièces sont crochetées à la commande\u00a0: votre commande part dans ${dias} jours environ.`,
      pagar: 'Passer au paiement',
      completa: 'Voir le panier complet',
    },
    de: {
      titulo: 'Ihr Warenkorb',
      cerrar: 'Warenkorb schließen',
      vacia: 'Sie haben noch nichts ausgewählt.',
      verTienda: 'Zum Shop',
      piezas: 'Artikel im Warenkorb',
      plazo: (dias: number) =>
        `Einige Stücke werden erst auf Bestellung gehäkelt: Ihre Bestellung wird in etwa ${dias} Tagen verschickt.`,
      pagar: 'Zur Kasse',
      completa: 'Ganzen Warenkorb ansehen',
    },
  },
);

export function CajonCesta() {
  const t = useTextos(T);
  const { abierta, cerrar, lineas, cupon, totales, unidades } = useCesta();
  const panel = useRef<HTMLElement>(null);
  const botonCerrar = useRef<HTMLButtonElement>(null);
  usePanelModal(abierta, cerrar, panel, botonCerrar);

  return (
    <>
      <div className={abierta ? 'velo abierto' : 'velo'} onClick={cerrar} aria-hidden="true" />
      <aside
        ref={panel}
        id="cajon-cesta"
        className={abierta ? 'cajon abierto' : 'cajon'}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cajon-titulo"
        aria-hidden={!abierta}
        inert={!abierta}
      >
        <div className="cajon-cab">
          <h2 id="cajon-titulo">
            {t.titulo}{' '}
            {unidades > 0 && <span className="mini">({unidades})</span>}
          </h2>
          <button ref={botonCerrar} type="button" className="icono" onClick={cerrar} aria-label={t.cerrar}>
            <IcoCerrar />
          </button>
        </div>

        {lineas.length === 0 ? (
          <div className="cajon-cuerpo">
            <div className="vacio">
              <Ovillo width={56} height={56} className="ovillo-vacio" />
              <p>{t.vacia}</p>
              <Enlace className="btn btn-2 btn-p mt-5" href={rutas.tienda} onClick={cerrar}>
                {t.verTienda}
              </Enlace>
            </div>
          </div>
        ) : (
          <>
            <ul className="cajon-cuerpo" aria-label={t.piezas}>
              {lineas.map((l) => (
                <LineaCesta key={l.id} linea={l} alNavegar={cerrar} />
              ))}
            </ul>
            <div className="cajon-pie">
              <BarraEnvioGratis totales={totales} />
              <FormularioCupon />
              <ResumenTotales totales={totales} cupon={cupon} />
              {totales.plazoEncargo && (
                <p className="mini-2">{t.plazo(totales.plazoEncargo)}</p>
              )}
              <Enlace className="btn btn-1 btn-bloque" href={rutas.pago} onClick={cerrar}>
                {t.pagar}
              </Enlace>
              <Enlace className="btn btn-4 btn-bloque btn-p" href={rutas.cesta} onClick={cerrar}>
                {t.completa}
              </Enlace>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
