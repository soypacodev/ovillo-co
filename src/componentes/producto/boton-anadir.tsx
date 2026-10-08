'use client';

import type { ReactNode } from 'react';
import { useCesta } from '@/lib/cesta/contexto';
import type { OpcionesAnadir, ProductoCesta } from '@/lib/cesta/tipos';

export interface PropsBotonAnadir extends OpcionesAnadir {
  producto: ProductoCesta;
  className?: string;
  children?: ReactNode;
  /** Abrir el cajón al añadir (por defecto, sí). */
  abrirCajon?: boolean;
  disabled?: boolean;
}

/** Botón «Añadir a la cesta». Sin variante indicada, usa la primera con stock. */
export function BotonAnadir({
  producto,
  className = 'btn btn-1',
  children = 'Añadir a la cesta',
  abrirCajon = true,
  disabled,
  variante,
  uds,
  personalizacion,
}: PropsBotonAnadir) {
  const { anadir } = useCesta();
  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      onClick={() => anadir(producto, { variante, uds, personalizacion, abrir: abrirCajon })}
    >
      {children}
    </button>
  );
}
