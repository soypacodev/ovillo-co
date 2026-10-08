'use server';

import { headers } from 'next/headers';
import { usuarioActual } from '@/lib/cuentas/sesion';
import { configuracionSupabase } from '@/lib/datos/entorno';
import { clienteServicio } from '@/lib/datos/supabase/servicio';
import {
  MOTIVOS_CONTACTO,
  erroresPorCampo,
  esquemaContacto,
  formularioAObjeto,
  valoresDeTexto,
  type CampoContacto,
  type DatosContacto,
} from './esquemas';
import { esRobot } from './formulario';
import { crearLimitador, origenPeticion } from './limite';
import type { EstadoFormulario } from './tipos';

export type EstadoContacto = EstadoFormulario<CampoContacto>;

const limitador = crearLimitador({ maximo: 5, ventana: 10 * 60 * 1000 });

/**
 * Guarda el mensaje con la función registrar_mensaje_contacto(), que solo
 * puede llamar el rol de servicio: así nadie se salta el límite de envíos
 * ni el campo trampa escribiendo directamente en la API de Supabase.
 */
async function guardar(datos: DatosContacto): Promise<boolean> {
  const usuario = await usuarioActual();
  const { error } = await clienteServicio().rpc('registrar_mensaje_contacto', {
    p_motivo: MOTIVOS_CONTACTO[datos.motivo],
    p_nombre: datos.nombre,
    p_email: datos.correo,
    p_mensaje: datos.mensaje,
    p_acepta: datos.acepta,
    p_pedido: datos.pedido || null,
    p_usuario: usuario?.id ?? null,
  });
  if (error) {
    console.error('No se ha podido guardar un mensaje de contacto:', error.code, error.message);
    return false;
  }
  return true;
}

export async function enviarContacto(_previo: EstadoContacto, formulario: FormData): Promise<EstadoContacto> {
  const crudo = formularioAObjeto(formulario);

  if (esRobot(formulario)) return { estado: 'enviado', guardado: false };

  const valores = valoresDeTexto<CampoContacto>(crudo);
  const resultado = esquemaContacto.safeParse(crudo);
  if (!resultado.success) {
    const errores = erroresPorCampo<CampoContacto>(resultado.error);
    const n = Object.keys(errores).length;
    return {
      estado: 'error',
      mensaje: n === 1 ? 'Hay un campo que revisar.' : `Hay ${n} campos que revisar.`,
      errores,
      valores,
    };
  }

  if (!limitador.permitir(origenPeticion(await headers()))) {
    return {
      estado: 'error',
      mensaje: 'Nos han llegado varios mensajes seguidos desde tu conexión. Espera unos minutos y vuelve a probar.',
      errores: {},
      valores,
    };
  }

  // Sin base de datos el mensaje se valida entero, pero no hay bandeja en
  // la que dejarlo.
  if (!configuracionSupabase()) return { estado: 'enviado', guardado: false };

  const guardado = await guardar(resultado.data).catch((e: unknown) => {
    console.error('No se ha podido guardar un mensaje de contacto:', e instanceof Error ? e.message : e);
    return false;
  });
  if (!guardado) {
    return {
      estado: 'error',
      mensaje: 'No hemos podido guardar tu mensaje por un problema nuestro. Vuelve a intentarlo en un momento.',
      errores: {},
      valores,
    };
  }
  return { estado: 'enviado', guardado: true };
}
