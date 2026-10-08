import type { Metadata } from 'next';
import Link from 'next/link';
import { CabeceraPanel } from '@/componentes/panel/cabecera-panel';
import { GraficoVentas } from '@/componentes/panel/grafico-ventas';
import { PastillaEstado } from '@/componentes/panel/pastilla-estado';
import { eur } from '@/lib/formato';
import { NOMBRE_ESTADO_PEDIDO } from '@/lib/panel/estados';
import { fechaLarga, haceCuanto } from '@/lib/fechas';
import { panel } from '@/lib/panel/servidor';
import { rutas } from '@/lib/rutas';

export const metadata: Metadata = { title: 'Resumen' };

/** «+12 %», «−8 %» o null si el mes anterior no tuvo ventas. */
function variacion(actual: number, anterior: number): { texto: string; sube: boolean } | null {
  if (!anterior) return null;
  const pct = Math.round(((actual - anterior) / anterior) * 100);
  return { texto: `${pct >= 0 ? '+' : '−'}${Math.abs(pct)} %`, sube: pct >= 0 };
}

export default async function ResumenPanel() {
  const { fuente } = await panel(rutas.panel);
  const [resumen, ventas, stock, recientes] = await Promise.all([
    fuente.resumen(),
    fuente.ventasPorDia(30),
    fuente.stockBajo(1),
    fuente.pedidos({ limite: 5, desplazamiento: 0 }),
  ]);
  const cambio = variacion(resumen.ventas_mes, resumen.ventas_mes_anterior);
  const hoy = fechaLarga(new Date().toISOString());

  return (
    <>
      <CabeceraPanel titulo="Resumen" descripcion={`Cómo va el mes, a ${hoy}.`} />

      <section aria-labelledby="titulo-cifras">
        <h2 id="titulo-cifras" className="oculto-vis">
          Cifras del mes
        </h2>
        <dl className="cifras-panel">
          <div className="cifra cifra-principal">
            <dt>Ventas del mes</dt>
            <dd>
              {eur(resumen.ventas_mes)}
              <span className="cifra-nota">
                {cambio ? (
                  <>
                    <span className={cambio.sube ? 'sube' : 'baja'}>{cambio.texto}</span> frente a los{' '}
                    {eur(resumen.ventas_mes_anterior)} del mes pasado
                  </>
                ) : (
                  'El mes pasado no hubo ventas para comparar'
                )}
              </span>
            </dd>
          </div>
          <div className="cifra">
            <dt>Pedidos del mes</dt>
            <dd>
              {resumen.pedidos_mes}
              <span className="cifra-nota">sin contar cancelados</span>
            </dd>
          </div>
          <div className="cifra">
            <dt>Ticket medio</dt>
            <dd>
              {eur(resumen.ticket_medio_mes)}
              <span className="cifra-nota">por pedido este mes</span>
            </dd>
          </div>
          <div className="cifra">
            <dt>Por preparar</dt>
            <dd>
              <Link href={`${rutas.panelPedidos}?estado=pagado`}>{resumen.pedidos_pendientes}</Link>
              <span className="cifra-nota">pagados o en preparación</span>
            </dd>
          </div>
          <div className="cifra">
            <dt>Encargos nuevos</dt>
            <dd>
              <Link href={`${rutas.panelEncargos}?estado=nuevo`}>{resumen.encargos_nuevos}</Link>
              <span className="cifra-nota">esperando respuesta</span>
            </dd>
          </div>
          <div className="cifra">
            <dt>Mensajes sin leer</dt>
            <dd>
              <Link href={`${rutas.panelMensajes}?estado=nuevo`}>{resumen.mensajes_nuevos}</Link>
              <span className="cifra-nota">del formulario de contacto</span>
            </dd>
          </div>
          <div className="cifra">
            <dt>Stock bajo</dt>
            <dd>
              {resumen.variantes_stock_bajo}
              <span className="cifra-nota">{resumen.variantes_stock_bajo === 1 ? 'variante' : 'variantes'} con 1 pieza o ninguna</span>
            </dd>
          </div>
        </dl>
      </section>

      <div className="panel-rejilla">
        <section className="panel-caja panel-ancho" aria-labelledby="titulo-ventas">
          <h2 id="titulo-ventas" className="panel-caja-titulo">
            Ventas por día
          </h2>
          <GraficoVentas dias={ventas} />
        </section>

        <section className="panel-caja" aria-labelledby="titulo-recientes">
          <div className="panel-caja-cab">
            <h2 id="titulo-recientes" className="panel-caja-titulo">
              Últimos pedidos
            </h2>
            <Link className="mini enlace" href={rutas.panelPedidos}>
              Ver todos
            </Link>
          </div>
          <ul className="lista-recientes">
            {recientes.filas.map((p) => (
              <li key={p.id}>
                <Link href={rutas.panelPedido(p.id)}>
                  <span>
                    <b>{p.numero}</b>
                    <span className="mini">
                      {p.nombre_cliente ?? p.email} · {haceCuanto(p.creado_en)}
                    </span>
                  </span>
                  <span className="lista-recientes-lado">
                    <span className="precio">{eur(p.total)}</span>
                    <PastillaEstado estado={p.estado} texto={NOMBRE_ESTADO_PEDIDO[p.estado]} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel-caja" aria-labelledby="titulo-stock">
          <div className="panel-caja-cab">
            <h2 id="titulo-stock" className="panel-caja-titulo">
              Stock bajo
            </h2>
            <Link className="mini enlace" href={rutas.panelProductos}>
              Productos
            </Link>
          </div>
          {stock.length ? (
            <ul className="lista-stock">
              {stock.map((s) => (
                <li key={`${s.producto_slug}-${s.variante}`}>
                  <span className="muestra" style={{ background: s.color }} aria-hidden="true" />
                  <Link href={rutas.panelProducto(s.producto_slug)}>
                    {s.producto}
                    <span className="mini"> · {s.variante}</span>
                  </Link>
                  <span className={s.stock === 0 ? 'stock-cero' : 'stock-uno'}>
                    {s.stock === 0 ? (s.encargo ? 'Por encargo' : 'Agotado') : 'Queda 1'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mini">Todo con existencias. Nada que reponer de momento.</p>
          )}
        </section>
      </div>
    </>
  );
}
