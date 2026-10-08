'use client';

// Cajón lateral de la cesta. Se abre al añadir algo o con el icono de
// la cabecera y se cierra con Escape, con el velo o con la X.

import Link from 'next/link';
import { useRef } from 'react';
import { IcoCerrar, Ovillo } from '@/componentes/iconos';
import { usePanelModal } from '@/componentes/use-panel-modal';
import { useCesta } from '@/lib/cesta/contexto';
import { rutas } from '@/lib/rutas';
import { BarraEnvioGratis } from './barra-envio-gratis';
import { FormularioCupon } from './formulario-cupon';
import { LineaCesta } from './linea-cesta';
import { ResumenTotales } from './resumen-totales';

export function CajonCesta() {
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
            Tu cesta{' '}
            {unidades > 0 && <span className="mini">({unidades})</span>}
          </h2>
          <button ref={botonCerrar} type="button" className="icono" onClick={cerrar} aria-label="Cerrar la cesta">
            <IcoCerrar />
          </button>
        </div>

        {lineas.length === 0 ? (
          <div className="cajon-cuerpo">
            <div className="vacio">
              <Ovillo width={56} height={56} className="ovillo-vacio" />
              <p>Todavía no has cogido nada.</p>
              <Link className="btn btn-2 btn-p mt-5" href={rutas.tienda} onClick={cerrar}>
                Ver la tienda
              </Link>
            </div>
          </div>
        ) : (
          <>
            <ul className="cajon-cuerpo" aria-label="Piezas en la cesta">
              {lineas.map((l) => (
                <LineaCesta key={l.id} linea={l} alNavegar={cerrar} />
              ))}
            </ul>
            <div className="cajon-pie">
              <BarraEnvioGratis totales={totales} />
              <FormularioCupon />
              <ResumenTotales totales={totales} cupon={cupon} />
              {totales.plazoEncargo && (
                <p className="mini-2">
                  Hay piezas que se tejen al pedir: el pedido sale en unos {totales.plazoEncargo} días.
                </p>
              )}
              <Link className="btn btn-1 btn-bloque" href={rutas.pago} onClick={cerrar}>
                Ir a pagar
              </Link>
              <Link className="btn btn-4 btn-bloque btn-p" href={rutas.cesta} onClick={cerrar}>
                Ver la cesta completa
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
