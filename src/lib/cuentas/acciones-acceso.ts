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
import { conIdioma, textos } from '@/lib/i18n';
import { idiomaActual } from '@/lib/i18n/servidor';
import { origenSitio } from '@/lib/origen';
import { rutas } from '@/lib/rutas';
import { esquemaEnlace, esquemaEntrar, esquemaNuevaContrasena, esquemaRecuperar, esquemaRegistro } from './esquemas';
import { conSiguiente, destinoSeguro } from './redireccion';
import { RESPUESTAS, error, ok, validar } from './respuestas';
import { perfilActual } from './sesion';
import type { EstadoAccion } from './tipos';

const T = textos(
  {
    demasiadosVolver: 'Demasiados intentos seguidos. Espera unos minutos y vuelve a probar.',
    demasiados: 'Demasiados intentos seguidos. Espera unos minutos.',
    sinConfirmar: 'Antes de entrar confirma tu correo: te mandamos un enlace al crear la cuenta.',
    noCoinciden: 'El correo o la contraseña no coinciden.',
    enlaceEnviado: 'Si ese correo tiene cuenta, te acaba de llegar un enlace para entrar. Caduca en una hora.',
    debil: 'Esa contraseña es demasiado fácil de adivinar. Prueba con una frase.',
    eligeOtra: 'Elige otra contraseña.',
    confirmaCorreo: (correo: string) =>
      `Te hemos mandado un correo a ${correo} para confirmar la cuenta. Abre el enlace desde este mismo navegador y entrarás directamente.`,
    recuperacionEnviada:
      'Si ese correo tiene cuenta, te llega un enlace para elegir una contraseña nueva. Mira también en el correo no deseado.',
    enlaceCaducado: 'El enlace ha caducado. Pide otro desde «He olvidado la contraseña».',
    demoSinCambio: 'La contraseña de la cuenta de demostración no se puede cambiar.',
    misma: 'Es la misma contraseña que ya tenías. Elige otra.',
    cambiada: 'Contraseña cambiada. La próxima vez entra con la nueva.',
  },
  {
    en: {
      demasiadosVolver: 'Too many attempts in a row. Please wait a few minutes and try again.',
      demasiados: 'Too many attempts in a row. Please wait a few minutes.',
      sinConfirmar: 'Please confirm your email before signing in: we sent you a link when you created your account.',
      noCoinciden: "The email or password doesn't match.",
      enlaceEnviado: "If that email has an account, a sign-in link is on its way. It's valid for one hour.",
      debil: 'That password is too easy to guess. Try a phrase instead.',
      eligeOtra: 'Choose a different password.',
      confirmaCorreo: (correo: string) =>
        `We've sent an email to ${correo} to confirm your account. Open the link in this same browser and you'll be signed straight in.`,
      recuperacionEnviada:
        "If that email has an account, you'll get a link to choose a new password. Do check your spam folder too.",
      enlaceCaducado: 'The link has expired. Request a new one from “I’ve forgotten my password”.',
      demoSinCambio: "The demo account's password can't be changed.",
      misma: "That's the password you already had. Please choose another.",
      cambiada: 'Password changed. Use the new one next time you sign in.',
    },
    fr: {
      demasiadosVolver: 'Trop de tentatives d’affilée. Patientez quelques minutes, puis réessayez.',
      demasiados: 'Trop de tentatives d’affilée. Patientez quelques minutes.',
      sinConfirmar:
        'Avant de vous connecter, confirmez votre adresse e-mail : nous vous avons envoyé un lien à la création du compte.',
      noCoinciden: 'L’adresse e-mail ou le mot de passe ne correspond pas.',
      enlaceEnviado: 'Si cette adresse a un compte, un lien de connexion vient de vous être envoyé. Il expire dans une heure.',
      debil: 'Ce mot de passe est trop facile à deviner. Essayez plutôt une phrase.',
      eligeOtra: 'Choisissez un autre mot de passe.',
      confirmaCorreo: (correo: string) =>
        `Nous avons envoyé un e-mail à ${correo} pour confirmer votre compte. Ouvrez le lien dans ce même navigateur pour vous connecter directement.`,
      recuperacionEnviada:
        'Si cette adresse a un compte, vous allez recevoir un lien pour choisir un nouveau mot de passe. Pensez à vérifier vos courriers indésirables.',
      enlaceCaducado: 'Le lien a expiré. Demandez-en un autre depuis « J’ai oublié mon mot de passe ».',
      demoSinCambio: 'Le mot de passe du compte de démonstration ne peut pas être modifié.',
      misma: 'C’est le même mot de passe qu’avant. Choisissez-en un autre.',
      cambiada: 'Mot de passe modifié. La prochaine fois, connectez-vous avec le nouveau.',
    },
    de: {
      demasiadosVolver: 'Zu viele Versuche hintereinander. Bitte warten Sie ein paar Minuten und versuchen Sie es erneut.',
      demasiados: 'Zu viele Versuche hintereinander. Bitte warten Sie ein paar Minuten.',
      sinConfirmar:
        'Bitte bestätigen Sie vor der Anmeldung Ihre E-Mail-Adresse: Wir haben Ihnen beim Anlegen des Kontos einen Link geschickt.',
      noCoinciden: 'E-Mail-Adresse oder Passwort stimmen nicht.',
      enlaceEnviado:
        'Wenn zu dieser E-Mail-Adresse ein Konto gehört, ist gerade ein Anmeldelink unterwegs. Er ist eine Stunde lang gültig.',
      debil: 'Dieses Passwort ist zu leicht zu erraten. Versuchen Sie es mit einem ganzen Satz.',
      eligeOtra: 'Wählen Sie ein anderes Passwort.',
      confirmaCorreo: (correo: string) =>
        `Wir haben Ihnen eine E-Mail an ${correo} geschickt, um das Konto zu bestätigen. Öffnen Sie den Link in diesem Browser, dann sind Sie direkt angemeldet.`,
      recuperacionEnviada:
        'Wenn zu dieser E-Mail-Adresse ein Konto gehört, erhalten Sie einen Link, um ein neues Passwort zu wählen. Schauen Sie auch im Spam-Ordner nach.',
      enlaceCaducado: 'Der Link ist abgelaufen. Fordern Sie über „Passwort vergessen“ einen neuen an.',
      demoSinCambio: 'Das Passwort des Demo-Kontos kann nicht geändert werden.',
      misma: 'Das ist Ihr bisheriges Passwort. Bitte wählen Sie ein anderes.',
      cambiada: 'Passwort geändert. Melden Sie sich beim nächsten Mal mit dem neuen an.',
    },
  },
);

// Frena a quien prueba contraseñas en bucle desde una misma conexión.
// Supabase Auth aplica además su propio límite.
const limitador = crearLimitador({ maximo: 10, ventana: 10 * 60 * 1000 });

async function demasiadosIntentos(): Promise<boolean> {
  return !limitador.permitir(origenPeticion(await headers()));
}

type CampoEntrar = 'correo' | 'contrasena';

/** Entra con correo y contraseña y vuelve a `siguiente` (solo rutas internas). */
export async function entrar(_previo: EstadoAccion<CampoEntrar>, formulario: FormData): Promise<EstadoAccion<CampoEntrar>> {
  const idioma = await idiomaActual();
  const t = T[idioma];
  const r = RESPUESTAS[idioma];
  if (!configuracionSupabase()) return error(r.sinBd);
  const v = validar<ReturnType<typeof esquemaEntrar>, CampoEntrar>(esquemaEntrar(idioma), formulario, idioma);
  if ('fallo' in v) return v.fallo;
  const { correo, contrasena, siguiente } = v.datos;
  if (await demasiadosIntentos()) {
    return error(t.demasiadosVolver, {}, { correo });
  }

  const supabase = await clienteServidor();
  const { error: fallo } = await supabase.auth.signInWithPassword({ email: correo, password: contrasena });
  if (fallo) {
    if (fallo.code === 'email_not_confirmed') {
      return error(t.sinConfirmar, {}, { correo });
    }
    if (fallo.code === 'invalid_credentials') {
      return error(t.noCoinciden, {}, { correo });
    }
    console.error('No se pudo iniciar sesión:', fallo.code, fallo.message);
    return error(r.fallo, {}, { correo });
  }
  redirect(conIdioma(destinoSeguro(siguiente), idioma));
}

/** Manda un enlace mágico para entrar sin contraseña. No crea cuentas. */
export async function enviarEnlace(_previo: EstadoAccion<'correo'>, formulario: FormData): Promise<EstadoAccion<'correo'>> {
  const idioma = await idiomaActual();
  const r = RESPUESTAS[idioma];
  if (!configuracionSupabase()) return error(r.sinBd);
  const v = validar<ReturnType<typeof esquemaEnlace>, 'correo'>(esquemaEnlace(idioma), formulario, idioma);
  if ('fallo' in v) return v.fallo;
  if (await demasiadosIntentos()) return error(T[idioma].demasiados);

  const destino = destinoSeguro(v.datos.siguiente);
  const supabase = await clienteServidor();
  const { error: fallo } = await supabase.auth.signInWithOtp({
    email: v.datos.correo,
    options: {
      // El enlace solo sirve para entrar: las cuentas se crean en /registro,
      // donde se aceptan la privacidad y los términos.
      shouldCreateUser: false,
      // Vuelve a la página en el idioma en que se pidió el enlace.
      emailRedirectTo: `${await origenSitio()}${conSiguiente(rutas.confirmarAuth, conIdioma(destino, idioma))}`,
    },
  });
  // Si el correo no tiene cuenta, Supabase responde con error; contestamos
  // igual para no desvelar quién está registrado.
  if (fallo && fallo.code !== 'otp_disabled' && fallo.status !== 400 && fallo.status !== 422) {
    console.error('No se pudo mandar el enlace de acceso:', fallo.code, fallo.message);
    return error(r.fallo);
  }
  return ok(T[idioma].enlaceEnviado);
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
  const idioma = await idiomaActual();
  const t = T[idioma];
  const r = RESPUESTAS[idioma];
  if (!configuracionSupabase()) return error(r.sinBd);
  const v = validar<ReturnType<typeof esquemaRegistro>, CampoRegistro>(esquemaRegistro(idioma), formulario, idioma);
  if ('fallo' in v) return v.fallo;
  const { nombre, correo, contrasena, boletin } = v.datos;
  if (await demasiadosIntentos()) return error(t.demasiados, {}, { nombre, correo });

  const supabase = await clienteServidor();
  const { data, error: fallo } = await supabase.auth.signUp({
    email: correo,
    password: contrasena,
    options: {
      data: { nombre },
      emailRedirectTo: `${await origenSitio()}${conSiguiente(rutas.confirmarAuth, conIdioma(rutas.cuenta, idioma))}`,
    },
  });
  if (fallo) {
    if (fallo.code === 'weak_password') {
      return error(t.debil, { contrasena: t.eligeOtra }, { nombre, correo });
    }
    if (fallo.code !== 'user_already_exists' && fallo.code !== 'email_exists') {
      console.error('No se pudo crear la cuenta:', fallo.code, fallo.message);
      return error(r.fallo, {}, { nombre, correo });
    }
  }

  if (boletin && !fallo) {
    await clientePublico()
      .rpc('suscribir_boletin', { p_email: correo, p_origen: 'registro' })
      .then(({ error: e }) => e && console.error('No se pudo apuntar al boletín:', e.message));
  }

  // Con la confirmación por correo desactivada, la sesión llega ya abierta.
  if (data?.session) redirect(conIdioma(rutas.cuenta, idioma));
  return ok(t.confirmaCorreo(correo));
}

/** Manda el enlace para elegir una contraseña nueva, con la misma respuesta haya cuenta o no. */
export async function recuperarContrasena(_previo: EstadoAccion<'correo'>, formulario: FormData): Promise<EstadoAccion<'correo'>> {
  const idioma = await idiomaActual();
  const r = RESPUESTAS[idioma];
  if (!configuracionSupabase()) return error(r.sinBd);
  const v = validar<ReturnType<typeof esquemaRecuperar>, 'correo'>(esquemaRecuperar(idioma), formulario, idioma);
  if ('fallo' in v) return v.fallo;
  if (await demasiadosIntentos()) return error(T[idioma].demasiados);

  const supabase = await clienteServidor();
  const { error: fallo } = await supabase.auth.resetPasswordForEmail(v.datos.correo, {
    redirectTo: `${await origenSitio()}${conSiguiente(rutas.confirmarAuth, conIdioma(rutas.nuevaContrasena, idioma))}`,
  });
  if (fallo && (fallo.status ?? 500) >= 500) {
    console.error('No se pudo mandar el correo de recuperación:', fallo.code, fallo.message);
    return error(r.fallo);
  }
  return ok(T[idioma].recuperacionEnviada);
}

type CampoContrasena = 'contrasena' | 'repetida';

/** Cambia la contraseña de la sesión abierta (la del enlace de recuperación o la normal). */
export async function cambiarContrasena(
  _previo: EstadoAccion<CampoContrasena>,
  formulario: FormData,
): Promise<EstadoAccion<CampoContrasena>> {
  const idioma = await idiomaActual();
  const t = T[idioma];
  const r = RESPUESTAS[idioma];
  if (!configuracionSupabase()) return error(r.sinBd);
  const v = validar<ReturnType<typeof esquemaNuevaContrasena>, CampoContrasena>(
    esquemaNuevaContrasena(idioma),
    formulario,
    idioma,
  );
  if ('fallo' in v) return v.fallo;
  const perfil = await perfilActual();
  if (!perfil) return error(t.enlaceCaducado);
  // La cuenta de demostración la comparte cualquiera que pulse el botón del
  // panel: si alguien le cambiara la contraseña, dejaría fuera a los demás.
  if (perfil.rol === 'demo') return error(t.demoSinCambio);

  const supabase = await clienteServidor();
  const { error: fallo } = await supabase.auth.updateUser({ password: v.datos.contrasena });
  if (fallo) {
    if (fallo.code === 'same_password') return error(t.misma);
    if (fallo.code === 'weak_password') return error(t.debil);
    console.error('No se pudo cambiar la contraseña:', fallo.code, fallo.message);
    return error(r.fallo);
  }
  return ok(t.cambiada);
}

/** Cierra la sesión solo en este navegador y vuelve a la portada. */
export async function cerrarSesion(): Promise<void> {
  const idioma = await idiomaActual();
  if (configuracionSupabase()) {
    const supabase = await clienteServidor();
    await supabase.auth.signOut({ scope: 'local' });
  }
  revalidatePath('/', 'layout');
  redirect(conIdioma(rutas.inicio, idioma));
}
