import type { ReactNode } from 'react';

interface PropsListaSiNo {
  titulo: string;
  tipo: 'si' | 'no';
  elementos: ReactNode[];
  nivel?: 'h3' | 'h4';
}

/** Caja verde de «sí» o neutra de «no», con su marca delante de cada línea. */
export function ListaSiNo({ titulo, tipo, elementos, nivel = 'h3' }: PropsListaSiNo) {
  const Titular = nivel;
  return (
    <div className={tipo === 'si' ? 'caja caja-si' : 'caja caja-no'}>
      <Titular className="lista-titulo">{titulo}</Titular>
      <ul className="lista-marcas">
        {elementos.map((e, i) => (
          <li key={i}>
            <span className="marca" aria-hidden="true">
              {tipo === 'si' ? '✓' : '✕'}
            </span>
            <span>{e}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
