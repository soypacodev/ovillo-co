'use client';

import { useEffect, useRef } from 'react';
import { IcoOk } from '@/componentes/iconos';
import { ResumenErrores } from '@/componentes/formularios/resumen-errores';
import type { EstadoAccion } from '@/lib/cuentas/tipos';

/** Resultado de una acción encima del formulario: el resumen de errores
 *  (que recibe el foco) o un aviso de que ha ido bien. */
export function AvisoEstado<C extends string>({ estado, prefijo }: { estado: EstadoAccion<C>; prefijo: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const intento = estado.estado === 'inicial' ? 0 : estado.intento;

  useEffect(() => {
    if (estado.estado === 'ok') ref.current?.focus({ preventScroll: false });
  }, [estado.estado, intento]);

  if (estado.estado === 'error') {
    return <ResumenErrores prefijo={prefijo} mensaje={estado.mensaje} errores={estado.errores} intento={intento} />;
  }
  if (estado.estado === 'ok') {
    return (
      <div ref={ref} className="aviso aviso-ok" role="status" tabIndex={-1}>
        <IcoOk />
        <span>{estado.mensaje}</span>
      </div>
    );
  }
  return null;
}
