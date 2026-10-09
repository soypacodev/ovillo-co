'use client';

import { Ovillo } from '@/componentes/iconos';
import { textos } from '@/lib/i18n';
import { useTextos } from '@/lib/i18n/cliente';

const T = textos(
  { enviando: 'Enviando…' },
  { en: { enviando: 'Sending…' }, fr: { enviando: 'Envoi en cours…' }, de: { enviando: 'Wird gesendet …' } },
);

interface PropsBoton {
  enviando: boolean;
  texto: string;
}

/** Botón principal de un formulario con el ovillo girando mientras envía. */
export function BotonEnviar({ enviando, texto }: PropsBoton) {
  const t = useTextos(T);
  return (
    <button className="btn btn-1 btn-g" type="submit" disabled={enviando} aria-disabled={enviando}>
      {enviando ? (
        <>
          <span className="ovillo-gira" style={{ display: 'inline-flex' }}>
            <Ovillo width={20} height={20} />
          </span>
          {t.enviando}
        </>
      ) : (
        texto
      )}
    </button>
  );
}
