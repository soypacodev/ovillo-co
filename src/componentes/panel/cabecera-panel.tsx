import type { ReactNode } from 'react';

interface PropsCabecera {
  titulo: ReactNode;
  descripcion?: ReactNode;
  /** Botones a la derecha del título. */
  acciones?: ReactNode;
  /** Enlace de vuelta (detalles). */
  volver?: ReactNode;
}

export function CabeceraPanel({ titulo, descripcion, acciones, volver }: PropsCabecera) {
  return (
    <header className="panel-cab">
      {volver}
      <div className="panel-cab-fila">
        <div>
          <h1>{titulo}</h1>
          {descripcion && <p className="panel-cab-desc">{descripcion}</p>}
        </div>
        {acciones && <div className="panel-cab-acciones">{acciones}</div>}
      </div>
    </header>
  );
}
