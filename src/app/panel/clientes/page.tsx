import type { Metadata } from 'next';
import Link from 'next/link';
import { CabeceraPanel } from '@/componentes/panel/cabecera-panel';
import { Paginacion } from '@/componentes/panel/paginacion';
import { eur } from '@/lib/formato';
import { fechaLarga } from '@/lib/fechas';
import { POR_PAGINA } from '@/lib/panel/fuente';
import { panel } from '@/lib/panel/servidor';
import { numeroPagina, type ParametrosUrl } from '@/lib/parametros';
import { rutas } from '@/lib/rutas';

export const metadata: Metadata = { title: 'Clientes' };

export default async function ClientesPanel({ searchParams }: { searchParams: ParametrosUrl }) {
  const { fuente } = await panel(rutas.panelClientes);
  const pagina = numeroPagina((await searchParams).pagina);
  const { filas, total } = await fuente.clientes({ limite: POR_PAGINA, desplazamiento: (pagina - 1) * POR_PAGINA });

  return (
    <>
      <CabeceraPanel
        titulo="Clientes"
        descripcion="Quien ha comprado alguna vez, con o sin cuenta, agrupado por correo. Lo gastado no cuenta cancelaciones ni reembolsos."
      />
      <p className="mini resultado-filtros">{total === 1 ? '1 cliente' : `${total} clientes`}</p>
      {filas.length ? (
        <div className="caja-tabla-panel">
          <table className="tabla tabla-panel">
            <caption className="oculto-vis">Clientes</caption>
            <thead>
              <tr>
                <th scope="col">Cliente</th>
                <th scope="col" className="derecha">
                  Pedidos
                </th>
                <th scope="col" className="derecha">
                  Gastado
                </th>
                <th scope="col">Último pedido</th>
                <th scope="col">Cuenta</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((c) => (
                <tr key={c.email}>
                  <th scope="row">
                    {c.nombre ?? '—'}
                    <span className="mini-2 celda-sub">
                      <Link className="enlace" href={`${rutas.panelPedidos}?q=${encodeURIComponent(c.email)}`}>
                        {c.email}
                        <span className="oculto-vis"> (ver sus pedidos)</span>
                      </Link>
                    </span>
                  </th>
                  <td className="derecha">{c.pedidos}</td>
                  <td className="derecha precio">{eur(c.gastado)}</td>
                  <td className="sin-salto">{fechaLarga(c.ultimo_pedido)}</td>
                  <td>{c.tiene_cuenta ? 'Sí' : 'Sin cuenta'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="panel-vacio">
          <p>Aún no ha comprado nadie.</p>
        </div>
      )}
      <Paginacion pagina={pagina} total={total} porPagina={POR_PAGINA} url={(n) => (n > 1 ? `${rutas.panelClientes}?pagina=${n}` : rutas.panelClientes)} />
    </>
  );
}
