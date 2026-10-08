import Link from 'next/link';
import { urlSitio } from '@/lib/datos/entorno';
import { rutas } from '@/lib/rutas';
import { JsonLd } from './json-ld';

interface PasoMigas {
  texto: string;
  href: string;
}

interface PropsMigas {
  /** Página actual, sin enlace. */
  actual: string;
  /** Niveles intermedios entre Inicio y la página actual. */
  camino?: readonly PasoMigas[];
}

/** Migas de pan (Inicio / … / página actual), también como datos
 *  estructurados para que el buscador muestre la ruta en el resultado. */
export function Migas({ actual, camino = [] }: PropsMigas) {
  const enlaces = [{ texto: 'Inicio', href: rutas.inicio }, ...camino];
  const base = urlSitio();
  const datos = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [...enlaces, { texto: actual, href: null }].map((paso, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: paso.texto,
      ...(paso.href !== null && { item: `${base}${paso.href}` }),
    })),
  };

  return (
    <nav className="miga" aria-label="Migas de pan">
      <JsonLd datos={datos} />
      <ol>
        {enlaces.map((paso) => (
          <li key={paso.href}>
            <Link href={paso.href}>{paso.texto}</Link>
          </li>
        ))}
        <li aria-current="page">{actual}</li>
      </ol>
    </nav>
  );
}
