'use client';

// Idioma en los componentes de cliente. El layout raíz lo lee de la
// petición y lo reparte con este contexto.

import { usePathname } from 'next/navigation';
import { createContext, use, type ReactNode } from 'react';
import { conIdioma, IDIOMA_POR_DEFECTO, sinIdioma, type Idioma } from './idiomas';
import type { Textos } from './textos';

const ContextoIdioma = createContext<Idioma>(IDIOMA_POR_DEFECTO);

export function ProveedorIdioma({ idioma, children }: { idioma: Idioma; children: ReactNode }) {
  return <ContextoIdioma value={idioma}>{children}</ContextoIdioma>;
}

export function useIdioma(): Idioma {
  return use(ContextoIdioma);
}

/** Los textos de ese archivo en el idioma de la página. */
export function useTextos<T>(t: Textos<T>): Textos<T>[Idioma] {
  return t[use(ContextoIdioma)];
}

/** Ruta actual sin prefijo de idioma («/en/tienda» → «/tienda»), para compararla con `rutas`. */
export function useRuta(): string {
  return sinIdioma(usePathname());
}

/** Convierte rutas de la tienda al idioma de la página. */
export function useConIdioma(): (ruta: string) => string {
  const idioma = use(ContextoIdioma);
  return (ruta) => conIdioma(ruta, idioma);
}
