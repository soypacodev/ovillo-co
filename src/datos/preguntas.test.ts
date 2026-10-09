// Las traducciones de las preguntas y de las cifras del taller cuadran con el español.

import { describe, expect, it } from 'vitest';
import { IDIOMAS } from '@/lib/i18n';
import { preguntasFrecuentes } from './preguntas';
import { PREGUNTAS } from './semilla';
import { CIFRAS_TALLER, cifrasTaller } from './taller';

describe('textos traducidos de los datos', () => {
  it('cada idioma tiene las mismas preguntas frecuentes, y el español es el de la semilla', () => {
    expect(preguntasFrecuentes('es')).toEqual(PREGUNTAS);
    for (const idioma of IDIOMAS) {
      const preguntas = preguntasFrecuentes(idioma);
      expect(preguntas, idioma).toHaveLength(PREGUNTAS.length);
      for (const p of preguntas) expect(p.p && p.r, idioma).toBeTruthy();
    }
  });

  it('las cifras del taller tienen los mismos valores en todos los idiomas', () => {
    expect(cifrasTaller('es')).toEqual(CIFRAS_TALLER.map((c) => ({ ...c })));
    for (const idioma of IDIOMAS) {
      expect(cifrasTaller(idioma).map((c) => c.valor)).toEqual(CIFRAS_TALLER.map((c) => c.valor));
    }
  });
});
