// Fusión de los favoritos del navegador con los de la cuenta al entrar.
// Nunca se pierde nada: se unen las dos listas. Primero van los de la
// cuenta (son los «de siempre») y detrás los nuevos de este navegador.

import { MAX_FAVORITOS, normalizarFavoritos } from '@/lib/cesta/favoritos';

export interface FusionFavoritos {
  /** Lista final, la misma en el navegador y en la cuenta. */
  favoritos: string[];
  /** Los que solo estaban en el navegador y hay que guardar en la cuenta. */
  subir: string[];
}

/** Une los favoritos del navegador (`locales`) con los de la cuenta (`remotos`). */
export function fusionarFavoritos(locales: unknown, remotos: unknown): FusionFavoritos {
  const cuenta = normalizarFavoritos(remotos);
  const enCuenta = new Set(cuenta);
  const nuevos = normalizarFavoritos(locales).filter((slug) => !enCuenta.has(slug));
  // Si no caben todos, se quedan los más recientes, como en alternarFavorito.
  const favoritos = [...cuenta, ...nuevos].slice(-MAX_FAVORITOS);
  const quedan = new Set(favoritos);
  return { favoritos, subir: nuevos.filter((slug) => quedan.has(slug)) };
}

/** Diferencia entre dos listas: qué se ha guardado y qué se ha quitado. */
export function cambiosFavoritos(antes: readonly string[], despues: readonly string[]) {
  const a = new Set(antes);
  const d = new Set(despues);
  return {
    anadir: despues.filter((s) => !a.has(s)),
    quitar: antes.filter((s) => !d.has(s)),
  };
}
