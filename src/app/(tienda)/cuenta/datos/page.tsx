import type { Metadata } from 'next';
import { AvisoSinCuentas } from '@/componentes/cuenta/aviso-sin-cuentas';
import { FormularioBorrarCuenta, FormularioDatos } from '@/componentes/cuenta/formularios-cuenta';
import { exigirPerfil } from '@/lib/cuentas/sesion';
import { textos } from '@/lib/i18n';
import { Enlace } from '@/lib/i18n/enlace';
import { idiomaActual } from '@/lib/i18n/servidor';
import { rutas } from '@/lib/rutas';

const T = textos(
  {
    titulo: 'Tus datos',
    acceso: 'Acceso',
    correo: 'Correo',
    cambiarCorreo: 'Para cambiar el correo, escríbenos desde el que tienes ahora y lo cambiamos nosotros.',
    cambiarContrasena: 'Cambiar la contraseña',
    borrarTitulo: 'Borrar la cuenta',
    borrarTexto:
      'Es inmediato y no se puede deshacer. Si solo quieres dejar de recibir correos, desmarca el boletín arriba.',
    quieroBorrar: 'Quiero borrar mi cuenta',
  },
  {
    en: {
      titulo: 'Your details',
      acceso: 'Sign-in',
      correo: 'Email',
      cambiarCorreo: "To change your email, write to us from the address you use now and we'll change it for you.",
      cambiarContrasena: 'Change the password',
      borrarTitulo: 'Delete the account',
      borrarTexto:
        "It's immediate and can't be undone. If you just want to stop receiving emails, untick the newsletter above.",
      quieroBorrar: 'I want to delete my account',
    },
    fr: {
      titulo: 'Vos informations',
      acceso: 'Connexion',
      correo: 'E-mail',
      cambiarCorreo:
        'Pour changer d’adresse e-mail, écrivez-nous depuis celle que vous utilisez actuellement et nous la changerons pour vous.',
      cambiarContrasena: 'Changer le mot de passe',
      borrarTitulo: 'Supprimer le compte',
      borrarTexto:
        'C’est immédiat et irréversible. Si vous voulez seulement ne plus recevoir d’e-mails, décochez la newsletter ci-dessus.',
      quieroBorrar: 'Je veux supprimer mon compte',
    },
    de: {
      titulo: 'Ihre Daten',
      acceso: 'Anmeldung',
      correo: 'E-Mail',
      cambiarCorreo:
        'Um Ihre E-Mail-Adresse zu ändern, schreiben Sie uns von Ihrer aktuellen Adresse aus, dann ändern wir sie für Sie.',
      cambiarContrasena: 'Passwort ändern',
      borrarTitulo: 'Konto löschen',
      borrarTexto:
        'Das geschieht sofort und lässt sich nicht rückgängig machen. Wenn Sie nur keine E-Mails mehr bekommen möchten, entfernen Sie oben das Häkchen beim Newsletter.',
      quieroBorrar: 'Ich möchte mein Konto löschen',
    },
  },
);

export async function generateMetadata(): Promise<Metadata> {
  return { title: T[await idiomaActual()].titulo };
}

export default async function PaginaDatos() {
  const t = T[await idiomaActual()];
  const perfil = await exigirPerfil(rutas.cuentaDatos);
  if (!perfil) return <AvisoSinCuentas titulo={t.titulo} />;

  return (
    <div className="cuenta-datos">
      <section className="caja" aria-labelledby="titulo-datos">
        <h2 id="titulo-datos" className="cuenta-seccion">
          {t.titulo}
        </h2>
        <FormularioDatos perfil={perfil} />
      </section>

      <section className="caja" aria-labelledby="titulo-acceso">
        <h2 id="titulo-acceso" className="cuenta-seccion">
          {t.acceso}
        </h2>
        <dl className="datos-acceso">
          <div>
            <dt>{t.correo}</dt>
            <dd>{perfil.email}</dd>
          </div>
        </dl>
        <p className="mini mt-3">{t.cambiarCorreo}</p>
        <Enlace className="btn btn-3 btn-p mt-5" href={rutas.nuevaContrasena}>
          {t.cambiarContrasena}
        </Enlace>
      </section>

      <section className="caja zona-peligro" aria-labelledby="titulo-borrar">
        <h2 id="titulo-borrar" className="cuenta-seccion">
          {t.borrarTitulo}
        </h2>
        <p className="mini mt-2">{t.borrarTexto}</p>
        <details className="borrar-detalles">
          <summary>{t.quieroBorrar}</summary>
          <FormularioBorrarCuenta />
        </details>
      </section>
    </div>
  );
}
