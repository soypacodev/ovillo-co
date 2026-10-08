'use server';

import { configuracionSupabase } from '@/lib/datos/entorno';
import { clientePublico } from '@/lib/datos/supabase/publico';
import { esRobot, leerCorreo } from './formulario';
import type { EstadoCorreo } from './tipos';

const APUNTADA = 'Hecho. Te escribiremos cuando haya piezas nuevas, como mucho una vez al mes.';

/**
 * Alta en el boletín. La respuesta es la misma tanto si el correo ya
 * estaba apuntado como si no, para no revelar quién está en la lista.
 */
export async function suscribirBoletin(previo: EstadoCorreo, datos: FormData): Promise<EstadoCorreo> {
  const intento = previo.intento + 1;
  const { correo, valido } = leerCorreo(datos);

  if (!valido) {
    return {
      estado: 'error',
      intento,
      correo,
      mensaje: correo ? 'Ese correo no parece completo. Revisa que lleve @ y un dominio.' : 'Escribe tu correo para apuntarte.',
    };
  }
  if (esRobot(datos)) return { estado: 'ok', intento, mensaje: APUNTADA };

  // Sin base de datos (demostración local) se valida igual y se responde igual.
  if (configuracionSupabase()) {
    const { error } = await clientePublico().rpc('suscribir_boletin', { p_email: correo, p_origen: 'portada' });
    if (error) {
      if (error.message.includes('EMAIL_NO_VALIDO')) {
        return { estado: 'error', intento, correo, mensaje: 'Ese correo no parece completo. Revisa que lleve @ y un dominio.' };
      }
      console.error('No se pudo guardar la suscripción al boletín:', error.message);
      return { estado: 'error', intento, correo, mensaje: 'No hemos podido apuntarte ahora mismo. Prueba de nuevo en un rato.' };
    }
  }

  return { estado: 'ok', intento, mensaje: APUNTADA };
}
