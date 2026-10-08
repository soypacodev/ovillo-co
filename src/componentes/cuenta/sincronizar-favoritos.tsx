'use client';

// Con sesión abierta, los favoritos del navegador y los de la cuenta son
// la misma lista. Al llegar se fusionan una vez por sesión del navegador
// (nunca se pierde ninguno) y, a partir de ahí, cada corazón que se marca
// o se quita se refleja también en la cuenta. No pinta nada.

import { useEffect, useRef } from 'react';
import { actualizarFavoritosCuenta, fusionarFavoritosCuenta } from '@/lib/cuentas/acciones';
import { cambiosFavoritos } from '@/lib/cuentas/favoritos';
import { useCesta, useFavoritos } from '@/lib/cesta/contexto';

const CLAVE = 'ovillo.favoritosFusionados';

function yaFusionados(): boolean {
  try {
    return window.sessionStorage.getItem(CLAVE) === '1';
  } catch {
    return false;
  }
}

function marcarFusionados(): void {
  try {
    window.sessionStorage.setItem(CLAVE, '1');
  } catch {
    // Sin sessionStorage se volverá a fusionar en la próxima carga: no pasa nada.
  }
}

export function SincronizarFavoritos() {
  const { hidratada } = useCesta();
  const { favoritos, reemplazar } = useFavoritos();
  // Última lista que sabemos que está también en la cuenta.
  const sincronizada = useRef<readonly string[] | null>(null);

  useEffect(() => {
    if (!hidratada || sincronizada.current !== null) return;
    if (yaFusionados()) {
      sincronizada.current = favoritos;
      return;
    }
    sincronizada.current = favoritos;
    fusionarFavoritosCuenta(favoritos)
      .then((lista) => {
        if (!lista) return;
        sincronizada.current = lista;
        reemplazar(lista);
        marcarFusionados();
      })
      .catch(() => {
        // Sin conexión: se intentará en la próxima carga.
      });
  }, [hidratada, favoritos, reemplazar]);

  useEffect(() => {
    const antes = sincronizada.current;
    if (!hidratada || antes === null || antes === favoritos) return;
    const cambios = cambiosFavoritos(antes, favoritos);
    sincronizada.current = favoritos;
    if (cambios.anadir.length || cambios.quitar.length) {
      actualizarFavoritosCuenta(cambios).catch(() => {});
    }
  }, [hidratada, favoritos]);

  return null;
}
