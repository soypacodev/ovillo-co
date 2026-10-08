import type { Metadata } from 'next';
import Link from 'next/link';
import { Migas } from '@/componentes/contenido/migas';
import { ListaFavoritos } from '@/componentes/cuenta/lista-favoritos';
import { TarjetaProducto } from '@/componentes/producto/tarjeta-producto';
import { catalogo } from '@/lib/datos';
import { configuracionSupabase } from '@/lib/datos/entorno';
import { rutas } from '@/lib/rutas';

import '@/estilos/catalogo.css';
import '@/estilos/cuenta.css';

export const metadata: Metadata = {
  title: 'Tus favoritos',
  robots: { index: false, follow: true },
};

/** Favoritos sin necesidad de cuenta: la lista vive en este navegador y,
 *  si hay sesión, se une con la de la cuenta al cargar la tienda. */
export default async function PaginaFavoritos() {
  const productos = await catalogo().productos();
  const tarjetas = Object.fromEntries(productos.map((p) => [p.slug, <TarjetaProducto key={p.slug} producto={p} />]));
  const conCuentas = configuracionSupabase() !== null;

  return (
    <div className="wrap">
      <Migas actual="Favoritos" />
      <header className="cab-tienda">
        <h1 className="ent ent-1">Tus favoritos</h1>
        <p className="lead ent ent-2">
          Lo que has guardado con el corazón se queda en este navegador.
          {conCuentas && (
            <>
              {' '}
              Si <Link className="enlace-texto" href={rutas.entrar}>entras en tu cuenta</Link>, también lo verás en tus
              otros dispositivos.
            </>
          )}
        </p>
      </header>
      <section aria-label="Piezas guardadas" className="favoritos-pagina">
        <ListaFavoritos tarjetas={tarjetas} entreDispositivos={conCuentas} />
      </section>
    </div>
  );
}
