import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ListaFavoritos } from '@/componentes/cuenta/lista-favoritos';
import { TarjetaProducto } from '@/componentes/producto/tarjeta-producto';
import { exigirPerfil } from '@/lib/cuentas/sesion';
import { catalogo } from '@/lib/datos';
import { rutas } from '@/lib/rutas';

export const metadata: Metadata = { title: 'Tus favoritos' };

export default async function PaginaFavoritos() {
  // Sin base de datos no hay cuentas, pero los favoritos del navegador sí.
  const perfil = await exigirPerfil(rutas.cuentaFavoritos);
  if (!perfil) redirect(rutas.favoritos);
  const productos = await catalogo().productos();
  const tarjetas = Object.fromEntries(productos.map((p) => [p.slug, <TarjetaProducto key={p.slug} producto={p} />]));

  return (
    <section aria-labelledby="titulo-favoritos">
      <h2 id="titulo-favoritos" className="cuenta-seccion">
        Tus favoritos
      </h2>
      <ListaFavoritos tarjetas={tarjetas} />
    </section>
  );
}
