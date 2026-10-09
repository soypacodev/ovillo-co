// La etiqueta de las variantes («Color», «Talla», «Modelo») llega ya
// traducida del catálogo, así que se reconoce el color en cualquier idioma.

const ETIQUETAS_COLOR = new Set(['color', 'colour', 'couleur', 'farbe']);

/** Las variantes se distinguen por el color: se eligen por la muestra. */
export const esPorColor = (etiquetaVariante: string) => ETIQUETAS_COLOR.has(etiquetaVariante.trim().toLowerCase());
