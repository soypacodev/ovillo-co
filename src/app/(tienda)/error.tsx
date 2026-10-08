'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { HiloSuelto } from '@/componentes/contenido/hilo-suelto';
import { rutas } from '@/lib/rutas';

interface PropsError {
  error: Error & { digest?: string };
  retry: () => void;
}

/** Fallo inesperado en una página. El marco común sigue en pie, así que
 *  se puede reintentar o salir sin recargar. */
export default function ErrorPagina({ error, retry }: PropsError) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="wrap">
      <section className="pagina-error" role="alert">
        <HiloSuelto />
        <p className="eyebrow">Algo ha fallado</p>
        <h1 className="mt-2">Se nos ha enredado la madeja</h1>
        <p className="lead">
          Ha habido un problema al cargar esta página. Suele ser cosa de un momento: prueba otra vez y, si sigue
          fallando, vuelve al inicio.
        </p>
        <div className="acciones-fila">
          <button type="button" className="btn btn-1" onClick={() => retry()}>
            Intentarlo de nuevo
          </button>
          <Link className="btn btn-2" href={rutas.inicio}>
            Volver al inicio
          </Link>
        </div>
        {error.digest && <p className="codigo-error">Código del error: {error.digest}</p>}
      </section>
    </div>
  );
}
