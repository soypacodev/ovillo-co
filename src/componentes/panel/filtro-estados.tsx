import Link from 'next/link';

interface PropsFiltro<E extends string> {
  estados: readonly E[];
  nombres: Record<E, string>;
  actual: E | null;
  /** URL de la lista con ese estado (null: todos). */
  url: (estado: E | null) => string;
  etiqueta: string;
}

/** Fila de chips para filtrar por estado. Son enlaces: el filtro queda en
 *  la URL, se puede compartir y funciona sin JavaScript. */
export function FiltroEstados<E extends string>({ estados, nombres, actual, url, etiqueta }: PropsFiltro<E>) {
  return (
    <nav className="chips filtro-estados" aria-label={etiqueta}>
      <Link className="chip" href={url(null)} aria-current={actual === null ? 'page' : undefined}>
        Todos
      </Link>
      {estados.map((e) => (
        <Link key={e} className="chip" href={url(e)} aria-current={actual === e ? 'page' : undefined}>
          {nombres[e]}
        </Link>
      ))}
    </nav>
  );
}
