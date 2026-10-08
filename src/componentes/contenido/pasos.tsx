import type { ReactNode } from 'react';

/** Lista numerada con los círculos de la marca. */
export function Pasos({ pasos, className }: { pasos: ReactNode[]; className?: string }) {
  return (
    <ol className={className ? `pasos ${className}` : 'pasos'}>
      {pasos.map((paso, i) => (
        <li key={i}>
          <span className="num" aria-hidden="true">
            {i + 1}
          </span>
          <span>{paso}</span>
        </li>
      ))}
    </ol>
  );
}
