import { CAMPO_TRAMPA } from '@/lib/acciones/opciones';

/** Campo invisible para personas y lectores de pantalla. Los robots que
 *  rellenan todo lo que encuentran lo completan y el servidor los descarta. */
export function CampoTrampa({ prefijo }: { prefijo: string }) {
  const id = `${prefijo}-${CAMPO_TRAMPA}`;
  return (
    <div className="trampa" aria-hidden="true">
      <label htmlFor={id}>Deja este campo vacío</label>
      <input type="text" id={id} name={CAMPO_TRAMPA} tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  );
}
