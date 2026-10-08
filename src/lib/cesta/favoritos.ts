// Favoritos: una lista de slugs, sin repetidos y en el orden en que se
// guardaron (el más reciente al final).

export const MAX_FAVORITOS = 100;

export function esFavorito(favoritos: readonly string[], slug: string): boolean {
  return favoritos.includes(slug);
}

/**
 * Guarda o quita un favorito. Por encima de MAX_FAVORITOS se descartan
 * los más antiguos.
 */
export function alternarFavorito(
  favoritos: readonly string[],
  slug: string,
): { favoritos: string[]; guardado: boolean } {
  if (favoritos.includes(slug)) {
    return { favoritos: favoritos.filter((s) => s !== slug), guardado: false };
  }
  return { favoritos: [...favoritos, slug].slice(-MAX_FAVORITOS), guardado: true };
}

/** Acepta cualquier cosa leída del almacenamiento y devuelve una lista válida. */
export function normalizarFavoritos(dato: unknown): string[] {
  if (!Array.isArray(dato)) return [];
  const vistos = new Set<string>();
  for (const x of dato) {
    if (typeof x === 'string' && x.length > 0 && x.length <= 120) vistos.add(x);
  }
  return [...vistos].slice(-MAX_FAVORITOS);
}
