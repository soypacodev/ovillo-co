import { tonoEstado } from '@/lib/panel/estados';

/** Estado de un pedido, encargo, mensaje o producto, con su color. El
 *  texto siempre dice el estado: el color solo acompaña. */
export function PastillaEstado({ estado, texto }: { estado: string; texto: string }) {
  return <span className={`pastilla estado estado-${tonoEstado(estado)}`}>{texto}</span>;
}
