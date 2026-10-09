// Textos del pedido en el idioma de la clienta. El recálculo trabaja en
// español porque los nombres de variante son la clave en Stripe y en la
// base de datos; aquí solo se cambian los nombres que ve ella. Importes,
// slugs y variantes no se tocan.

import { catalogo, type FuenteCatalogo } from '@/lib/datos';
import type { Idioma } from '@/lib/i18n';
import type { PedidoCalculado } from './tipos';

/** El mismo pedido con los nombres de las piezas, sus variantes y el envío traducidos. */
export async function localizarPedido(
  pedido: PedidoCalculado,
  idioma: Idioma,
  fuente: FuenteCatalogo = catalogo(idioma),
): Promise<PedidoCalculado> {
  if (idioma === 'es') return pedido;
  const slugs = [...new Set(pedido.lineas.map((l) => l.slug))];
  const [productos, metodos] = await Promise.all([
    Promise.all(slugs.map((slug) => fuente.producto(slug))),
    fuente.metodosEnvio(),
  ]);
  const porSlug = new Map(productos.flatMap((p) => (p ? [[p.slug, p] as const] : [])));
  const metodo = metodos.find((m) => m.id === pedido.metodoEnvio.id);

  return {
    ...pedido,
    lineas: pedido.lineas.map((l) => {
      const producto = porSlug.get(l.slug);
      const rotulo = producto?.variantes.find((v) => v.nombre === l.variante)?.rotulo;
      return { ...l, nombre: producto?.nombre ?? l.nombre, ...(rotulo && { rotulo }) };
    }),
    metodoEnvio: { ...pedido.metodoEnvio, nombre: metodo?.nombre ?? pedido.metodoEnvio.nombre },
  };
}
