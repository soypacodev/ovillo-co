'use client';

// Cambio de idioma. Cada opción es un enlace normal (no next/link) a la
// misma página en el otro idioma: la página se carga entera, el proxy
// recuerda la elección en una cookie y todo el marco cambia de idioma.
// El español va por /es/… para que el proxy guarde la elección y después
// quite el prefijo.

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { DATOS_IDIOMA, IDIOMAS, sinIdioma, textos, type Idioma } from '@/lib/i18n';
import { useIdioma, useTextos } from '@/lib/i18n/cliente';

const T = textos(
  { idioma: 'Idioma', cambiar: (nombre: string) => `Idioma: ${nombre}. Cambiar de idioma` },
  {
    en: { idioma: 'Language', cambiar: (nombre: string) => `Language: ${nombre}. Change language` },
    fr: { idioma: 'Langue', cambiar: (nombre: string) => `Langue : ${nombre}. Changer de langue` },
    de: { idioma: 'Sprache', cambiar: (nombre: string) => `Sprache: ${nombre}. Sprache ändern` },
  },
);

function useDestino(): (idioma: Idioma) => string {
  const ruta = sinIdioma(usePathname());
  const consulta = useSearchParams().toString();
  return (idioma) => `/${idioma}${ruta === '/' ? '' : ruta}${consulta ? `?${consulta}` : ''}`;
}

function Opciones({ alElegir }: { alElegir?: () => void }) {
  const actual = useIdioma();
  const destino = useDestino();
  return (
    <ul className="idiomas-lista">
      {IDIOMAS.map((i) => (
        <li key={i}>
          <a
            href={destino(i)}
            hrefLang={i}
            lang={i}
            aria-current={i === actual ? 'true' : undefined}
            onClick={alElegir}
          >
            <span className="idioma-codigo" aria-hidden="true">
              {i.toUpperCase()}
            </span>
            {DATOS_IDIOMA[i].nombre}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Desplegable compacto de la cabecera. */
export function SelectorIdioma({ className = '' }: { className?: string }) {
  const idioma = useIdioma();
  const t = useTextos(T);
  const caja = useRef<HTMLDetailsElement>(null);

  // Se cierra al pulsar fuera o con Escape, como cualquier menú.
  useEffect(() => {
    const cerrarFuera = (e: PointerEvent) => {
      if (caja.current?.open && !caja.current.contains(e.target as Node)) caja.current.open = false;
    };
    const cerrarConEscape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !caja.current?.open) return;
      caja.current.open = false;
      caja.current.querySelector('summary')?.focus();
    };
    document.addEventListener('pointerdown', cerrarFuera);
    document.addEventListener('keydown', cerrarConEscape);
    return () => {
      document.removeEventListener('pointerdown', cerrarFuera);
      document.removeEventListener('keydown', cerrarConEscape);
    };
  }, []);

  return (
    <details ref={caja} className={`selector-idioma ${className}`.trim()}>
      <summary className="icono" aria-label={t.cambiar(DATOS_IDIOMA[idioma].nombre)}>
        <span aria-hidden="true">{idioma.toUpperCase()}</span>
      </summary>
      <div className="idiomas-menu">
        <Opciones />
      </div>
    </details>
  );
}

/** Lista en línea para el menú móvil y el pie. */
export function ListaIdiomas({ alElegir }: { alElegir?: () => void }) {
  const t = useTextos(T);
  return (
    <nav className="idiomas-fila" aria-label={t.idioma}>
      <Opciones alElegir={alElegir} />
    </nav>
  );
}
