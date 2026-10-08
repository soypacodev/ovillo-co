// Metadatos comunes de las páginas. Next mezcla los metadatos de cada
// nivel de forma superficial: si una página define `openGraph`, sustituye
// el del layout entero. Por eso cada página los pide aquí completos.

import type { Metadata } from 'next';

const NOMBRE_TIENDA = 'Ovillo & Co.';

/** La que genera app/opengraph-image.tsx. */
const IMAGEN_GENERAL = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'Ovillo & Co. · Crochet hecho a mano en Málaga',
};

interface DatosPagina {
  titulo: string;
  descripcion: string;
  /** Ruta canónica, sin dominio (la completa metadataBase). */
  ruta: string;
  tipo?: 'website' | 'article';
  /** Foto propia para compartir; sin ella, la imagen general de la tienda. */
  imagen?: { url: string; alt: string };
}

/** Título, descripción, canónica y Open Graph completos de una página. */
export function metadatosPagina({ titulo, descripcion, ruta, tipo = 'website', imagen }: DatosPagina): Metadata {
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: ruta },
    openGraph: {
      type: tipo,
      locale: 'es_ES',
      siteName: NOMBRE_TIENDA,
      url: ruta,
      title: `${titulo} · ${NOMBRE_TIENDA}`,
      description: descripcion,
      images: [imagen ?? IMAGEN_GENERAL],
    },
  };
}
