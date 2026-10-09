'use client';

// Formulario de un solo correo que envía a una función de servidor. Sin
// JavaScript también funciona: el navegador envía el formulario y la
// página vuelve con el mensaje.

import { useActionState, useId } from 'react';
import { CampoTrampa } from '@/componentes/formularios/campo-trampa';
import { IcoOk, Ovillo } from '@/componentes/iconos';
import { CORREO_INICIAL, type EstadoCorreo } from '@/lib/acciones/tipos';
import { textos } from '@/lib/i18n';
import { useTextos } from '@/lib/i18n/cliente';

const T = textos(
  { ejemplo: 'tucorreo@ejemplo.com', enviando: 'Enviando…' },
  {
    en: { ejemplo: 'you@example.com', enviando: 'Sending…' },
    fr: { ejemplo: 'vous@exemple.fr', enviando: 'Envoi…' },
    de: { ejemplo: 'ihre@beispiel.de', enviando: 'Wird gesendet…' },
  },
);

export interface PropsFormularioCorreo {
  accion: (previo: EstadoCorreo, datos: FormData) => Promise<EstadoCorreo>;
  etiqueta: string;
  boton: string;
  /** Campos ocultos que acompañan al correo (producto, variante…). */
  ocultos?: Record<string, string>;
  className?: string;
}

export function FormularioCorreo({ accion, etiqueta, boton, ocultos, className }: PropsFormularioCorreo) {
  const [estado, enviar, enviando] = useActionState(accion, CORREO_INICIAL);
  const id = useId();
  const t = useTextos(T);
  const idError = `${id}-error`;

  if (estado.estado === 'ok') {
    return (
      <div className="aviso aviso-ok" role="status">
        <IcoOk />
        <span>{estado.mensaje}</span>
      </div>
    );
  }

  const error = estado.estado === 'error' ? estado : null;

  return (
    <form action={enviar} noValidate className={['form-correo', className].filter(Boolean).join(' ')}>
      {ocultos &&
        Object.entries(ocultos).map(([nombre, valor]) => <input key={nombre} type="hidden" name={nombre} value={valor} />)}
      <CampoTrampa prefijo={id} />
      <div className={error ? 'campo mal' : 'campo'}>
        <label htmlFor={`${id}-correo`} className="oculto-vis">
          {etiqueta}
        </label>
        <input
          key={estado.intento}
          id={`${id}-correo`}
          type="email"
          name="correo"
          inputMode="email"
          autoComplete="email"
          placeholder={t.ejemplo}
          defaultValue={error?.correo ?? ''}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? idError : undefined}
          // Tras un error el foco vuelve al campo para corregirlo.
          autoFocus={Boolean(error)}
        />
        <p id={idError} className="error" role="alert">
          {error?.mensaje}
        </p>
      </div>
      <button className="btn btn-1" type="submit" disabled={enviando}>
        {enviando ? (
          <>
            <Ovillo width={18} height={18} className="ovillo-gira" />
            {t.enviando}
          </>
        ) : (
          boton
        )}
      </button>
    </form>
  );
}
