'use client';

import { startTransition, useActionState, type FormEvent } from 'react';
import { cambiarEstadoMensaje } from '@/lib/panel/acciones';
import type { EstadoMensaje } from '@/lib/panel/estados';
import { PANEL_INICIAL } from '@/lib/panel/tipos-accion';
import { AvisoPanel } from './aviso-panel';
import { BotonGuardar } from './boton-guardar';

const BOTONES: Record<EstadoMensaje, { valor: EstadoMensaje; texto: string }[]> = {
  nuevo: [
    { valor: 'respondido', texto: 'Marcar como respondido' },
    { valor: 'archivado', texto: 'Archivar' },
  ],
  respondido: [
    { valor: 'nuevo', texto: 'Marcar como sin leer' },
    { valor: 'archivado', texto: 'Archivar' },
  ],
  archivado: [{ valor: 'nuevo', texto: 'Recuperar' }],
};

export function AccionesMensaje({ id, estado, bloqueado }: { id: string; estado: EstadoMensaje; bloqueado: string | null }) {
  const [resultado, enviar, enviando] = useActionState(cambiarEstadoMensaje, PANEL_INICIAL);

  function alEnviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (bloqueado) return;
    const submitter = (e.nativeEvent as SubmitEvent).submitter;
    const datos = new FormData(e.currentTarget, submitter);
    startTransition(() => enviar(datos));
  }

  return (
    <form action={enviar} onSubmit={alEnviar} className="acciones-mensaje">
      <input type="hidden" name="id" value={id} />
      <div className="acciones-fila">
        {BOTONES[estado].map((b, i) => (
          <BotonGuardar
            key={b.valor}
            name="estado"
            value={b.valor}
            texto={b.texto}
            enviando={enviando}
            className={i === 0 ? 'btn btn-2 btn-p' : 'btn btn-4 btn-p'}
            bloqueado={bloqueado}
            motivoVisible={false}
          />
        ))}
      </div>
      <AvisoPanel resultado={resultado} />
    </form>
  );
}
