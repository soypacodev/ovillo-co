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

import '@/estilos/tokens.css';
import '@/estilos/base.css';
import '@/estilos/componentes.css';
import '@/estilos/marco.css';
import '@/estilos/pantallas.css';
import '@/estilos/animaciones.css';

const URL_SITIO = urlSitio();
const DESCRIPCION =
  'Amigurumis, mantas y accesorios de crochet tejidos a mano en Málaga, de uno en uno. Piezas únicas y encargos personalizados. Tienda de demostración.';

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITIO),
  title: {
    default: 'Ovillo & Co. · Crochet hecho a mano en Málaga',
    template: '%s · Ovillo & Co.',
  },
  description: DESCRIPCION,
  applicationName: 'Ovillo & Co.',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'Ovillo & Co.',
    title: 'Ovillo & Co. · Crochet hecho a mano en Málaga',
    description: DESCRIPCION,
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

export const viewport: Viewport = {
  themeColor: '#F8F6F2',
  colorScheme: 'light',
};

// Marca <html> con .js antes de pintar: las animaciones de aparición solo
// esconden el contenido cuando hay JavaScript para enseñarlo después. Si
// falla la carga de algún script, se quita y todo queda visible.
const MARCA_JS =
  "document.documentElement.classList.add('js');addEventListener('error',function(e){var t=e.target;if(t&&t.tagName==='SCRIPT')document.documentElement.classList.remove('js')},true)";

const DATOS_MARCA = datosTienda(URL_SITIO, DESCRIPCION);

export default async function RootLayout({ children }: { children: ReactNode }) {
  // El proxy pone un nonce nuevo en cada petición (ver src/proxy.ts). Leerlo
  // hace que todas las páginas se generen al pedirlas: una CSP con nonce no
  // es compatible con HTML generado de antemano.
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <html lang="es" className={`${fraunces.variable} ${dmSans.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: MARCA_JS }} suppressHydrationWarning />
      </head>
      <body>
        <JsonLd datos={DATOS_MARCA} />
        <a className="saltar" href="#contenido">
          Saltar al contenido
        </a>
        <Proveedores>
          <div role="region" aria-label="Aviso de demostración">
            <CintaDemo />
          </div>
          {/* Cabecera, pie y <main id="contenido"> los pone cada marco: el
              de la tienda, en app/(tienda)/layout.tsx, y el del panel. */}
          {children}
        </Proveedores>
      </body>
    </html>
  );
}
