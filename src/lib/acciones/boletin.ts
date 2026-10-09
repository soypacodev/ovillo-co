'use server';

import { configuracionSupabase } from '@/lib/datos/entorno';
import { textos } from '@/lib/i18n';
import { idiomaActual } from '@/lib/i18n/servidor';
import { clientePublico } from '@/lib/datos/supabase/publico';
import { esRobot, leerCorreo } from './formulario';
import type { EstadoCorreo } from './tipos';

const T = textos(
  {
    apuntada: 'Hecho. Te escribiremos cuando haya piezas nuevas, como mucho una vez al mes.',
    incompleto: 'Ese correo no parece completo. Revisa que lleve @ y un dominio.',
    falta: 'Escribe tu correo para apuntarte.',
    fallo: 'No hemos podido apuntarte ahora mismo. Prueba de nuevo en un rato.',
  },
  {
    en: {
      apuntada: 'Done. We’ll write when there are new pieces, once a month at most.',
      incompleto: 'That email address doesn’t look complete. Check it has an @ and a domain.',
      falta: 'Enter your email address to sign up.',
      fallo: 'We couldn’t sign you up just now. Please try again in a little while.',
    },
    fr: {
      apuntada: 'C’est fait. Nous vous écrirons quand il y aura de nouvelles pièces, une fois par mois au plus.',
      incompleto: 'Cette adresse e-mail semble incomplète. Vérifiez qu’elle contient un @ et un domaine.',
      falta: 'Indiquez votre adresse e-mail pour vous inscrire.',
      fallo: 'Nous n’avons pas pu vous inscrire pour le moment. Réessayez un peu plus tard.',
    },
    de: {
      apuntada: 'Erledigt. Wir schreiben Ihnen, wenn es neue Stücke gibt – höchstens einmal im Monat.',
      incompleto: 'Diese E-Mail-Adresse scheint unvollständig zu sein. Prüfen Sie, ob sie ein @ und eine Domain enthält.',
      falta: 'Geben Sie Ihre E-Mail-Adresse ein, um sich anzumelden.',
      fallo: 'Die Anmeldung hat gerade nicht geklappt. Bitte versuchen Sie es später noch einmal.',
    },
  },
);

/**
 * Alta en el boletín. La respuesta es la misma tanto si el correo ya
 * estaba apuntado como si no, para no revelar quién está en la lista.
 */
export async function suscribirBoletin(previo: EstadoCorreo, datos: FormData): Promise<EstadoCorreo> {
  const intento = previo.intento + 1;
  const t = T[await idiomaActual()];
  const { correo, valido } = leerCorreo(datos);

  if (!valido) {
    return {
      estado: 'error',
      intento,
      correo,
      mensaje: correo ? t.incompleto : t.falta,
    };
  }
  if (esRobot(datos)) return { estado: 'ok', intento, mensaje: t.apuntada };

  // Sin base de datos (demostración local) se valida igual y se responde igual.
  if (configuracionSupabase()) {
    const { error } = await clientePublico().rpc('suscribir_boletin', { p_email: correo, p_origen: 'portada' });
    if (error) {
      if (error.message.includes('EMAIL_NO_VALIDO')) {
        return { estado: 'error', intento, correo, mensaje: t.incompleto };
      }
      console.error('No se pudo guardar la suscripción al boletín:', error.message);
      return { estado: 'error', intento, correo, mensaje: t.fallo };
    }
  }

  return { estado: 'ok', intento, mensaje: t.apuntada };
}
