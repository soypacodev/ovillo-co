import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { BotonVisibilidad } from '@/componentes/panel/boton-visibilidad';
import { CabeceraPanel } from '@/componentes/panel/cabecera-panel';
import { PastillaEstado } from '@/componentes/panel/pastilla-estado';
import { CATEGORIAS } from '@/datos/semilla';
import { eur } from '@/lib/formato';
import { permisoEscritura } from '@/lib/panel/acceso';
import { NOMBRE_ESTADO_PRODUCTO } from '@/lib/panel/estados';
import { panel } from '@/lib/panel/servidor';
import { rutas } from '@/lib/rutas';

export const metadata: Metadata = { title: 'Productos' };

const nombreCategoria = (slug: string) => CATEGORIAS.find((c) => c.slug === slug)?.nombre ?? slug;

export default async function ProductosPanel() {
  const { acceso, fuente } = await panel(rutas.panelProductos);
  const productos = await fuente.productos();
  const permiso = permisoEscritura(acceso);
  const bloqueado = permiso.ok ? null : permiso.motivo;

  return (
    <>
      <CabeceraPanel
        titulo="Productos"
        descripcion="El catálogo completo, también lo oculto. El stock se cuenta por variante."
        acciones={
          <Link className="btn btn-1 btn-p" href={rutas.panelProductoNuevo}>
            Añadir producto
          </Link>
        }
      />
      {bloqueado && <p className="mini resultado-filtros">{bloqueado}</p>}

      <div className="caja-tabla-panel">
        <table className="tabla tabla-panel tabla-productos">
          <caption className="oculto-vis">Productos</caption>
          <thead>
            <tr>
              <th scope="col">Producto</th>
              <th scope="col" className="derecha">
                Precio
              </th>
              <th scope="col">Stock</th>
              <th scope="col">En la tienda</th>
              <th scope="col">
                <span className="oculto-vis">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => {
              const stock = p.variantes.filter((v) => v.activa).reduce((s, v) => s + v.stock, 0);
              return (
                <tr key={p.id}>
                  <th scope="row">
                    <span className="celda-producto">
                      <span className="mini-foto">{p.foto && <Image src={p.foto} alt="" fill sizes="48px" />}</span>
                      <span>
                        <Link className="enlace-fila" href={rutas.panelProducto(p.slug)}>
                          {p.nombre}
                        </Link>
                        <span className="mini-2 celda-sub">
                          {nombreCategoria(p.categoria)}
                          {p.encargo && ` · por encargo (${p.dias} días)`}
                        </span>
                      </span>
                    </span>
                  </th>
                  <td className="derecha sin-salto">
                    <span className="precio">{eur(p.precio)}</span>
                    {p.antes && <span className="antes celda-sub">{eur(p.antes)}</span>}
                  </td>
                  <td>
                    <span className={stock === 0 && !p.encargo ? 'stock-cero' : stock <= 2 ? 'stock-uno' : undefined}>
                      {stock === 0 ? (p.encargo ? 'Por encargo' : 'Agotado') : `${stock} uds.`}
                    </span>
                    <span className="puntos-variantes" aria-label={p.variantes.map((v) => `${v.nombre}: ${v.stock}`).join(', ')}>
                      {p.variantes.map((v) => (
                        <span key={v.id ?? v.nombre} className="muestra muestra-p" style={{ background: v.color }} title={`${v.nombre}: ${v.stock}`} />
                      ))}
                    </span>
                  </td>
                  <td>
                    <PastillaEstado estado={p.estado} texto={NOMBRE_ESTADO_PRODUCTO[p.estado]} />
                  </td>
                  <td className="derecha">
                    <div className="acciones-celda">
                      <Link className="btn btn-4 btn-p" href={rutas.panelProducto(p.slug)}>
                        Editar<span className="oculto-vis"> {p.nombre}</span>
                      </Link>
                      <BotonVisibilidad id={p.id} nombre={p.nombre} estado={p.estado} bloqueado={bloqueado} motivoVisible={false} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
