'use client';

// Sigue al ratón y deja su posición en --mx y --my (de -0,5 a 0,5). El
// movimiento lo hace el CSS de .paralaje, que solo se activa con ratón,
// en escritorio y sin «reducir movimiento»; aquí solo se evita trabajar
// para nada cuando no se va a ver.

import { useRef, type ComponentPropsWithoutRef, type MouseEvent } from 'react';

const CONDICION = '(hover: hover) and (min-width: 900px) and (prefers-reduced-motion: no-preference)';

export function ZonaParalaje({ children, ...resto }: ComponentPropsWithoutRef<'section'>) {
  const zona = useRef<HTMLElement>(null);
  const cuadro = useRef(0);

  const mover = (e: MouseEvent<HTMLElement>) => {
    const el = zona.current;
    if (!el || cuadro.current || !window.matchMedia(CONDICION).matches) return;
    const { clientX, clientY } = e;
    cuadro.current = requestAnimationFrame(() => {
      cuadro.current = 0;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((clientX - r.left) / r.width - 0.5).toFixed(3));
      el.style.setProperty('--my', ((clientY - r.top) / r.height - 0.5).toFixed(3));
    });
  };

  const salir = () => {
    cancelAnimationFrame(cuadro.current);
    cuadro.current = 0;
    zona.current?.style.setProperty('--mx', '0');
    zona.current?.style.setProperty('--my', '0');
  };

  return (
    <section ref={zona} onMouseMove={mover} onMouseLeave={salir} {...resto}>
      {children}
    </section>
  );
}
