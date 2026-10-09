'use client';

import type { ReactNode } from 'react';
import { IcoAtras, IcoInfo, Ovillo } from '@/componentes/iconos';
import type { MetodoEnvio } from '@/lib/catalogo/tipos';
import { eur } from '@/lib/formato';
import { textos } from '@/lib/i18n';
import { useIdioma, useTextos } from '@/lib/i18n/cliente';
import { Enlace } from '@/lib/i18n/enlace';
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

const T = textos(
  {
    titulo: 'Revisa y paga',
    pago: 'Pago',
    acepto: (venta: ReactNode, privacidad: ReactNode) => (
      <>
        He leído y acepto los {venta} y la {privacidad}.
      </>
    ),
    venta: 'términos de venta',
    privacidad: 'política de privacidad',
    quitarCodigo: 'Quitar el código y seguir',
    volver: 'Volver a la entrega',
    abriendo: 'Abriendo el pago seguro…',
    confirmando: 'Confirmando…',
    pagar: (total: string) => `Pagar ${total}`,
    confirmarPrueba: (total: string) => `Confirmar pedido de prueba · ${total}`,
  },
  {
    en: {
      titulo: 'Review and pay',
      pago: 'Payment',
      acepto: (venta: ReactNode, privacidad: ReactNode) => (
        <>
          I have read and accept the {venta} and the {privacidad}.
        </>
      ),
      venta: 'terms of sale',
      privacidad: 'privacy policy',
      quitarCodigo: 'Remove the code and continue',
      volver: 'Back to delivery',
      abriendo: 'Opening secure payment…',
      confirmando: 'Confirming…',
      pagar: (total: string) => `Pay ${total}`,
      confirmarPrueba: (total: string) => `Confirm test order · ${total}`,
    },
    fr: {
      titulo: 'Vérifiez et payez',
      pago: 'Paiement',
      acepto: (venta: ReactNode, privacidad: ReactNode) => (
        <>
          J’ai lu et j’accepte les {venta} et la {privacidad}.
        </>
      ),
      venta: 'conditions de vente',
      privacidad: 'politique de confidentialité',
      quitarCodigo: 'Retirer le code et continuer',
      volver: 'Retour à la livraison',
      abriendo: 'Ouverture du paiement sécurisé…',
      confirmando: 'Confirmation…',
      pagar: (total: string) => `Payer ${total}`,
      confirmarPrueba: (total: string) => `Confirmer la commande test · ${total}`,
    },
    de: {
      titulo: 'Prüfen und bezahlen',
      pago: 'Zahlung',
      acepto: (venta: ReactNode, privacidad: ReactNode) => (
        <>
          Ich habe die {venta} und die {privacidad} gelesen und akzeptiere sie.
        </>
      ),
      venta: 'Verkaufsbedingungen',
      privacidad: 'Datenschutzerklärung',
      quitarCodigo: 'Code entfernen und fortfahren',
      volver: 'Zurück zur Lieferung',
      abriendo: 'Sichere Zahlung wird geöffnet…',
      confirmando: 'Wird bestätigt…',
      pagar: (total: string) => `${total} bezahlen`,
      confirmarPrueba: (total: string) => `Testbestellung bestätigen · ${total}`,
    },
  },
);

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
  const t = useTextos(T);
  const idioma = useIdioma();
  return (
    <div className="paso-pago">
        <div className="caja">
          <h2 ref={titulo} tabIndex={-1}>
            {t.titulo}
          </h2>
          <Revision datos={datos} metodos={metodos} irA={irA} />
        </div>

        <div className="caja">
          <h3>{t.pago}</h3>
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
              {t.acepto(
                <Enlace href={`${rutas.legal}#venta`} className="enlace-texto">
                  {t.venta}
                </Enlace>,
                <Enlace href={`${rutas.legal}#privacidad`} className="enlace-texto">
                  {t.privacidad}
                </Enlace>,
              )}
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
                {t.quitarCodigo}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="botones-paso">
        <button type="button" className="btn btn-4 btn-p" onClick={() => irA(2)} disabled={ocupado}>
          <IcoAtras /> {t.volver}
        </button>
        <button type="submit" className="btn btn-1 btn-g" disabled={ocupado} aria-live="polite">
          {ocupado ? (
            <span className="boton-cargando">
              <Ovillo width={20} height={20} className="ovillo-gira" />
              {modo === 'stripe' ? t.abriendo : t.confirmando}
            </span>
          ) : modo === 'stripe' ? (
            t.pagar(eur(total, idioma))
          ) : (
            t.confirmarPrueba(eur(total, idioma))
          )}
        </button>
      </div>
    </div>
  );
}
