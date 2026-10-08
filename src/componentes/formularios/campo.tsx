import type { ReactNode } from 'react';

/** Atributos que enlazan un control con su etiqueta, su pista y su error. */
interface AriaCampo {
  id: string;
  name: string;
  'aria-invalid'?: true;
  'aria-describedby'?: string;
}

interface PropsCampo {
  /** Nombre del campo en el formulario; también sirve de id. */
  nombre: string;
  /** Prefijo para que dos formularios en la misma página no repitan ids. */
  prefijo: string;
  etiqueta: ReactNode;
  /** Texto suave junto a la etiqueta, p. ej. «(opcional)». */
  aclaracion?: string;
  pista?: ReactNode;
  error?: string;
  className?: string;
  children: (aria: AriaCampo) => ReactNode;
}

export const idCampo = (prefijo: string, nombre: string) => `${prefijo}-${nombre}`;

/** Etiqueta, control, pista y error enlazados por id: el lector de
 *  pantalla lee el error al llegar al campo, no solo al enviar. */
export function Campo({ nombre, prefijo, etiqueta, aclaracion, pista, error, className, children }: PropsCampo) {
  const id = idCampo(prefijo, nombre);
  const idPista = `${id}-pista`;
  const idError = `${id}-error`;
  const descrito = [error && idError, pista && idPista].filter(Boolean).join(' ') || undefined;

  return (
    <div className={['campo', error && 'mal', className].filter(Boolean).join(' ')}>
      <label htmlFor={id}>
        {etiqueta}
        {aclaracion && <span className="aclaracion"> {aclaracion}</span>}
      </label>
      {children({ id, name: nombre, 'aria-invalid': error ? true : undefined, 'aria-describedby': descrito })}
      {pista && (
        <p className="pista" id={idPista}>
          {pista}
        </p>
      )}
      {error && (
        <p className="error" id={idError}>
          {error}
        </p>
      )}
    </div>
  );
}

interface PropsConsentimiento {
  prefijo: string;
  error?: string;
  marcado?: boolean;
  children: ReactNode;
}

/** Casilla de consentimiento con su error enlazado. */
export function Consentimiento({ prefijo, error, marcado, children }: PropsConsentimiento) {
  const id = idCampo(prefijo, 'acepta');
  return (
    <div className={error ? 'campo mal' : 'campo'}>
      <label className="check" htmlFor={id}>
        <input
          type="checkbox"
          id={id}
          name="acepta"
          defaultChecked={marcado}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <span>{children}</span>
      </label>
      {error && (
        <p className="error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
