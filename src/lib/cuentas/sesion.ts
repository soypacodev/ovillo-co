// Quién está pidiendo la página. Se valida siempre con getUser(), que
// pregunta a Supabase Auth: la cookie por sí sola la puede fabricar
// cualquiera. cache() hace que layout y página compartan una sola consulta
// por petición.
import 'server-only';

import { redirect } from 'next/navigation';
import { cache } from 'react';
import { configuracionSupabase } from '@/lib/datos/entorno';
import { clienteServidor } from '@/lib/datos/supabase/servidor';
import { rutas } from '@/lib/rutas';
import { conSiguiente } from './redireccion';
import type { Perfil, RolCuenta } from './tipos';

export interface Usuario {
  id: string;
  email: string;
}

export const usuarioActual = cache(async (): Promise<Usuario | null> => {
  if (!configuracionSupabase()) return null;
  const supabase = await clienteServidor();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? '' };
});

const ROLES: readonly RolCuenta[] = ['cliente', 'admin', 'demo'];

export const perfilActual = cache(async (): Promise<Perfil | null> => {
  const usuario = await usuarioActual();
  if (!usuario) return null;
  const supabase = await clienteServidor();
  const { data } = await supabase
    .from('perfiles')
    .select('rol, nombre, telefono, acepta_boletin')
    .eq('id', usuario.id)
    .maybeSingle();
  const rol = ROLES.find((r) => r === data?.rol) ?? 'cliente';
  return {
    ...usuario,
    rol,
    nombre: typeof data?.nombre === 'string' ? data.nombre : '',
    telefono: typeof data?.telefono === 'string' ? data.telefono : '',
    aceptaBoletin: data?.acepta_boletin === true,
  };
});

/**
 * Para las páginas de la cuenta: null si la tienda no tiene base de datos
 * (la página enseña entonces el aviso de la demostración); si la hay y no
 * hay sesión, lleva a entrar y vuelve después a `ruta`.
 */
export async function exigirPerfil(ruta: string): Promise<Perfil | null> {
  if (!configuracionSupabase()) return null;
  const perfil = await perfilActual();
  if (!perfil) redirect(conSiguiente(rutas.entrar, ruta));
  return perfil;
}
