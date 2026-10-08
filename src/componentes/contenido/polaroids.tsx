import Image from 'next/image';
import { Aparece } from '@/componentes/aparece';

export interface FotoPolaroid {
  src: string;
  alt: string;
  pie: string;
}

const CLASES = ['p1', 'p2', 'p3'] as const;

/** Tres fotos inclinadas que se enderezan al pasar el ratón. */
export function Polaroids({ fotos, grande = false }: { fotos: readonly FotoPolaroid[]; grande?: boolean }) {
  return (
    <Aparece efecto="rev-der" className={grande ? 'polaroids polaroids-g' : 'polaroids'}>
      {fotos.slice(0, 3).map((foto, i) => (
        <figure key={foto.src} className={`polaroid ${CLASES[i]}`}>
          <div className="foto">
            <Image src={foto.src} alt={foto.alt} fill sizes="(max-width: 880px) 50vw, 300px" />
          </div>
          <figcaption>{foto.pie}</figcaption>
        </figure>
      ))}
    </Aparece>
  );
}
