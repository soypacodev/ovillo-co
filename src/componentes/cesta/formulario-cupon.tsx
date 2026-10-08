'use client';

// Campo de código promocional. Valida contra las promociones con mensajes
// concretos y, si hay uno aplicado, permite quitarlo.

import { useId, useState, type FormEvent } from 'react';
import { useBrindis } from '@/componentes/brindis';
import { useCesta } from '@/lib/cesta/contexto';
import { eur } from '@/lib/formato';

export function FormularioCupon({ abierto = false }: { abierto?: boolean }) {
  const { cupon, totales, aplicarCupon, quitarCupon } = useCesta();
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const avisar = useBrindis();
  const id = useId();

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
            Código <b>{cupon}</b>
            {totales.promocionCupon ? ` · ${totales.promocionCupon.nombre}` : ''}
          </span>
          <button type="button" className="boton-texto" onClick={quitarCupon}>
            quitar<span className="oculto-vis"> el código {cupon}</span>
          </button>
        </div>
        {totales.cuponFaltaMinimo > 0 && (
          <p className="cupon-msg mal">
            Te faltan {eur(totales.cuponFaltaMinimo)} para que este código se aplique.
          </p>
        )}
        {totales.cuponQuitaEnvioGratis && (
          <p className="cupon-msg">El envío gratis se calcula con el importe ya descontado.</p>
        )}
      </div>
    );
  }

  return (
    <details className="cupon" open={abierto || undefined}>
      <summary>¿Tienes un código de descuento?</summary>
      <form className="cupon-form" onSubmit={enviar} noValidate>
        <label htmlFor={id} className="oculto-vis">
          Código de descuento
        </label>
        <input
          id={id}
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Por ejemplo, HOLA10"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={40}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-msg` : undefined}
        />
        <button type="submit" className="btn btn-3 btn-p">
          Aplicar
        </button>
      </form>
      <p id={`${id}-msg`} className="cupon-msg mal" aria-live="polite">
        {error}
      </p>
    </details>
  );
}
