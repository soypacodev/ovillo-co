'use client';

import { useId, useRef } from 'react';
import { piezas } from '@/lib/formato';
import { textos } from '@/lib/i18n';
import { useTextos } from '@/lib/i18n/cliente';

const T = textos(
  {
    vaciar: 'Vaciar la cesta',
    pregunta: '¿Vaciamos la cesta?',
    aviso: (n: number) => `Se quitarán ${piezas(n)}. Si cambias de idea, tendrás que volver a añadirlas.`,
    no: 'No, la mantengo',
    si: 'Sí, vaciarla',
  },
  {
    en: {
      vaciar: 'Empty the basket',
      pregunta: 'Empty your basket?',
      aviso: (n: number) =>
        `This will remove ${piezas(n, 'en')}. If you change your mind, you’ll have to add ${n === 1 ? 'it' : 'them'} again.`,
      no: 'No, keep it',
      si: 'Yes, empty it',
    },
    fr: {
      vaciar: 'Vider le panier',
      pregunta: 'On vide le panier\u202f?',
      aviso: (n: number) =>
        n === 1
          ? `${piezas(n, 'fr')} sera retirée. Si vous changez d’avis, il faudra l’ajouter à nouveau.`
          : `${piezas(n, 'fr')} seront retirées. Si vous changez d’avis, il faudra les ajouter à nouveau.`,
      no: 'Non, je le garde',
      si: 'Oui, le vider',
    },
    de: {
      vaciar: 'Warenkorb leeren',
      pregunta: 'Warenkorb leeren?',
      aviso: (n: number) =>
        n === 1
          ? `${piezas(n, 'de')} wird entfernt. Wenn Sie es sich anders überlegen, müssen Sie es erneut hinzufügen.`
          : `${piezas(n, 'de')} werden entfernt. Wenn Sie es sich anders überlegen, müssen Sie sie erneut hinzufügen.`,
      no: 'Nein, behalten',
      si: 'Ja, leeren',
    },
  },
);

/**
 * «Vaciar la cesta» con confirmación. Usa <dialog> nativo en modo modal:
 * el navegador encierra el foco, cierra con Escape y lo anuncia como
 * diálogo, sin depender de window.confirm.
 */
export function DialogoVaciar({ unidades, alConfirmar }: { unidades: number; alConfirmar: () => void }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const id = useId();
  const t = useTextos(T);

  return (
    <>
      <button type="button" className="btn btn-4 btn-p" aria-haspopup="dialog" onClick={() => dialogo.current?.showModal()}>
        {t.vaciar}
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
          <h2 id={`${id}-t`}>{t.pregunta}</h2>
          <p id={`${id}-d`}>{t.aviso(unidades)}</p>
          <form method="dialog" className="dialogo-botones">
            <button type="submit" value="no" className="btn btn-2 btn-p" autoFocus>
              {t.no}
            </button>
            <button type="submit" value="si" className="btn btn-1 btn-p">
              {t.si}
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}
