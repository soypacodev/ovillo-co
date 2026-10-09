import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ListaFavoritos } from '@/componentes/cuenta/lista-favoritos';
import { TarjetaProducto } from '@/componentes/producto/tarjeta-producto';
import { exigirPerfil } from '@/lib/cuentas/sesion';
import { catalogo } from '@/lib/datos';
import { conIdioma, textos } from '@/lib/i18n';
import { idiomaActual } from '@/lib/i18n/servidor';
import { rutas } from '@/lib/rutas';

const T = textos(
  { titulo: 'Tus favoritos' },
  { en: { titulo: 'Your favourites' }, fr: { titulo: 'Vos favoris' }, de: { titulo: 'Ihre Favoriten' } },
);

export async function generateMetadata(): Promise<Metadata> {
  return { title: T[await idiomaActual()].titulo };
}

export default async function PaginaFavoritos() {
  const idioma = await idiomaActual();
  // Sin base de datos no hay cuentas, pero los favoritos del navegador sí.
  const perfil = await exigirPerfil(rutas.cuentaFavoritos);
  if (!perfil) redirect(conIdioma(rutas.favoritos, idioma));
  const productos = await catalogo(idioma).productos();
  const tarjetas = Object.fromEntries(productos.map((p) => [p.slug, <TarjetaProducto key={p.slug} producto={p} />]));

  return (
    <section aria-labelledby="titulo-favoritos">
      <h2 id="titulo-favoritos" className="cuenta-seccion">
        {T[idioma].titulo}
      </h2>
      <ListaFavoritos tarjetas={tarjetas} />
    </section>
  );
}
