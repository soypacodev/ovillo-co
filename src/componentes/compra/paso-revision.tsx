'use client';

import Link from 'next/link';
import { IcoAtras, IcoInfo, Ovillo } from '@/componentes/iconos';
import type { MetodoEnvio } from '@/lib/catalogo/tipos';
import { eur } from '@/lib/formato';
import { rutas } from '@/lib/rutas';
import { idCampo } from './campos';
import type { ModoPago, Paso, PropsPaso } from './datos-pago';
import { CajaPago, Revision } from './revision-pago';

interface PropsPasoRevision extends PropsPaso {
  metodos: MetodoEnvio[];
  modo: ModoPago;
  total: number;
  irA: (paso: Paso) => void;
  ocupado: boolean;
  errorGeneral: { mensaje: string; cupon?: boolean } | null;
  quitarCupon: () => void;
}

/** Paso 3: resumen de lo escrito, aceptación de los términos y pago. */
export function PasoRevision({
  datos,
  errores,
  cambiar,
  titulo,
  metodos,
  modo,
  total,
  irA,
  ocupado,
  errorGeneral,
  quitarCupon,
}: PropsPasoRevision) {
  return (
    <div className="paso-pago">
        <div className="caja">
          <h2 ref={titulo} tabIndex={-1}>
            Revisa y paga
          </h2>
          <Revision datos={datos} metodos={metodos} irA={irA} />
        </div>

        <div className="caja">
          <h3>Pago</h3>
          <CajaPago modo={modo} />
          <label className={errores.acepta ? 'check check-acepta mal' : 'check check-acepta'}>
            <input
              id={idCampo('acepta')}
              type="checkbox"
              checked={datos.acepta}
              onChange={(e) => cambiar('acepta', e.target.checked)}
              aria-invalid={errores.acepta ? true : undefined}
              aria-describedby={errores.acepta ? `${idCampo('acepta')}-error` : undefined}
            />
            <span>
              He leído y acepto los{' '}
              <Link href={`${rutas.legal}#venta`} className="enlace-texto">
                términos de venta
              </Link>{' '}
              y la{' '}
              <Link href={`${rutas.legal}#privacidad`} className="enlace-texto">
                política de privacidad
              </Link>
              .
            </span>
          </label>
          {errores.acepta && (
            <p className="error visible" id={`${idCampo('acepta')}-error`}>
              {errores.acepta}
            </p>
          )}
        </div>

      {errorGeneral && (
        <div className="error-general" id="error-pago" role="alert">
          <IcoInfo />
          <div>
            <p>{errorGeneral.mensaje}</p>
            {errorGeneral.cupon && (
              <button type="button" className="boton-texto" onClick={quitarCupon}>
                Quitar el código y seguir
              </button>
            )}
          </div>
        </div>
      )}

      <div className="botones-paso">
        <button type="button" className="btn btn-4 btn-p" onClick={() => irA(2)} disabled={ocupado}>
          <IcoAtras /> Volver a la entrega
        </button>
        <button type="submit" className="btn btn-1 btn-g" disabled={ocupado} aria-live="polite">
          {ocupado ? (
            <span className="boton-cargando">
              <Ovillo width={20} height={20} className="ovillo-gira" />
              {modo === 'stripe' ? 'Abriendo el pago seguro…' : 'Confirmando…'}
            </span>
          ) : modo === 'stripe' ? (
            `Pagar ${eur(total)}`
          ) : (
            `Confirmar pedido de prueba · ${eur(total)}`
          )}
        </button>
      </div>
    </div>
  );
}
