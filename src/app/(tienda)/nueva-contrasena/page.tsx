import type { Metadata } from 'next';
import { AvisoSinCuentas } from '@/componentes/cuenta/aviso-sin-cuentas';
import { FormularioNuevaContrasena } from '@/componentes/cuenta/formularios-acceso';
import { PantallaAcceso } from '@/componentes/cuenta/pantalla-acceso';
import { exigirPerfil } from '@/lib/cuentas/sesion';
import { textos } from '@/lib/i18n';
import { idiomaActual } from '@/lib/i18n/servidor';
import { metadatosPagina } from '@/lib/metadatos';
import { rutas } from '@/lib/rutas';
import '@/estilos/cuenta.css';

const T = textos(
  {
    titulo: 'Contraseña nueva',
    descripcion: 'Elige una contraseña nueva para tu cuenta.',
    paraCuenta: (correo: string) => `Para la cuenta ${correo}.`,
  },
  {
    en: {
      titulo: 'New password',
      descripcion: 'Choose a new password for your account.',
      paraCuenta: (correo: string) => `For the account ${correo}.`,
    },
    fr: {
      titulo: 'Nouveau mot de passe',
      descripcion: 'Choisissez un nouveau mot de passe pour votre compte.',
      paraCuenta: (correo: string) => `Pour le compte ${correo}.`,
    },
    de: {
      titulo: 'Neues Passwort',
      descripcion: 'Wählen Sie ein neues Passwort für Ihr Konto.',
      paraCuenta: (correo: string) => `Für das Konto ${correo}.`,
    },
  },
);

export async function generateMetadata(): Promise<Metadata> {
  const idioma = await idiomaActual();
  return {
    ...metadatosPagina({
      idioma,
      titulo: T[idioma].titulo,
      descripcion: T[idioma].descripcion,
      ruta: rutas.nuevaContrasena,
    }),
    robots: { index: false, follow: false },
  };
}

export default async function PaginaNuevaContrasena() {
  const t = T[await idiomaActual()];
  // Se llega desde el enlace del correo (que abre la sesión) o desde «Mis datos».
  const perfil = await exigirPerfil(rutas.nuevaContrasena);
  if (!perfil) {
    return (
      <div className="wrap">
        <AvisoSinCuentas titulo={t.titulo} />
      </div>
    );
  }
  return (
    <div className="wrap">
      <PantallaAcceso titulo={t.titulo} entradilla={t.paraCuenta(perfil.email)}>
        <FormularioNuevaContrasena />
      </PantallaAcceso>
    </div>
  );
}
