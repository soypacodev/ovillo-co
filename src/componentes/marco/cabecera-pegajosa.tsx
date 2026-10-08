'use client';

// Al bajar un poco, la cabecera se compacta y aparece su línea inferior.

import { useEffect, useState, type ReactNode } from 'react';

export function CabeceraPegajosa({ children }: { children: ReactNode }) {
  const [pegada, setPegada] = useState(false);

  useEffect(() => {
    const mirar = () => setPegada(window.scrollY > 12);
    const marco = requestAnimationFrame(mirar);
    window.addEventListener('scroll', mirar, { passive: true });
    return () => {
      cancelAnimationFrame(marco);
      window.removeEventListener('scroll', mirar);
    };
  }, []);

  return <header className={pegada ? 'cabecera pegada' : 'cabecera'}>{children}</header>;
}
