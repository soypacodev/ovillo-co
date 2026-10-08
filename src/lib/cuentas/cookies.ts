// Comprobación barata de si hay una sesión: mira si existe la cookie de
// Supabase, sin validarla. Sirve para decidir a dónde apunta un enlace o
// si merece la pena refrescar la sesión; nunca para dar acceso a nada
// (eso lo decide getUser() en el servidor y RLS en la base de datos).

import { cookies } from 'next/headers';
import { configuracionSupabase } from '@/lib/datos/entorno';

/** «sb-<proyecto>-auth-token», a veces troceada en «.0», «.1»… */
const COOKIE_SESION = /^sb-.+-auth-token(\.\d+)?$/;

export function esCookieDeSesion(nombre: string): boolean {
  return COOKIE_SESION.test(nombre);
}

/** true si hay cookie de sesión no vacía. Es solo una pista: no la valida. */
export async function haySesionProbable(): Promise<boolean> {
  if (!configuracionSupabase()) return false;
  const almacen = await cookies();
  return almacen.getAll().some((c) => esCookieDeSesion(c.name) && c.value !== '');
}
