import type { Metadata } from 'next';
import { AvisoSinCuentas } from '@/componentes/cuenta/aviso-sin-cuentas';
import { FormularioNuevaContrasena } from '@/componentes/cuenta/formularios-acceso';
import { PantallaAcceso } from '@/componentes/cuenta/pantalla-acceso';
import { exigirPerfil } from '@/lib/cuentas/sesion';
import { metadatosPagina } from '@/lib/metadatos';
import { rutas } from '@/lib/rutas';
import '@/estilos/cuenta.css';

export const metadata: Metadata = {
  ...metadatosPagina({
    titulo: 'Contraseña nueva',
    descripcion: 'Elige una contraseña nueva para tu cuenta.',
    ruta: rutas.nuevaContrasena,
  }),
  robots: { index: false, follow: false },
};

export default async function PaginaNuevaContrasena() {
  // Se llega desde el enlace del correo (que abre la sesión) o desde «Mis datos».
  const perfil = await exigirPerfil(rutas.nuevaContrasena);
  if (!perfil) {
    return (
      <div className="wrap">
        <AvisoSinCuentas titulo="Contraseña nueva" />
      </div>
    );
  }
  return (
    <div className="wrap">
      <PantallaAcceso titulo="Contraseña nueva" entradilla={`Para la cuenta ${perfil.email}.`}>
        <FormularioNuevaContrasena />
      </PantallaAcceso>
    </div>
  );
}
