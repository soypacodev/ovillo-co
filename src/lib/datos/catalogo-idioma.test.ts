// catalogo(idioma): los textos salen traducidos y la búsqueda encuentra
// palabras del idioma de la página; lo que identifica a cada pieza no cambia.

import { describe, expect, it } from 'vitest';
import { catalogo } from '.';

describe('catálogo en otro idioma', () => {
  it('traduce sin cambiar slugs, precios ni variantes', async () => {
    const [es, en] = await Promise.all([catalogo('es').productos(), catalogo('en').productos()]);
    expect(en.map((p) => p.slug)).toEqual(es.map((p) => p.slug));
    expect(en.map((p) => p.precio)).toEqual(es.map((p) => p.precio));
    expect(en.flatMap((p) => p.variantes.map((v) => v.nombre))).toEqual(es.flatMap((p) => p.variantes.map((v) => v.nombre)));
    expect(en.some((p, i) => p.nombre !== es[i].nombre)).toBe(true);
    expect(en.every((p) => !('traducciones' in p))).toBe(true);
  });

  it('busca en el idioma de la página', async () => {
    const mantas = await catalogo('en').productos({ busqueda: 'blanket' });
    expect(mantas.length).toBeGreaterThan(0);
    expect(await catalogo('es').productos({ busqueda: 'blanket' })).toEqual([]);
  });

  it('traduce envíos y categorías', async () => {
    const envios = await catalogo('de').metodosEnvio();
    expect(envios.map((e) => e.id)).toEqual(['ordinario', 'express', 'recogida']);
    expect(envios[0].nombre).not.toBe('Envío ordinario');
    expect((await catalogo('fr').categoria('bebe'))?.slug).toBe('bebe');
  });
});
