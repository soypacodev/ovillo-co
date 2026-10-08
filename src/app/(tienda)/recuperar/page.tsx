import type { Metadata } from 'next';
import Link from 'next/link';
import { AvisoSinCuentas } from '@/componentes/cuenta/aviso-sin-cuentas';
import { FormularioRecuperar } from '@/componentes/cuenta/formularios-acceso';
import { PantallaAcceso } from '@/componentes/cuenta/pantalla-acceso';
import { configuracionSupabase } from '@/lib/datos/entorno';
import { metadatosPagina } from '@/lib/metadatos';
import { rutas } from '@/lib/rutas';
import '@/estilos/cuenta.css';

export const metadata: Metadata = {
  ...metadatosPagina({
    titulo: 'Recuperar la contraseña',
    descripcion: 'Te mandamos un enlace para elegir una contraseña nueva.',
    ruta: rutas.recuperar,
  }),
  robots: { index: false, follow: true },
};

export default function PaginaRecuperar() {
  if (!configuracionSupabase()) {
    return (
      <div className="wrap">
        <AvisoSinCuentas titulo="Recuperar la contraseña" />
      </div>
    );
  }
  return (
    <div className="wrap">
      <PantallaAcceso
        titulo="¿Se te ha olvidado?"
        entradilla="Pasa. Escribe el correo de tu cuenta y te mandamos un enlace para elegir otra contraseña."
      >
        <FormularioRecuperar />
        <p className="mini mt-5">
          ¿Te has acordado?{' '}
          <Link className="enlace" href={rutas.entrar}>
            Volver a entrar
          </Link>
        </p>
      </PantallaAcceso>
    </div>
  );
}
