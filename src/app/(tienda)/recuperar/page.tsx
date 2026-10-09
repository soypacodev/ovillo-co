import type { Metadata } from 'next';
import { AvisoSinCuentas } from '@/componentes/cuenta/aviso-sin-cuentas';
import { FormularioRecuperar } from '@/componentes/cuenta/formularios-acceso';
import { PantallaAcceso } from '@/componentes/cuenta/pantalla-acceso';
import { configuracionSupabase } from '@/lib/datos/entorno';
import { textos } from '@/lib/i18n';
import { Enlace } from '@/lib/i18n/enlace';
import { idiomaActual } from '@/lib/i18n/servidor';
import { metadatosPagina } from '@/lib/metadatos';
import { rutas } from '@/lib/rutas';
import '@/estilos/cuenta.css';

const T = textos(
  {
    titulo: 'Recuperar la contraseña',
    descripcion: 'Te mandamos un enlace para elegir una contraseña nueva.',
    olvidado: '¿Se te ha olvidado?',
    entradilla: 'Pasa. Escribe el correo de tu cuenta y te mandamos un enlace para elegir otra contraseña.',
    acordado: '¿Te has acordado?',
    volver: 'Volver a entrar',
  },
  {
    en: {
      titulo: 'Reset your password',
      descripcion: "We'll send you a link to choose a new password.",
      olvidado: 'Forgotten it?',
      entradilla: "It happens. Enter your account email and we'll send you a link to choose a new password.",
      acordado: 'Remembered it?',
      volver: 'Back to sign in',
    },
    fr: {
      titulo: 'Réinitialiser le mot de passe',
      descripcion: 'Nous vous envoyons un lien pour choisir un nouveau mot de passe.',
      olvidado: 'Vous l’avez oublié ?',
      entradilla:
        'Ça arrive. Indiquez l’adresse e-mail de votre compte et nous vous enverrons un lien pour choisir un autre mot de passe.',
      acordado: 'Ça vous revient ?',
      volver: 'Revenir à la connexion',
    },
    de: {
      titulo: 'Passwort zurücksetzen',
      descripcion: 'Wir schicken Ihnen einen Link, um ein neues Passwort zu wählen.',
      olvidado: 'Passwort vergessen?',
      entradilla:
        'Kann passieren. Geben Sie die E-Mail-Adresse Ihres Kontos ein, und wir schicken Ihnen einen Link, um ein neues Passwort zu wählen.',
      acordado: 'Doch wieder eingefallen?',
      volver: 'Zurück zur Anmeldung',
    },
  },
);

export async function generateMetadata(): Promise<Metadata> {
  const idioma = await idiomaActual();
  return {
    ...metadatosPagina({ idioma, titulo: T[idioma].titulo, descripcion: T[idioma].descripcion, ruta: rutas.recuperar }),
    robots: { index: false, follow: true },
  };
}

export default async function PaginaRecuperar() {
  const t = T[await idiomaActual()];
  if (!configuracionSupabase()) {
    return (
      <div className="wrap">
        <AvisoSinCuentas titulo={t.titulo} />
      </div>
    );
  }
  return (
    <div className="wrap">
      <PantallaAcceso titulo={t.olvidado} entradilla={t.entradilla}>
        <FormularioRecuperar />
        <p className="mini mt-5">
          {t.acordado}{' '}
          <Enlace className="enlace" href={rutas.entrar}>
            {t.volver}
          </Enlace>
        </p>
      </PantallaAcceso>
    </div>
  );
}
