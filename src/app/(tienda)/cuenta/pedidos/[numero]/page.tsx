import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { AvisoSinCuentas } from '@/componentes/cuenta/aviso-sin-cuentas';
import { ESTADOS_PEDIDO_T } from '@/componentes/cuenta/estados-pedido';
import { Seguimiento } from '@/componentes/cuenta/seguimiento';
import { T_PEDIDO } from '@/componentes/cuenta/tarjeta-pedido';
import { IcoAtras } from '@/componentes/iconos';
import { PastillaEstado } from '@/componentes/panel/pastilla-estado';
import { miPedido } from '@/lib/cuentas/datos';
import { exigirPerfil } from '@/lib/cuentas/sesion';
import { urlFotoGuardada } from '@/lib/datos/fotos';
import { fechaLarga } from '@/lib/fechas';
import { eur, eurMenos } from '@/lib/formato';
import { textos, type Idioma } from '@/lib/i18n';
import { Enlace } from '@/lib/i18n/enlace';
import { idiomaActual } from '@/lib/i18n/servidor';
import { rutas } from '@/lib/rutas';

const T = textos(
  {
    tuPedido: 'Tu pedido',
    todos: 'Todos tus pedidos',
    hecho: (fecha: string) => `Hecho el ${fecha}`,
    seguimiento: 'Seguimiento',
    envio: 'Envío',
    verDonde: 'Ver dónde está',
    otraPestana: ' (se abre en otra pestaña)',
    confeccion: (dias: number) => `Lleva piezas que tejemos al pedir: cuenta con unos ${dias} días antes del envío.`,
    queLleva: 'Qué lleva',
    cita: (texto: string) => `«${texto}»`,
    subtotal: 'Subtotal',
    conRebajas: (importe: string) => ` (con ${importe} de rebajas)`,
    codigo: (codigo: string | null) => `Código ${codigo ?? ''}`,
    gratis: 'Gratis',
    total: 'Total',
    dondeVa: 'Dónde va',
    recogida: 'Recogida en el taller, con cita previa.',
    noCuadra: (escribenos: ReactNode) => (
      <>
        ¿Algo no cuadra? {escribenos} con el número de pedido y lo miramos.
      </>
    ),
    escribenos: 'Escríbenos',
  },
  {
    en: {
      tuPedido: 'Your order',
      todos: 'All your orders',
      hecho: (fecha: string) => `Placed on ${fecha}`,
      seguimiento: 'Tracking',
      envio: 'Delivery',
      verDonde: 'See where it is',
      otraPestana: ' (opens in a new tab)',
      confeccion: (dias: number) =>
        `It includes pieces we crochet to order: allow about ${dias} days before it ships.`,
      queLleva: "What's inside",
      cita: (texto: string) => `“${texto}”`,
      subtotal: 'Subtotal',
      conRebajas: (importe: string) => ` (including ${importe} off in the sale)`,
      codigo: (codigo: string | null) => `Code ${codigo ?? ''}`,
      gratis: 'Free',
      total: 'Total',
      dondeVa: 'Where it’s going',
      recogida: 'Collection from the workshop, by appointment.',
      noCuadra: (escribenos: ReactNode) => (
        <>
          Something not right? {escribenos} with your order number and we’ll look into it.
        </>
      ),
      escribenos: 'Drop us a line',
    },
    fr: {
      tuPedido: 'Votre commande',
      todos: 'Toutes vos commandes',
      hecho: (fecha: string) => `Passée le ${fecha}`,
      seguimiento: 'Suivi',
      envio: 'Livraison',
      verDonde: 'Voir où elle se trouve',
      otraPestana: ' (s’ouvre dans un nouvel onglet)',
      confeccion: (dias: number) =>
        `Elle contient des pièces que nous crochetons à la commande : comptez environ ${dias} jours avant l’expédition.`,
      queLleva: 'Contenu',
      cita: (texto: string) => `« ${texto} »`,
      subtotal: 'Sous-total',
      conRebajas: (importe: string) => ` (dont ${importe} de soldes)`,
      codigo: (codigo: string | null) => `Code ${codigo ?? ''}`,
      gratis: 'Gratuit',
      total: 'Total',
      dondeVa: 'Adresse de livraison',
      recogida: 'Retrait à l’atelier, sur rendez-vous.',
      noCuadra: (escribenos: ReactNode) => (
        <>
          Quelque chose ne va pas ? {escribenos} avec le numéro de commande et nous regarderons.
        </>
      ),
      escribenos: 'Écrivez-nous',
    },
    de: {
      tuPedido: 'Ihre Bestellung',
      todos: 'Alle Ihre Bestellungen',
      hecho: (fecha: string) => `Aufgegeben am ${fecha}`,
      seguimiento: 'Sendungsverfolgung',
      envio: 'Versand',
      verDonde: 'Sendung verfolgen',
      otraPestana: ' (öffnet in neuem Tab)',
      confeccion: (dias: number) =>
        `Sie enthält Stücke, die wir auf Bestellung häkeln: Rechnen Sie mit etwa ${dias} Tagen bis zum Versand.`,
      queLleva: 'Inhalt',
      cita: (texto: string) => `„${texto}“`,
      subtotal: 'Zwischensumme',
      conRebajas: (importe: string) => ` (inkl. ${importe} Sale-Rabatt)`,
      codigo: (codigo: string | null) => `Code ${codigo ?? ''}`,
      gratis: 'Kostenlos',
      total: 'Gesamt',
      dondeVa: 'Lieferadresse',
      recogida: 'Abholung in der Werkstatt, nach Terminvereinbarung.',
      noCuadra: (escribenos: ReactNode) => (
        <>
          Stimmt etwas nicht? {escribenos} mit der Bestellnummer, dann sehen wir nach.
        </>
      ),
      escribenos: 'Schreiben Sie uns',
    },
  },
);

/** Nombre del envío. En la base de datos se guarda en español; en los
 *  demás idiomas se traduce por su id y, si no se conoce, va tal cual. */
const ENVIOS: Record<Exclude<Idioma, 'es'>, Record<string, string>> = {
  en: { ordinario: 'Standard delivery', express: 'Express delivery', recogida: 'Collection from the workshop' },
  fr: { ordinario: 'Livraison standard', express: 'Livraison express', recogida: 'Retrait à l’atelier' },
  de: { ordinario: 'Standardversand', express: 'Expressversand', recogida: 'Abholung in der Werkstatt' },
};

const nombreEnvio = (id: string | null, nombre: string, idioma: Idioma) =>
  idioma === 'es' || !id ? nombre : (ENVIOS[idioma][id] ?? nombre);

interface PropsPedido {
  params: Promise<{ numero: string }>;
}

export async function generateMetadata({ params }: PropsPedido): Promise<Metadata> {
  const { numero } = await params;
  return { title: T_PEDIDO[await idiomaActual()].pedido(decodeURIComponent(numero)) };
}

/** Enlace al localizador público de Correos; otros transportistas, sin enlace. */
function enlaceSeguimiento(transportista: string | null, numero: string | null): string | null {
  if (!numero || !transportista || !/correos/i.test(transportista)) return null;
  return `https://www.correos.es/es/es/herramientas/localizador/envios/detalle?tracking-number=${encodeURIComponent(numero)}`;
}

export default async function PaginaPedido({ params }: PropsPedido) {
  const numero = decodeURIComponent((await params).numero);
  const idioma = await idiomaActual();
  const t = T[idioma];
  const perfil = await exigirPerfil(rutas.cuentaPedido(numero));
  if (!perfil) return <AvisoSinCuentas titulo={t.tuPedido} />;
  const pedido = await miPedido(perfil.id, numero);
  if (!pedido) notFound();

  const enlace = enlaceSeguimiento(pedido.transportista, pedido.numero_seguimiento);
  const d = pedido.direccion_envio;

  return (
    <article className="pedido-cuenta" aria-labelledby="titulo-pedido">
      <Enlace className="volver mini" href={rutas.cuentaPedidos}>
        <IcoAtras width={16} height={16} />
        {t.todos}
      </Enlace>
      <header className="pedido-cuenta-cab">
        <div>
          <h2 id="titulo-pedido" className="cuenta-seccion">
            {T_PEDIDO[idioma].pedido(pedido.numero)}
          </h2>
          <p className="mini">{t.hecho(fechaLarga(pedido.creado_en, idioma))}</p>
        </div>
        <PastillaEstado estado={pedido.estado} texto={ESTADOS_PEDIDO_T[idioma][pedido.estado]} />
      </header>

      <div className="pedido-cuenta-rejilla">
        <section className="caja" aria-labelledby="titulo-seguimiento">
          <h3 id="titulo-seguimiento" className="titulo-mini">
            {t.seguimiento}
          </h3>
          <Seguimiento estado={pedido.estado} eventos={pedido.eventos} />
          {pedido.numero_seguimiento && (
            <p className="aviso mt-5">
              <span>
                {pedido.transportista ?? t.envio}: <b className="codigo">{pedido.numero_seguimiento}</b>
                {enlace && (
                  <>
                    {' · '}
                    <a className="enlace" href={enlace} target="_blank" rel="noopener noreferrer">
                      {t.verDonde}
                      <span className="oculto-vis">{t.otraPestana}</span>
                    </a>
                  </>
                )}
              </span>
            </p>
          )}
          {pedido.dias_confeccion && !['enviado', 'entregado', 'cancelado', 'reembolsado'].includes(pedido.estado) && (
            <p className="mini mt-4">{t.confeccion(pedido.dias_confeccion)}</p>
          )}
        </section>

        <section className="caja" aria-labelledby="titulo-contenido">
          <h3 id="titulo-contenido" className="titulo-mini">
            {t.queLleva}
          </h3>
          <ul className="lineas-pedido">
            {pedido.lineas.map((l, i) => {
              const foto = urlFotoGuardada(l.foto_ruta);
              return (
                <li key={`${l.producto_slug}-${l.nombre_variante}-${i}`}>
                  <span className="mini-foto">{foto && <Image src={foto} alt="" fill sizes="56px" />}</span>
                  <span>
                    <Enlace className="linea-nom" href={rutas.producto(l.producto_slug)}>
                      {l.nombre_producto}
                    </Enlace>
                    <span className="mini">
                      {l.nombre_variante} · {l.cantidad} × {eur(Math.round(l.total / l.cantidad), idioma)}
                      {l.personalizacion && ` · ${t.cita(l.personalizacion)}`}
                    </span>
                  </span>
                  <span className="precio">{eur(l.total, idioma)}</span>
                </li>
              );
            })}
          </ul>
          <dl className="totales-pedido">
            {/* Las líneas llevan ya la rebaja automática: el subtotal es su suma. */}
            <div className="fila">
              <dt>{t.subtotal}</dt>
              <dd>
                {eur(pedido.subtotal - pedido.descuento_automatico, idioma)}
                {pedido.descuento_automatico > 0 && (
                  <span className="mini-2 nota-rebaja">{t.conRebajas(eur(pedido.descuento_automatico, idioma))}</span>
                )}
              </dd>
            </div>
            {pedido.descuento_cupon > 0 && (
              <div className="fila">
                <dt>{t.codigo(pedido.codigo_cupon)}</dt>
                <dd className="rebaja">{eurMenos(pedido.descuento_cupon, idioma)}</dd>
              </div>
            )}
            <div className="fila">
              <dt>{nombreEnvio(pedido.metodo_envio_id, pedido.metodo_envio_nombre, idioma)}</dt>
              <dd>{pedido.envio ? eur(pedido.envio, idioma) : t.gratis}</dd>
            </div>
            <div className="fila total">
              <dt>{t.total}</dt>
              <dd>{eur(pedido.total, idioma)}</dd>
            </div>
          </dl>
        </section>

        <section className="caja-cl" aria-labelledby="titulo-envio">
          <h3 id="titulo-envio" className="titulo-mini">
            {t.dondeVa}
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
            <p className="mini mt-2">{t.recogida}</p>
          )}
          <p className="mini mt-4">
            {t.noCuadra(
              <Enlace className="enlace" href={rutas.contacto}>
                {t.escribenos}
              </Enlace>,
            )}
          </p>
        </section>
      </div>
    </article>
  );
}
