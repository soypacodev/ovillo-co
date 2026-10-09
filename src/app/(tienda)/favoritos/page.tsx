import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Migas } from '@/componentes/contenido/migas';
import { ListaFavoritos } from '@/componentes/cuenta/lista-favoritos';
import { TarjetaProducto } from '@/componentes/producto/tarjeta-producto';
import { catalogo } from '@/lib/datos';
import { configuracionSupabase } from '@/lib/datos/entorno';
import { textos } from '@/lib/i18n';
import { Enlace } from '@/lib/i18n/enlace';
import { idiomaActual } from '@/lib/i18n/servidor';
import { rutas } from '@/lib/rutas';

import '@/estilos/catalogo.css';
import '@/estilos/cuenta.css';

const T = textos(
  {
    titulo: 'Tus favoritos',
    migas: 'Favoritos',
    texto: 'Lo que has guardado con el corazón se queda en este navegador.',
    conCuenta: (enlace: (texto: string) => ReactNode) => (
      <>
        {' '}
        Si {enlace('entras en tu cuenta')}, también lo verás en tus otros dispositivos.
      </>
    ),
    guardadas: 'Piezas guardadas',
  },
  {
    en: {
      titulo: 'Your favourites',
      migas: 'Favourites',
      texto: 'Everything you’ve saved with the heart stays in this browser.',
      conCuenta: (enlace: (texto: string) => ReactNode) => (
        <>
          {' '}
          If you {enlace('sign in to your account')}, you’ll see it on your other devices too.
        </>
      ),
      guardadas: 'Saved items',
    },
    fr: {
      titulo: 'Vos favoris',
      migas: 'Favoris',
      texto: 'Ce que vous avez enregistré d’un cœur reste dans ce navigateur.',
      conCuenta: (enlace: (texto: string) => ReactNode) => (
        <>
          {' '}
          Si vous {enlace('vous connectez à votre compte')}, vous le retrouverez aussi sur vos autres appareils.
        </>
      ),
      guardadas: 'Pièces enregistrées',
    },
    de: {
      titulo: 'Ihre Favoriten',
      migas: 'Favoriten',
      texto: 'Was Sie mit dem Herz gespeichert haben, bleibt in diesem Browser.',
      conCuenta: (enlace: (texto: string) => ReactNode) => (
        <>
          {' '}
          Wenn Sie sich {enlace('in Ihrem Konto anmelden')}, sehen Sie es auch auf Ihren anderen Geräten.
        </>
      ),
      guardadas: 'Gespeicherte Stücke',
    },
  },
);

export async function generateMetadata(): Promise<Metadata> {
  const idioma = await idiomaActual();
  return {
    title: T[idioma].titulo,
    robots: { index: false, follow: true },
  };
}

/** Favoritos sin necesidad de cuenta: la lista vive en este navegador y,
 *  si hay sesión, se une con la de la cuenta al cargar la tienda. */
export default async function PaginaFavoritos() {
  const idioma = await idiomaActual();
  const t = T[idioma];
  const productos = await catalogo(idioma).productos();
  const tarjetas = Object.fromEntries(productos.map((p) => [p.slug, <TarjetaProducto key={p.slug} producto={p} />]));
  const conCuentas = configuracionSupabase() !== null;

  return (
    <div className="wrap">
      <Migas actual={t.migas} />
      <header className="cab-tienda">
        <h1 className="ent ent-1">{t.titulo}</h1>
        <p className="lead ent ent-2">
          {t.texto}
          {conCuentas &&
            t.conCuenta((texto) => (
              <Enlace className="enlace-texto" href={rutas.entrar}>
                {texto}
              </Enlace>
            ))}
        </p>
      </header>
      <section aria-label={t.guardadas} className="favoritos-pagina">
        <ListaFavoritos tarjetas={tarjetas} entreDispositivos={conCuentas} />
      </section>
    </div>
  );
}
