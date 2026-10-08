// Ajustes tipográficos para textos que llegan como datos (catálogo,
// preguntas, plazos de envío): los escritos en el código ya van bien.

const NBSP = ' ';

/** «24-48 h» → «24–48 h» (raya corta entre cifras) y espacio de no
 *  separación entre una cifra y su unidad, para que «50 €» o «30 °C»
 *  nunca queden partidos en dos líneas. */
export function tipografia(texto: string): string {
  return texto
    .replace(/(\d) ?[-–] ?(\d)/g, '$1–$2')
    .replace(/(\d) (€|%|h\b|cm\b|mm\b|m\b|g\b|kg\b|°C|×)/g, `$1${NBSP}$2`)
    .replace(/× (\d)/g, `×${NBSP}$1`);
}
