'use client';

import { CAMPO_TRAMPA } from '@/lib/acciones/opciones';
import { textos } from '@/lib/i18n';
import { useTextos } from '@/lib/i18n/cliente';

const T = textos(
  { vacio: 'Deja este campo vacío' },
  {
    en: { vacio: 'Leave this field empty' },
    fr: { vacio: 'Laissez ce champ vide' },
    de: { vacio: 'Dieses Feld bitte leer lassen' },
  },
);

/** Campo invisible para personas y lectores de pantalla. Los robots que
 *  rellenan todo lo que encuentran lo completan y el servidor los descarta. */
export function CampoTrampa({ prefijo }: { prefijo: string }) {
  const t = useTextos(T);
  const id = `${prefijo}-${CAMPO_TRAMPA}`;
  return (
    <div className="trampa" aria-hidden="true">
      <label htmlFor={id}>{t.vacio}</label>
      <input type="text" id={id} name={CAMPO_TRAMPA} tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  );
}
