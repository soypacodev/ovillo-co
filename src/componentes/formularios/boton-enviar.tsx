import { Ovillo } from '@/componentes/iconos';

interface PropsBoton {
  enviando: boolean;
  texto: string;
}

/** Botón principal de un formulario con el ovillo girando mientras envía. */
export function BotonEnviar({ enviando, texto }: PropsBoton) {
  return (
    <button className="btn btn-1 btn-g" type="submit" disabled={enviando} aria-disabled={enviando}>
      {enviando ? (
        <>
          <span className="ovillo-gira" style={{ display: 'inline-flex' }}>
            <Ovillo width={20} height={20} />
          </span>
          Enviando…
        </>
      ) : (
        texto
      )}
    </button>
  );
}
