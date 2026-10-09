import type { Metadata } from 'next';
import { connection } from 'next/server';
import { Migas } from '@/componentes/contenido/migas';
import { VistaCesta } from '@/componentes/compra/vista-cesta';
import { paraCesta, stockTotal, TarjetaProducto } from '@/componentes/producto/tarjeta-producto';
import { catalogo } from '@/lib/datos';
import { elegirRelacionados } from '@/lib/datos/filtros';
import { textos } from '@/lib/i18n';
import { idiomaActual } from '@/lib/i18n/servidor';

import '@/componentes/compra/compra.css';

const T = textos(
  { titulo: 'Tu cesta' },
  { en: { titulo: 'Your basket' }, fr: { titulo: 'Votre panier' }, de: { titulo: 'Ihr Warenkorb' } },
);

export async function generateMetadata(): Promise<Metadata> {
  const idioma = await idiomaActual();
  return {
    title: T[idioma].titulo,
    robots: { index: false, follow: true },
  };
}

export default async function PaginaCesta() {
  // Precios y stock al día en cada visita: con ellos se corrige la cesta guardada.
  await connection();
  const idioma = await idiomaActual();
  const t = T[idioma];
  // Nombres y envíos en el idioma de la página; slugs, variantes y precios no cambian.
  const fuente = catalogo(idioma);
  const [productos, metodos] = await Promise.all([fuente.productos(), fuente.metodosEnvio()]);

  // Las tarjetas se pintan aquí, en el servidor; el cliente solo elige
  // cuáles enseñar (sugerencias o favoritos) según la cesta guardada.
  const tarjetas = Object.fromEntries(productos.map((p) => [p.slug, <TarjetaProducto key={p.slug} producto={p} />]));

  return (
    <div className="wrap">
      <Migas actual={t.titulo} />
      <header className="compra-cab">
        <h1 className="ent ent-1">{t.titulo}</h1>
      </header>
      <VistaCesta
        productos={productos.map(paraCesta)}
        metodos={metodos}
        tarjetas={tarjetas}
        sugeribles={productos.filter((p) => stockTotal(p) > 0).map((p) => p.slug)}
        afines={Object.fromEntries(
          productos.map((p) => [p.slug, elegirRelacionados(productos, p.slug, 8).map((r) => r.slug)]),
        )}
      />
    </div>
  );
}
