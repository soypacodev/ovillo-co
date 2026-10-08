'use client';

import { useEffect, useRef } from 'react';
import { IcoInfo, IcoOk } from '@/componentes/iconos';
import type { ResultadoPanel } from '@/lib/panel/tipos-accion';

/** Resultado de una acción del panel. Recibe el foco al aparecer para que
 *  el lector de pantalla lo lea y quien usa teclado no se pierda. */
export function AvisoPanel({ resultado }: { resultado: ResultadoPanel }) {
  const ref = useRef<HTMLDivElement>(null);
  const intento = resultado.estado === 'inicial' ? 0 : resultado.intento;

  useEffect(() => {
    if (intento) ref.current?.focus({ preventScroll: false });
  }, [intento]);

  if (resultado.estado === 'inicial') return null;
  const ok = resultado.estado === 'ok';
  return (
    <div ref={ref} tabIndex={-1} className={ok ? 'aviso aviso-ok' : 'aviso aviso-error'} role={ok ? 'status' : 'alert'}>
      {ok ? <IcoOk /> : <IcoInfo />}
      <span>{resultado.mensaje}</span>
    </div>
  );
}
