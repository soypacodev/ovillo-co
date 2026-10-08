'use server';

import { z } from 'zod';
import { configuracionSupabase } from '@/lib/datos/entorno';
import { catalogo } from '@/lib/datos';
import { clientePublico } from '@/lib/datos/supabase/publico';
import { esquemaLinea } from '@/lib/pagos/esquema';
import { esRobot, leerCorreo } from './formulario';
import type { EstadoCorreo } from './tipos';

const esquemaPieza = z.object({ producto: esquemaLinea.shape.slug, variante: esquemaLinea.shape.variante });

const APUNTADO = 'Apuntado. Te escribimos en cuanto lo volvamos a tener.';

/** Aviso de reposición de una variante agotada. */
export async function pedirAvisoStock(previo: EstadoCorreo, datos: FormData): Promise<EstadoCorreo> {
  const intento = previo.intento + 1;
  const { correo, valido } = leerCorreo(datos);
  if (!valido) {
    return { estado: 'error', intento, correo, mensaje: 'Escribe un correo válido para poder avisarte.' };
  }
  if (esRobot(datos)) return { estado: 'ok', intento, mensaje: APUNTADO };

  const pieza = esquemaPieza.safeParse({ producto: datos.get('producto'), variante: datos.get('variante') });
  const producto = pieza.success ? await catalogo().producto(pieza.data.producto) : null;
  if (!pieza.success || !producto || !producto.variantes.some((v) => v.nombre === pieza.data.variante)) {
    return { estado: 'error', intento, correo, mensaje: 'No encontramos esa pieza. Recarga la página y vuelve a probar.' };
  }

  if (configuracionSupabase()) {
    const { error } = await clientePublico().rpc('pedir_aviso_stock', {
      p_producto: pieza.data.producto,
      p_variante: pieza.data.variante,
      p_email: correo,
    });
    if (error) {
      console.error('No se pudo guardar el aviso de reposición:', error.message);
      return { estado: 'error', intento, correo, mensaje: 'No hemos podido guardarlo ahora mismo. Prueba de nuevo en un rato.' };
    }
  }

  return { estado: 'ok', intento, mensaje: APUNTADO };
}
