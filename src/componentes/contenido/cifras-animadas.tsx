'use client';

import { useEffect, useRef, useState } from 'react';
import { DATOS_IDIOMA, IDIOMAS, type Idioma } from '@/lib/i18n';
import { useIdioma } from '@/lib/i18n/cliente';

export interface Cifra {
  valor: number;
  texto: string;
}

const DURACION_MS = 1400;
const NUMEROS = Object.fromEntries(
  IDIOMAS.map((i) => [i, new Intl.NumberFormat(DATOS_IDIOMA[i].formato)]),
) as Record<Idioma, Intl.NumberFormat>;

/** Cifras que suben de 0 a su valor al entrar en pantalla. El HTML del
 *  servidor ya lleva el valor final: sin JavaScript, o con menos
 *  movimiento, se ve el número quieto. El lector de pantalla lee siempre
 *  el valor final, nunca la cuenta. */
export function CifrasAnimadas({ cifras, className }: { cifras: readonly Cifra[]; className?: string }) {
  const ref = useRef<HTMLDListElement>(null);
  const numero = NUMEROS[useIdioma()];
  const [progreso, setProgreso] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let cuadro = 0;
    const inicio = requestAnimationFrame(() => setProgreso(0));
    const observador = new IntersectionObserver(
      (filas) => {
        if (!filas.some((f) => f.isIntersecting)) return;
        observador.disconnect();
        const t0 = performance.now();
        const paso = (t: number) => {
          const x = Math.min(1, (t - t0) / DURACION_MS);
          setProgreso(1 - Math.pow(1 - x, 3));
          if (x < 1) cuadro = requestAnimationFrame(paso);
        };
        cuadro = requestAnimationFrame(paso);
      },
      { threshold: 0.4 },
    );
    observador.observe(el);
    return () => {
      cancelAnimationFrame(inicio);
      cancelAnimationFrame(cuadro);
      observador.disconnect();
    };
  }, []);

  return (
    <dl ref={ref} className={className ? `cifras ${className}` : 'cifras'}>
      {cifras.map((c) => (
        <div key={c.texto}>
          <dt>{c.texto}</dt>
          <dd>
            <span className="cifra" aria-hidden="true">
              {numero.format(Math.round(c.valor * progreso))}
            </span>
            <span className="oculto-vis">{numero.format(c.valor)}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
