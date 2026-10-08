'use server';

// Entrar, crear la cuenta, recuperar la contraseña y salir. Todo pasa por
// Supabase Auth con la sesión en cookies. Los mensajes no revelan si un
// correo tiene cuenta o no.

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { crearLimitador, origenPeticion } from '@/lib/acciones/limite';
import { configuracionSupabase } from '@/lib/datos/entorno';
import { clientePublico } from '@/lib/datos/supabase/publico';
import { clienteServidor } from '@/lib/datos/supabase/servidor';
import { origenSitio } from '@/lib/origen';
import { rutas } from '@/lib/rutas';
import { esquemaEnlace, esquemaEntrar, esquemaNuevaContrasena, esquemaRecuperar, esquemaRegistro } from './esquemas';
import { conSiguiente, destinoSeguro } from './redireccion';
import { FALLO, SIN_BD, error, ok, validar } from './respuestas';
import { perfilActual } from './sesion';
import type { EstadoAccion } from './tipos';

// Frena a quien prueba contraseñas en bucle desde una misma conexión.
// Supabase Auth aplica además su propio límite.
const limitador = crearLimitador({ maximo: 10, ventana: 10 * 60 * 1000 });

async function demasiadosIntentos(): Promise<boolean> {
  return !limitador.permitir(origenPeticion(await headers()));
}

type CampoEntrar = 'correo' | 'contrasena';

/** Entra con correo y contraseña y vuelve a `siguiente` (solo rutas internas). */
export async function entrar(_previo: EstadoAccion<CampoEntrar>, formulario: FormData): Promise<EstadoAccion<CampoEntrar>> {
  if (!configuracionSupabase()) return error(SIN_BD);
  const v = validar<typeof esquemaEntrar, CampoEntrar>(esquemaEntrar, formulario);
  if ('fallo' in v) return v.fallo;
  const { correo, contrasena, siguiente } = v.datos;
  if (await demasiadosIntentos()) {
    return error('Demasiados intentos seguidos. Espera unos minutos y vuelve a probar.', {}, { correo });
  }

  const supabase = await clienteServidor();
  const { error: fallo } = await supabase.auth.signInWithPassword({ email: correo, password: contrasena });
  if (fallo) {
    if (fallo.code === 'email_not_confirmed') {
      return error('Antes de entrar confirma tu correo: te mandamos un enlace al crear la cuenta.', {}, { correo });
    }
    if (fallo.code === 'invalid_credentials') {
      return error('El correo o la contraseña no coinciden.', {}, { correo });
    }
    console.error('No se pudo iniciar sesión:', fallo.code, fallo.message);
    return error(FALLO, {}, { correo });
  }
  redirect(destinoSeguro(siguiente));
}

/** Manda un enlace mágico para entrar sin contraseña. No crea cuentas. */
export async function enviarEnlace(_previo: EstadoAccion<'correo'>, formulario: FormData): Promise<EstadoAccion<'correo'>> {
  if (!configuracionSupabase()) return error(SIN_BD);
  const v = validar<typeof esquemaEnlace, 'correo'>(esquemaEnlace, formulario);
  if ('fallo' in v) return v.fallo;
  if (await demasiadosIntentos()) return error('Demasiados intentos seguidos. Espera unos minutos.');

  const destino = destinoSeguro(v.datos.siguiente);
  const supabase = await clienteServidor();
  const { error: fallo } = await supabase.auth.signInWithOtp({
    email: v.datos.correo,
    options: {
      // El enlace solo sirve para entrar: las cuentas se crean en /registro,
      // donde se aceptan la privacidad y los términos.
      shouldCreateUser: false,
      emailRedirectTo: `${await origenSitio()}${conSiguiente(rutas.confirmarAuth, destino)}`,
    },
  });
  // Si el correo no tiene cuenta, Supabase responde con error; contestamos
  // igual para no desvelar quién está registrado.
  if (fallo && fallo.code !== 'otp_disabled' && fallo.status !== 400 && fallo.status !== 422) {
    console.error('No se pudo mandar el enlace de acceso:', fallo.code, fallo.message);
    return error(FALLO);
  }
  return ok('Si ese correo tiene cuenta, te acaba de llegar un enlace para entrar. Caduca en una hora.');
}

type CampoRegistro = 'nombre' | 'correo' | 'contrasena' | 'acepta' | 'boletin';

/**
 * Crea la cuenta y manda el correo de confirmación. Si el correo ya
 * tiene cuenta, responde lo mismo que si no la tuviera.
 */
export async function registrarse(
  _previo: EstadoAccion<CampoRegistro>,
  formulario: FormData,
): Promise<EstadoAccion<CampoRegistro>> {
  if (!configuracionSupabase()) return error(SIN_BD);
  const v = validar<typeof esquemaRegistro, CampoRegistro>(esquemaRegistro, formulario);
  if ('fallo' in v) return v.fallo;
  const { nombre, correo, contrasena, boletin } = v.datos;
  if (await demasiadosIntentos()) return error('Demasiados intentos seguidos. Espera unos minutos.', {}, { nombre, correo });

  const supabase = await clienteServidor();
  const { data, error: fallo } = await supabase.auth.signUp({
    email: correo,
    password: contrasena,
    options: {
      data: { nombre },
      emailRedirectTo: `${await origenSitio()}${conSiguiente(rutas.confirmarAuth, rutas.cuenta)}`,
    },
  });
  if (fallo) {
    if (fallo.code === 'weak_password') {
      return error('Esa contraseña es demasiado fácil de adivinar. Prueba con una frase.', { contrasena: 'Elige otra contraseña.' }, { nombre, correo });
    }
    if (fallo.code !== 'user_already_exists' && fallo.code !== 'email_exists') {
      console.error('No se pudo crear la cuenta:', fallo.code, fallo.message);
      return error(FALLO, {}, { nombre, correo });
    }
  }

  if (boletin && !fallo) {
    await clientePublico()
      .rpc('suscribir_boletin', { p_email: correo, p_origen: 'registro' })
      .then(({ error: e }) => e && console.error('No se pudo apuntar al boletín:', e.message));
  }

  // Con la confirmación por correo desactivada, la sesión llega ya abierta.
  if (data?.session) redirect(rutas.cuenta);
  return ok(
    `Te hemos mandado un correo a ${correo} para confirmar la cuenta. Abre el enlace desde este mismo navegador y entrarás directamente.`,
  );
}

/** Manda el enlace para elegir una contraseña nueva, con la misma respuesta haya cuenta o no. */
export async function recuperarContrasena(_previo: EstadoAccion<'correo'>, formulario: FormData): Promise<EstadoAccion<'correo'>> {
  if (!configuracionSupabase()) return error(SIN_BD);
  const v = validar<typeof esquemaRecuperar, 'correo'>(esquemaRecuperar, formulario);
  if ('fallo' in v) return v.fallo;
  if (await demasiadosIntentos()) return error('Demasiados intentos seguidos. Espera unos minutos.');

  const supabase = await clienteServidor();
  const { error: fallo } = await supabase.auth.resetPasswordForEmail(v.datos.correo, {
    redirectTo: `${await origenSitio()}${conSiguiente(rutas.confirmarAuth, rutas.nuevaContrasena)}`,
  });
  if (fallo && (fallo.status ?? 500) >= 500) {
    console.error('No se pudo mandar el correo de recuperación:', fallo.code, fallo.message);
    return error(FALLO);
  }
  return ok('Si ese correo tiene cuenta, te llega un enlace para elegir una contraseña nueva. Mira también en el correo no deseado.');
}

type CampoContrasena = 'contrasena' | 'repetida';

/** Cambia la contraseña de la sesión abierta (la del enlace de recuperación o la normal). */
export async function cambiarContrasena(
  _previo: EstadoAccion<CampoContrasena>,
  formulario: FormData,
): Promise<EstadoAccion<CampoContrasena>> {
  if (!configuracionSupabase()) return error(SIN_BD);
  const v = validar<typeof esquemaNuevaContrasena, CampoContrasena>(esquemaNuevaContrasena, formulario);
  if ('fallo' in v) return v.fallo;
  const perfil = await perfilActual();
  if (!perfil) return error('El enlace ha caducado. Pide otro desde «He olvidado la contraseña».');
  // La cuenta de demostración la comparte cualquiera que pulse el botón del
  // panel: si alguien le cambiara la contraseña, dejaría fuera a los demás.
  if (perfil.rol === 'demo') return error('La contraseña de la cuenta de demostración no se puede cambiar.');

  const supabase = await clienteServidor();
  const { error: fallo } = await supabase.auth.updateUser({ password: v.datos.contrasena });
  if (fallo) {
    if (fallo.code === 'same_password') return error('Es la misma contraseña que ya tenías. Elige otra.');
    if (fallo.code === 'weak_password') return error('Esa contraseña es demasiado fácil de adivinar. Prueba con una frase.');
    console.error('No se pudo cambiar la contraseña:', fallo.code, fallo.message);
    return error(FALLO);
  }
  return ok('Contraseña cambiada. La próxima vez entra con la nueva.');
}

/** Cierra la sesión solo en este navegador y vuelve a la portada. */
export async function cerrarSesion(): Promise<void> {
  if (configuracionSupabase()) {
    const supabase = await clienteServidor();
    await supabase.auth.signOut({ scope: 'local' });
  }
  revalidatePath('/', 'layout');
  redirect(rutas.inicio);
}
