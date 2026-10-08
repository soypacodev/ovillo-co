'use client';

import { useEffect, useRef } from 'react';
import { IcoInfo } from '@/componentes/iconos';
import { idCampo } from './campo';

interface PropsResumen {
  prefijo: string;
  mensaje: string;
  errores: Partial<Record<string, string>>;
  /** Cambia en cada envío fallido para volver a llevar el foco al resumen. */
  intento: unknown;
}

/** Aviso con la lista de errores al principio del formulario. Recibe el
 *  foco tras un envío fallido, y cada error enlaza con su campo. */
export function ResumenErrores({ prefijo, mensaje, errores, intento }: PropsResumen) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const aviso = ref.current;
    if (!aviso) return;
    aviso.focus({ preventScroll: true });
    aviso.scrollIntoView({ block: 'start' });
  }, [intento]);

  const lista = Object.entries(errores).filter((e): e is [string, string] => Boolean(e[1]));

  return (
    <div ref={ref} className="aviso aviso-error resumen-errores" tabIndex={-1} role="alert">
      <IcoInfo />
      <div>
        <p className="resumen-titulo">{mensaje}</p>
        {lista.length > 0 && (
          <ul>
            {lista.map(([campo, texto]) => (
              <li key={campo}>
                <a href={`#${idCampo(prefijo, campo)}`}>{texto}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
