'use client';

import { startTransition, useActionState, useState, type FormEvent } from 'react';
import { cambiarEstadoPedido } from '@/lib/panel/acciones';
import { NOMBRE_ESTADO_PEDIDO, TRANSICIONES_PEDIDO, type EstadoPedido } from '@/lib/panel/estados';
import { PANEL_INICIAL } from '@/lib/panel/tipos-accion';
import { AvisoPanel } from './aviso-panel';
import { BotonGuardar } from './boton-guardar';

interface PropsFormulario {
  id: string;
  estado: EstadoPedido;
  transportista: string | null;
  seguimiento: string | null;
  nota: string | null;
  conEnvio: boolean;
  bloqueado: string | null;
}

/** Cambio de estado y datos de envío. Solo ofrece los estados a los que
 *  se puede pasar desde el actual, igual que el disparador de la base de datos. */
export function FormularioEstadoPedido({ id, estado, transportista, seguimiento, nota, conEnvio, bloqueado }: PropsFormulario) {
  const [resultado, enviar, enviando] = useActionState(cambiarEstadoPedido, PANEL_INICIAL);
  const [elegido, setElegido] = useState<EstadoPedido>(estado);
  const opciones: EstadoPedido[] = [estado, ...TRANSICIONES_PEDIDO[estado]];
  const errores = resultado.estado === 'error' ? resultado.errores : {};

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
      <div className="campo">
        <label htmlFor="pedido-estado">Estado</label>
        <select
          id="pedido-estado"
          name="estado"
          value={elegido}
          onChange={(e) => setElegido(opciones.find((o) => o === e.target.value) ?? estado)}
          aria-invalid={errores.estado ? true : undefined}
          aria-describedby={errores.estado ? 'pedido-estado-error' : 'pedido-estado-pista'}
        >
          {opciones.map((o) => (
            <option key={o} value={o}>
              {o === estado ? `${NOMBRE_ESTADO_PEDIDO[o]} (ahora)` : NOMBRE_ESTADO_PEDIDO[o]}
            </option>
          ))}
        </select>
        {errores.estado ? (
          <p className="error visible" id="pedido-estado-error">
            {errores.estado}
          </p>
        ) : (
          <p className="pista" id="pedido-estado-pista">
            {opciones.length === 1 ? 'Este pedido ya está cerrado.' : 'Solo salen los pasos posibles desde el estado actual.'}
            {elegido === 'reembolsado' && elegido !== estado && ' Marcarlo no devuelve el dinero: el reembolso se hace en Stripe.'}
            {elegido === 'cancelado' && elegido !== estado && ' Al cancelar, las piezas vuelven al stock.'}
          </p>
        )}
      </div>

      {conEnvio && (
        <div className="par">
          <div className="campo">
            <label htmlFor="pedido-transportista">Transportista</label>
            <input id="pedido-transportista" name="transportista" type="text" maxLength={60} defaultValue={transportista ?? 'Correos'} />
          </div>
          <div className={errores.numero_seguimiento ? 'campo mal' : 'campo'}>
            <label htmlFor="pedido-seguimiento">Nº de seguimiento</label>
            <input
              id="pedido-seguimiento"
              name="numero_seguimiento"
              type="text"
              maxLength={40}
              spellCheck={false}
              autoComplete="off"
              defaultValue={seguimiento ?? ''}
              placeholder="PK000000000ES"
              aria-invalid={errores.numero_seguimiento ? true : undefined}
              aria-describedby={errores.numero_seguimiento ? 'pedido-seguimiento-error' : undefined}
            />
            {errores.numero_seguimiento && (
              <p className="error" id="pedido-seguimiento-error">
                {errores.numero_seguimiento}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="campo">
        <label htmlFor="pedido-nota">
          Nota interna <span className="aclaracion">(no la ve el cliente)</span>
        </label>
        <textarea id="pedido-nota" name="nota_admin" rows={3} maxLength={1000} defaultValue={nota ?? ''} />
      </div>

      <BotonGuardar texto="Guardar cambios" enviando={enviando} bloqueado={bloqueado} />
    </form>
  );
}
