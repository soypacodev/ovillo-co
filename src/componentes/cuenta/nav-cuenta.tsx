'use client';

import { textos } from '@/lib/i18n';
import { useRuta, useTextos } from '@/lib/i18n/cliente';
import { Enlace } from '@/lib/i18n/enlace';
import { rutas } from '@/lib/rutas';

const SECCIONES = [rutas.cuenta, rutas.cuentaPedidos, rutas.cuentaFavoritos, rutas.cuentaDirecciones, rutas.cuentaDatos];

const T = textos(
  {
    secciones: ['Resumen', 'Pedidos', 'Favoritos', 'Direcciones', 'Mis datos'],
    nav: 'Secciones de tu cuenta',
  },
  {
    en: { secciones: ['Overview', 'Orders', 'Favourites', 'Addresses', 'My details'], nav: 'Sections of your account' },
    fr: { secciones: ['Aperçu', 'Commandes', 'Favoris', 'Adresses', 'Mes informations'], nav: 'Rubriques de votre compte' },
    de: { secciones: ['Übersicht', 'Bestellungen', 'Favoriten', 'Adressen', 'Meine Daten'], nav: 'Bereiche Ihres Kontos' },
  },
);

/** Pestañas de la cuenta. «Resumen» solo se marca en su propia página;
 *  el resto también en sus páginas hijas (el detalle de un pedido). */
export function NavCuenta() {
  const ruta = useRuta();
  const t = useTextos(T);
  return (
    <nav className="nav-cuenta" aria-label={t.nav}>
      <ul>
        {SECCIONES.map((href, i) => {
          const actual = href === rutas.cuenta ? ruta === href : ruta === href || ruta.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Enlace href={href} aria-current={actual ? 'page' : undefined}>
                {t.secciones[i]}
              </Enlace>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
