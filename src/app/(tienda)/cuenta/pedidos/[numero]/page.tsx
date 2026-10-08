import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AvisoSinCuentas } from '@/componentes/cuenta/aviso-sin-cuentas';
import { Seguimiento } from '@/componentes/cuenta/seguimiento';
import { IcoAtras } from '@/componentes/iconos';
import { PastillaEstado } from '@/componentes/panel/pastilla-estado';
import { miPedido } from '@/lib/cuentas/datos';
import { exigirPerfil } from '@/lib/cuentas/sesion';
import { urlFotoGuardada } from '@/lib/datos/fotos';
import { eur, eurMenos } from '@/lib/formato';
import { NOMBRE_ESTADO_PEDIDO } from '@/lib/panel/estados';
import { fechaLarga } from '@/lib/fechas';
import { rutas } from '@/lib/rutas';

interface PropsPedido {
  params: Promise<{ numero: string }>;
}

export async function generateMetadata({ params }: PropsPedido): Promise<Metadata> {
  const { numero } = await params;
  return { title: `Pedido ${decodeURIComponent(numero)}` };
}

/** Enlace al localizador público de Correos; otros transportistas, sin enlace. */
function enlaceSeguimiento(transportista: string | null, numero: string | null): string | null {
  if (!numero || !transportista || !/correos/i.test(transportista)) return null;
  return `https://www.correos.es/es/es/herramientas/localizador/envios/detalle?tracking-number=${encodeURIComponent(numero)}`;
}

export default async function PaginaPedido({ params }: PropsPedido) {
  const numero = decodeURIComponent((await params).numero);
  const perfil = await exigirPerfil(rutas.cuentaPedido(numero));
  if (!perfil) return <AvisoSinCuentas titulo="Tu pedido" />;
  const pedido = await miPedido(perfil.id, numero);
  if (!pedido) notFound();

  const enlace = enlaceSeguimiento(pedido.transportista, pedido.numero_seguimiento);
  const d = pedido.direccion_envio;

  return (
    <article className="pedido-cuenta" aria-labelledby="titulo-pedido">
      <Link className="volver mini" href={rutas.cuentaPedidos}>
        <IcoAtras width={16} height={16} />
        Todos tus pedidos
      </Link>
      <header className="pedido-cuenta-cab">
        <div>
          <h2 id="titulo-pedido" className="cuenta-seccion">
            Pedido {pedido.numero}
          </h2>
          <p className="mini">Hecho el {fechaLarga(pedido.creado_en)}</p>
        </div>
        <PastillaEstado estado={pedido.estado} texto={NOMBRE_ESTADO_PEDIDO[pedido.estado]} />
      </header>

      <div className="pedido-cuenta-rejilla">
        <section className="caja" aria-labelledby="titulo-seguimiento">
          <h3 id="titulo-seguimiento" className="titulo-mini">
            Seguimiento
          </h3>
          <Seguimiento estado={pedido.estado} eventos={pedido.eventos} />
          {pedido.numero_seguimiento && (
            <p className="aviso mt-5">
              <span>
                {pedido.transportista ?? 'Envío'}: <b className="codigo">{pedido.numero_seguimiento}</b>
                {enlace && (
                  <>
                    {' · '}
                    <a className="enlace" href={enlace} target="_blank" rel="noopener noreferrer">
                      Ver dónde está
                      <span className="oculto-vis"> (se abre en otra pestaña)</span>
                    </a>
                  </>
                )}
              </span>
            </p>
          )}
          {pedido.dias_confeccion && !['enviado', 'entregado', 'cancelado', 'reembolsado'].includes(pedido.estado) && (
            <p className="mini mt-4">
              Lleva piezas que tejemos al pedir: cuenta con unos {pedido.dias_confeccion} días antes del envío.
            </p>
          )}
        </section>

        <section className="caja" aria-labelledby="titulo-contenido">
          <h3 id="titulo-contenido" className="titulo-mini">
            Qué lleva
          </h3>
          <ul className="lineas-pedido">
            {pedido.lineas.map((l, i) => {
              const foto = urlFotoGuardada(l.foto_ruta);
              return (
                <li key={`${l.producto_slug}-${l.nombre_variante}-${i}`}>
                  <span className="mini-foto">{foto && <Image src={foto} alt="" fill sizes="56px" />}</span>
                  <span>
                    <Link className="linea-nom" href={rutas.producto(l.producto_slug)}>
                      {l.nombre_producto}
                    </Link>
                    <span className="mini">
                      {l.nombre_variante} · {l.cantidad} × {eur(l.precio_unitario)}
                      {l.personalizacion && ` · «${l.personalizacion}»`}
                    </span>
                  </span>
                  <span className="precio">{eur(l.total)}</span>
                </li>
              );
            })}
          </ul>
          <dl className="totales-pedido">
            <div className="fila">
              <dt>Subtotal</dt>
              <dd>{eur(pedido.subtotal)}</dd>
            </div>
            {pedido.descuento_automatico > 0 && (
              <div className="fila">
                <dt>Rebajas</dt>
                <dd className="rebaja">{eurMenos(pedido.descuento_automatico)}</dd>
              </div>
            )}
            {pedido.descuento_cupon > 0 && (
              <div className="fila">
                <dt>Código {pedido.codigo_cupon}</dt>
                <dd className="rebaja">{eurMenos(pedido.descuento_cupon)}</dd>
              </div>
            )}
            <div className="fila">
              <dt>{pedido.metodo_envio_nombre}</dt>
              <dd>{pedido.envio ? eur(pedido.envio) : 'Gratis'}</dd>
            </div>
            <div className="fila total">
              <dt>Total</dt>
              <dd>{eur(pedido.total)}</dd>
            </div>
          </dl>
        </section>

        <section className="caja-cl" aria-labelledby="titulo-envio">
          <h3 id="titulo-envio" className="titulo-mini">
            Dónde va
          </h3>
          {d ? (
            <address className="direccion mt-2">
              {d.destinatario}
              <br />
              {d.linea1}
              {d.linea2 && (
                <>
                  <br />
                  {d.linea2}
                </>
              )}
              <br />
              {d.codigo_postal} {d.ciudad} ({d.provincia})
            </address>
          ) : (
            <p className="mini mt-2">Recogida en el taller, con cita previa.</p>
          )}
          <p className="mini mt-4">
            ¿Algo no cuadra?{' '}
            <Link className="enlace" href={rutas.contacto}>
              Escríbenos
            </Link>{' '}
            con el número de pedido y lo miramos.
          </p>
        </section>
      </div>
    </article>
  );
}
