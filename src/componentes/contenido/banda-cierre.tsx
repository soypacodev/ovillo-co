import type { ReactNode } from 'react';
import { Aparece } from '@/componentes/aparece';

interface PropsBanda {
  titulo: string;
  children: ReactNode;
  acciones: ReactNode;
  /** Nivel del titular, según la jerarquía de la página. */
  nivel?: 'h2' | 'h3';
}

/** Banda pastel de llamada a la acción al final de una página. */
export function BandaCierre({ titulo, children, acciones, nivel = 'h2' }: PropsBanda) {
  const Titular = nivel;
  return (
    <Aparece efecto="rev-zoom" className="banda dos-cta">
      <div>
        <Titular className="banda-titulo">{titulo}</Titular>
        <p className="banda-texto">{children}</p>
      </div>
      <div className="acciones-fila">{acciones}</div>
    </Aparece>
  );
}
