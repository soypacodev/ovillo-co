'use client';

import { useEffect } from 'react';

export default function ErrorPanel({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="panel-vacio" role="alert">
      <h1>No se ha podido cargar</h1>
      <p className="mini mt-2">Suele ser cosa de un momento. Si sigue fallando, revisa la conexión con la base de datos.</p>
      <button type="button" className="btn btn-1 btn-p mt-5" onClick={() => retry()}>
        Intentarlo de nuevo
      </button>
      {error.digest && <p className="mini-2 mt-3">Código: {error.digest}</p>}
    </div>
  );
}
