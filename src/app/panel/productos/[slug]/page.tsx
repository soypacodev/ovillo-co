import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IcoAtras, IcoOk } from '@/componentes/iconos';
import { CabeceraPanel } from '@/componentes/panel/cabecera-panel';
import { FormularioProducto } from '@/componentes/panel/formulario-producto';
import { FotosProducto } from '@/componentes/panel/fotos-producto';
import { PastillaEstado } from '@/componentes/panel/pastilla-estado';
import { permisoEscritura } from '@/lib/panel/acceso';
import { NOMBRE_ESTADO_PRODUCTO } from '@/lib/panel/estados';
import { panel } from '@/lib/panel/servidor';
import { parametro, type ParametrosUrl } from '@/lib/parametros';
import { rutas } from '@/lib/rutas';

interface PropsProducto {
  params: Promise<{ slug: string }>;
  searchParams: ParametrosUrl;
}

export const metadata: Metadata = { title: 'Editar producto' };

export default async function ProductoPanel({ params, searchParams }: PropsProducto) {
  const { slug } = await params;
  const { acceso, fuente } = await panel(rutas.panelProducto(slug));
  const producto = await fuente.producto(slug);
  if (!producto) notFound();
  const permiso = permisoEscritura(acceso);
  const bloqueado = permiso.ok ? null : permiso.motivo;
  const recienGuardado = parametro((await searchParams).guardado) === '1';

  return (
    <>
      <CabeceraPanel
        volver={
          <Link className="volver mini" href={rutas.panelProductos}>
            <IcoAtras width={16} height={16} />
            Productos
          </Link>
        }
        titulo={
          <>
            {producto.nombre} <PastillaEstado estado={producto.estado} texto={NOMBRE_ESTADO_PRODUCTO[producto.estado]} />
          </>
        }
        acciones={
          producto.estado === 'publicado' ? (
            <Link className="btn btn-3 btn-p" href={rutas.producto(producto.slug)}>
              Ver en la tienda
            </Link>
          ) : undefined
        }
      />
      {recienGuardado && (
        <p className="aviso aviso-ok mb-6" role="status">
          <IcoOk />
          <span>Producto guardado.</span>
        </p>
      )}

      <div className="producto-editor">
        <FormularioProducto key={producto.slug} producto={producto} bloqueado={bloqueado} />
        <aside className="producto-editor-lado" aria-labelledby="titulo-fotos">
          <section className="panel-caja">
            <h2 id="titulo-fotos" className="panel-caja-titulo">
              Fotos
            </h2>
            <FotosProducto productoId={producto.id} fotos={producto.fotos} bloqueado={bloqueado} />
          </section>
        </aside>
      </div>
    </>
  );
}
