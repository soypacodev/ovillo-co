// Cliente con el rol de servicio: se salta RLS. Solo para el servidor
// (webhook de Stripe, tareas internas) y nunca con datos sin validar.
import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { configuracionSupabase } from '../entorno';
import { claveServicioSupabase } from '../entorno-servidor';

/** Cliente nuevo con la clave de servicio. Lanza si falta la configuración o la clave. */
export function clienteServicio(): SupabaseClient {
  const config = configuracionSupabase();
  if (!config) throw new Error('Supabase no está configurado (falta NEXT_PUBLIC_SUPABASE_URL).');
  return createClient(config.url, claveServicioSupabase(), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
