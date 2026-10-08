'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { IcoOk } from '@/componentes/iconos';

interface PropsConfirmacion {
  titulo: string;
  children: ReactNode;
  /** Botones o enlaces para seguir. */
  acciones?: ReactNode;
}

/** Sustituye al formulario cuando el envío sale bien. El titular recibe
 *  el foco para que el lector de pantalla anuncie el cambio. */
export function Confirmacion({ titulo, children, acciones }: PropsConfirmacion) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const titular = ref.current;
    if (!titular) return;
    titular.focus({ preventScroll: true });
    titular.closest('.confirmacion')?.scrollIntoView({ block: 'start' });
  }, []);

  return (
    <div className="caja confirmacion" role="status">
      <div className="confirmacion-ico flota">
        <IcoOk width={28} height={28} />
      </div>
      <h2 ref={ref} tabIndex={-1}>
        {titulo}
      </h2>
      <div className="confirmacion-texto">{children}</div>
      {acciones && <div className="confirmacion-acciones">{acciones}</div>}
    </div>
  );
}
