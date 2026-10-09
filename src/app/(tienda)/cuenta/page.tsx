import type { Metadata } from 'next';
import { AvisoSinCuentas } from '@/componentes/cuenta/aviso-sin-cuentas';
import { TarjetaPedidoCuenta } from '@/componentes/cuenta/tarjeta-pedido';
import { IcoCamion, IcoCorazonG, IcoSobre } from '@/componentes/iconos';
import { cuantosFavoritos, misDirecciones, misPedidos } from '@/lib/cuentas/datos';
import { exigirPerfil } from '@/lib/cuentas/sesion';
import { textos } from '@/lib/i18n';
import { Enlace } from '@/lib/i18n/enlace';
import { idiomaActual } from '@/lib/i18n/servidor';
import { rutas } from '@/lib/rutas';

const T = textos(
  {
    titulo: 'Resumen',
    ultimo: 'Tu último pedido',
    sinPedidos: 'Aún no has hecho ningún pedido con esta cuenta.',
    apareceran: 'Los pedidos que hagas con la sesión abierta aparecerán aquí, con su seguimiento.',
    verTienda: 'Ver la tienda',
    atajos: 'Atajos',
    pedidos: (n: number) => (n === 1 ? '1 pedido' : `${n} pedidos`),
    historial: 'Historial y seguimiento',
    favoritos: (n: number) => (n === 1 ? '1 favorito' : `${n} favoritos`),
    paraLuego: 'Lo que te guardaste para luego',
    direcciones: (n: number) => (n === 1 ? '1 dirección' : `${n} direcciones`),
    anade: 'Añade una para ir más rápido',
    cuentaEspecial: (demo: boolean) =>
      `Esta es una cuenta ${demo ? 'de demostración' : 'del taller'}: sus pedidos de prueba se ven en el panel.`,
  },
  {
    en: {
      titulo: 'Overview',
      ultimo: 'Your latest order',
      sinPedidos: "You haven't placed any orders with this account yet.",
      apareceran: 'Orders you place while signed in will appear here, with their tracking.',
      verTienda: 'Visit the shop',
      atajos: 'Shortcuts',
      pedidos: (n: number) => (n === 1 ? '1 order' : `${n} orders`),
      historial: 'History and tracking',
      favoritos: (n: number) => (n === 1 ? '1 favourite' : `${n} favourites`),
      paraLuego: 'What you saved for later',
      direcciones: (n: number) => (n === 1 ? '1 address' : `${n} addresses`),
      anade: 'Add one to check out faster',
      cuentaEspecial: (demo: boolean) =>
        `This is ${demo ? 'a demo' : 'a workshop'} account: its test orders appear in the dashboard.`,
    },
    fr: {
      titulo: 'Aperçu',
      ultimo: 'Votre dernière commande',
      sinPedidos: 'Vous n’avez encore passé aucune commande avec ce compte.',
      apareceran: 'Les commandes passées avec votre session ouverte apparaîtront ici, avec leur suivi.',
      verTienda: 'Voir la boutique',
      atajos: 'Raccourcis',
      pedidos: (n: number) => (n === 1 ? '1 commande' : `${n} commandes`),
      historial: 'Historique et suivi',
      favoritos: (n: number) => (n === 1 ? '1 favori' : `${n} favoris`),
      paraLuego: 'Ce que vous avez gardé pour plus tard',
      direcciones: (n: number) => (n === 1 ? '1 adresse' : `${n} adresses`),
      anade: 'Ajoutez-en une pour aller plus vite',
      cuentaEspecial: (demo: boolean) =>
        `Ceci est un compte ${demo ? 'de démonstration' : 'de l’atelier'} : ses commandes de test sont visibles dans le tableau de bord.`,
    },
    de: {
      titulo: 'Übersicht',
      ultimo: 'Ihre letzte Bestellung',
      sinPedidos: 'Sie haben mit diesem Konto noch nichts bestellt.',
      apareceran: 'Bestellungen, die Sie angemeldet aufgeben, erscheinen hier mit ihrer Sendungsverfolgung.',
      verTienda: 'Zum Shop',
      atajos: 'Schnellzugriff',
      pedidos: (n: number) => (n === 1 ? '1 Bestellung' : `${n} Bestellungen`),
      historial: 'Verlauf und Sendungsverfolgung',
      favoritos: (n: number) => (n === 1 ? '1 Favorit' : `${n} Favoriten`),
      paraLuego: 'Was Sie sich für später gemerkt haben',
      direcciones: (n: number) => (n === 1 ? '1 Adresse' : `${n} Adressen`),
      anade: 'Fügen Sie eine hinzu, dann geht es schneller',
      cuentaEspecial: (demo: boolean) =>
        `Dies ist ${demo ? 'ein Demo-Konto' : 'ein Werkstatt-Konto'}: Seine Testbestellungen sehen Sie im Dashboard.`,
    },
  },
);

export async function generateMetadata(): Promise<Metadata> {
  return { title: T[await idiomaActual()].titulo };
}

export default async function PaginaCuenta() {
  const perfil = await exigirPerfil(rutas.cuenta);
  if (!perfil) return <AvisoSinCuentas />;
  const t = T[await idiomaActual()];

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
          {t.ultimo}
        </h2>
        {ultimo ? (
          <TarjetaPedidoCuenta pedido={ultimo} />
        ) : (
          <div className="caja-cl cuenta-vacia">
            <p>{t.sinPedidos}</p>
            <p className="mini mt-2">{t.apareceran}</p>
            <Enlace className="btn btn-1 mt-5" href={rutas.tienda}>
              {t.verTienda}
            </Enlace>
          </div>
        )}
      </section>

      <section aria-labelledby="atajos" className="cuenta-atajos">
        <h2 id="atajos" className="oculto-vis">
          {t.atajos}
        </h2>
        <Enlace className="atajo" href={rutas.cuentaPedidos}>
          <IcoCamion />
          <span>
            <b>{t.pedidos(pedidos.length)}</b>
            <span className="mini">{t.historial}</span>
          </span>
        </Enlace>
        <Enlace className="atajo" href={rutas.cuentaFavoritos}>
          <IcoCorazonG />
          <span>
            <b>{t.favoritos(favoritos)}</b>
            <span className="mini">{t.paraLuego}</span>
          </span>
        </Enlace>
        <Enlace className="atajo" href={rutas.cuentaDirecciones}>
          <IcoSobre />
          <span>
            <b>{t.direcciones(direcciones.length)}</b>
            <span className="mini">
              {predeterminada ? `${predeterminada.ciudad} · ${predeterminada.codigo_postal}` : t.anade}
            </span>
          </span>
        </Enlace>
      </section>

      {perfil.rol !== 'cliente' && <p className="aviso mt-6">{t.cuentaEspecial(perfil.rol === 'demo')}</p>}
    </div>
  );
}
