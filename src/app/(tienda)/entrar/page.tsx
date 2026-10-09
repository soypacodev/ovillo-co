import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AvisoSinCuentas } from '@/componentes/cuenta/aviso-sin-cuentas';
import { FormularioEnlace, FormularioEntrar } from '@/componentes/cuenta/formularios-acceso';
import { PantallaAcceso } from '@/componentes/cuenta/pantalla-acceso';
import { destinoSeguro } from '@/lib/cuentas/redireccion';
import { usuarioActual } from '@/lib/cuentas/sesion';
import { configuracionSupabase } from '@/lib/datos/entorno';
import { conIdioma, textos } from '@/lib/i18n';
import { idiomaActual } from '@/lib/i18n/servidor';
import { metadatosPagina } from '@/lib/metadatos';
import { parametro, type ParametrosUrl } from '@/lib/parametros';
import { rutas } from '@/lib/rutas';
import '@/estilos/cuenta.css';

const T = textos(
  {
    titulo: 'Entrar',
    descripcion: 'Entra en tu cuenta de Ovillo & Co. para ver tus pedidos, tus direcciones y tus favoritos.',
    avisos: {
      'cuenta-borrada': 'Tu cuenta se ha borrado. Gracias por habernos dejado un hueco en tu casa.',
      'enlace-caducado': 'Ese enlace ya se ha usado o ha caducado. Pide otro o entra con tu contraseña.',
      'demo-no-disponible': 'El panel de demostración no está disponible ahora mismo en esta instalación.',
    },
    hola: 'Hola otra vez',
    entradilla: 'Entra para ver tus pedidos, tus direcciones y lo que guardaste en favoritos.',
    o: 'o',
  },
  {
    en: {
      titulo: 'Sign in',
      descripcion: 'Sign in to your Ovillo & Co. account to see your orders, your addresses and your favourites.',
      avisos: {
        'cuenta-borrada': 'Your account has been deleted. Thank you for making a little room for us in your home.',
        'enlace-caducado': 'That link has already been used or has expired. Request a new one or sign in with your password.',
        'demo-no-disponible': "The demo dashboard isn't available on this installation right now.",
      },
      hola: 'Hello again',
      entradilla: 'Sign in to see your orders, your addresses and what you saved in your favourites.',
      o: 'or',
    },
    fr: {
      titulo: 'Connexion',
      descripcion: 'Connectez-vous à votre compte Ovillo & Co. pour voir vos commandes, vos adresses et vos favoris.',
      avisos: {
        'cuenta-borrada': 'Votre compte a été supprimé. Merci de nous avoir fait une petite place chez vous.',
        'enlace-caducado':
          'Ce lien a déjà été utilisé ou a expiré. Demandez-en un autre ou connectez-vous avec votre mot de passe.',
        'demo-no-disponible': 'Le tableau de bord de démonstration n’est pas disponible pour le moment sur cette installation.',
      },
      hola: 'Ravis de vous revoir',
      entradilla: 'Connectez-vous pour voir vos commandes, vos adresses et ce que vous avez mis dans vos favoris.',
      o: 'ou',
    },
    de: {
      titulo: 'Anmelden',
      descripcion: 'Melden Sie sich bei Ihrem Ovillo & Co.-Konto an, um Ihre Bestellungen, Adressen und Favoriten zu sehen.',
      avisos: {
        'cuenta-borrada': 'Ihr Konto wurde gelöscht. Danke, dass Sie uns ein Plätzchen in Ihrem Zuhause gegeben haben.',
        'enlace-caducado':
          'Dieser Link wurde schon verwendet oder ist abgelaufen. Fordern Sie einen neuen an oder melden Sie sich mit Ihrem Passwort an.',
        'demo-no-disponible': 'Das Demo-Dashboard ist in dieser Installation gerade nicht verfügbar.',
      },
      hola: 'Schön, Sie wiederzusehen',
      entradilla: 'Melden Sie sich an, um Ihre Bestellungen, Ihre Adressen und Ihre gespeicherten Favoriten zu sehen.',
      o: 'oder',
    },
  },
);

type Aviso = keyof (typeof T)['es']['avisos'];
const esAviso = (valor: string): valor is Aviso => Object.hasOwn(T.es.avisos, valor);

export async function generateMetadata(): Promise<Metadata> {
  const idioma = await idiomaActual();
  return {
    ...metadatosPagina({ idioma, titulo: T[idioma].titulo, descripcion: T[idioma].descripcion, ruta: rutas.entrar }),
    robots: { index: false, follow: true },
  };
}

export default async function PaginaEntrar({ searchParams }: { searchParams: ParametrosUrl }) {
  const idioma = await idiomaActual();
  const t = T[idioma];
  const parametros = await searchParams;
  const siguiente = destinoSeguro(parametro(parametros.siguiente));
  const clave = parametro(parametros.aviso);
  const aviso = esAviso(clave) ? t.avisos[clave] : null;

  if (!configuracionSupabase()) {
    return (
      <div className="wrap">
        <AvisoSinCuentas titulo={t.titulo} />
      </div>
    );
  }
  if (await usuarioActual()) redirect(conIdioma(siguiente, idioma));

  return (
    <div className="wrap">
      <PantallaAcceso titulo={t.hola} pestana="entrar" entradilla={t.entradilla} aviso={aviso}>
        <FormularioEntrar siguiente={siguiente} />
        <div className="separador-o" role="presentation">
          <span>{t.o}</span>
        </div>
        <FormularioEnlace siguiente={siguiente} />
      </PantallaAcceso>
    </div>
  );
}
