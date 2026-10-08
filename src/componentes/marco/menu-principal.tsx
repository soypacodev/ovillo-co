'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MENU_PRINCIPAL, esRutaActual } from '@/lib/rutas';

export function MenuPrincipal() {
  const ruta = usePathname();
  return (
    <nav className="menu" aria-label="Navegación principal">
      {MENU_PRINCIPAL.map((e) => (
        <Link key={e.href} href={e.href} aria-current={esRutaActual(e.href, ruta) ? 'page' : undefined}>
          {e.texto}
        </Link>
      ))}
    </nav>
  );
}
