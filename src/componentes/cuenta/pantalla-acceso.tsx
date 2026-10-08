import Link from 'next/link';
import type { ReactNode } from 'react';
import { IcoInfo } from '@/componentes/iconos';
import { rutas } from '@/lib/rutas';
import { BotonPanelDemo } from './boton-panel-demo';
import { VentajasCuenta } from './ventajas-cuenta';

interface PropsPantalla {
  titulo: string;
  entradilla: ReactNode;
  /** Pestaña marcada; sin ella no se enseñan las pestañas. */
  pestana?: 'entrar' | 'registro';
  /** Aviso que llega en la URL (cuenta borrada, enlace caducado…). */
  aviso?: string | null;
  children: ReactNode;
}

/** Marco común de entrar, registro y contraseñas: formulario a un lado y,
 *  al otro, para qué sirve la cuenta y la puerta al panel de demostración. */
export function PantallaAcceso({ titulo, entradilla, pestana, aviso, children }: PropsPantalla) {
  return (
    <div className="cuenta-acceso">
      <div className="cuenta-formulario">
        <h1 className="ent ent-1 cuenta-titulo">{titulo}</h1>
        {pestana && (
          <nav className="pestanas ent ent-2" aria-label="Acceso">
            <Link href={rutas.entrar} aria-current={pestana === 'entrar' ? 'page' : undefined}>
              Ya tengo cuenta
            </Link>
            <Link href={rutas.registro} aria-current={pestana === 'registro' ? 'page' : undefined}>
              Crear cuenta
            </Link>
          </nav>
        )}
        <p className="lead cuenta-entradilla ent ent-3">{entradilla}</p>
        {aviso && (
          <div className="aviso mt-5" role="status">
            <IcoInfo />
            <span>{aviso}</span>
          </div>
        )}
        <div className="ent ent-4">{children}</div>
        <p className="mini-2 centro mt-7">
          También puedes{' '}
          <Link href={rutas.tienda} className="enlace">
            comprar sin cuenta
          </Link>
          .
        </p>
      </div>

      <aside className="cuenta-lateral ent ent-5" aria-label="Sobre las cuentas">
        <VentajasCuenta />
        <div className="caja-cl mt-4 cuenta-demo">
          <h2 className="titulo-mini">¿Eres del taller o vienes a curiosear?</h2>
          <p className="mini mt-2">
            El panel de demostración enseña cómo se gestionan pedidos, productos y encargos. Se puede mirar todo; los
            cambios no se guardan.
          </p>
          <BotonPanelDemo className="btn btn-2 btn-p mt-4" />
        </div>
      </aside>
    </div>
  );
}
