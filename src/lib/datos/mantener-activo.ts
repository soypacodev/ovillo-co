// Mantiene despierto el proyecto de Supabase del plan gratuito, que se pausa
// tras una semana sin peticiones a la base de datos. Un cron de Vercel llama
// una vez al día a /api/mantener-activo y esta función hace una única consulta
// de solo lectura al catálogo público. No escribe nada ni crea datos.
//
// Sin red ni base de datos propias: recibe las dependencias como parámetro y se
// prueba con dobles, igual que el webhook de Stripe.

import { createHash, timingSafeEqual } from 'node:crypto';

/** Longitud mínima del secreto del cron: uno corto se adivina con facilidad. */
export const LONGITUD_MINIMA_SECRETO = 16;

export interface DependenciasMantenerActivo {
  /** Valor de CRON_SECRET. Vercel lo envía como «Authorization: Bearer …». */
  secreto: string | undefined;
  /** false en modo demostración sin Supabase: no hay nada que mantener despierto. */
  hayBaseDeDatos: boolean;
  /** Una consulta de solo lectura. Devuelve el error de PostgREST, si lo hay. */
  consultar: () => Promise<{ error: { message: string } | null }>;
}

export type CuerpoMantenerActivo =
  | { ok: true; consulta: boolean }
  | { ok: false; error: string };

export interface RespuestaMantenerActivo {
  estado: 200 | 401 | 502 | 503;
  cuerpo: CuerpoMantenerActivo;
}

/** Compara en tiempo constante: la huella iguala longitudes y no filtra cuál era la del secreto. */
function coincide(recibido: string, esperado: string): boolean {
  const huella = (texto: string) => createHash('sha256').update(texto).digest();
  return timingSafeEqual(huella(recibido), huella(esperado));
}

export async function mantenerActivo(
  autorizacion: string | null,
  dependencias: DependenciasMantenerActivo,
): Promise<RespuestaMantenerActivo> {
  const { secreto, hayBaseDeDatos, consultar } = dependencias;

  // Sin secreto válido la ruta se cierra del todo: nadie de fuera puede
  // provocar consultas, y el fallo queda a la vista en los registros.
  if (!secreto || secreto.length < LONGITUD_MINIMA_SECRETO) {
    return {
      estado: 503,
      cuerpo: { ok: false, error: `Falta CRON_SECRET en el entorno, o tiene menos de ${LONGITUD_MINIMA_SECRETO} caracteres.` },
    };
  }

  if (!autorizacion || !coincide(autorizacion, `Bearer ${secreto}`)) {
    return { estado: 401, cuerpo: { ok: false, error: 'No autorizado.' } };
  }

  if (!hayBaseDeDatos) return { estado: 200, cuerpo: { ok: true, consulta: false } };

  const { error } = await consultar();
  if (error) return { estado: 502, cuerpo: { ok: false, error: `La consulta a Supabase falló: ${error.message}` } };
  return { estado: 200, cuerpo: { ok: true, consulta: true } };
}
