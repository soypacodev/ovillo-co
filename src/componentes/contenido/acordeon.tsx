import type { ReactNode } from 'react';
import { IcoMas } from '@/componentes/iconos';
import type { PreguntaFrecuente } from '@/lib/catalogo/tipos';
import { tipografia } from '@/lib/tipografia';
import { JsonLd } from './json-ld';

export interface ElementoAcordeon {
  titulo: ReactNode;
  contenido: ReactNode;
  abierto?: boolean;
}

/** Bloques plegables con <details>: funcionan sin JavaScript y con teclado. */
export function Acordeon({ elementos, className = 'acordeon' }: { elementos: readonly ElementoAcordeon[]; className?: string }) {
  return (
    <div className={className}>
      {elementos.map((e, i) => (
        <details key={i} open={e.abierto}>
          <summary>
            {e.titulo}
            <IcoMas />
          </summary>
          <div className="det-cuerpo">{e.contenido}</div>
        </details>
      ))}
    </div>
  );
}

/** Preguntas frecuentes: el acordeón y sus datos estructurados FAQPage. */
export function PreguntasFrecuentes({ preguntas: crudas }: { preguntas: readonly PreguntaFrecuente[] }) {
  const preguntas = crudas.map((p) => ({ p: tipografia(p.p), r: tipografia(p.r) }));
  const datos = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: preguntas.map((p) => ({
      '@type': 'Question',
      name: p.p,
      acceptedAnswer: { '@type': 'Answer', text: p.r },
    })),
  };
  return (
    <>
      <JsonLd datos={datos} />
      <Acordeon elementos={preguntas.map((p) => ({ titulo: p.p, contenido: p.r }))} />
    </>
  );
}
