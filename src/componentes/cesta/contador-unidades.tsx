'use client';

import { IcoMasMini, IcoMenos } from '@/componentes/iconos';

export interface PropsContador {
  valor: number;
  /** Tope superior (stock o límite por línea). */
  max: number;
  /** Por debajo de este valor el botón de restar se desactiva. Con 0, el
   *  botón sigue activo en 1 y sirve para quitar la línea. */
  min?: number;
  alCambiar: (nuevo: number) => void;
  /** Nombre de la pieza, para que los botones digan de qué son. */
  nombre: string;
  grande?: boolean;
  className?: string;
}

export function ContadorUnidades({ valor, max, min = 1, alCambiar, nombre, grande, className }: PropsContador) {
  const clases = ['contador', grande && 'contador-g', className].filter(Boolean).join(' ');
  const quitaLinea = min === 0 && valor === 1;
  return (
    <div className={clases} role="group" aria-label={`Unidades de ${nombre}`}>
      <button
        type="button"
        onClick={() => alCambiar(valor - 1)}
        disabled={valor <= min}
        aria-label={quitaLinea ? `Quitar ${nombre} de la cesta` : `Una unidad menos de ${nombre}`}
      >
        <IcoMenos />
      </button>
      <output aria-live="polite" aria-atomic="true">
        {valor}
        <span className="oculto-vis"> {valor === 1 ? 'unidad' : 'unidades'}</span>
      </output>
      <button
        type="button"
        onClick={() => alCambiar(valor + 1)}
        disabled={valor >= max}
        aria-label={valor >= max ? `No quedan más unidades de ${nombre}` : `Una unidad más de ${nombre}`}
      >
        <IcoMasMini />
      </button>
    </div>
  );
}
