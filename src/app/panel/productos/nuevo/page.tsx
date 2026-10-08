import type { Metadata } from 'next';
import Link from 'next/link';
import { IcoAtras } from '@/componentes/iconos';
import { CabeceraPanel } from '@/componentes/panel/cabecera-panel';
import { FormularioProducto } from '@/componentes/panel/formulario-producto';
import { permisoEscritura } from '@/lib/panel/acceso';
import { panel } from '@/lib/panel/servidor';
import { rutas } from '@/lib/rutas';

export const metadata: Metadata = { title: 'Producto nuevo' };

export default async function ProductoNuevo() {
  const { acceso } = await panel(rutas.panelProductoNuevo);
  const permiso = permisoEscritura(acceso);
  return (
    <>
      <CabeceraPanel
        volver={
          <Link className="volver mini" href={rutas.panelProductos}>
            <IcoAtras width={16} height={16} />
            Productos
          </Link>
        }
        titulo="Producto nuevo"
        descripcion="Nace oculto si no eliges otra cosa. Las fotos se añaden después de crearlo."
      />
      <FormularioProducto producto={null} bloqueado={permiso.ok ? null : permiso.motivo} />
    </>
  );
}
