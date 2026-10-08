import type { MetadataRoute } from 'next';
import { urlSitio } from '@/lib/datos/entorno';

// Se permite rastrear todo lo público; la cuenta y el panel no lo son.
// Que la tienda no salga en los resultados lo decide la etiqueta noindex
// del layout: con el rastreo permitido el buscador puede leerla, y si se
// bloquease aquí no la vería.
export default function robots(): MetadataRoute.Robots {
  const base = urlSitio();
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/auth/', '/cuenta', '/panel'] },
    sitemap: `${base}/sitemap.xml`,
  };
}
