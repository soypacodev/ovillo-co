'use client';

// Comportamiento común del cajón de la cesta y del menú móvil: bloquea el
// scroll de la página, lleva el foco dentro al abrir, lo mantiene ahí con
// Tab, cierra con Escape y devuelve el foco a donde estaba al cerrar.

import { useEffect, type RefObject } from 'react';

const ENFOCABLES =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

export function usePanelModal(
  abierto: boolean,
  cerrar: () => void,
  panel: RefObject<HTMLElement | null>,
  primerFoco?: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!abierto) return;
    const previo = document.activeElement as HTMLElement | null;
    document.body.classList.add('sin-scroll');
    (primerFoco?.current ?? panel.current)?.focus();

    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cerrar();
        return;
      }
      if (e.key !== 'Tab' || !panel.current) return;
      const enfocables = Array.from(panel.current.querySelectorAll<HTMLElement>(ENFOCABLES)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (!enfocables.length) return;
      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener('keydown', alPulsar);

    return () => {
      document.removeEventListener('keydown', alPulsar);
      document.body.classList.remove('sin-scroll');
      // Si se cerró al navegar, el elemento anterior puede no existir ya.
      if (previo?.isConnected) previo.focus({ preventScroll: true });
    };
  }, [abierto, cerrar, panel, primerFoco]);
}
