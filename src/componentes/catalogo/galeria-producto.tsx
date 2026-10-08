'use client';

// Galería de la ficha. Todas las fotos están apiladas dentro del arco y
// solo cambia cuál se ve: el cambio es un fundido y no hay salto mientras
// se descarga la siguiente.

import Image from 'next/image';
import { useState } from 'react';
import type { Foto } from '@/lib/catalogo/tipos';

const TAMANOS_FOTO_FICHA = '(max-width: 940px) min(92vw, 560px), (max-width: 1600px) 600px, 680px';

export interface PropsGaleria {
  fotos: Foto[];
  nombre: string;
  encargo: boolean;
  descuento: number;
}

export function GaleriaProducto({ fotos, nombre, encargo, descuento }: PropsGaleria) {
  const [actual, setActual] = useState(0);

  return (
    <div className="galeria">
      <div className="principal ent-arco">
        {fotos.map((foto, i) => (
          <Image
            key={foto.src}
            src={foto.src}
            alt={foto.alt}
            fill
            sizes={TAMANOS_FOTO_FICHA}
            loading={i === 0 ? 'eager' : 'lazy'}
            fetchPriority={i === 0 ? 'high' : undefined}
            className={i === actual ? 'foto-ficha visible' : 'foto-ficha'}
            aria-hidden={i === actual ? undefined : true}
          />
        ))}
        {encargo && <span className="pastilla pastilla-en insignia">Se teje al pedir</span>}
        {descuento > 0 && (
          <span className="pastilla pastilla-of insignia-dto">
            −{descuento} %<span className="oculto-vis"> de descuento</span>
          </span>
        )}
      </div>

      {fotos.length > 1 && (
        <div className="tiras" role="group" aria-label={`Fotos de ${nombre}`}>
          {fotos.map((foto, i) => (
            <button
              key={foto.src}
              type="button"
              className="tira"
              aria-pressed={i === actual}
              aria-label={`Ver la foto ${i + 1} de ${fotos.length}`}
              onClick={() => setActual(i)}
            >
              <Image src={foto.src} alt="" fill sizes="(max-width: 940px) 22vw, 140px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
