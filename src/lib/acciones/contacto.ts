'use server';

import { headers } from 'next/headers';
import { textos } from '@/lib/i18n';
import { idiomaActual } from '@/lib/i18n/servidor';
import { usuarioActual } from '@/lib/cuentas/sesion';
import { configuracionSupabase } from '@/lib/datos/entorno';
import { clienteServicio } from '@/lib/datos/supabase/servicio';
import {
  MOTIVOS_CONTACTO,
  avisoRevisar,
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

const T = textos(
  {
    muchos: 'Nos han llegado varios mensajes seguidos desde tu conexión. Espera unos minutos y vuelve a probar.',
    fallo: 'No hemos podido guardar tu mensaje por un problema nuestro. Vuelve a intentarlo en un momento.',
  },
  {
    en: {
      muchos: 'We’ve had several messages in a row from your connection. Please wait a few minutes and try again.',
      fallo: 'We couldn’t save your message because of a problem on our side. Please try again in a moment.',
    },
    fr: {
      muchos: 'Nous avons reçu plusieurs messages d’affilée depuis votre connexion. Patientez quelques minutes et réessayez.',
      fallo: 'Nous n’avons pas pu enregistrer votre message à cause d’un problème de notre côté. Réessayez dans un instant.',
    },
    de: {
      muchos: 'Von Ihrer Verbindung kamen mehrere Nachrichten kurz hintereinander. Bitte warten Sie ein paar Minuten und versuchen Sie es erneut.',
      fallo: 'Ihre Nachricht konnte wegen eines Problems bei uns nicht gespeichert werden. Bitte versuchen Sie es gleich noch einmal.',
    },
  },
);

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

/**
 * Acción del formulario de contacto: descarta robots, valida, aplica el
 * límite de envíos y guarda el mensaje. Sin base de datos responde como
 * enviado, con `guardado: false`.
 */
export async function enviarContacto(_previo: EstadoContacto, formulario: FormData): Promise<EstadoContacto> {
  const crudo = formularioAObjeto(formulario);

  if (esRobot(formulario)) return { estado: 'enviado', guardado: false };

  const idioma = await idiomaActual();
  const t = T[idioma];
  const valores = valoresDeTexto<CampoContacto>(crudo);
  const resultado = esquemaContacto(idioma).safeParse(crudo);
  if (!resultado.success) {
    const errores = erroresPorCampo<CampoContacto>(resultado.error);
    return {
      estado: 'error',
      mensaje: avisoRevisar(Object.keys(errores).length, idioma),
      errores,
      valores,
    };
  }

  if (!limitador.permitir(origenPeticion(await headers()))) {
    return {
      estado: 'error',
      mensaje: t.muchos,
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
      mensaje: t.fallo,
      errores: {},
      valores,
    };
  }
  return { estado: 'enviado', guardado: true };
}
