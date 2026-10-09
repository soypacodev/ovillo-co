import { fechaHora } from '@/lib/fechas';
import { textos } from '@/lib/i18n';
import { idiomaActual } from '@/lib/i18n/servidor';
import type { EstadoPedido } from '@/lib/panel/estados';
import { ESTADOS_PEDIDO_T } from './estados-pedido';

const CAMINO: EstadoPedido[] = ['pagado', 'en_preparacion', 'enviado', 'entregado'];

const T = textos(
  {
    pasos: {
      pagado: 'Nos ha llegado el pedido y el pago.',
      en_preparacion: 'Lo estamos tejiendo o preparando con mimo.',
      enviado: 'Ya va de camino.',
      entregado: 'Entregado. Esperamos que te encante.',
      cancelado: 'El pedido se ha cancelado.',
      reembolsado: 'Te hemos devuelto el importe.',
    },
    pendiente: ' (pendiente)',
    todavia: 'Todavía no.',
  },
  {
    en: {
      pasos: {
        pagado: "We've received your order and payment.",
        en_preparacion: "We're crocheting or preparing it with care.",
        enviado: "It's on its way.",
        entregado: 'Delivered. We hope you love it.',
        cancelado: 'The order has been cancelled.',
        reembolsado: "We've refunded the amount.",
      },
      pendiente: ' (pending)',
      todavia: 'Not yet.',
    },
    fr: {
      pasos: {
        pagado: 'Nous avons bien reçu la commande et le paiement.',
        en_preparacion: 'Nous la crochetons ou la préparons avec soin.',
        enviado: 'Elle est en route.',
        entregado: 'Livrée. Nous espérons qu’elle vous plaira.',
        cancelado: 'La commande a été annulée.',
        reembolsado: 'Nous vous avons remboursé le montant.',
      },
      pendiente: ' (en attente)',
      todavia: 'Pas encore.',
    },
    de: {
      pasos: {
        pagado: 'Bestellung und Zahlung sind bei uns eingegangen.',
        en_preparacion: 'Wir häkeln oder bereiten sie mit viel Liebe vor.',
        enviado: 'Sie ist unterwegs.',
        entregado: 'Zugestellt. Wir hoffen, sie gefällt Ihnen.',
        cancelado: 'Die Bestellung wurde storniert.',
        reembolsado: 'Wir haben Ihnen den Betrag erstattet.',
      },
      pendiente: ' (ausstehend)',
      todavia: 'Noch nicht.',
    },
  },
);

interface PropsSeguimiento {
  estado: EstadoPedido;
  eventos: { estado: EstadoPedido; creado_en: string }[];
}

/** Línea de hitos del pedido. Los que aún no han pasado se ven apagados;
 *  si se canceló o reembolsó, el camino acaba ahí. */
export async function Seguimiento({ estado, eventos }: PropsSeguimiento) {
  const idioma = await idiomaActual();
  const t = T[idioma];
  const fecha = (e: EstadoPedido) => eventos.findLast((x) => x.estado === e)?.creado_en;
  const torcido = estado === 'cancelado' || estado === 'reembolsado';
  const pasos = torcido
    ? [...CAMINO.filter((e) => fecha(e)), ...(estado === 'reembolsado' && fecha('cancelado') ? ['cancelado' as const] : []), estado]
    : CAMINO;
  const actual = pasos.indexOf(estado);

  return (
    <ol className="seguimiento">
      {pasos.map((paso, i) => {
        const cuando = fecha(paso);
        const clase = i < actual ? 'hecho' : i === actual ? (torcido ? 'ahora torcido' : 'ahora') : 'pendiente';
        return (
          <li key={paso} className={`seguimiento-paso ${clase}`} aria-current={i === actual ? 'step' : undefined}>
            <span className="seguimiento-bolita" aria-hidden="true">
              {i + 1}
            </span>
            <div>
              <p className="seguimiento-titulo">
                {ESTADOS_PEDIDO_T[idioma][paso]}
                {i > actual && <span className="oculto-vis">{t.pendiente}</span>}
              </p>
              <p className="mini">{i <= actual ? t.pasos[paso] : t.todavia}</p>
              {cuando && i <= actual && (
                <p className="mini-2">
                  <time dateTime={cuando}>{fechaHora(cuando, idioma)}</time>
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
