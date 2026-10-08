'use client';

// Variante elegida en la ficha. La comparten la galería, que enseña la
// foto de esa variante, y el bloque de compra, que la añade a la cesta.

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface ValorVariante {
  indice: number;
  elegir: (indice: number) => void;
}

const Contexto = createContext<ValorVariante | null>(null);

export function ProveedorVariante({ inicial, children }: { inicial: number; children: ReactNode }) {
  const [indice, elegir] = useState(inicial);
  const valor = useMemo(() => ({ indice, elegir }), [indice]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useVariante(): ValorVariante {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useVariante necesita <ProveedorVariante>.');
  return valor;
}
