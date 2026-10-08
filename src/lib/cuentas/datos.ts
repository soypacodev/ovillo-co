// Lecturas del área de cliente. Van con la sesión de quien mira, y además
// se filtran por su id: RLS deja a admin leer pedidos y direcciones de
// todo el mundo, y en «mis pedidos» solo deben salir los suyos.
import 'server-only';

import { z } from 'zod';
import { clienteServidor } from '@/lib/datos/supabase/servidor';
import { ESTADOS_PEDIDO } from '@/lib/panel/estados';
import type { Direccion } from './tipos';

const textoONulo = z.string().nullable();
const entero = z.number().int();

const resumenPedido = z.object({
  id: z.string(),
  numero: z.string(),
  estado: z.enum(ESTADOS_PEDIDO),
  creado_en: z.string(),
  total: entero,
  metodo_envio_nombre: z.string(),
  lineas: z.array(z.object({ nombre_producto: z.string(), cantidad: entero, foto_ruta: textoONulo })),
});
export type ResumenPedidoCuenta = z.infer<typeof resumenPedido>;

const pedidoCompleto = resumenPedido.extend({
  subtotal: entero,
  descuento_automatico: entero,
  descuento_cupon: entero,
  envio: entero,
  codigo_cupon: textoONulo,
  dias_confeccion: entero.nullable(),
  transportista: textoONulo,
  numero_seguimiento: textoONulo,
  pagado_en: textoONulo,
  enviado_en: textoONulo,
  entregado_en: textoONulo,
  cancelado_en: textoONulo,
  direccion_envio: z
    .object({
      destinatario: z.string().nullish(),
      linea1: z.string().nullish(),
      linea2: z.string().nullish(),
      ciudad: z.string().nullish(),
      provincia: z.string().nullish(),
      codigo_postal: z.string().nullish(),
    })
    .nullable(),
  lineas: z.array(
    z.object({
      producto_slug: z.string(),
      nombre_producto: z.string(),
      nombre_variante: z.string(),
      color: textoONulo,
      foto_ruta: textoONulo,
      precio_unitario: entero,
      cantidad: entero,
      descuento: entero,
      total: entero,
      personalizacion: textoONulo,
    }),
  ),
  eventos: z.array(z.object({ estado: z.enum(ESTADOS_PEDIDO), nota: textoONulo, creado_en: z.string() })),
});
export type PedidoCuenta = z.infer<typeof pedidoCompleto>;

/** Pedidos de la cuenta, del más reciente al más antiguo, con sus miniaturas. */
export async function misPedidos(usuarioId: string, limite = 50): Promise<ResumenPedidoCuenta[]> {
  const supabase = await clienteServidor();
  const { data, error } = await supabase
    .from('pedidos')
    .select('id, numero, estado, creado_en, total, metodo_envio_nombre, lineas:lineas_pedido(nombre_producto, cantidad, foto_ruta)')
    .eq('usuario_id', usuarioId)
    .order('creado_en', { ascending: false })
    .limit(limite);
  if (error) throw new Error(`No se pudieron leer tus pedidos: ${error.message}`);
  return z.array(resumenPedido).parse(data ?? []);
}

/** Un pedido de la cuenta por su número, con líneas y seguimiento; null si no es suyo. */
export async function miPedido(usuarioId: string, numero: string): Promise<PedidoCuenta | null> {
  const supabase = await clienteServidor();
  const { data, error } = await supabase
    .from('pedidos')
    .select(
      `id, numero, estado, creado_en, total, metodo_envio_nombre, subtotal, descuento_automatico, descuento_cupon,
       envio, codigo_cupon, dias_confeccion, transportista, numero_seguimiento, pagado_en, enviado_en, entregado_en,
       cancelado_en, direccion_envio,
       lineas:lineas_pedido(producto_slug, nombre_producto, nombre_variante, color, foto_ruta, precio_unitario,
         cantidad, descuento, total, personalizacion),
       eventos:eventos_pedido(estado, nota, creado_en)`,
    )
    .eq('usuario_id', usuarioId)
    .eq('numero', numero)
    .maybeSingle();
  if (error) throw new Error(`No se pudo leer el pedido: ${error.message}`);
  if (!data) return null;
  const pedido = pedidoCompleto.parse(data);
  pedido.eventos.sort((a, b) => a.creado_en.localeCompare(b.creado_en));
  return pedido;
}

const filaDireccion = z.object({
  id: z.string(),
  etiqueta: textoONulo,
  destinatario: z.string(),
  linea1: z.string(),
  linea2: textoONulo,
  ciudad: z.string(),
  provincia: z.string(),
  codigo_postal: z.string(),
  telefono: textoONulo,
  predeterminada: z.boolean(),
});

/** Direcciones de la cuenta, con la predeterminada primero. */
export async function misDirecciones(usuarioId: string): Promise<Direccion[]> {
  const supabase = await clienteServidor();
  const { data, error } = await supabase
    .from('direcciones')
    .select('id, etiqueta, destinatario, linea1, linea2, ciudad, provincia, codigo_postal, telefono, predeterminada')
    .eq('usuario_id', usuarioId)
    .order('predeterminada', { ascending: false })
    .order('creado_en');
  if (error) throw new Error(`No se pudieron leer tus direcciones: ${error.message}`);
  return z
    .array(filaDireccion)
    .parse(data ?? [])
    .map((d) => ({ ...d, etiqueta: d.etiqueta ?? '', linea2: d.linea2 ?? '', telefono: d.telefono ?? '' }));
}

/** Número de favoritos guardados en la cuenta (0 si falla la consulta). */
export async function cuantosFavoritos(usuarioId: string): Promise<number> {
  const supabase = await clienteServidor();
  const { count } = await supabase.from('favoritos').select('producto_id', { count: 'exact', head: true }).eq('usuario_id', usuarioId);
  return count ?? 0;
}
