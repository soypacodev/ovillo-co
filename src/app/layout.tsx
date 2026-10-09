import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';
import { CintaDemo } from '@/componentes/marco/cinta-demo';
import { JsonLd } from '@/componentes/contenido/json-ld';
import { Proveedores } from '@/componentes/proveedores';
import { dmSans, fraunces } from '@/fuentes';
import { datosTienda } from '@/lib/buscadores/datos-estructurados';
import { ROBOTS_POR_DEFECTO } from '@/lib/buscadores/indexacion';
import { urlSitio } from '@/lib/datos/entorno';
import { DATOS_IDIOMA, textos } from '@/lib/i18n';
import { ProveedorIdioma } from '@/lib/i18n/cliente';
import { idiomaActual } from '@/lib/i18n/servidor';

import '@/estilos/tokens.css';
import '@/estilos/base.css';
import '@/estilos/componentes.css';
import '@/estilos/marco.css';
import '@/estilos/pantallas.css';
import '@/estilos/animaciones.css';

const URL_SITIO = urlSitio();

const T = textos(
  {
    titulo: 'Ovillo & Co. · Crochet hecho a mano en Málaga',
    descripcion:
      'Amigurumis, mantas y accesorios de crochet tejidos a mano en Málaga, de uno en uno. Piezas únicas y encargos personalizados. Tienda de demostración.',
    saltar: 'Saltar al contenido',
    avisoDemo: 'Aviso de demostración',
  },
  {
    en: {
      titulo: 'Ovillo & Co. · Handmade crochet from Málaga',
      descripcion:
        'Amigurumi, blankets and crochet accessories hand-made in Málaga, one at a time. One-of-a-kind pieces and custom orders. Demo shop.',
      saltar: 'Skip to content',
      avisoDemo: 'Demo notice',
    },
    fr: {
      titulo: 'Ovillo & Co. · Crochet fait main à Málaga',
      descripcion:
        'Amigurumis, couvertures et accessoires au crochet faits main à Málaga, pièce par pièce. Pièces uniques et commandes personnalisées. Boutique de démonstration.',
      saltar: 'Aller au contenu',
      avisoDemo: 'Avis de démonstration',
    },
    de: {
      titulo: 'Ovillo & Co. · Handgehäkeltes aus Málaga',
      descripcion:
        'Amigurumis, Decken und Häkel-Accessoires, in Málaga von Hand gefertigt, Stück für Stück. Unikate und Auftragsarbeiten. Demo-Shop.',
      saltar: 'Zum Inhalt springen',
      avisoDemo: 'Demo-Hinweis',
    },
  },
);

export async function generateMetadata(): Promise<Metadata> {
  const idioma = await idiomaActual();
  const t = T[idioma];
  return {
    metadataBase: new URL(URL_SITIO),
    title: { default: t.titulo, template: '%s · Ovillo & Co.' },
    description: t.descripcion,
    applicationName: 'Ovillo & Co.',
    openGraph: {
      type: 'website',
      locale: DATOS_IDIOMA[idioma].og,
      siteName: 'Ovillo & Co.',
      title: t.titulo,
      description: t.descripcion,
      // Las páginas que no definen su propio Open Graph (cesta, pago, cuenta)
      // son privadas: al compartirlas se enseña la portada.
      url: '/',
    },
    twitter: { card: 'summary_large_image' },
    formatDetection: { telephone: false, email: false, address: false },
    // Por defecto, noindex salvo NEXT_PUBLIC_INDEXAR=si; la portada lo
    // levanta. El porqué está en src/lib/buscadores/indexacion.ts.
    robots: ROBOTS_POR_DEFECTO,
  };
}

export const viewport: Viewport = {
  themeColor: '#F8F6F2',
  colorScheme: 'light',
};

// Marca <html> con .js antes de pintar: las animaciones de aparición solo
// esconden el contenido cuando hay JavaScript para enseñarlo después. Si
// falla la carga de algún script, se quita y todo queda visible.
const MARCA_JS =
  "document.documentElement.classList.add('js');addEventListener('error',function(e){var t=e.target;if(t&&t.tagName==='SCRIPT')document.documentElement.classList.remove('js')},true)";

export default async function RootLayout({ children }: { children: ReactNode }) {
  // El proxy pone un nonce nuevo en cada petición (ver src/proxy.ts). Leerlo
  // hace que todas las páginas se generen al pedirlas: una CSP con nonce no
  // es compatible con HTML generado de antemano.
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  const idioma = await idiomaActual();
  const t = T[idioma];

  return (
    <html
      lang={idioma}
      className={`${fraunces.variable} ${dmSans.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: MARCA_JS }} suppressHydrationWarning />
      </head>
      <body>
        <JsonLd datos={datosTienda(URL_SITIO, t.descripcion, idioma)} />
        <a className="saltar" href="#contenido">
          {t.saltar}
        </a>
        <ProveedorIdioma idioma={idioma}>
          <Proveedores>
            <div role="region" aria-label={t.avisoDemo}>
              <CintaDemo />
            </div>
            {/* Cabecera, pie y <main id="contenido"> los pone cada marco: el
              de la tienda, en app/(tienda)/layout.tsx, y el del panel. */}
            {children}
          </Proveedores>
        </ProveedorIdioma>
      </body>
    </html>
  );
}
