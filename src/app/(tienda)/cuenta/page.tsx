import type { Metadata } from 'next';
import Link from 'next/link';
import { AvisoSinCuentas } from '@/componentes/cuenta/aviso-sin-cuentas';
import { TarjetaPedidoCuenta } from '@/componentes/cuenta/tarjeta-pedido';
import { IcoCamion, IcoCorazonG, IcoSobre } from '@/componentes/iconos';
import { cuantosFavoritos, misDirecciones, misPedidos } from '@/lib/cuentas/datos';
import { exigirPerfil } from '@/lib/cuentas/sesion';
import { rutas } from '@/lib/rutas';

export const metadata: Metadata = { title: 'Resumen' };

export default async function PaginaCuenta() {
  const perfil = await exigirPerfil(rutas.cuenta);
  if (!perfil) return <AvisoSinCuentas />;

  const [pedidos, favoritos, direcciones] = await Promise.all([
    misPedidos(perfil.id, 20),
    cuantosFavoritos(perfil.id),
    misDirecciones(perfil.id),
  ]);
  const ultimo = pedidos[0];
  const predeterminada = direcciones.find((d) => d.predeterminada) ?? direcciones[0];

  return (
    <div className="cuenta-resumen">
      <section aria-labelledby="ultimo-pedido">
        <h2 id="ultimo-pedido" className="cuenta-seccion">
          Tu último pedido
        </h2>
        {ultimo ? (
          <TarjetaPedidoCuenta pedido={ultimo} />
        ) : (
          <div className="caja-cl cuenta-vacia">
            <p>Aún no has hecho ningún pedido con esta cuenta.</p>
            <p className="mini mt-2">
              Los pedidos que hagas con la sesión abierta aparecerán aquí, con su seguimiento.
            </p>
            <Link className="btn btn-1 mt-5" href={rutas.tienda}>
              Ver la tienda
            </Link>
          </div>
        )}
      </section>

      <section aria-labelledby="atajos" className="cuenta-atajos">
        <h2 id="atajos" className="oculto-vis">
          Atajos
        </h2>
        <Link className="atajo" href={rutas.cuentaPedidos}>
          <IcoCamion />
          <span>
            <b>{pedidos.length === 1 ? '1 pedido' : `${pedidos.length} pedidos`}</b>
            <span className="mini">Historial y seguimiento</span>
          </span>
        </Link>
        <Link className="atajo" href={rutas.cuentaFavoritos}>
          <IcoCorazonG />
          <span>
            <b>{favoritos === 1 ? '1 favorito' : `${favoritos} favoritos`}</b>
            <span className="mini">Lo que te guardaste para luego</span>
          </span>
        </Link>
        <Link className="atajo" href={rutas.cuentaDirecciones}>
          <IcoSobre />
          <span>
            <b>{direcciones.length === 1 ? '1 dirección' : `${direcciones.length} direcciones`}</b>
            <span className="mini">
              {predeterminada ? `${predeterminada.ciudad} · ${predeterminada.codigo_postal}` : 'Añade una para ir más rápido'}
            </span>
          </span>
        </Link>
      </section>

      {perfil.rol !== 'cliente' && (
        <p className="aviso mt-6">
          Esta es una cuenta {perfil.rol === 'demo' ? 'de demostración' : 'del taller'}: sus pedidos de prueba se ven en el panel.
        </p>
      )}
    </div>
  );
}
