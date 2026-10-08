// Página de confirmación de un pedido, venga de Stripe (modo prueba) o
// del modo demostración. No usa estado propio: la pinta el servidor
// cuando hay sesión de Stripe y el navegador en el modo demostración.

import Image from 'next/image';
import Link from 'next/link';
import { IcoInfo, Ovillo } from '@/componentes/iconos';
import { fechaLarga } from '@/lib/fechas';
import { eur, eurMenos } from '@/lib/formato';
import type { ResumenPedido } from '@/lib/pagos/tipos';
import { rutas } from '@/lib/rutas';
import { BotonImprimir } from './boton-imprimir';
import { Confeti } from './confeti';
import { VaciarAlConfirmar } from './vaciar-al-confirmar';

function aviso(p: ResumenPedido): string {
  if (p.estado === 'demo') return 'Pedido de demostración: no se ha realizado ningún pago ni se ha pedido ninguna tarjeta.';
  if (p.estado === 'pendiente') {
    return 'Stripe aún no ha confirmado el pago. En cuanto lo haga, el pedido queda en marcha; tu cesta sigue guardada por si acaso.';
  }
  return 'Pago de prueba con Stripe: no se ha cobrado nada real.';
}

function hitos(p: ResumenPedido): { clase: string; marca: string; titulo: string; texto: string }[] {
  const recogida = p.envio.id === 'recogida';
  return [
    {
      clase: p.estado === 'pendiente' ? 'ahora' : 'hecho',
      marca: p.estado === 'pendiente' ? '1' : '✓',
      titulo: 'Pedido recibido',
      texto:
        p.estado === 'pendiente'
          ? 'Ya tenemos tus datos. Falta que el banco confirme el pago.'
          : 'Ahora mismo. Ya tenemos tus datos y el pedido está en marcha.',
    },
    {
      clase: p.estado === 'pendiente' ? '' : 'ahora',
      marca: '2',
      titulo: p.diasConfeccion ? 'Lo estamos tejiendo' : 'Preparando el paquete',
      texto: p.diasConfeccion
        ? 'Te escribimos cuando lo empecemos. Si quieres fotos del proceso, pídenoslas.'
        : 'Lo envolvemos en papel de seda con las instrucciones de lavado escritas a mano.',
    },
    recogida
      ? {
          clase: '',
          marca: '3',
          titulo: 'Listo para recoger',
          texto: 'Te escribimos para darte cita en el taller, en Málaga.',
        }
      : {
          clase: '',
          marca: '3',
          titulo: 'De camino',
          texto: `Te mandamos el seguimiento del ${p.envio.nombre.toLowerCase()} en cuanto salga${p.envio.plazo ? ` (${p.envio.plazo.toLowerCase()})` : ''}.`,
        },
    {
      clase: '',
      marca: '4',
      titulo: recogida ? 'En tus manos' : 'En tu casa',
      texto: 'Si algo no está como esperabas, escríbenos y lo solucionamos.',
    },
  ];
}

export function Confirmacion({ pedido: p }: { pedido: ResumenPedido }) {
  const datos: [string, string][] = [
    ['Fecha', fechaLarga(p.fecha)],
    ['A nombre de', p.nombre],
    ['Correo', p.email],
    p.direccion ? ['Dirección', p.direccion] : ['Recogida', 'En el taller, en Málaga, con cita'],
    ['Envío', [p.envio.nombre, p.envio.plazo].filter(Boolean).join(' · ')],
  ];
  if (p.regalo) datos.push(['Regalo', 'Envuelto para regalar, sin precio en el paquete']);
  if (p.dedicatoria) datos.push(['Dedicatoria', `«${p.dedicatoria}»`]);
  if (p.nota) datos.push(['Tu nota', `«${p.nota}»`]);

  return (
    <>
      {p.estado !== 'pendiente' && <VaciarAlConfirmar numero={p.numero} />}

      <section className="gracias-cab">
        {p.estado !== 'pendiente' && <Confeti />}
        <Ovillo width={64} height={64} className="flota ovillo-gracias" />
        <p className="eyebrow ent ent-1">{p.estado === 'pendiente' ? 'Pago en proceso' : 'Pedido confirmado'}</p>
        <h1 className="ent ent-2">{p.estado === 'pendiente' ? 'Casi está' : '¡Gracias! Nos ponemos con ello'}</h1>
        <p className="lead ent ent-3">
          {p.diasConfeccion
            ? `Como hay piezas que se tejen al pedir, calcula unos ${p.diasConfeccion} días antes de que salga.`
            : p.envio.id === 'recogida'
              ? 'Todo está hecho: en 24–48 horas lo tendrás listo para recoger.'
              : 'Todo está hecho, así que sale del taller en 24–48 horas.'}{' '}
          Al ser una tienda de demostración no te llegará ningún correo; en la tienda real, la confirmación iría a{' '}
          <b>{p.email}</b>.
        </p>
        <div className={p.estado === 'pendiente' ? 'aviso ent ent-3' : 'aviso aviso-ok ent ent-3'} role="status">
          <IcoInfo />
          <span>{aviso(p)}</span>
        </div>
        <div className="botones-centro acciones-gracias ent ent-4">
          <Link className="btn btn-2" href={rutas.tienda}>
            Seguir mirando
          </Link>
          <BotonImprimir />
        </div>
      </section>

      <div className="dos-lado dos-arr layout-gracias">
        <div className="columna-gracias">
          <div className="caja">
            <h2>Qué pasa ahora</h2>
            <ol className="hitos">
              {hitos(p).map((h) => (
                <li key={h.titulo} className={`hito ${h.clase}`} aria-current={h.clase === 'ahora' ? 'step' : undefined}>
                  <span className="bolita" aria-hidden="true">
                    {h.marca}
                  </span>
                  <div>
                    <p className="hito-tit">
                      {h.titulo}
                      {h.clase === 'hecho' && <span className="oculto-vis"> (hecho)</span>}
                    </p>
                    <p className="mini mt-1">
                      {h.texto}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="caja">
            <h2>Lo que has pedido</h2>
            <ul className="lineas-gracias">
              {p.lineas.map((l, i) => (
                <li key={`${l.slug}-${i}`} className="linea-resumen">
                  <div className="miniatura">{l.foto && <Image src={l.foto.src} alt="" fill sizes="60px" />}</div>
                  <div>
                    <p className="nom">{l.nombre}</p>
                    <p className="mini-2">
                      {l.variante} · {l.cantidad} ud.{l.personalizacion && ` · bordado «${l.personalizacion}»`}
                    </p>
                  </div>
                  <span className="precio">{eur(l.total)}</span>
                </li>
              ))}
            </ul>
            <div className="totales-resumen mt-5">
              <div className="fila">
                <span>Subtotal</span>
                <span>{eur(p.subtotal)}</span>
              </div>
              {p.descuento > 0 && (
                <div className="fila">
                  <span>{p.nombreDescuento}</span>
                  <span className="rebaja">{eurMenos(p.descuento)}</span>
                </div>
              )}
              <div className="fila">
                <span>{p.envio.nombre}</span>
                <span>{p.envioImporte === 0 ? 'Gratis' : eur(p.envioImporte)}</span>
              </div>
              <div className="fila total">
                <span>{p.estado === 'demo' ? 'Total (sin cobrar)' : 'Total pagado'}</span>
                <span>{eur(p.total)}</span>
              </div>
            </div>
          </div>

          <div className="banda favor-foto">
            <h3 className="tit-favor">¿Nos haces un favor?</h3>
            <p className="texto-favor">
              Cuando te llegue, si te gusta, mándanos una foto en casa. Con tu permiso la ponemos en la web: así quien
              dude ve las piezas de verdad y no solo nuestras fotos.
            </p>
            <Link className="btn btn-1 mt-5" href={rutas.contacto}>
              Mandarnos una foto
            </Link>
          </div>
        </div>

        <aside className="lateral-gracias" aria-label="Datos del pedido">
          <div className="caja">
            <p className="eyebrow">Número de pedido</p>
            <p className="numero-pedido">{p.numero}</p>
            <hr className="sep sep-corto" />
            <dl className="datos-pedido">
              {datos.map(([etiqueta, valor]) => (
                <div key={etiqueta}>
                  <dt>{etiqueta}</dt>
                  <dd>{valor}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="caja-cl">
            <h2 className="titulo-mini">¿Algún problema?</h2>
            <p className="mini mt-2">
              Escríbenos con tu número de pedido y lo arreglamos. Te contesta el taller, no un departamento de atención
              al cliente.
            </p>
            <Link className="btn btn-2 btn-p mt-3" href={rutas.contacto}>
              Escribirnos
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
