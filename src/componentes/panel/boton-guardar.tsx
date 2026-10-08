'use client';

import { useId, type ReactNode } from 'react';
import { IcoCandado, Ovillo } from '@/componentes/iconos';

interface PropsBoton {
  texto: ReactNode;
  enviando?: boolean;
  /** Motivo por el que no se puede guardar (modo demostración). */
  bloqueado?: string | null;
  className?: string;
  /** Para varios botones en el mismo formulario (cada uno con su valor). */
  name?: string;
  value?: string;
  /** Con varios botones juntos, el motivo se enseña solo una vez. */
  motivoVisible?: boolean;
}

/**
 * Botón de guardar del panel. En modo demostración no desaparece ni se
 * vuelve invisible al teclado: queda con aria-disabled, sigue pudiendo
 * enfocarse y lleva enlazado el motivo, que también se ve debajo. El
 * servidor rechaza igualmente el envío si llegara.
 */
export function BotonGuardar({
  texto,
  enviando = false,
  bloqueado,
  className = 'btn btn-1',
  name,
  value,
  motivoVisible = true,
}: PropsBoton) {
  const id = useId();
  if (bloqueado) {
    return (
      <span className="guardar-bloqueado">
        <button
          type="submit"
          name={name}
          value={value}
          className={`${className} bloqueado`}
          aria-disabled="true"
          aria-describedby={id}
          title={bloqueado}
          onClick={(e) => e.preventDefault()}
        >
          <IcoCandado width={16} height={16} />
          {texto}
        </button>
        <span className={motivoVisible ? 'motivo-bloqueo' : 'oculto-vis'} id={id}>
          {bloqueado}
        </span>
      </span>
    );
  }
  return (
    <button type="submit" name={name} value={value} className={className} disabled={enviando} aria-disabled={enviando}>
      {enviando ? (
        <>
          <span className="ovillo-gira" style={{ display: 'inline-flex' }}>
            <Ovillo width={18} height={18} />
          </span>
          Guardando…
        </>
      ) : (
        texto
      )}
    </button>
  );
}
