import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AvisoSinCuentas } from '@/componentes/cuenta/aviso-sin-cuentas';
import { FormularioEnlace, FormularioEntrar } from '@/componentes/cuenta/formularios-acceso';
import { PantallaAcceso } from '@/componentes/cuenta/pantalla-acceso';
import { destinoSeguro } from '@/lib/cuentas/redireccion';
import { usuarioActual } from '@/lib/cuentas/sesion';
import { configuracionSupabase } from '@/lib/datos/entorno';
import { metadatosPagina } from '@/lib/metadatos';
import { parametro, type ParametrosUrl } from '@/lib/parametros';
import { rutas } from '@/lib/rutas';
import '@/estilos/cuenta.css';

export const metadata: Metadata = {
  ...metadatosPagina({
    titulo: 'Entrar',
    descripcion: 'Entra en tu cuenta de Ovillo & Co. para ver tus pedidos, tus direcciones y tus favoritos.',
    ruta: rutas.entrar,
  }),
  robots: { index: false, follow: true },
};

const AVISOS: Record<string, string> = {
  'cuenta-borrada': 'Tu cuenta se ha borrado. Gracias por habernos dejado un hueco en tu casa.',
  'enlace-caducado': 'Ese enlace ya se ha usado o ha caducado. Pide otro o entra con tu contraseña.',
  'demo-no-disponible': 'El panel de demostración no está disponible ahora mismo en esta instalación.',
};

export default async function PaginaEntrar({ searchParams }: { searchParams: ParametrosUrl }) {
  const parametros = await searchParams;
  const siguiente = destinoSeguro(parametro(parametros.siguiente));
  const aviso = AVISOS[parametro(parametros.aviso)] ?? null;

  if (!configuracionSupabase()) {
    return (
      <div className="wrap">
        <AvisoSinCuentas titulo="Entrar" />
      </div>
    );
  }
  if (await usuarioActual()) redirect(siguiente);

  return (
    <div className="wrap">
      <PantallaAcceso
        titulo="Hola otra vez"
        pestana="entrar"
        entradilla="Entra para ver tus pedidos, tus direcciones y lo que guardaste en favoritos."
        aviso={aviso}
      >
        <FormularioEntrar siguiente={siguiente} />
        <div className="separador-o" role="presentation">
          <span>o</span>
        </div>
        <FormularioEnlace siguiente={siguiente} />
      </PantallaAcceso>
    </div>
  );
}
