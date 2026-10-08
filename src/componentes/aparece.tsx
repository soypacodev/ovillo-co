'use client';

// Aparición al entrar en pantalla (.rev, .rev-izq, .rev-der, .rev-zoom,
// .rev-lista y .puntada-rev de animaciones.css). Se dispara una sola vez.
// El estado oculto solo existe con html.js, así que sin JavaScript todo
// se ve desde el principio.

import { useEffect, useRef, useState, type ComponentPropsWithoutRef, type ElementType } from 'react';

type EfectoAparece = 'rev' | 'rev-izq' | 'rev-der' | 'rev-zoom' | 'rev-lista' | 'puntada-rev';

type PropsAparece<T extends ElementType> = {
  como?: T;
  efecto?: EfectoAparece;
} & Omit<ComponentPropsWithoutRef<T>, 'como' | 'efecto'>;

export function Aparece<T extends ElementType = 'div'>({ como, efecto = 'rev', className, ...resto }: PropsAparece<T>) {
  const Etiqueta: ElementType = como ?? 'div';
  const ref = useRef<HTMLElement>(null);
  const [visto, setVisto] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      requestAnimationFrame(() => setVisto(true));
      return;
    }
    const observador = new IntersectionObserver(
      (filas) => {
        // También lo que ya quedó por encima: si se baja deprisa antes de que
        // cargue el JavaScript, al volver hacia arriba no puede estar vacío.
        if (filas.some((f) => f.isIntersecting || f.boundingClientRect.bottom < 0)) {
          setVisto(true);
          observador.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  const clases = [efecto, visto && 'ver', className].filter(Boolean).join(' ');
  return <Etiqueta ref={ref} className={clases} {...resto} />;
}
