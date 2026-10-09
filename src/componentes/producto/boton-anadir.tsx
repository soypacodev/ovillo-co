'use client';

import type { ReactNode } from 'react';
import { useCesta } from '@/lib/cesta/contexto';
import type { OpcionesAnadir, ProductoCesta } from '@/lib/cesta/tipos';
import { textos } from '@/lib/i18n';
import { useTextos } from '@/lib/i18n/cliente';

const T = textos(
  { anadir: 'Añadir a la cesta' },
  { en: { anadir: 'Add to basket' }, fr: { anadir: 'Ajouter au panier' }, de: { anadir: 'In den Warenkorb' } },
);

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
  children,
  abrirCajon = true,
  disabled,
  variante,
  uds,
  personalizacion,
}: PropsBotonAnadir) {
  const { anadir } = useCesta();
  const t = useTextos(T);
  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      onClick={() => anadir(producto, { variante, uds, personalizacion, abrir: abrirCajon })}
    >
      {children ?? t.anadir}
    </button>
  );
}
