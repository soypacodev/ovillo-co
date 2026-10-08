import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { BotonSalir } from '@/componentes/cuenta/boton-salir';
import { NavCuenta } from '@/componentes/cuenta/nav-cuenta';
import { perfilActual } from '@/lib/cuentas/sesion';
import { configuracionSupabase } from '@/lib/datos/entorno';
import { rutas } from '@/lib/rutas';
import '@/estilos/cuenta.css';
import '@/estilos/pedido.css';

export const metadata: Metadata = {
  title: { default: 'Tu cuenta', template: '%s · Tu cuenta · Ovillo & Co.' },
  robots: { index: false, follow: false },
};

/** Saludo y pestañas comunes. Cada página comprueba la sesión por su
 *  cuenta (el layout no se vuelve a pintar al cambiar de pestaña). */
export default async function LayoutCuenta({ children }: { children: ReactNode }) {
  if (!configuracionSupabase()) return <div className="wrap">{children}</div>;
  const perfil = await perfilActual();
  if (!perfil) return <div className="wrap">{children}</div>;

  const nombre = perfil.nombre.split(/\s+/)[0] || 'de nuevo';
  return (
    <div className="wrap">
      <header className="cuenta-cab">
        <div>
          <p className="eyebrow">Tu cuenta</p>
          <h1 className="cuenta-titulo mt-1">Hola, {nombre}</h1>
          <p className="mini mt-1">{perfil.email}</p>
        </div>
        <div className="cuenta-cab-acciones">
          {perfil.rol !== 'cliente' && (
            <Link className="btn btn-2 btn-p" href={rutas.panel}>
              Ir al panel del taller
            </Link>
          )}
          <BotonSalir />
        </div>
      </header>
      <NavCuenta />
      <div className="cuenta-cuerpo">{children}</div>
    </div>
  );
}
