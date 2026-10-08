'use client';

import { startTransition, useActionState, type FormEvent } from 'react';
import { cambiarEstadoEncargo } from '@/lib/panel/acciones';
import { ESTADOS_ENCARGO, NOMBRE_ESTADO_ENCARGO, type EstadoEncargo } from '@/lib/panel/estados';
import { PANEL_INICIAL } from '@/lib/panel/tipos-accion';
import { AvisoPanel } from './aviso-panel';
import { BotonGuardar } from './boton-guardar';

interface PropsFormulario {
  id: string;
  estado: EstadoEncargo;
  nota: string | null;
  bloqueado: string | null;
}

export function FormularioEstadoEncargo({ id, estado, nota, bloqueado }: PropsFormulario) {
  const [resultado, enviar, enviando] = useActionState(cambiarEstadoEncargo, PANEL_INICIAL);

  function alEnviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (bloqueado) return;
    const datos = new FormData(e.currentTarget);
    startTransition(() => enviar(datos));
  }

  return (
    <form action={enviar} onSubmit={alEnviar} className="panel-form" noValidate>
      <AvisoPanel resultado={resultado} />
      <input type="hidden" name="id" value={id} />
      <fieldset className="opciones-estado">
        <legend>Estado</legend>
        {ESTADOS_ENCARGO.map((e) => (
          <label key={e} className="opcion opcion-p">
            <input type="radio" name="estado" value={e} defaultChecked={e === estado} />
            <span>{NOMBRE_ESTADO_ENCARGO[e]}</span>
          </label>
        ))}
      </fieldset>
      <div className="campo">
        <label htmlFor="encargo-nota">
          Nota interna <span className="aclaracion">(presupuesto, plazos, lo hablado)</span>
        </label>
        <textarea id="encargo-nota" name="nota_admin" rows={4} maxLength={1000} defaultValue={nota ?? ''} />
      </div>
      <BotonGuardar texto="Guardar" enviando={enviando} bloqueado={bloqueado} />
    </form>
  );
}
