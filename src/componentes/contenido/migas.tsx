import { urlSitio } from '@/lib/datos/entorno';
import { conIdioma, textos } from '@/lib/i18n';
import { Enlace } from '@/lib/i18n/enlace';
import { idiomaActual } from '@/lib/i18n/servidor';
import { rutas } from '@/lib/rutas';
import { JsonLd } from './json-ld';

const T = textos(
  { inicio: 'Inicio', migas: 'Migas de pan' },
  {
    en: { inicio: 'Home', migas: 'Breadcrumb' },
    fr: { inicio: 'Accueil', migas: 'Fil d’Ariane' },
    de: { inicio: 'Startseite', migas: 'Brotkrümelnavigation' },
  },
);

interface PasoMigas {
  texto: string;
  href: string;
}

interface PropsMigas {
  /** Página actual, sin enlace. */
  actual: string;
  /** Niveles intermedios entre Inicio y la página actual, con rutas sin idioma. */
  camino?: readonly PasoMigas[];
}

/** Migas de pan (Inicio / … / página actual), también como datos
 *  estructurados para que el buscador muestre la ruta en el resultado. */
export async function Migas({ actual, camino = [] }: PropsMigas) {
  const idioma = await idiomaActual();
  const t = T[idioma];
  const enlaces = [{ texto: t.inicio, href: rutas.inicio }, ...camino];
  const base = urlSitio();
  const datos = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [...enlaces, { texto: actual, href: null }].map((paso, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: paso.texto,
      ...(paso.href !== null && { item: `${base}${conIdioma(paso.href, idioma)}` }),
    })),
  };

  return (
    <nav className="miga" aria-label={t.migas}>
      <JsonLd datos={datos} />
      <ol>
        {enlaces.map((paso) => (
          <li key={paso.href}>
            <Enlace href={paso.href}>{paso.texto}</Enlace>
          </li>
        ))}
        <li aria-current="page">{actual}</li>
      </ol>
    </nav>
  );
}
