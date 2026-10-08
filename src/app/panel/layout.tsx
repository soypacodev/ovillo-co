import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { FranjaDemo } from '@/componentes/panel/franja-demo';
import { NavPanel } from '@/componentes/panel/nav-panel';
import { Ovillo } from '@/componentes/iconos';
import { rutas } from '@/lib/rutas';
import { entrarAlPanel } from '@/lib/panel/servidor';
import '@/estilos/pedido.css';
import '@/estilos/panel.css';

export const metadata: Metadata = {
  title: { default: 'Panel del taller', template: '%s · Panel · Ovillo & Co.' },
  robots: { index: false, follow: false },
};

export default async function LayoutPanel({ children }: { children: ReactNode }) {
  const entrada = await entrarAlPanel();

  if (entrada.tipo === 'prohibido') {
    return (
      <main id="contenido" tabIndex={-1} className="panel-prohibido">
        <Ovillo width={44} height={44} />
        <h1>Esta zona es solo para el taller</h1>
        <p className="lead">
          Has entrado con una cuenta de cliente. El panel lo usan las cuentas de administración y la de demostración.
        </p>
        <div className="acciones-fila">
          <Link className="btn btn-1" href={rutas.cuenta}>
            Ir a mi cuenta
          </Link>
          <Link className="btn btn-2" href={rutas.inicio}>
            Volver a la tienda
          </Link>
        </div>
      </main>
    );
  }

  const { acceso, fuente, nombre } = entrada;
  const resumen = await fuente.resumen();

  return (
    <div className="panel">
      <NavPanel
        contadores={{ pedidos: resumen.pedidos_pendientes, encargos: resumen.encargos_nuevos, mensajes: resumen.mensajes_nuevos }}
        nombre={nombre}
        rolTexto={acceso.rol === 'admin' ? 'Administración' : acceso.modo === 'local' ? 'Modo local, sin base de datos' : 'Cuenta de demostración'}
        conSesion={acceso.modo === 'supabase'}
      />
      <div className="panel-principal">
        {acceso.soloLectura && <FranjaDemo modo={acceso.modo} />}
        <main id="contenido" tabIndex={-1} className="panel-contenido">
          {children}
        </main>
      </div>
    </div>
  );
}
