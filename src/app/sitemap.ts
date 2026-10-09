import type { MetadataRoute } from 'next';
import { INDEXAR_TIENDA } from '@/lib/buscadores/indexacion';
import { catalogo } from '@/lib/datos';
import { urlSitio } from '@/lib/datos/entorno';
import { conIdioma, IDIOMAS, type Idioma } from '@/lib/i18n';
import { rutas } from '@/lib/rutas';

const PAGINAS: { ruta: string; prioridad: number }[] = [
  { ruta: rutas.inicio, prioridad: 1 },
  { ruta: rutas.tienda, prioridad: 0.9 },
  { ruta: rutas.encargos, prioridad: 0.7 },
  { ruta: rutas.taller, prioridad: 0.6 },
  { ruta: rutas.cuidados, prioridad: 0.5 },
  { ruta: rutas.envios, prioridad: 0.5 },
  { ruta: rutas.contacto, prioridad: 0.4 },
  { ruta: rutas.legal, prioridad: 0.2 },
];

type Entrada = MetadataRoute.Sitemap[number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = urlSitio();
  const url = (ruta: string, idioma: Idioma) => `${base}${conIdioma(ruta, idioma)}`;

  /** Una entrada por idioma, cada una con las demás versiones (hreflang). */
  const entradas = (ruta: string, datos: Omit<Entrada, 'url' | 'alternates'>): Entrada[] => {
    const languages = {
      ...Object.fromEntries(IDIOMAS.map((i) => [i, url(ruta, i)])),
      'x-default': url(ruta, 'es'),
    };
    return IDIOMAS.map((idioma) => ({ url: url(ruta, idioma), ...datos, alternates: { languages } }));
  };

  // En la demo solo se indexa la portada: listar páginas con noindex
  // haría que Search Console las marcase como errores.
  if (!INDEXAR_TIENDA) return entradas(rutas.inicio, { priority: 1 });

  const fuente = catalogo();
  const [categorias, productos] = await Promise.all([fuente.categorias(), fuente.productos()]);

  return [
    ...PAGINAS.flatMap((p) => entradas(p.ruta, { priority: p.prioridad })),
    ...categorias.flatMap((c) => entradas(rutas.categoria(c.slug), { priority: 0.8 })),
    ...productos.flatMap((p) =>
      entradas(rutas.producto(p.slug), { priority: 0.7, images: p.fotos.map((f) => `${base}${f.src}`) }),
    ),
  ];
}
