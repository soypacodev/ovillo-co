'use server';

import { z } from 'zod';
import { configuracionSupabase } from '@/lib/datos/entorno';
import { textos } from '@/lib/i18n';
import { idiomaActual } from '@/lib/i18n/servidor';
import { catalogo } from '@/lib/datos';
import { clientePublico } from '@/lib/datos/supabase/publico';
import { esquemaLinea } from '@/lib/pagos/esquema';
import { esRobot, leerCorreo } from './formulario';
import type { EstadoCorreo } from './tipos';

const esquemaPieza = z.object({ producto: esquemaLinea.shape.slug, variante: esquemaLinea.shape.variante });

const T = textos(
  {
    apuntado: 'Apuntado. Te escribimos en cuanto lo volvamos a tener.',
    correo: 'Escribe un correo válido para poder avisarte.',
    noExiste: 'No encontramos esa pieza. Recarga la página y vuelve a probar.',
    fallo: 'No hemos podido guardarlo ahora mismo. Prueba de nuevo en un rato.',
  },
  {
    en: {
      apuntado: 'Noted. We’ll email you as soon as it’s back in stock.',
      correo: 'Enter a valid email address so we can let you know.',
      noExiste: 'We can’t find that piece. Reload the page and try again.',
      fallo: 'We couldn’t save that just now. Please try again in a little while.',
    },
    fr: {
      apuntado: 'C’est noté. Nous vous écrivons dès que la pièce est de nouveau disponible.',
      correo: 'Indiquez une adresse e-mail valide pour que nous puissions vous prévenir.',
      noExiste: 'Nous ne trouvons pas cette pièce. Rechargez la page et réessayez.',
      fallo: 'Nous n’avons pas pu l’enregistrer pour le moment. Réessayez un peu plus tard.',
    },
    de: {
      apuntado: 'Vorgemerkt. Wir schreiben Ihnen, sobald das Stück wieder da ist.',
      correo: 'Geben Sie eine gültige E-Mail-Adresse ein, damit wir Sie benachrichtigen können.',
      noExiste: 'Dieses Stück finden wir nicht. Laden Sie die Seite neu und versuchen Sie es noch einmal.',
      fallo: 'Das konnten wir gerade nicht speichern. Bitte versuchen Sie es später noch einmal.',
    },
  },
);

/** Aviso de reposición de una variante agotada. */
export async function pedirAvisoStock(previo: EstadoCorreo, datos: FormData): Promise<EstadoCorreo> {
  const intento = previo.intento + 1;
  const t = T[await idiomaActual()];
  const { correo, valido } = leerCorreo(datos);
  if (!valido) {
    return { estado: 'error', intento, correo, mensaje: t.correo };
  }
  if (esRobot(datos)) return { estado: 'ok', intento, mensaje: t.apuntado };

  const pieza = esquemaPieza.safeParse({ producto: datos.get('producto'), variante: datos.get('variante') });
  const producto = pieza.success ? await catalogo().producto(pieza.data.producto) : null;
  if (!pieza.success || !producto || !producto.variantes.some((v) => v.nombre === pieza.data.variante)) {
    return { estado: 'error', intento, correo, mensaje: t.noExiste };
  }

  if (configuracionSupabase()) {
    const { error } = await clientePublico().rpc('pedir_aviso_stock', {
      p_producto: pieza.data.producto,
      p_variante: pieza.data.variante,
      p_email: correo,
    });
    if (error) {
      console.error('No se pudo guardar el aviso de reposición:', error.message);
      return { estado: 'error', intento, correo, mensaje: t.fallo };
    }
  }

  return { estado: 'ok', intento, mensaje: t.apuntado };
}
