'use client';

import { startTransition, useActionState, type FormEvent } from 'react';
import { cambiarVisibilidad } from '@/lib/panel/acciones';
import type { EstadoProducto } from '@/lib/panel/estados';
import { PANEL_INICIAL } from '@/lib/panel/tipos-accion';
import { AvisoPanel } from './aviso-panel';
import { BotonGuardar } from './boton-guardar';

/** Publicar u ocultar un producto de un clic, desde la lista o la ficha. */
export function BotonVisibilidad({
  id,
  nombre,
  estado,
  bloqueado,
  motivoVisible = true,
}: {
  id: string;
  nombre: string;
  estado: EstadoProducto;
  bloqueado: string | null;
  motivoVisible?: boolean;
}) {
  const [resultado, enviar, enviando] = useActionState(cambiarVisibilidad, PANEL_INICIAL);
  const publicar = estado !== 'publicado';

  function alEnviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (bloqueado) return;
    const datos = new FormData(e.currentTarget);
    startTransition(() => enviar(datos));
  }

  return (
    <form action={enviar} onSubmit={alEnviar} className="form-visibilidad">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="estado" value={publicar ? 'publicado' : 'borrador'} />
      <BotonGuardar
        texto={
          <>
            {publicar ? 'Publicar' : 'Ocultar'}
            <span className="oculto-vis"> {nombre}</span>
          </>
        }
        enviando={enviando}
        bloqueado={bloqueado}
        motivoVisible={motivoVisible}
        className="btn btn-3 btn-p"
      />
      {resultado.estado === 'error' && <AvisoPanel resultado={resultado} />}
    </form>
  );
}
