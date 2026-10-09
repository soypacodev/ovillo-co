'use client';

// Campo de código promocional. Valida contra las promociones con mensajes
// concretos y, si hay uno aplicado, permite quitarlo.

import { useId, useState, type FormEvent } from 'react';
import { useBrindis } from '@/componentes/brindis';
import { useCesta } from '@/lib/cesta/contexto';
import { nombrePromocion } from '@/lib/cesta/nombres';
import { eur } from '@/lib/formato';
import { textos } from '@/lib/i18n';
import { useIdioma, useTextos } from '@/lib/i18n/cliente';

const T = textos(
  {
    codigo: 'Código',
    quitar: 'quitar',
    quitarOculto: (c: string) => ` el código ${c}`,
    faltaMinimo: (importe: string) => `Te faltan ${importe} para que este código se aplique.`,
    envioDescontado: 'El envío gratis se calcula con el importe ya descontado.',
    pregunta: '¿Tienes un código de descuento?',
    etiqueta: 'Código de descuento',
    ejemplo: 'Por ejemplo, HOLA10',
    aplicar: 'Aplicar',
  },
  {
    en: {
      codigo: 'Code',
      quitar: 'remove',
      quitarOculto: (c: string) => ` the code ${c}`,
      faltaMinimo: (importe: string) => `You’re ${importe} short for this code to apply.`,
      envioDescontado: 'Free delivery is worked out on the discounted amount.',
      pregunta: 'Got a discount code?',
      etiqueta: 'Discount code',
      ejemplo: 'For example, HOLA10',
      aplicar: 'Apply',
    },
    fr: {
      codigo: 'Code',
      quitar: 'retirer',
      quitarOculto: (c: string) => ` le code ${c}`,
      faltaMinimo: (importe: string) => `Il vous manque ${importe} pour que ce code s’applique.`,
      envioDescontado: 'La livraison offerte se calcule sur le montant après remise.',
      pregunta: 'Vous avez un code de réduction\u202f?',
      etiqueta: 'Code de réduction',
      ejemplo: 'Par exemple, HOLA10',
      aplicar: 'Appliquer',
    },
    de: {
      codigo: 'Code',
      quitar: 'entfernen',
      quitarOculto: (c: string) => ` (Code ${c})`,
      faltaMinimo: (importe: string) => `Es fehlen noch ${importe}, damit dieser Code gilt.`,
      envioDescontado: 'Der kostenlose Versand wird mit dem bereits rabattierten Betrag berechnet.',
      pregunta: 'Haben Sie einen Rabattcode?',
      etiqueta: 'Rabattcode',
      ejemplo: 'Zum Beispiel HOLA10',
      aplicar: 'Einlösen',
    },
  },
);

export function FormularioCupon({ abierto = false }: { abierto?: boolean }) {
  const { cupon, totales, aplicarCupon, quitarCupon } = useCesta();
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const avisar = useBrindis();
  const id = useId();
  const t = useTextos(T);
  const idioma = useIdioma();

  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const r = aplicarCupon(codigo);
    if (r.ok) {
      setCodigo('');
      setError(null);
      avisar(r.mensaje);
    } else {
      setError(r.mensaje);
    }
  };

  if (cupon) {
    return (
      <div>
        <div className="cupon-activo">
          <span>
            {t.codigo} <b>{cupon}</b>
            {totales.promocionCupon ? ` · ${nombrePromocion(totales.promocionCupon, idioma)}` : ''}
          </span>
          <button type="button" className="boton-texto" onClick={quitarCupon}>
            {t.quitar}
            <span className="oculto-vis">{t.quitarOculto(cupon)}</span>
          </button>
        </div>
        {totales.cuponFaltaMinimo > 0 && (
          <p className="cupon-msg mal">{t.faltaMinimo(eur(totales.cuponFaltaMinimo, idioma))}</p>
        )}
        {totales.cuponQuitaEnvioGratis && (
          <p className="cupon-msg">{t.envioDescontado}</p>
        )}
      </div>
    );
  }

  return (
    <details className="cupon" open={abierto || undefined}>
      <summary>{t.pregunta}</summary>
      <form className="cupon-form" onSubmit={enviar} noValidate>
        <label htmlFor={id} className="oculto-vis">
          {t.etiqueta}
        </label>
        <input
          id={id}
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder={t.ejemplo}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={40}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-msg` : undefined}
        />
        <button type="submit" className="btn btn-3 btn-p">
          {t.aplicar}
        </button>
      </form>
      <p id={`${id}-msg`} className="cupon-msg mal" aria-live="polite">
        {error}
      </p>
    </details>
  );
}
