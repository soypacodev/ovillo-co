'use client';

// Menú a pantalla completa para móvil y tableta. El panel se pinta
// fuera de la cabecera (portal en <body>) porque el desenfoque de la
// cabecera haría que un hijo con position:fixed se recortase a ella.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { IcoCerrar, IcoMenu } from '@/componentes/iconos';
import { usePanelModal } from '@/componentes/use-panel-modal';
import { MENU_PRINCIPAL, esRutaActual, rutas } from '@/lib/rutas';
import { TextoFavoritos } from './enlaces-cabecera';
import { Logo } from './logo';

const nadaQueEscuchar = () => () => {};

export function MenuMovil({ cuenta }: { cuenta: string }) {
  // La cuenta depende de la sesión: no tiene sentido precargarla.
  const enlaces: { href: string; texto: ReactNode; precargar?: boolean }[] = [
    ...MENU_PRINCIPAL,
    { href: cuenta, texto: 'Mi cuenta', precargar: false },
    { href: rutas.favoritos, texto: <TextoFavoritos /> },
    { href: rutas.cesta, texto: 'Mi cesta' },
  ];

  const [abierto, setAbierto] = useState(false);
  const ruta = usePathname();
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
        aria-label="Abrir el menú"
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
            aria-label="Menú"
            aria-hidden={!abierto}
            inert={!abierto}
          >
            <div className="nav">
              <Logo alPulsar={cerrar} />
              <button ref={botonCerrar} type="button" className="icono" onClick={cerrar} aria-label="Cerrar el menú">
                <IcoCerrar />
              </button>
            </div>
            <nav aria-label="Navegación móvil">
              <ul>
                {enlaces.map((e) => (
                  <li key={e.href}>
                    <Link
                      href={e.href}
                      prefetch={e.precargar}
                      onClick={cerrar}
                      aria-current={esRutaActual(e.href, ruta) ? 'page' : undefined}
                    >
                      {e.texto}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>,
          document.body,
        )}
    </>
  );
}
