import Link from 'next/link';
import { IcoAtras, IcoFlecha } from '@/componentes/iconos';

interface PropsPaginacion {
  pagina: number;
  total: number;
  porPagina: number;
  /** Construye la URL de una página conservando filtros y búsqueda. */
  url: (pagina: number) => string;
}

export function Paginacion({ pagina, total, porPagina, url }: PropsPaginacion) {
  const paginas = Math.max(1, Math.ceil(total / porPagina));
  if (paginas <= 1) return null;
  const desde = (pagina - 1) * porPagina + 1;
  const hasta = Math.min(total, pagina * porPagina);

  return (
    <nav className="paginacion" aria-label="Páginas">
      <p className="mini">
        {desde}–{hasta} de {total}
      </p>
      <div className="paginacion-botones">
        {pagina > 1 ? (
          <Link className="btn btn-3 btn-p" href={url(pagina - 1)} rel="prev">
            <IcoAtras width={16} height={16} />
            Anterior
          </Link>
        ) : (
          <span className="btn btn-3 btn-p" aria-disabled="true">
            <IcoAtras width={16} height={16} />
            Anterior
          </span>
        )}
        <span className="mini" aria-current="page">
          Página {pagina} de {paginas}
        </span>
        {pagina < paginas ? (
          <Link className="btn btn-3 btn-p" href={url(pagina + 1)} rel="next">
            Siguiente
            <IcoFlecha width={16} height={16} />
          </Link>
        ) : (
          <span className="btn btn-3 btn-p" aria-disabled="true">
            Siguiente
            <IcoFlecha width={16} height={16} />
          </span>
        )}
      </div>
    </nav>
  );
}
