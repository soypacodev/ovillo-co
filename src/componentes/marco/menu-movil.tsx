'use client';

// Menú a pantalla completa para móvil y tableta. El panel se pinta
// fuera de la cabecera (portal en <body>) porque el desenfoque de la
// cabecera haría que un hijo con position:fixed se recortase a ella.

import { useCallback, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { IcoCerrar, IcoMenu } from '@/componentes/iconos';
import { usePanelModal } from '@/componentes/use-panel-modal';
import { textos } from '@/lib/i18n';
import { useIdioma, useRuta, useTextos } from '@/lib/i18n/cliente';
import { Enlace } from '@/lib/i18n/enlace';
import { MENU_PRINCIPAL, esRutaActual, rutas } from '@/lib/rutas';
import { TextoFavoritos } from './enlaces-cabecera';
import { Logo } from './logo';
import { ListaIdiomas } from './selector-idioma';

const T = textos(
  {
    cuenta: 'Mi cuenta',
    cesta: 'Mi cesta',
    abrir: 'Abrir el menú',
    menu: 'Menú',
    cerrar: 'Cerrar el menú',
    navegacion: 'Navegación móvil',
  },
  {
    en: {
      cuenta: 'My account',
      cesta: 'My basket',
      abrir: 'Open the menu',
      menu: 'Menu',
      cerrar: 'Close the menu',
      navegacion: 'Mobile navigation',
    },
    fr: {
      cuenta: 'Mon compte',
      cesta: 'Mon panier',
      abrir: 'Ouvrir le menu',
      menu: 'Menu',
      cerrar: 'Fermer le menu',
      navegacion: 'Navigation mobile',
    },
    de: {
      cuenta: 'Mein Konto',
      cesta: 'Mein Warenkorb',
      abrir: 'Menü öffnen',
      menu: 'Menü',
      cerrar: 'Menü schließen',
      navegacion: 'Mobile Navigation',
    },
  },
);

const nadaQueEscuchar = () => () => {};

export function MenuMovil({ cuenta }: { cuenta: string }) {
  const idioma = useIdioma();
  const t = useTextos(T);
  // La cuenta depende de la sesión: no tiene sentido precargarla.
  const enlaces: { href: string; texto: ReactNode; precargar?: boolean }[] = [
    ...MENU_PRINCIPAL.map((e) => ({ href: e.href, texto: e.texto[idioma] })),
    { href: cuenta, texto: t.cuenta, precargar: false },
    { href: rutas.favoritos, texto: <TextoFavoritos /> },
    { href: rutas.cesta, texto: t.cesta },
  ];

  const [abierto, setAbierto] = useState(false);
  const ruta = useRuta();
  const panel = useRef<HTMLDivElement>(null);
  const botonCerrar = useRef<HTMLButtonElement>(null);
  const enCliente = useSyncExternalStore(nadaQueEscuchar, () => true, () => false);

  const cerrar = useCallback(() => setAbierto(false), []);
  usePanelModal(abierto, cerrar, panel, botonCerrar);

  return (
    <>
      <button
        type="button"
        className="icono hamburguesa"
        onClick={() => setAbierto(true)}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-controls="menu-movil"
        aria-label={t.abrir}
      >
        <IcoMenu />
      </button>
      {enCliente &&
        createPortal(
          <div
            ref={panel}
            id="menu-movil"
            className={abierto ? 'menu-movil abierto' : 'menu-movil'}
            role="dialog"
            aria-modal="true"
            aria-label={t.menu}
            aria-hidden={!abierto}
            inert={!abierto}
          >
            <div className="nav">
              <Logo alPulsar={cerrar} />
              <button ref={botonCerrar} type="button" className="icono" onClick={cerrar} aria-label={t.cerrar}>
                <IcoCerrar />
              </button>
            </div>
            <nav aria-label={t.navegacion}>
              <ul>
                {enlaces.map((e) => (
                  <li key={e.href}>
                    <Enlace
                      href={e.href}
                      prefetch={e.precargar}
                      onClick={cerrar}
                      aria-current={esRutaActual(e.href, ruta) ? 'page' : undefined}
                    >
                      {e.texto}
                    </Enlace>
                  </li>
                ))}
              </ul>
            </nav>
            <ListaIdiomas alElegir={cerrar} />
          </div>,
          document.body,
        )}
    </>
  );
}
