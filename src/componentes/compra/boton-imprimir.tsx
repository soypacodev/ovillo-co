'use client';

import { textos } from '@/lib/i18n';
import { useTextos } from '@/lib/i18n/cliente';

const T = textos(
  { guardar: 'Guardar como PDF' },
  { en: { guardar: 'Save as PDF' }, fr: { guardar: 'Enregistrer en PDF' }, de: { guardar: 'Als PDF speichern' } },
);

export function BotonImprimir() {
  const t = useTextos(T);
  return (
    <button type="button" className="btn btn-3" onClick={() => window.print()}>
      {t.guardar}
    </button>
  );
}
