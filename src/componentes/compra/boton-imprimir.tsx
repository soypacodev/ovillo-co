'use client';

export function BotonImprimir() {
  return (
    <button type="button" className="btn btn-3" onClick={() => window.print()}>
      Guardar como PDF
    </button>
  );
}
