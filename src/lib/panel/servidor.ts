// Entrada al panel desde páginas y acciones. Cada página lo llama (no basta
// con el layout: al navegar entre páginas el layout no se vuelve a pintar)
// y cada acción vuelve a comprobar el rol antes de escribir.
import 'server-only';

import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';
import { conSiguiente } from '@/lib/cuentas/redireccion';
import { perfilActual } from '@/lib/cuentas/sesion';
import { configuracionSupabase } from '@/lib/datos/entorno';
import { clienteServidor } from '@/lib/datos/supabase/servidor';
import { rutas } from '@/lib/rutas';
import { accesoPanel, permisoEscritura, type AccesoPanel, type PermisoEscritura } from './acceso';
import type { FuentePanel } from './fuente';
import { crearFuenteLocal } from './fuente-local';
import { crearFuenteSupabase } from './fuente-supabase';

const fuenteLocal = crearFuenteLocal();
const ACCESO_LOCAL: AccesoPanel = { modo: 'local', rol: 'demo', soloLectura: true };

export type ResultadoAccesoPanel =
  | { tipo: 'ok'; acceso: AccesoPanel; fuente: FuentePanel; nombre: string }
  /** Con sesión pero sin rol de panel (una clienta, por ejemplo). */
  | { tipo: 'prohibido' };

const accesoActual = cache(async (): Promise<AccesoPanel | null> => {
  const config = configuracionSupabase();
  if (!config) return ACCESO_LOCAL;
  const perfil = await perfilActual();
  return perfil ? accesoPanel(perfil.rol, true) : null;
});

/** Para páginas y layout del panel: sin sesión lleva a entrar. */
export const entrarAlPanel = cache(async (ruta: string = rutas.panel): Promise<ResultadoAccesoPanel> => {
  const config = configuracionSupabase();
  if (!config) return { tipo: 'ok', acceso: ACCESO_LOCAL, fuente: fuenteLocal, nombre: 'Demostración' };

  const perfil = await perfilActual();
  if (!perfil) redirect(conSiguiente(rutas.entrar, ruta));
  const acceso = accesoPanel(perfil.rol, true);
  if (!acceso) return { tipo: 'prohibido' };
  const bd = await clienteServidor();
  return {
    tipo: 'ok',
    acceso,
    fuente: crearFuenteSupabase(bd, config.url),
    nombre: acceso.rol === 'demo' ? 'Demostración' : perfil.nombre || perfil.email,
  };
});

/** Atajo para las páginas: devuelve acceso y fuente, o corta si quien mira
 *  no tiene rol de panel (el layout ya le explica por qué no puede entrar). */
export async function panel(ruta: string): Promise<{ acceso: AccesoPanel; fuente: FuentePanel }> {
  const r = await entrarAlPanel(ruta);
  if (r.tipo !== 'ok') notFound();
  return { acceso: r.acceso, fuente: r.fuente };
}

/** Para las acciones de escritura: el rol se mira aquí, en el servidor,
 *  con la sesión de la petición, aunque el botón ya estuviera desactivado. */
export async function permisoParaEscribir(): Promise<PermisoEscritura> {
  return permisoEscritura(await accesoActual());
}
