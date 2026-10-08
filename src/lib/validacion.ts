// Piezas de zod comunes a los formularios de la tienda, la cuenta y el
// panel, para que un mismo campo se valide igual en todos.

import { z } from 'zod';

/** Un campo ausente en el FormData llega como null: se trata como vacío. */
export const texto = () => z.preprocess((v) => (typeof v === 'string' ? v : ''), z.string().trim());

/** Una casilla marcada llega como «on»; sin marcar, no llega. */
export const casilla = () => z.preprocess((v) => v === 'on' || v === 'true', z.boolean());

/** Mismo patrón que los check de correo de la base de datos. */
export const PATRON_CORREO = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Correo en minúsculas y sin espacios, con el mensaje para cuando falta. */
export const correo = (siFalta: string) =>
  texto()
    .transform((v) => v.toLowerCase())
    .pipe(
      z
        .string()
        .min(1, siFalta)
        .max(254, 'Ese correo es demasiado largo.')
        .regex(PATRON_CORREO, 'Ese correo no parece válido. Revisa que tenga @ y un dominio.'),
    );
