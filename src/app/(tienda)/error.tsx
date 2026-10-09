'use client';

import { useEffect } from 'react';
import { HiloSuelto } from '@/componentes/contenido/hilo-suelto';
import { textos } from '@/lib/i18n';
import { useTextos } from '@/lib/i18n/cliente';
import { Enlace } from '@/lib/i18n/enlace';
import { rutas } from '@/lib/rutas';

const T = textos(
  {
    etiqueta: 'Algo ha fallado',
    titulo: 'Se nos ha enredado la madeja',
    texto:
      'Ha habido un problema al cargar esta página. Suele ser cosa de un momento: prueba otra vez y, si sigue fallando, vuelve al inicio.',
    reintentar: 'Intentarlo de nuevo',
    inicio: 'Volver al inicio',
    codigo: (digest: string) => `Código del error: ${digest}`,
  },
  {
    en: {
      etiqueta: 'Something went wrong',
      titulo: 'Our yarn has got in a tangle',
      texto:
        'There was a problem loading this page. It’s usually only momentary: try again and, if it keeps failing, head back to the home page.',
      reintentar: 'Try again',
      inicio: 'Back to the home page',
      codigo: (digest: string) => `Error code: ${digest}`,
    },
    fr: {
      etiqueta: 'Un problème est survenu',
      titulo: 'Notre pelote s’est emmêlée',
      texto:
        'Un problème est survenu lors du chargement de cette page. C’est généralement passager\u00a0: réessayez et, si le problème persiste, revenez à l’accueil.',
      reintentar: 'Réessayer',
      inicio: 'Retour à l’accueil',
      codigo: (digest: string) => `Code d’erreur\u00a0: ${digest}`,
    },
    de: {
      etiqueta: 'Etwas ist schiefgelaufen',
      titulo: 'Da hat sich unser Garn verheddert',
      texto:
        'Beim Laden dieser Seite ist ein Problem aufgetreten. Meist ist das nur von kurzer Dauer: Versuchen Sie es noch einmal und kehren Sie zur Startseite zurück, falls es weiterhin nicht klappt.',
      reintentar: 'Erneut versuchen',
      inicio: 'Zur Startseite',
      codigo: (digest: string) => `Fehlercode: ${digest}`,
    },
  },
);

interface PropsError {
  error: Error & { digest?: string };
  retry: () => void;
}

/** Fallo inesperado en una página. El marco común sigue en pie, así que
 *  se puede reintentar o salir sin recargar. */
export default function ErrorPagina({ error, retry }: PropsError) {
  const t = useTextos(T);
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="wrap">
      <section className="pagina-error" role="alert">
        <HiloSuelto />
        <p className="eyebrow">{t.etiqueta}</p>
        <h1 className="mt-2">{t.titulo}</h1>
        <p className="lead">{t.texto}</p>
        <div className="acciones-fila">
          <button type="button" className="btn btn-1" onClick={() => retry()}>
            {t.reintentar}
          </button>
          <Enlace className="btn btn-2" href={rutas.inicio}>
            {t.inicio}
          </Enlace>
        </div>
        {error.digest && <p className="codigo-error">{t.codigo(error.digest)}</p>}
      </section>
    </div>
  );
}
