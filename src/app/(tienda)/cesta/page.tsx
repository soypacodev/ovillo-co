import type { Metadata } from 'next';
import { connection } from 'next/server';
import { Migas } from '@/componentes/contenido/migas';
import { VistaCesta } from '@/componentes/compra/vista-cesta';
import { paraCesta, stockTotal, TarjetaProducto } from '@/componentes/producto/tarjeta-producto';
import { catalogo } from '@/lib/datos';
import { elegirRelacionados } from '@/lib/datos/filtros';

import '@/componentes/compra/compra.css';

export const metadata: Metadata = {
  title: 'Tu cesta',
  robots: { index: false, follow: true },
};

export default async function PaginaCesta() {
  // Precios y stock al día en cada visita: con ellos se corrige la cesta guardada.
  await connection();
  const fuente = catalogo();
  const [productos, metodos] = await Promise.all([fuente.productos(), fuente.metodosEnvio()]);

  // Las tarjetas se pintan aquí, en el servidor; el cliente solo elige
  // cuáles enseñar (sugerencias o favoritos) según la cesta guardada.
  const tarjetas = Object.fromEntries(productos.map((p) => [p.slug, <TarjetaProducto key={p.slug} producto={p} />]));

  return (
    <div className="wrap">
      <Migas actual="Tu cesta" />
      <header className="compra-cab">
        <h1 className="ent ent-1">Tu cesta</h1>
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
