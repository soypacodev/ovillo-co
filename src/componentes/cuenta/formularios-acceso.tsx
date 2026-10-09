'use client';

// Formularios para entrar, crear la cuenta y recuperar la contraseña.
// Todos envían a acciones de servidor; la sesión queda en cookies.

import type { ReactNode } from 'react';
import { BotonEnviar } from '@/componentes/formularios/boton-enviar';
import { Campo, Consentimiento } from '@/componentes/formularios/campo';
import {
  cambiarContrasena,
  entrar,
  enviarEnlace,
  recuperarContrasena,
  registrarse,
} from '@/lib/cuentas/acciones-acceso';
import { MIN_CONTRASENA } from '@/lib/cuentas/tipos';
import { textos } from '@/lib/i18n';
import { useTextos } from '@/lib/i18n/cliente';
import { Enlace } from '@/lib/i18n/enlace';
import { rutas } from '@/lib/rutas';
import { AvisoEstado } from './aviso-estado';
import { useFormulario } from './use-formulario';

const T = textos(
  {
    correo: 'Correo electrónico',
    ejemploCorreo: 'tunombre@correo.com',
    contrasena: 'Contraseña',
    olvido: 'He olvidado la contraseña',
    entrar: 'Entrar',
    pistaEnlace: 'Sin contraseñas: te llega un enlace y entras con un clic.',
    enviando: 'Enviando…',
    mandarEnlace: 'Mandarme un enlace al correo',
    tuNombre: 'Tu nombre',
    pistaContrasena: (min: number) => `Mínimo ${min} caracteres. Mejor larga que complicada.`,
    acepto: (privacidad: ReactNode, terminos: ReactNode) => (
      <>
        Acepto la {privacidad} y los {terminos}.
      </>
    ),
    privacidad: 'política de privacidad',
    terminos: 'términos de venta',
    boletin: 'Avisadme cuando haya piezas nuevas (como mucho, un correo al mes).',
    crear: 'Crear la cuenta',
    correoCuenta: 'Correo de tu cuenta',
    mandarElEnlace: 'Mandarme el enlace',
    irCuenta: 'Ir a mi cuenta',
    nueva: 'Contraseña nueva',
    minimo: (min: number) => `Mínimo ${min} caracteres.`,
    repitela: 'Repítela',
    guardar: 'Guardar la contraseña',
  },
  {
    en: {
      correo: 'Email address',
      ejemploCorreo: 'yourname@email.com',
      contrasena: 'Password',
      olvido: 'I’ve forgotten my password',
      entrar: 'Sign in',
      pistaEnlace: 'No passwords: we send you a link and you sign in with one click.',
      enviando: 'Sending…',
      mandarEnlace: 'Email me a sign-in link',
      tuNombre: 'Your name',
      pistaContrasena: (min: number) => `At least ${min} characters. Long beats complicated.`,
      acepto: (privacidad: ReactNode, terminos: ReactNode) => (
        <>
          I accept the {privacidad} and the {terminos}.
        </>
      ),
      privacidad: 'privacy policy',
      terminos: 'terms of sale',
      boletin: 'Let me know when there are new pieces (one email a month at most).',
      crear: 'Create my account',
      correoCuenta: 'Your account email',
      mandarElEnlace: 'Send me the link',
      irCuenta: 'Go to my account',
      nueva: 'New password',
      minimo: (min: number) => `At least ${min} characters.`,
      repitela: 'Repeat it',
      guardar: 'Save the password',
    },
    fr: {
      correo: 'Adresse e-mail',
      ejemploCorreo: 'votrenom@email.fr',
      contrasena: 'Mot de passe',
      olvido: 'J’ai oublié mon mot de passe',
      entrar: 'Se connecter',
      pistaEnlace: 'Sans mot de passe : vous recevez un lien et vous vous connectez en un clic.',
      enviando: 'Envoi…',
      mandarEnlace: 'M’envoyer un lien par e-mail',
      tuNombre: 'Votre nom',
      pistaContrasena: (min: number) => `${min} caractères minimum. Mieux vaut long que compliqué.`,
      acepto: (privacidad: ReactNode, terminos: ReactNode) => (
        <>
          J’accepte la {privacidad} et les {terminos}.
        </>
      ),
      privacidad: 'politique de confidentialité',
      terminos: 'conditions de vente',
      boletin: 'Prévenez-moi quand il y a de nouvelles pièces (un e-mail par mois au maximum).',
      crear: 'Créer le compte',
      correoCuenta: 'Adresse e-mail de votre compte',
      mandarElEnlace: 'M’envoyer le lien',
      irCuenta: 'Aller à mon compte',
      nueva: 'Nouveau mot de passe',
      minimo: (min: number) => `${min} caractères minimum.`,
      repitela: 'Répétez-le',
      guardar: 'Enregistrer le mot de passe',
    },
    de: {
      correo: 'E-Mail-Adresse',
      ejemploCorreo: 'ihrname@email.de',
      contrasena: 'Passwort',
      olvido: 'Passwort vergessen',
      entrar: 'Anmelden',
      pistaEnlace: 'Ohne Passwort: Sie bekommen einen Link und melden sich mit einem Klick an.',
      enviando: 'Wird gesendet…',
      mandarEnlace: 'Anmeldelink per E-Mail schicken',
      tuNombre: 'Ihr Name',
      pistaContrasena: (min: number) => `Mindestens ${min} Zeichen. Lieber lang als kompliziert.`,
      acepto: (privacidad: ReactNode, terminos: ReactNode) => (
        <>
          Ich akzeptiere die {privacidad} und die {terminos}.
        </>
      ),
      privacidad: 'Datenschutzerklärung',
      terminos: 'Verkaufsbedingungen',
      boletin: 'Benachrichtigen Sie mich, wenn es neue Stücke gibt (höchstens eine E-Mail im Monat).',
      crear: 'Konto anlegen',
      correoCuenta: 'E-Mail-Adresse Ihres Kontos',
      mandarElEnlace: 'Link schicken',
      irCuenta: 'Zu meinem Konto',
      nueva: 'Neues Passwort',
      minimo: (min: number) => `Mindestens ${min} Zeichen.`,
      repitela: 'Wiederholen',
      guardar: 'Passwort speichern',
    },
  },
);

export function FormularioEntrar({ siguiente }: { siguiente: string }) {
  const t = useTextos(T);
  const f = useFormulario(entrar);
  const p = 'entrar';
  return (
    <form action={f.enviar} onSubmit={f.alEnviar} noValidate className="formulario-cuenta">
      <AvisoEstado estado={f.estado} prefijo={p} />
      <input type="hidden" name="siguiente" value={siguiente} />
      <Campo prefijo={p} nombre="correo" etiqueta={t.correo} error={f.errores.correo}>
        {(aria) => (
          <input
            {...aria}
            type="email"
            required
            autoComplete="email"
            spellCheck={false}
            defaultValue={f.valores.correo}
            placeholder={t.ejemploCorreo}
          />
        )}
      </Campo>
      <Campo prefijo={p} nombre="contrasena" etiqueta={t.contrasena} error={f.errores.contrasena}>
        {(aria) => <input {...aria} type="password" required autoComplete="current-password" />}
      </Campo>
      <p className="olvido">
        <Enlace className="mini enlace" href={rutas.recuperar}>
          {t.olvido}
        </Enlace>
      </p>
      <BotonEnviar enviando={f.enviando} texto={t.entrar} />
    </form>
  );
}

export function FormularioEnlace({ siguiente }: { siguiente: string }) {
  const t = useTextos(T);
  const f = useFormulario(enviarEnlace);
  const p = 'enlace';
  if (f.estado.estado === 'ok') return <AvisoEstado estado={f.estado} prefijo={p} />;
  return (
    <form action={f.enviar} onSubmit={f.alEnviar} noValidate className="formulario-cuenta">
      <AvisoEstado estado={f.estado} prefijo={p} />
      <input type="hidden" name="siguiente" value={siguiente} />
      <Campo
        prefijo={p}
        nombre="correo"
        etiqueta={t.correo}
        pista={t.pistaEnlace}
        error={f.errores.correo}
      >
        {(aria) => (
          <input {...aria} type="email" required autoComplete="email" spellCheck={false} defaultValue={f.valores.correo} />
        )}
      </Campo>
      <button type="submit" className="btn btn-3 btn-bloque" disabled={f.enviando}>
        {f.enviando ? t.enviando : t.mandarEnlace}
      </button>
    </form>
  );
}

export function FormularioRegistro() {
  const t = useTextos(T);
  const f = useFormulario(registrarse);
  const p = 'registro';
  if (f.estado.estado === 'ok') return <AvisoEstado estado={f.estado} prefijo={p} />;
  return (
    <form action={f.enviar} onSubmit={f.alEnviar} noValidate className="formulario-cuenta">
      <AvisoEstado estado={f.estado} prefijo={p} />
      <Campo prefijo={p} nombre="nombre" etiqueta={t.tuNombre} error={f.errores.nombre}>
        {(aria) => <input {...aria} type="text" required maxLength={120} autoComplete="name" defaultValue={f.valores.nombre} />}
      </Campo>
      <Campo prefijo={p} nombre="correo" etiqueta={t.correo} error={f.errores.correo}>
        {(aria) => (
          <input
            {...aria}
            type="email"
            required
            autoComplete="email"
            spellCheck={false}
            defaultValue={f.valores.correo}
            placeholder={t.ejemploCorreo}
          />
        )}
      </Campo>
      <Campo
        prefijo={p}
        nombre="contrasena"
        etiqueta={t.contrasena}
        pista={t.pistaContrasena(MIN_CONTRASENA)}
        error={f.errores.contrasena}
      >
        {(aria) => <input {...aria} type="password" required minLength={MIN_CONTRASENA} autoComplete="new-password" />}
      </Campo>
      <Consentimiento prefijo={p} error={f.errores.acepta} marcado={f.valores.acepta === 'on'}>
        {t.acepto(
          <Enlace href={`${rutas.legal}#privacidad`}>{t.privacidad}</Enlace>,
          <Enlace href={`${rutas.legal}#venta`}>{t.terminos}</Enlace>,
        )}
      </Consentimiento>
      <label className="check" htmlFor={`${p}-boletin`}>
        <input type="checkbox" id={`${p}-boletin`} name="boletin" defaultChecked={f.valores.boletin === 'on'} />
        <span>{t.boletin}</span>
      </label>
      <BotonEnviar enviando={f.enviando} texto={t.crear} />
    </form>
  );
}

export function FormularioRecuperar() {
  const t = useTextos(T);
  const f = useFormulario(recuperarContrasena);
  const p = 'recuperar';
  if (f.estado.estado === 'ok') return <AvisoEstado estado={f.estado} prefijo={p} />;
  return (
    <form action={f.enviar} onSubmit={f.alEnviar} noValidate className="formulario-cuenta">
      <AvisoEstado estado={f.estado} prefijo={p} />
      <Campo prefijo={p} nombre="correo" etiqueta={t.correoCuenta} error={f.errores.correo}>
        {(aria) => (
          <input {...aria} type="email" required autoComplete="email" spellCheck={false} defaultValue={f.valores.correo} />
        )}
      </Campo>
      <BotonEnviar enviando={f.enviando} texto={t.mandarElEnlace} />
    </form>
  );
}

export function FormularioNuevaContrasena() {
  const t = useTextos(T);
  const f = useFormulario(cambiarContrasena);
  const p = 'nueva';
  if (f.estado.estado === 'ok') {
    return (
      <>
        <AvisoEstado estado={f.estado} prefijo={p} />
        <Enlace className="btn btn-1 mt-6" href={rutas.cuenta}>
          {t.irCuenta}
        </Enlace>
      </>
    );
  }
  return (
    <form action={f.enviar} onSubmit={f.alEnviar} noValidate className="formulario-cuenta">
      <AvisoEstado estado={f.estado} prefijo={p} />
      <Campo
        prefijo={p}
        nombre="contrasena"
        etiqueta={t.nueva}
        pista={t.minimo(MIN_CONTRASENA)}
        error={f.errores.contrasena}
      >
        {(aria) => <input {...aria} type="password" required minLength={MIN_CONTRASENA} autoComplete="new-password" />}
      </Campo>
      <Campo prefijo={p} nombre="repetida" etiqueta={t.repitela} error={f.errores.repetida}>
        {(aria) => <input {...aria} type="password" required autoComplete="new-password" />}
      </Campo>
      <BotonEnviar enviando={f.enviando} texto={t.guardar} />
    </form>
  );
}
