// Punto de entrada del acceso a datos. El origen se elige solo: con
// NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY se lee de
// Supabase; sin ellas, de la semilla local, y la tienda funciona igual.

import { configuracionSupabase } from './entorno';
import type { FuenteCatalogo } from './fuente';
import { crearFuenteSupabase } from './fuente-supabase';
import { fuenteSemilla } from './fuente-semilla';
import { clientePublico } from './supabase/publico';

let fuente: FuenteCatalogo | undefined;

/** Fuente del catálogo de esta instalación; se elige una vez y se reutiliza. */
export function catalogo(): FuenteCatalogo {
  if (fuente) return fuente;
  const config = configuracionSupabase();
  fuente = config ? crearFuenteSupabase(clientePublico(), config.url) : fuenteSemilla;
  return fuente;
}

export type { FuenteCatalogo } from './fuente';
export { enOferta, leerFiltros, stockTotal, type FiltrosCatalogo, type ParametrosBusqueda } from './filtros';
