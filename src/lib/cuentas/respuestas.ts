// Respuestas comunes de las acciones de la cuenta: el estado que pintan
// los formularios y la validación con zod que lo produce.
import 'server-only';

import type { z } from 'zod';
import { erroresPorCampo, formularioAObjeto, valoresDeTexto } from '@/lib/acciones/esquemas';
import type { EstadoAccion } from './tipos';

export const SIN_BD = 'En esta demostración las cuentas necesitan conectar la base de datos.';
export const FALLO = 'Algo ha fallado de nuestro lado. Vuelve a intentarlo en un momento.';

let intentos = 0;
export const ok = (mensaje: string): EstadoAccion => ({ estado: 'ok', mensaje, intento: ++intentos });
export const error = <C extends string>(
  mensaje: string,
  errores: Partial<Record<C, string>> = {},
  valores: Partial<Record<C, string>> = {},
): EstadoAccion<C> => ({ estado: 'error', mensaje, errores, valores, intento: ++intentos });

/** Valida el formulario y devuelve los datos o el estado de error listo para pintar. */
export function validar<T extends z.ZodType, C extends string>(
  esquema: T,
  formulario: FormData,
): { datos: z.output<T> } | { fallo: EstadoAccion<C> } {
  const crudo = formularioAObjeto(formulario);
  const r = esquema.safeParse(crudo);
  if (r.success) return { datos: r.data };
  const errores = erroresPorCampo<C>(r.error);
  const n = Object.keys(errores).length;
  // Las contraseñas no vuelven nunca al formulario.
  const valores = valoresDeTexto<C>(crudo);
  for (const campo of ['contrasena', 'repetida'] as C[]) delete valores[campo];
  return { fallo: error(n === 1 ? 'Hay un campo que revisar.' : `Hay ${n} campos que revisar.`, errores, valores) };
}
