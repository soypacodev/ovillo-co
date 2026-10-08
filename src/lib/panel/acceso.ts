// Quién puede ver el panel y quién puede cambiar algo en él. Es lógica
// pura (sin Supabase ni cookies) para poder probarla; la usan el layout,
// cada página y, sobre todo, cada acción de servidor antes de escribir.
// RLS repite la misma regla en la base de datos.

import type { RolCuenta } from '@/lib/cuentas/tipos';
import type { ModoPanel } from './fuente';

export interface AccesoPanel {
  modo: ModoPanel;
  rol: 'admin' | 'demo';
  soloLectura: boolean;
}

export const MOTIVO_SOLO_LECTURA = 'Panel de demostración: puedes mirar todo, los cambios no se guardan.';

/**
 * Sin base de datos el panel se abre a cualquiera en modo local de solo
 * lectura (los datos son inventados). Con base de datos, solo a las
 * cuentas admin y demo; null para el resto.
 */
export function accesoPanel(rol: RolCuenta | null, hayBaseDeDatos: boolean): AccesoPanel | null {
  if (!hayBaseDeDatos) return { modo: 'local', rol: 'demo', soloLectura: true };
  if (rol === 'admin') return { modo: 'supabase', rol: 'admin', soloLectura: false };
  if (rol === 'demo') return { modo: 'supabase', rol: 'demo', soloLectura: true };
  return null;
}

export type PermisoEscritura = { ok: true } | { ok: false; motivo: string };

/** Solo admin con base de datos escribe. */
export function permisoEscritura(acceso: AccesoPanel | null): PermisoEscritura {
  if (!acceso) return { ok: false, motivo: 'Esta zona es solo para el taller. Entra con la cuenta de administración.' };
  if (acceso.soloLectura || acceso.rol !== 'admin') return { ok: false, motivo: MOTIVO_SOLO_LECTURA };
  return { ok: true };
}
