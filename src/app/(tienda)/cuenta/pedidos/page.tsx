import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AvisoSinCuentas } from '@/componentes/cuenta/aviso-sin-cuentas';
import { TarjetaPedidoCuenta } from '@/componentes/cuenta/tarjeta-pedido';
import { misPedidos } from '@/lib/cuentas/datos';
import { exigirPerfil } from '@/lib/cuentas/sesion';
import { textos } from '@/lib/i18n';
import { Enlace } from '@/lib/i18n/enlace';
import { idiomaActual } from '@/lib/i18n/servidor';
import { rutas } from '@/lib/rutas';

const T = textos(
  {
    titulo: 'Tus pedidos',
    sinPedidos: 'Todavía no hay pedidos en esta cuenta.',
    sinEntrar: (escribenos: ReactNode) => (
      <>
        Si compraste sin entrar, el seguimiento te llegó por correo. Para cualquier duda, {escribenos} con el número de
        pedido.
      </>
    ),
    escribenos: 'escríbenos',
  },
  {
    en: {
      titulo: 'Your orders',
      sinPedidos: 'There are no orders on this account yet.',
      sinEntrar: (escribenos: ReactNode) => (
        <>
          If you bought without signing in, the tracking details came by email. If you have any questions, {escribenos}{' '}
          with your order number.
        </>
      ),
      escribenos: 'drop us a line',
    },
    fr: {
      titulo: 'Vos commandes',
      sinPedidos: 'Il n’y a pas encore de commande sur ce compte.',
      sinEntrar: (escribenos: ReactNode) => (
        <>
          Si vous avez acheté sans vous connecter, le suivi vous a été envoyé par e-mail. Pour toute question, {escribenos}{' '}
          en indiquant le numéro de commande.
        </>
      ),
      escribenos: 'écrivez-nous',
    },
    de: {
      titulo: 'Ihre Bestellungen',
      sinPedidos: 'Zu diesem Konto gibt es noch keine Bestellungen.',
      sinEntrar: (escribenos: ReactNode) => (
        <>
          Wenn Sie ohne Anmeldung bestellt haben, kam die Sendungsverfolgung per E-Mail. Bei Fragen {escribenos} mit der
          Bestellnummer.
        </>
      ),
      escribenos: 'schreiben Sie uns',
    },
  },
);

export async function generateMetadata(): Promise<Metadata> {
  return { title: T[await idiomaActual()].titulo };
}

export default async function PaginaPedidos() {
  const t = T[await idiomaActual()];
  const perfil = await exigirPerfil(rutas.cuentaPedidos);
  if (!perfil) return <AvisoSinCuentas titulo={t.titulo} />;
  const pedidos = await misPedidos(perfil.id);

  return (
    <section aria-labelledby="titulo-pedidos">
      <h2 id="titulo-pedidos" className="cuenta-seccion">
        {t.titulo}
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
          <p>{t.sinPedidos}</p>
          <p className="mini mt-2">
            {t.sinEntrar(
              <Enlace className="enlace" href={rutas.contacto}>
                {t.escribenos}
              </Enlace>,
            )}
          </p>
        </div>
      )}
    </section>
  );
}
