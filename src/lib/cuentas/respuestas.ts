// Respuestas comunes de las acciones de la cuenta: el estado que pintan
// los formularios y la validación con zod que lo produce.
import 'server-only';

import type { z } from 'zod';
import { erroresPorCampo, formularioAObjeto, valoresDeTexto } from '@/lib/acciones/esquemas';
import { textos, type Idioma } from '@/lib/i18n';
import type { EstadoAccion } from './tipos';

/** Mensajes comunes de las acciones de la cuenta. */
export const RESPUESTAS = textos(
  {
    sinBd: 'En esta demostración las cuentas necesitan conectar la base de datos.',
    fallo: 'Algo ha fallado de nuestro lado. Vuelve a intentarlo en un momento.',
    sesionCaducada: 'Tu sesión ha caducado. Vuelve a entrar.',
    revisar: (n: number) => (n === 1 ? 'Hay un campo que revisar.' : `Hay ${n} campos que revisar.`),
  },
  {
    en: {
      sinBd: 'In this demo, accounts need the database to be connected.',
      fallo: 'Something went wrong on our side. Please try again in a moment.',
      sesionCaducada: 'Your session has expired. Please sign in again.',
      revisar: (n: number) => (n === 1 ? 'There is one field to check.' : `There are ${n} fields to check.`),
    },
    fr: {
      sinBd: 'Dans cette démonstration, les comptes ont besoin que la base de données soit connectée.',
      fallo: 'Un problème est survenu de notre côté. Veuillez réessayer dans un instant.',
      sesionCaducada: 'Votre session a expiré. Veuillez vous reconnecter.',
      revisar: (n: number) => (n === 1 ? 'Un champ est à vérifier.' : `${n} champs sont à vérifier.`),
    },
    de: {
      sinBd: 'In dieser Demo brauchen die Konten eine verbundene Datenbank.',
      fallo: 'Bei uns ist etwas schiefgelaufen. Bitte versuchen Sie es gleich noch einmal.',
      sesionCaducada: 'Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.',
      revisar: (n: number) => (n === 1 ? 'Ein Feld muss noch geprüft werden.' : `${n} Felder müssen noch geprüft werden.`),
    },
  },
);

let intentos = 0;
/** Estado de éxito. `intento` cambia en cada respuesta para que el aviso vuelva a recibir el foco. */
export const ok = (mensaje: string): EstadoAccion => ({ estado: 'ok', mensaje, intento: ++intentos });
/** Estado de error con mensajes por campo y lo escrito, para no perderlo. */
export const error = <C extends string>(
  mensaje: string,
  errores: Partial<Record<C, string>> = {},
  valores: Partial<Record<C, string>> = {},
): EstadoAccion<C> => ({ estado: 'error', mensaje, errores, valores, intento: ++intentos });

/** Valida el formulario y devuelve los datos o el estado de error listo para pintar. */
export function validar<T extends z.ZodType, C extends string>(
  esquema: T,
  formulario: FormData,
  idioma: Idioma,
): { datos: z.output<T> } | { fallo: EstadoAccion<C> } {
  const crudo = formularioAObjeto(formulario);
  const r = esquema.safeParse(crudo);
  if (r.success) return { datos: r.data };
  const errores = erroresPorCampo<C>(r.error);
  const n = Object.keys(errores).length;
  // Las contraseñas no vuelven nunca al formulario.
  const valores = valoresDeTexto<C>(crudo);
  for (const campo of ['contrasena', 'repetida'] as C[]) delete valores[campo];
  return { fallo: error(RESPUESTAS[idioma].revisar(n), errores, valores) };
}
