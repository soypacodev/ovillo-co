'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { rutas } from '@/lib/rutas';

const SECCIONES = [
  { href: rutas.cuenta, texto: 'Resumen' },
  { href: rutas.cuentaPedidos, texto: 'Pedidos' },
  { href: rutas.cuentaFavoritos, texto: 'Favoritos' },
  { href: rutas.cuentaDirecciones, texto: 'Direcciones' },
  { href: rutas.cuentaDatos, texto: 'Mis datos' },
];

/** Pestañas de la cuenta. «Resumen» solo se marca en su propia página;
 *  el resto también en sus páginas hijas (el detalle de un pedido). */
export function NavCuenta() {
  const ruta = usePathname();
  return (
    <nav className="nav-cuenta" aria-label="Secciones de tu cuenta">
      <ul>
        {SECCIONES.map((s) => {
          const actual = s.href === rutas.cuenta ? ruta === s.href : ruta === s.href || ruta.startsWith(`${s.href}/`);
          return (
            <li key={s.href}>
              <Link href={s.href} aria-current={actual ? 'page' : undefined}>
                {s.texto}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
