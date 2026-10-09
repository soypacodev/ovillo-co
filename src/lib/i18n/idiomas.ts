// Idiomas de la tienda. El español es el de siempre y va sin prefijo
// (/tienda); el resto cuelga de su código (/en/tienda, /fr/tienda…).
// El panel del taller no se traduce: es la herramienta del dueño.

export const IDIOMAS = ['es', 'en', 'fr', 'de'] as const;
export type Idioma = (typeof IDIOMAS)[number];

export const IDIOMA_POR_DEFECTO: Idioma = 'es';

/** Cookie con el idioma que eligió (o en el que entró) la visita. */
export const COOKIE_IDIOMA = 'idioma';
/** Cabecera interna con la que el proxy dice a las páginas en qué idioma pintar. */
export const CABECERA_IDIOMA = 'x-idioma';

export const esIdioma = (valor: unknown): valor is Idioma =>
  typeof valor === 'string' && (IDIOMAS as readonly string[]).includes(valor);

interface DatosIdioma {
  /** Nombre en su propio idioma, para el selector. */
  nombre: string;
  /** Para Intl: números, importes y fechas. */
  formato: string;
  /** og:locale */
  og: string;
}

export const DATOS_IDIOMA: Record<Idioma, DatosIdioma> = {
  es: { nombre: 'Español', formato: 'es-ES', og: 'es_ES' },
  en: { nombre: 'English', formato: 'en-GB', og: 'en_GB' },
  fr: { nombre: 'Français', formato: 'fr-FR', og: 'fr_FR' },
  de: { nombre: 'Deutsch', formato: 'de-DE', og: 'de_DE' },
};

/**
 * Zonas que no se traducen: el panel, la confirmación de Supabase y la API.
 * Con prefijo de idioma redirigen a su ruta normal.
 */
const SIN_TRADUCIR = ['/panel', '/auth', '/api'];

export const seTraduce = (ruta: string) => !SIN_TRADUCIR.some((z) => ruta === z || ruta.startsWith(`${z}/`));

/** «/en/tienda?x=1» → { idioma: 'en', ruta: '/tienda?x=1' }. Sin prefijo, idioma null. */
export function separarIdioma(ruta: string): {
  idioma: Idioma | null;
  ruta: string;
} {
  const m = /^\/([a-z]{2})(?=\/|\?|#|$)/.exec(ruta);
  if (!m || !esIdioma(m[1])) return { idioma: null, ruta };
  const resto = ruta.slice(3);
  return {
    idioma: m[1],
    ruta: resto === '' || resto.startsWith('?') || resto.startsWith('#') ? `/${resto}` : resto,
  };
}

/** Ruta sin el prefijo de idioma. */
export const sinIdioma = (ruta: string) => separarIdioma(ruta).ruta;

/**
 * Ruta interna en ese idioma: «/tienda» → «/en/tienda». Las rutas externas
 * (mailto:, https://), las anclas sueltas y las zonas sin traducir no cambian.
 */
export function conIdioma(ruta: string, idioma: Idioma): string {
  if (!ruta.startsWith('/') || ruta.startsWith('//')) return ruta;
  const limpia = sinIdioma(ruta);
  if (idioma === IDIOMA_POR_DEFECTO || !seTraduce(limpia)) return limpia;
  if (limpia === '/') return `/${idioma}`;
  if (limpia.startsWith('/?') || limpia.startsWith('/#')) return `/${idioma}${limpia.slice(1)}`;
  return `/${idioma}${limpia}`;
}

/**
 * Idioma preferido según Accept-Language («de-AT,de;q=0.9,en;q=0.8» → de).
 * Sin ninguno de los nuestros, null.
 */
export function idiomaDeCabecera(cabecera: string | null): Idioma | null {
  if (!cabecera) return null;
  const preferencias = cabecera
    .split(',')
    .map((parte, orden) => {
      const [etiqueta, ...params] = parte.trim().split(';');
      const q = params.map((p) => /^\s*q=([\d.]+)\s*$/.exec(p)?.[1]).find(Boolean);
      return {
        codigo: etiqueta.trim().slice(0, 2).toLowerCase(),
        q: q ? Number(q) : 1,
        orden,
      };
    })
    .filter((p) => p.q > 0 && !Number.isNaN(p.q))
    .sort((a, b) => b.q - a.q || a.orden - b.orden);
  return preferencias.map((p) => p.codigo).find(esIdioma) ?? null;
}
