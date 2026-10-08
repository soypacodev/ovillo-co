import type { Metadata } from 'next';
import Link from 'next/link';
import { AccionesMensaje } from '@/componentes/panel/acciones-mensaje';
import { CabeceraPanel } from '@/componentes/panel/cabecera-panel';
import { FiltroEstados } from '@/componentes/panel/filtro-estados';
import { Paginacion } from '@/componentes/panel/paginacion';
import { PastillaEstado } from '@/componentes/panel/pastilla-estado';
import { permisoEscritura } from '@/lib/panel/acceso';
import { ESTADOS_MENSAJE, NOMBRE_ESTADO_MENSAJE, type EstadoMensaje } from '@/lib/panel/estados';
import { fechaHora, haceCuanto } from '@/lib/fechas';
import { POR_PAGINA } from '@/lib/panel/fuente';
import { panel } from '@/lib/panel/servidor';
import { numeroPagina, parametro, type ParametrosUrl } from '@/lib/parametros';
import { rutas } from '@/lib/rutas';

export const metadata: Metadata = { title: 'Mensajes' };

function urlLista(estado: EstadoMensaje | null, pagina = 1): string {
  const p = new URLSearchParams();
  if (estado) p.set('estado', estado);
  if (pagina > 1) p.set('pagina', String(pagina));
  const qs = p.toString();
  return qs ? `${rutas.panelMensajes}?${qs}` : rutas.panelMensajes;
}

export default async function MensajesPanel({ searchParams }: { searchParams: ParametrosUrl }) {
  const { acceso, fuente } = await panel(rutas.panelMensajes);
  const parametros = await searchParams;
  const estado = ESTADOS_MENSAJE.find((e) => e === parametro(parametros.estado)) ?? null;
  const pagina = numeroPagina(parametros.pagina);
  const { filas, total } = await fuente.mensajes({
    estado: estado ?? undefined,
    limite: POR_PAGINA,
    desplazamiento: (pagina - 1) * POR_PAGINA,
  });
  const permiso = permisoEscritura(acceso);

  return (
    <>
      <CabeceraPanel titulo="Mensajes" descripcion="Lo que llega por el formulario de contacto. Contesta desde tu correo y márcalo aquí." />
      <div className="panel-filtros">
        <FiltroEstados etiqueta="Filtrar por estado" estados={ESTADOS_MENSAJE} nombres={NOMBRE_ESTADO_MENSAJE} actual={estado} url={urlLista} />
      </div>
      <p className="mini resultado-filtros" aria-live="polite">
        {total === 1 ? '1 mensaje' : `${total} mensajes`}
      </p>

      {filas.length ? (
        <ul className="lista-tarjetas">
          {filas.map((m) => (
            <li key={m.id} className={m.estado === 'nuevo' ? 'panel-caja mensaje sin-leer' : 'panel-caja mensaje'}>
              <article aria-labelledby={`mensaje-${m.id}`}>
                <div className="tarjeta-encargo-cab">
                  <h2 id={`mensaje-${m.id}`}>{m.motivo}</h2>
                  <PastillaEstado estado={m.estado} texto={NOMBRE_ESTADO_MENSAJE[m.estado]} />
                </div>
                <p className="mini">
                  <b>{m.nombre}</b> ·{' '}
                  <a className="enlace" href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.motivo}`)}`}>
                    {m.email}
                  </a>{' '}
                  · <time dateTime={m.creado_en} title={fechaHora(m.creado_en)}>{haceCuanto(m.creado_en)}</time>
                  {m.numero_pedido && (
                    <>
                      {' '}
                      · pedido{' '}
                      <Link className="enlace" href={`${rutas.panelPedidos}?q=${encodeURIComponent(m.numero_pedido)}`}>
                        {m.numero_pedido}
                      </Link>
                    </>
                  )}
                </p>
                <p className="texto-largo mt-3">{m.mensaje}</p>
                <AccionesMensaje id={m.id} estado={m.estado} bloqueado={permiso.ok ? null : permiso.motivo} />
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <div className="panel-vacio">
          <p>No hay mensajes {estado ? `en «${NOMBRE_ESTADO_MENSAJE[estado]}»` : 'todavía'}.</p>
        </div>
      )}
      <Paginacion pagina={pagina} total={total} porPagina={POR_PAGINA} url={(n) => urlLista(estado, n)} />
    </>
  );
}
