// Metadatos comunes de las páginas. Next mezcla los metadatos de cada
// nivel de forma superficial: si una página define `openGraph`, sustituye
// el del layout entero. Por eso cada página los pide aquí completos.

import type { Metadata } from 'next';

const NOMBRE_TIENDA = 'Ovillo & Co.';

/** La que genera app/opengraph-image.tsx. */
export const IMAGEN_GENERAL = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  type: 'image/jpeg',
  alt: 'Ovillo & Co. · Crochet hecho a mano en Málaga',
};

interface DatosPagina {
  titulo: string;
  descripcion: string;
  /** Ruta canónica, sin dominio (la completa metadataBase). */
  ruta: string;
  tipo?: 'website' | 'article';
  /** Imagen para compartir: sin ella, la general; con «ruta», la que
   *  genera el opengraph-image.tsx de la propia ruta, que Next añade solo. */
  imagen?: { url: string; alt: string } | 'ruta';
  /** En las fichas: precio en céntimos, para og:type «product». */
  precio?: number;
}

/** Título, descripción, canónica y Open Graph completos de una página. */
export function metadatosPagina({ titulo, descripcion, ruta, tipo = 'website', imagen, precio }: DatosPagina): Metadata {
  const openGraph = {
    locale: 'es_ES',
    siteName: NOMBRE_TIENDA,
    url: ruta,
    title: `${titulo} · ${NOMBRE_TIENDA}`,
    description: descripcion,
    ...(imagen !== 'ruta' && { images: [imagen ? { ...IMAGEN_GENERAL, ...imagen } : IMAGEN_GENERAL] }),
  };
  if (precio === undefined) {
    return { title: titulo, description: descripcion, alternates: { canonical: ruta }, openGraph: { ...openGraph, type: tipo } };
  }
  // Next no contempla og:type «product» en `openGraph`: sin `type` ahí, las
  // etiquetas de producto salen por `other` y no hay dos og:type distintos.
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: ruta },
    openGraph,
    other: {
      'og:type': 'product',
      'product:price:amount': (precio / 100).toFixed(2),
      'product:price:currency': 'EUR',
    },
  };
}
