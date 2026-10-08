import type { MetadataRoute } from 'next';
import { urlSitio } from '@/lib/datos/entorno';

// Se permite rastrear todo lo público; la cuenta y el panel no lo son.
// Qué sale en los resultados lo deciden las etiquetas noindex (ver
// src/lib/buscadores/indexacion.ts): si una página se bloquease aquí, el
// buscador no llegaría a leer su noindex.
export default function robots(): MetadataRoute.Robots {
  const base = urlSitio();
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/auth/', '/cuenta', '/panel'] },
    sitemap: `${base}/sitemap.xml`,
  };
}
