// Cliente anónimo sin sesión ni cookies, para leer el catálogo público.
// Al no tocar cookies, las páginas que lo usan pueden seguir siendo
// estáticas o cacheadas.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { configuracionSupabase } from '../entorno';

let cliente: SupabaseClient | undefined;

/** Cliente anónimo compartido. Lanza si Supabase no está configurado. */
export function clientePublico(): SupabaseClient {
  if (cliente) return cliente;
  const config = configuracionSupabase();
  if (!config) throw new Error('Supabase no está configurado (faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY).');
  cliente = createClient(config.url, config.claveAnonima, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return cliente;
}
