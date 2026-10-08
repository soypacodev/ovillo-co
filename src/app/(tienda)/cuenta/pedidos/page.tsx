import type { Metadata } from 'next';
import Link from 'next/link';
import { AvisoSinCuentas } from '@/componentes/cuenta/aviso-sin-cuentas';
import { TarjetaPedidoCuenta } from '@/componentes/cuenta/tarjeta-pedido';
import { misPedidos } from '@/lib/cuentas/datos';
import { exigirPerfil } from '@/lib/cuentas/sesion';
import { rutas } from '@/lib/rutas';

export const metadata: Metadata = { title: 'Tus pedidos' };

export default async function PaginaPedidos() {
  const perfil = await exigirPerfil(rutas.cuentaPedidos);
  if (!perfil) return <AvisoSinCuentas titulo="Tus pedidos" />;
  const pedidos = await misPedidos(perfil.id);

  return (
    <section aria-labelledby="titulo-pedidos">
      <h2 id="titulo-pedidos" className="cuenta-seccion">
        Tus pedidos
      </h2>
      {pedidos.length ? (
        <ul className="lista-pedidos">
          {pedidos.map((p) => (
            <li key={p.id}>
              <TarjetaPedidoCuenta pedido={p} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="caja-cl cuenta-vacia">
          <p>Todavía no hay pedidos en esta cuenta.</p>
          <p className="mini mt-2">
            Si compraste sin entrar, el seguimiento te llegó por correo. Para cualquier duda,{' '}
            <Link className="enlace" href={rutas.contacto}>
              escríbenos
            </Link>{' '}
            con el número de pedido.
          </p>
        </div>
      )}
    </section>
  );
}
