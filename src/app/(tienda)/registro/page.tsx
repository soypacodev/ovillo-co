import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AvisoSinCuentas } from '@/componentes/cuenta/aviso-sin-cuentas';
import { FormularioRegistro } from '@/componentes/cuenta/formularios-acceso';
import { PantallaAcceso } from '@/componentes/cuenta/pantalla-acceso';
import { usuarioActual } from '@/lib/cuentas/sesion';
import { configuracionSupabase } from '@/lib/datos/entorno';
import { metadatosPagina } from '@/lib/metadatos';
import { rutas } from '@/lib/rutas';
import '@/estilos/cuenta.css';

export const metadata: Metadata = {
  ...metadatosPagina({
    titulo: 'Crear una cuenta',
    descripcion: 'Crea tu cuenta en Ovillo & Co. para seguir tus pedidos y no repetir la dirección en cada compra.',
    ruta: rutas.registro,
  }),
  robots: { index: false, follow: true },
};

export default async function PaginaRegistro() {
  if (!configuracionSupabase()) {
    return (
      <div className="wrap">
        <AvisoSinCuentas titulo="Crear una cuenta" />
      </div>
    );
  }
  if (await usuarioActual()) redirect(rutas.cuenta);

  return (
    <div className="wrap">
      <PantallaAcceso
        titulo="Crear una cuenta"
        pestana="registro"
        entradilla="No hace falta para comprar, pero va bien para no repetir la dirección cada vez."
      >
        <FormularioRegistro />
      </PantallaAcceso>
    </div>
  );
}
