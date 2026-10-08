import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IcoAtras } from '@/componentes/iconos';
import { CabeceraPanel } from '@/componentes/panel/cabecera-panel';
import { FormularioEstadoPedido } from '@/componentes/panel/formulario-estado-pedido';
import { PastillaEstado } from '@/componentes/panel/pastilla-estado';
import { urlFotoGuardada } from '@/lib/datos/fotos';
import { eur, eurMenos } from '@/lib/formato';
import { permisoEscritura } from '@/lib/panel/acceso';
import { NOMBRE_ESTADO_PEDIDO } from '@/lib/panel/estados';
import { fechaHora, fechaLarga } from '@/lib/fechas';
import { panel } from '@/lib/panel/servidor';
import { esUuid } from '@/lib/parametros';
import { rutas } from '@/lib/rutas';

interface PropsPedido {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: 'Pedido' };

export default async function PedidoPanel({ params }: PropsPedido) {
  const { id } = await params;
  const { acceso, fuente } = await panel(rutas.panelPedido(id));
  if (!esUuid(id)) notFound();
  const p = await fuente.pedido(id);
  if (!p) notFound();

  const permiso = permisoEscritura(acceso);
  const d = p.direccion_envio;

  return (
    <>
      <CabeceraPanel
        volver={
          <Link className="volver mini" href={rutas.panelPedidos}>
            <IcoAtras width={16} height={16} />
            Pedidos
          </Link>
        }
        titulo={
          <>
            Pedido {p.numero} <PastillaEstado estado={p.estado} texto={NOMBRE_ESTADO_PEDIDO[p.estado]} />
          </>
        }
        descripcion={`Pagado el ${fechaLarga(p.pagado_en ?? p.creado_en)} · ${p.metodo_envio_nombre}`}
      />

      <div className="panel-rejilla panel-ficha">
        <div className="panel-columna">
          <section className="panel-caja" aria-labelledby="titulo-lineas">
            <h2 id="titulo-lineas" className="panel-caja-titulo">
              Qué lleva
            </h2>
            <ul className="lineas-pedido">
              {p.lineas.map((l, i) => {
                const foto = urlFotoGuardada(l.foto_ruta);
                return (
                  <li key={`${l.producto_slug}-${l.nombre_variante}-${i}`}>
                    <span className="mini-foto">{foto && <Image src={foto} alt="" fill sizes="56px" />}</span>
                    <span>
                      <span className="linea-nom">{l.nombre_producto}</span>
                      <span className="mini">
                        {l.color && <span className="muestra muestra-p" style={{ background: l.color }} aria-hidden="true" />}
                        {l.nombre_variante} · {l.cantidad} × {eur(l.precio_unitario)}
                        {l.descuento > 0 && ` · rebaja ${eurMenos(l.descuento)}`}
                      </span>
                      {l.personalizacion && <span className="mini personalizacion">Personalización: «{l.personalizacion}»</span>}
                      {l.encargo && <span className="mini">Se teje por encargo ({l.dias} días)</span>}
                    </span>
                    <span className="precio">{eur(l.total)}</span>
                  </li>
                );
              })}
            </ul>
            <dl className="totales-pedido">
              <div className="fila">
                <dt>Subtotal</dt>
                <dd>{eur(p.subtotal)}</dd>
              </div>
              {p.descuento_automatico > 0 && (
                <div className="fila">
                  <dt>Rebajas automáticas</dt>
                  <dd className="rebaja">{eurMenos(p.descuento_automatico)}</dd>
                </div>
              )}
              {p.descuento_cupon > 0 && (
                <div className="fila">
                  <dt>Código {p.codigo_cupon}</dt>
                  <dd className="rebaja">{eurMenos(p.descuento_cupon)}</dd>
                </div>
              )}
              <div className="fila">
                <dt>{p.metodo_envio_nombre}</dt>
                <dd>{p.envio ? eur(p.envio) : 'Gratis'}</dd>
              </div>
              <div className="fila total">
                <dt>Total cobrado</dt>
                <dd>{eur(p.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="panel-caja" aria-labelledby="titulo-historial">
            <h2 id="titulo-historial" className="panel-caja-titulo">
              Historial
            </h2>
            <ol className="historial">
              {[...p.eventos].reverse().map((e, i) => (
                <li key={`${e.estado}-${e.creado_en}-${i}`}>
                  <PastillaEstado estado={e.estado} texto={NOMBRE_ESTADO_PEDIDO[e.estado]} />
                  <time dateTime={e.creado_en} className="mini">
                    {fechaHora(e.creado_en)}
                  </time>
                  {e.nota && <span className="mini">{e.nota}</span>}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="panel-columna">
          <section className="panel-caja" aria-labelledby="titulo-gestion">
            <h2 id="titulo-gestion" className="panel-caja-titulo">
              Estado y envío
            </h2>
            <FormularioEstadoPedido
              key={`${p.estado}-${p.numero_seguimiento ?? ''}`}
              id={p.id}
              estado={p.estado}
              transportista={p.transportista}
              seguimiento={p.numero_seguimiento}
              nota={p.nota_admin}
              conEnvio={d !== null}
              bloqueado={permiso.ok ? null : permiso.motivo}
            />
          </section>

          <section className="panel-caja" aria-labelledby="titulo-cliente">
            <h2 id="titulo-cliente" className="panel-caja-titulo">
              Cliente
            </h2>
            <dl className="datos-panel">
              <div>
                <dt>Nombre</dt>
                <dd>{p.nombre_cliente ?? '—'}</dd>
              </div>
              <div>
                <dt>Correo</dt>
                <dd>{p.email ? <a className="enlace" href={`mailto:${p.email}`}>{p.email}</a> : '—'}</dd>
              </div>
              {p.telefono && (
                <div>
                  <dt>Teléfono</dt>
                  <dd>{p.telefono}</dd>
                </div>
              )}
              <div>
                <dt>Cuenta</dt>
                <dd>{p.tiene_cuenta ? 'Compró con su cuenta' : 'Compró sin cuenta'}</dd>
              </div>
              <div>
                <dt>{d ? 'Envío a' : 'Entrega'}</dt>
                <dd>
                  {d ? (
                    <address className="direccion">
                      {d.destinatario && (
                        <>
                          {d.destinatario}
                          <br />
                        </>
                      )}
                      {d.linea1 && (
                        <>
                          {d.linea1}
                          <br />
                        </>
                      )}
                      {d.linea2 && (
                        <>
                          {d.linea2}
                          <br />
                        </>
                      )}
                      {[d.codigo_postal, d.ciudad].filter(Boolean).join(' ')}
                      {d.provincia && ` (${d.provincia})`}
                    </address>
                  ) : (
                    'Recogida en el taller'
                  )}
                </dd>
              </div>
            </dl>
            {p.nota_cliente && (
              <blockquote className="nota-cliente">
                <span className="oculto-vis">Nota del cliente: </span>
                {p.nota_cliente}
              </blockquote>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
