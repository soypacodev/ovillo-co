import type { ReactNode } from 'react';

/** Caja de una tabla ancha. En móvil se desplaza en horizontal, así que
 *  tiene que poder recibir el foco para moverla con el teclado. */
export function CajaTabla({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="caja caja-tabla" role="region" aria-label={etiqueta} tabIndex={0}>
      {children}
    </div>
  );
}
