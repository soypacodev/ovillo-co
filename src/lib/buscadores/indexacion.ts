// Qué pueden poner los buscadores en sus resultados.
//
// La demo quiere que se la encuentre buscando a su autor, pero no competir
// con talleres de crochet de verdad. Por eso, salvo NEXT_PUBLIC_INDEXAR=si
// (una instalación para un negocio real), solo se indexa la portada, que se
// presenta como demostración de Paco Dev. Fichas, catálogo y páginas de
// contenido llevan noindex: se pueden rastrear (para leer los enlaces y los
// datos estructurados), pero no aparecen como resultados.

import type { Metadata } from 'next';

export const INDEXAR_TIENDA = process.env.NEXT_PUBLIC_INDEXAR === 'si';

/** Para el layout raíz: lo que hereda cualquier página que no diga otra cosa. */
export const ROBOTS_POR_DEFECTO: Metadata['robots'] = INDEXAR_TIENDA ? undefined : { index: false, follow: true };

/** Para la portada, que se indexa siempre. */
export const ROBOTS_PORTADA: Metadata['robots'] = { index: true, follow: true };
