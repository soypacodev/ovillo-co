// Elige dónde se recalcula el pedido: en la base de datos si hay
// Supabase, o con la semilla si la tienda funciona sin él.
import 'server-only';

import { configuracionSupabase } from '@/lib/datos/entorno';
import { clienteServicio } from '@/lib/datos/supabase/servicio';
import { calcularConCatalogo, calcularConSupabase, type EntradaCalculo } from './recalculo';
import type { PedidoCalculado } from './tipos';

export async function recalcularPedido(entrada: EntradaCalculo): Promise<PedidoCalculado> {
  const config = configuracionSupabase();
  // `calcular_pedido` solo lo puede ejecutar el rol de servicio.
  if (config) return calcularConSupabase(clienteServicio(), config.url, entrada);
  return calcularConCatalogo(entrada);
}
