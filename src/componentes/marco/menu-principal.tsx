'use client';

import { textos } from '@/lib/i18n';
import { useIdioma, useRuta, useTextos } from '@/lib/i18n/cliente';
import { Enlace } from '@/lib/i18n/enlace';
import { MENU_PRINCIPAL, esRutaActual } from '@/lib/rutas';

const T = textos(
  { navegacion: 'Navegación principal' },
  {
    en: { navegacion: 'Main navigation' },
    fr: { navegacion: 'Navigation principale' },
    de: { navegacion: 'Hauptnavigation' },
  },
);

export function MenuPrincipal() {
  const ruta = useRuta();
  const idioma = useIdioma();
  const t = useTextos(T);
  return (
    <nav className="menu" aria-label={t.navegacion}>
      {MENU_PRINCIPAL.map((e) => (
        <Enlace key={e.href} href={e.href} aria-current={esRutaActual(e.href, ruta) ? 'page' : undefined}>
          {e.texto[idioma]}
        </Enlace>
      ))}
    </nav>
  );
}
