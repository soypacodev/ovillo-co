'use client';

import { useEffect } from 'react';
import { useBrindis } from '@/componentes/brindis';
import { useCesta } from '@/lib/cesta/contexto';
import type { ProductoCesta } from '@/lib/cesta/tipos';
import { textos } from '@/lib/i18n';
import { useTextos } from '@/lib/i18n/cliente';

const T = textos(
  { puesta: 'Hemos puesto tu cesta al día: algún precio o disponibilidad ha cambiado' },
  {
    en: { puesta: 'We’ve updated your basket: a price or availability has changed' },
    fr: { puesta: 'Nous avons mis votre panier à jour\u00a0: un prix ou une disponibilité a changé' },
    de: { puesta: 'Wir haben Ihren Warenkorb aktualisiert: Ein Preis oder die Verfügbarkeit hat sich geändert' },
  },
);

/**
 * Pone la cesta guardada al día con el catálogo recién leído en el
 * servidor: precios nuevos, piezas agotadas o retiradas. Vuelve a
 * hacerlo cada vez que llega un catálogo nuevo (router.refresh()).
 */
export function useSincronizarCesta(productos: readonly ProductoCesta[]) {
  const { hidratada, sincronizar } = useCesta();
  const avisar = useBrindis();
  const { puesta } = useTextos(T);

  useEffect(() => {
    if (!hidratada) return;
    if (sincronizar(productos)) {
      avisar(puesta);
    }
  }, [hidratada, productos, sincronizar, avisar, puesta]);
}
