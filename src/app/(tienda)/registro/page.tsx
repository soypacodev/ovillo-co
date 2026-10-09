import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AvisoSinCuentas } from '@/componentes/cuenta/aviso-sin-cuentas';
import { FormularioRegistro } from '@/componentes/cuenta/formularios-acceso';
import { PantallaAcceso } from '@/componentes/cuenta/pantalla-acceso';
import { usuarioActual } from '@/lib/cuentas/sesion';
import { configuracionSupabase } from '@/lib/datos/entorno';
import { conIdioma, textos } from '@/lib/i18n';
import { idiomaActual } from '@/lib/i18n/servidor';
import { metadatosPagina } from '@/lib/metadatos';
import { rutas } from '@/lib/rutas';
import '@/estilos/cuenta.css';

const T = textos(
  {
    titulo: 'Crear una cuenta',
    descripcion: 'Crea tu cuenta en Ovillo & Co. para seguir tus pedidos y no repetir la dirección en cada compra.',
    entradilla: 'No hace falta para comprar, pero va bien para no repetir la dirección cada vez.',
  },
  {
    en: {
      titulo: 'Create an account',
      descripcion: 'Create your Ovillo & Co. account to track your orders and skip retyping your address every time.',
      entradilla: "You don't need one to shop, but it saves typing your address every time.",
    },
    fr: {
      titulo: 'Créer un compte',
      descripcion:
        'Créez votre compte Ovillo & Co. pour suivre vos commandes et ne plus retaper votre adresse à chaque achat.',
      entradilla: 'Ce n’est pas nécessaire pour acheter, mais c’est pratique pour ne pas retaper l’adresse à chaque fois.',
    },
    de: {
      titulo: 'Konto anlegen',
      descripcion:
        'Legen Sie Ihr Konto bei Ovillo & Co. an, um Ihre Bestellungen zu verfolgen und die Adresse nicht jedes Mal neu einzugeben.',
      entradilla: 'Zum Bestellen brauchen Sie keins, aber so müssen Sie die Adresse nicht jedes Mal neu eingeben.',
    },
  },
);

export async function generateMetadata(): Promise<Metadata> {
  const idioma = await idiomaActual();
  return {
    ...metadatosPagina({ idioma, titulo: T[idioma].titulo, descripcion: T[idioma].descripcion, ruta: rutas.registro }),
    robots: { index: false, follow: true },
  };
}

export default async function PaginaRegistro() {
  const idioma = await idiomaActual();
  const t = T[idioma];
  if (!configuracionSupabase()) {
    return (
      <div className="wrap">
        <AvisoSinCuentas titulo={t.titulo} />
      </div>
    );
  }
  if (await usuarioActual()) redirect(conIdioma(rutas.cuenta, idioma));

  return (
    <div className="wrap">
      <PantallaAcceso titulo={t.titulo} pestana="registro" entradilla={t.entradilla}>
        <FormularioRegistro />
      </PantallaAcceso>
    </div>
  );
}
