import { describe, expect, it } from 'vitest';
import type { Idioma } from '@/lib/i18n';
import { datosTienda } from './datos-estructurados';

const BASE = 'https://ovillo.example';

type Nodo = Record<string, unknown>;

function grafo(idioma?: Idioma): Nodo[] {
  // Se pasa por JSON igual que al pintarlo en la página.
  const datos = JSON.parse(JSON.stringify(datosTienda(BASE, 'Crochet hecho a mano.', idioma))) as {
    '@context': string;
    '@graph': Nodo[];
  };
  expect(datos['@context']).toBe('https://schema.org');
  return datos['@graph'];
}

const nodo = (tipo: string, idioma?: Idioma) => grafo(idioma).find((n) => n['@type'] === tipo) as Nodo;

describe('datos estructurados de la tienda', () => {
  it('cada nodo tiene tipo e identificador únicos y las referencias apuntan a nodos que existen', () => {
    const nodos = grafo();
    const ids = nodos.map((n) => n['@id']);
    expect(new Set(ids).size).toBe(nodos.length);
    const web = nodo('WebSite');
    for (const ref of [web.publisher, web.creator] as { '@id': string }[]) {
      expect(ids).toContain(ref['@id']);
    }
  });

  it('describe un comercio local de Málaga sin calle ni teléfono', () => {
    const tienda = nodo('Store');
    expect(tienda).toMatchObject({ name: 'Ovillo & Co.', url: BASE, priceRange: '€€' });
    expect(tienda.address).toEqual({
      '@type': 'PostalAddress',
      addressLocality: 'Málaga',
      addressRegion: 'Andalucía',
      addressCountry: 'ES',
    });
    expect(tienda).not.toHaveProperty('telephone');
    expect(String(tienda.email)).toMatch(/\.example$/);
    expect(tienda.areaServed).toContainEqual({ '@type': 'City', name: 'Málaga' });
  });

  it('el horario de recogida usa días de schema.org y horas HH:MM', () => {
    const [horario] = nodo('Store').openingHoursSpecification as Nodo[];
    expect(horario['@type']).toBe('OpeningHoursSpecification');
    for (const dia of horario.dayOfWeek as string[]) {
      expect(dia).toMatch(/^https:\/\/schema\.org\/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/);
    }
    expect(horario.opens).toMatch(/^\d{2}:\d{2}$/);
    expect(horario.closes).toMatch(/^\d{2}:\d{2}$/);
    expect(String(horario.opens) < String(horario.closes)).toBe(true);
  });

  it('las URL son absolutas y el buscador lleva su marcador', () => {
    const tienda = nodo('Store');
    for (const url of [tienda.url, tienda.logo, tienda.image]) expect(String(url)).toMatch(/^https:\/\//);
    const accion = nodo('WebSite').potentialAction as Nodo;
    expect(accion.target).toBe(`${BASE}/tienda?q={busqueda}`);
    expect(accion['query-input']).toBe('required name=busqueda');
  });

  it('en español, el sitio va en es-ES y sin prefijo', () => {
    const web = nodo('WebSite');
    expect(web).toMatchObject({ url: BASE, inLanguage: 'es-ES' });
    expect(nodo('Store').areaServed).toContainEqual({ '@type': 'Country', name: 'España' });
  });

  it('en otro idioma cambian los textos y las URL, pero no los identificadores', () => {
    const web = nodo('WebSite', 'en');
    expect(web).toMatchObject({ url: `${BASE}/en`, inLanguage: 'en-GB' });
    expect((web.potentialAction as Nodo).target).toBe(`${BASE}/en/tienda?q={busqueda}`);
    expect(grafo('en').map((n) => n['@id'])).toEqual(grafo().map((n) => n['@id']));
    const tienda = nodo('Store', 'de');
    expect(tienda.url).toBe(BASE);
    expect(tienda.paymentAccepted).toBe('Kredit- oder Debitkarte');
    expect(tienda.areaServed).toContainEqual({ '@type': 'Country', name: 'Spanien' });
  });
});
