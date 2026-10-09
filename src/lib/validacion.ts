// Piezas de zod comunes a los formularios de la tienda, la cuenta y el
// panel, para que un mismo campo se valide igual en todos.

import { z } from 'zod';
import { textos, type Idioma } from '@/lib/i18n';

const T = textos(
  {
    correoLargo: 'Ese correo es demasiado largo.',
    correoMal: 'Ese correo no parece válido. Revisa que tenga @ y un dominio.',
  },
  {
    en: {
      correoLargo: 'That email address is too long.',
      correoMal: 'That email address doesn’t look right. Check it has an @ and a domain.',
    },
    fr: {
      correoLargo: 'Cette adresse e-mail est trop longue.',
      correoMal: 'Cette adresse e-mail ne semble pas valide. Vérifiez qu’elle contient un @ et un domaine.',
    },
    de: {
      correoLargo: 'Diese E-Mail-Adresse ist zu lang.',
      correoMal: 'Diese E-Mail-Adresse scheint nicht gültig zu sein. Prüfen Sie, ob sie ein @ und eine Domain enthält.',
    },
  },
);

/** Un campo ausente en el FormData llega como null: se trata como vacío. */
export const texto = () => z.preprocess((v) => (typeof v === 'string' ? v : ''), z.string().trim());

/** Una casilla marcada llega como «on»; sin marcar, no llega. */
export const casilla = () => z.preprocess((v) => v === 'on' || v === 'true', z.boolean());

/** Mismo patrón que las restricciones de correo de la base de datos. */
export const PATRON_CORREO = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Correo en minúsculas y sin espacios, con el mensaje para cuando falta. */
export const correo = (siFalta: string, idioma: Idioma = 'es') =>
  texto()
    .transform((v) => v.toLowerCase())
    .pipe(
      z
        .string()
        .min(1, siFalta)
        .max(254, T[idioma].correoLargo)
        .regex(PATRON_CORREO, T[idioma].correoMal),
    );
