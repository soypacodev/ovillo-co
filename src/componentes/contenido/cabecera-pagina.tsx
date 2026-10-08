import type { ReactNode } from 'react';

interface PropsCabecera {
  etiqueta: string;
  titulo: ReactNode;
  children?: ReactNode;
  /** Ancho máximo del bloque, en caracteres. */
  ancho?: number;
}

/** Etiqueta, titular y entradilla con la animación de entrada de portada. */
export function CabeceraPagina({ etiqueta, titulo, children, ancho = 58 }: PropsCabecera) {
  return (
    <header className="cab-pagina" style={{ maxWidth: `${ancho}ch` }}>
      <p className="eyebrow ent ent-1">{etiqueta}</p>
      <h1 className="ent ent-2">{titulo}</h1>
      {children && <div className="lead ent ent-3">{children}</div>}
    </header>
  );
}
