import { NOMBRE_ESTADO_PEDIDO, type EstadoPedido } from '@/lib/panel/estados';
import { fechaHora } from '@/lib/fechas';

const CAMINO: EstadoPedido[] = ['pagado', 'en_preparacion', 'enviado', 'entregado'];

const TEXTOS: Record<EstadoPedido, string> = {
  pagado: 'Nos ha llegado el pedido y el pago.',
  en_preparacion: 'Lo estamos tejiendo o preparando con mimo.',
  enviado: 'Ya va de camino.',
  entregado: 'Entregado. Esperamos que te encante.',
  cancelado: 'El pedido se ha cancelado.',
  reembolsado: 'Te hemos devuelto el importe.',
};

interface PropsSeguimiento {
  estado: EstadoPedido;
  eventos: { estado: EstadoPedido; creado_en: string }[];
}

/** Línea de hitos del pedido. Los que aún no han pasado se ven apagados;
 *  si se canceló o reembolsó, el camino acaba ahí. */
export function Seguimiento({ estado, eventos }: PropsSeguimiento) {
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
                {NOMBRE_ESTADO_PEDIDO[paso]}
                {i > actual && <span className="oculto-vis"> (pendiente)</span>}
              </p>
              <p className="mini">{i <= actual ? TEXTOS[paso] : 'Todavía no.'}</p>
              {cuando && i <= actual && (
                <p className="mini-2">
                  <time dateTime={cuando}>{fechaHora(cuando)}</time>
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
