// Metadatos comunes de las páginas. Next mezcla los metadatos de cada
// nivel de forma superficial: si una página define `openGraph`, sustituye
// el del layout entero. Por eso cada página los pide aquí completos.

import type { Metadata } from 'next';
import { conIdioma, DATOS_IDIOMA, IDIOMAS, type Idioma } from '@/lib/i18n/idiomas';

const NOMBRE_TIENDA = 'Ovillo & Co.';

/** La que genera app/opengraph-image.tsx. */
export const IMAGEN_GENERAL = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  type: 'image/jpeg',
  alt: 'Ovillo & Co. · Crochet hecho a mano en Málaga',
};

const ALT_GENERAL: Record<Idioma, string> = {
  es: IMAGEN_GENERAL.alt,
  en: 'Ovillo & Co. · Handmade crochet from Málaga',
  fr: 'Ovillo & Co. · Crochet fait main à Málaga',
  de: 'Ovillo & Co. · Handgehäkeltes aus Málaga',
};

interface DatosPagina {
  idioma: Idioma;
  titulo: string;
  descripcion: string;
  /** Ruta canónica sin dominio ni idioma (la completa metadataBase). */
  ruta: string;
  tipo?: 'website' | 'article';
  /** Imagen para compartir: sin ella, la general; con «ruta», la que
   *  genera el opengraph-image.tsx de la propia ruta, que Next añade solo. */
  imagen?: { url: string; alt: string } | 'ruta';
  /** En las fichas: precio en céntimos, para og:type «product». */
  precio?: number;
}

/**
 * Canónica en el idioma de la página y sus versiones en los demás
 * (hreflang). x-default es la española, la que se sirve sin prefijo.
 */
export function alternativas(ruta: string, idioma: Idioma): NonNullable<Metadata['alternates']> {
  return {
    canonical: conIdioma(ruta, idioma),
    languages: {
      ...Object.fromEntries(IDIOMAS.map((i) => [i, conIdioma(ruta, i)])),
      'x-default': conIdioma(ruta, 'es'),
    },
  };
}

/** Título, descripción, canónica, hreflang y Open Graph completos de una página. */
export function metadatosPagina({
  idioma,
  titulo,
  descripcion,
  ruta,
  tipo = 'website',
  imagen,
  precio,
}: DatosPagina): Metadata {
  const alternates = alternativas(ruta, idioma);
  const openGraph = {
    locale: DATOS_IDIOMA[idioma].og,
    alternateLocale: IDIOMAS.filter((i) => i !== idioma).map((i) => DATOS_IDIOMA[i].og),
    siteName: NOMBRE_TIENDA,
    url: alternates.canonical as string,
    title: `${titulo} · ${NOMBRE_TIENDA}`,
    description: descripcion,
    ...(imagen !== 'ruta' && {
      images: [imagen ? { ...IMAGEN_GENERAL, ...imagen } : { ...IMAGEN_GENERAL, alt: ALT_GENERAL[idioma] }],
    }),
  };
  if (precio === undefined) {
    return { title: titulo, description: descripcion, alternates, openGraph: { ...openGraph, type: tipo } };
  }
  // Next no contempla og:type «product» en `openGraph`: sin `type` ahí, las
  // etiquetas de producto salen por `other` y no hay dos og:type distintos.
  return {
    title: titulo,
    description: descripcion,
    alternates,
    openGraph,
    other: {
      'og:type': 'product',
      'product:price:amount': (precio / 100).toFixed(2),
      'product:price:currency': 'EUR',
    },
  };
}
