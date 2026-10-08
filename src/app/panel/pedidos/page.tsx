import type { Metadata } from 'next';
import Form from 'next/form';
import Link from 'next/link';
import { IcoLupa } from '@/componentes/iconos';
import { CabeceraPanel } from '@/componentes/panel/cabecera-panel';
import { FiltroEstados } from '@/componentes/panel/filtro-estados';
import { Paginacion } from '@/componentes/panel/paginacion';
import { PastillaEstado } from '@/componentes/panel/pastilla-estado';
import { eur } from '@/lib/formato';
import { ESTADOS_PEDIDO, NOMBRE_ESTADO_PEDIDO, type EstadoPedido } from '@/lib/panel/estados';
import { fechaHora } from '@/lib/fechas';
import { POR_PAGINA } from '@/lib/panel/fuente';
import { panel } from '@/lib/panel/servidor';
import { numeroPagina, parametro, type ParametrosUrl } from '@/lib/parametros';
import { rutas } from '@/lib/rutas';

export const metadata: Metadata = { title: 'Pedidos' };

function urlLista(estado: EstadoPedido | null, busqueda: string, pagina = 1): string {
  const p = new URLSearchParams();
  if (estado) p.set('estado', estado);
  if (busqueda) p.set('q', busqueda);
  if (pagina > 1) p.set('pagina', String(pagina));
  const qs = p.toString();
  return qs ? `${rutas.panelPedidos}?${qs}` : rutas.panelPedidos;
}

export default async function PedidosPanel({ searchParams }: { searchParams: ParametrosUrl }) {
  const { fuente } = await panel(rutas.panelPedidos);
  const parametros = await searchParams;
  const estado = ESTADOS_PEDIDO.find((e) => e === parametro(parametros.estado)) ?? null;
  const busqueda = parametro(parametros.q).trim().slice(0, 80);
  const pagina = numeroPagina(parametros.pagina);
  const { filas, total } = await fuente.pedidos({
    estado: estado ?? undefined,
    busqueda,
    limite: POR_PAGINA,
    desplazamiento: (pagina - 1) * POR_PAGINA,
  });

  return (
    <>
      <CabeceraPanel titulo="Pedidos" descripcion="Todo lo que ha entrado por la tienda, del más nuevo al más antiguo." />

      <div className="panel-filtros">
        <FiltroEstados
          etiqueta="Filtrar por estado"
          estados={ESTADOS_PEDIDO}
          nombres={NOMBRE_ESTADO_PEDIDO}
          actual={estado}
          url={(e) => urlLista(e, busqueda)}
        />
        <Form action={rutas.panelPedidos} role="search" className="busca panel-busca">
          {estado && <input type="hidden" name="estado" value={estado} />}
          <label htmlFor="busca-pedidos" className="oculto-vis">
            Buscar pedidos
          </label>
          <IcoLupa width={17} height={17} />
          <input type="search" id="busca-pedidos" name="q" defaultValue={busqueda} placeholder="Número, nombre o correo" />
        </Form>
      </div>

      <p className="mini resultado-filtros" aria-live="polite">
        {total === 1 ? '1 pedido' : `${total} pedidos`}
        {estado && ` · ${NOMBRE_ESTADO_PEDIDO[estado]}`}
        {busqueda && ` con «${busqueda}»`}
        {(estado || busqueda) && (
          <>
            {' · '}
            <Link className="enlace" href={rutas.panelPedidos}>
              Quitar filtros
            </Link>
          </>
        )}
      </p>

      {filas.length ? (
        <div className="caja-tabla-panel">
          <table className="tabla tabla-panel tabla-pedidos">
            <caption className="oculto-vis">Pedidos</caption>
            <thead>
              <tr>
                <th scope="col">Pedido</th>
                <th scope="col">Cliente</th>
                <th scope="col">Fecha</th>
                <th scope="col">Estado</th>
                <th scope="col" className="derecha">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {filas.map((p) => (
                <tr key={p.id}>
                  <th scope="row">
                    <Link className="enlace-fila" href={rutas.panelPedido(p.id)}>
                      {p.numero}
                    </Link>
                    <span className="mini-2 celda-sub">
                      {p.unidades === 1 ? '1 pieza' : `${p.unidades} piezas`} · {p.metodo_envio_nombre}
                    </span>
                  </th>
                  <td>
                    {p.nombre_cliente ?? '—'}
                    <span className="mini-2 celda-sub">{p.email}</span>
                  </td>
                  <td className="sin-salto">{fechaHora(p.creado_en)}</td>
                  <td>
                    <PastillaEstado estado={p.estado} texto={NOMBRE_ESTADO_PEDIDO[p.estado]} />
                  </td>
                  <td className="derecha precio">{eur(p.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="panel-vacio">
          <p>No hay pedidos con esos filtros.</p>
        </div>
      )}

      <Paginacion pagina={pagina} total={total} porPagina={POR_PAGINA} url={(n) => urlLista(estado, busqueda, n)} />
    </>
  );
}
