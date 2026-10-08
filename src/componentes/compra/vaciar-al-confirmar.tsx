'use client';

import { useEffect } from 'react';
import { guardarLocal, leerLocal } from '@/lib/almacen-local';
import { useCesta } from '@/lib/cesta/contexto';

const CLAVE = 'cesta-vaciada-por';

/**
 * Vacía la cesta una sola vez por pedido confirmado. Si alguien vuelve
 * más tarde a esta página con otra cesta a medias, no se la borra.
 */
export function VaciarAlConfirmar({ numero }: { numero: string }) {
  const { hidratada, vaciar } = useCesta();
  useEffect(() => {
    if (!hidratada || leerLocal(CLAVE) === numero) return;
    vaciar();
    guardarLocal(CLAVE, numero);
  }, [hidratada, numero, vaciar]);
  return null;
}
