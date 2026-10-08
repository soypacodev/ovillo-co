// Cliente con la sesión de quien hace la petición, para componentes de
// servidor, funciones de servidor y route handlers. Se crea uno nuevo en
// cada petición: compartirlo mezclaría sesiones de personas distintas.
import 'server-only';

import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { configuracionSupabase } from '../entorno';

export async function clienteServidor(): Promise<SupabaseClient> {
  const config = configuracionSupabase();
  if (!config) throw new Error('Supabase no está configurado (faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY).');
  const almacen = await cookies();

  return createServerClient(config.url, config.claveAnonima, {
    cookies: {
      getAll: () => almacen.getAll(),
      setAll: (nuevas) => {
        try {
          for (const { name, value, options } of nuevas) almacen.set(name, value, options);
        } catch {
          // Un componente de servidor no puede escribir cookies; la sesión
          // la renueva el proxy o la siguiente función de servidor.
        }
      },
    },
  });
}
