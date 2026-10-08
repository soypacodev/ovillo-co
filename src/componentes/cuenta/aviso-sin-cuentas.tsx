import Link from 'next/link';
import { IcoInfo } from '@/componentes/iconos';
import { rutas } from '@/lib/rutas';
import { BotonPanelDemo } from './boton-panel-demo';
import { VentajasCuenta } from './ventajas-cuenta';

/** Lo que se ve en las páginas de cuenta cuando la tienda funciona sin
 *  base de datos: qué falta, qué haría la cuenta y adónde ir mientras. */
export function AvisoSinCuentas({ titulo = 'Tu cuenta' }: { titulo?: string }) {
  return (
    <div className="cuenta-acceso">
      <div className="cuenta-formulario">
        <p className="eyebrow ent ent-1">Cuentas</p>
        <h1 className="ent ent-2 cuenta-titulo">{titulo}</h1>
        <div className="aviso mt-6 ent ent-3" role="note">
          <IcoInfo />
          <div>
            <p>
              <b>En esta demostración las cuentas necesitan conectar la base de datos.</b>
            </p>
            <p className="mt-2">
              La tienda funciona entera sin ella: puedes comprar como invitada y tus favoritos se guardan en este
              navegador. Lo que sí puedes ver ya es el panel del taller, con pedidos y encargos de ejemplo.
            </p>
          </div>
        </div>
        <div className="acciones-fila mt-6 ent ent-4">
          <BotonPanelDemo className="btn btn-1" />
          <Link className="btn btn-2" href={rutas.tienda}>
            Seguir mirando la tienda
          </Link>
        </div>
      </div>
      <aside className="ent ent-5">
        <VentajasCuenta />
      </aside>
    </div>
  );
}
