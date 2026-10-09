// Nombres visibles de las promociones en el idioma de la página. La cesta
// calcula con la semilla en español (el nombre es su clave); aquí solo se
// elige el texto que se enseña.

import type { Promocion } from '@/lib/catalogo/tipos';
import { TRADUCCIONES_PROMOCIONES } from '@/datos/traducciones-tarifas';
import type { Idioma } from '@/lib/i18n/idiomas';

/** Nombre de una promoción traducido si existe; si no, el español. */
export function nombrePromocion(p: Pick<Promocion, 'nombre' | 'traducciones'>, idioma: Idioma): string {
  if (idioma === 'es') return p.nombre;
  return p.traducciones?.[idioma]?.nombre || TRADUCCIONES_PROMOCIONES[p.nombre]?.[idioma]?.nombre || p.nombre;
}
