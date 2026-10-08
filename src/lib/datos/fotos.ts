import { configuracionSupabase } from './entorno';
import { urlFoto } from './supabase/mapeo';

/** URL que se puede pintar de una ruta de foto guardada (en public/ o en
 *  el bucket «productos»), haya o no Supabase. */
export function urlFotoGuardada(ruta: string | null | undefined): string | null {
  if (!ruta) return null;
  const config = configuracionSupabase();
  return config ? urlFoto(ruta, config.url) : ruta.startsWith('/') ? ruta : null;
}
