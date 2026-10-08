'use client';

import { useId, useRef } from 'react';
import { piezas } from '@/lib/formato';

/**
 * «Vaciar la cesta» con confirmación. Usa <dialog> nativo en modo modal:
 * el navegador encierra el foco, cierra con Escape y lo anuncia como
 * diálogo, sin depender de window.confirm.
 */
export function DialogoVaciar({ unidades, alConfirmar }: { unidades: number; alConfirmar: () => void }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const id = useId();

  return (
    <>
      <button type="button" className="btn btn-4 btn-p" aria-haspopup="dialog" onClick={() => dialogo.current?.showModal()}>
        Vaciar la cesta
      </button>
      <dialog
        ref={dialogo}
        className="dialogo"
        aria-labelledby={`${id}-t`}
        aria-describedby={`${id}-d`}
        onClose={(e) => {
          if (e.currentTarget.returnValue === 'si') alConfirmar();
          e.currentTarget.returnValue = '';
        }}
        // Un clic en el velo, fuera de la caja, también cierra.
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close('no');
        }}
      >
        <div className="dialogo-caja">
          <h2 id={`${id}-t`}>¿Vaciamos la cesta?</h2>
          <p id={`${id}-d`}>Se quitarán {piezas(unidades)}. Si cambias de idea, tendrás que volver a añadirlas.</p>
          <form method="dialog" className="dialogo-botones">
            <button type="submit" value="no" className="btn btn-2 btn-p" autoFocus>
              No, la mantengo
            </button>
            <button type="submit" value="si" className="btn btn-1 btn-p">
              Sí, vaciarla
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}
