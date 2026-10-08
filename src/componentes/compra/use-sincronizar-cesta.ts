'use client';

import { useEffect } from 'react';
import { useBrindis } from '@/componentes/brindis';
import { useCesta } from '@/lib/cesta/contexto';
import type { ProductoCesta } from '@/lib/cesta/tipos';

/**
 * Pone la cesta guardada al día con el catálogo recién leído en el
 * servidor: precios nuevos, piezas agotadas o retiradas. Vuelve a
 * hacerlo cada vez que llega un catálogo nuevo (router.refresh()).
 */
export function useSincronizarCesta(productos: readonly ProductoCesta[]) {
  const { hidratada, sincronizar } = useCesta();
  const avisar = useBrindis();

  useEffect(() => {
    if (!hidratada) return;
    if (sincronizar(productos)) {
      avisar('Hemos puesto tu cesta al día: algún precio o disponibilidad ha cambiado');
    }
  }, [hidratada, productos, sincronizar, avisar]);
}
