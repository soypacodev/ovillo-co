'use client';

import { startTransition, useActionState, type FormEvent } from 'react';
import { ACCION_INICIAL, type EstadoAccion } from '@/lib/cuentas/tipos';

type Accion<C extends string> = (previo: EstadoAccion<C>, datos: FormData) => Promise<EstadoAccion<C>>;

/**
 * Estado común de los formularios de la cuenta. Se envía a mano para que
 * React no vacíe el formulario cuando vuelve con errores; sin JavaScript,
 * el atributo action hace el mismo envío.
 */
export function useFormulario<C extends string>(accion: Accion<C>) {
  const [estado, enviar, enviando] = useActionState<EstadoAccion<C>, FormData>(accion, ACCION_INICIAL);

  function alEnviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    startTransition(() => enviar(datos));
  }

  return {
    estado,
    enviar,
    enviando,
    alEnviar,
    errores: estado.estado === 'error' ? estado.errores : ({} as Partial<Record<C, string>>),
    valores: estado.estado === 'error' ? estado.valores : ({} as Partial<Record<C, string>>),
  };
}
