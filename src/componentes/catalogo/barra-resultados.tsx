'use client';

import type { ReactNode } from 'react';
import { EXTRAS, ORDENES, RANGOS_PRECIO, type Orden } from '@/lib/datos/filtros';
import { piezas } from '@/lib/formato';
import type { CategoriaFiltro } from './panel-filtros';
import { alternar, useFiltros } from './contexto-filtros';

/** Contador, botón de filtros (móvil), orden y chips de filtros activos. */
export function BarraResultados({ categorias }: { categorias: CategoriaFiltro[] }) {
  const { filtros, aplicar, quitarTodo, total, pendiente, abrirPanel, panelAbierto, setTexto } = useFiltros();

  const activos: { clave: string; texto: string; quitar: () => void }[] = [
    ...(filtros.categorias ?? []).map((slug) => ({
      clave: `cat-${slug}`,
      texto: categorias.find((c) => c.slug === slug)?.nombre ?? slug,
      quitar: () => aplicar((f) => ({ ...f, categorias: alternar(f.categorias, slug) })),
    })),
    ...(filtros.rangos ?? []).map((id) => ({
      clave: `precio-${id}`,
      texto: RANGOS_PRECIO.find((r) => r.id === id)?.texto ?? id,
      quitar: () => aplicar((f) => ({ ...f, rangos: alternar(f.rangos, id) })),
    })),
    ...(filtros.extras ?? []).map((id) => ({
      clave: `extra-${id}`,
      texto: EXTRAS.find((e) => e.id === id)?.texto ?? id,
      quitar: () => aplicar((f) => ({ ...f, extras: alternar(f.extras, id) })),
    })),
  ];
  const busqueda = filtros.busqueda?.trim();
  if (busqueda) {
    activos.push({
      clave: 'busqueda',
      texto: `«${busqueda}»`,
      quitar: () => {
        setTexto('');
        aplicar((f) => ({ ...f, busqueda: '' }));
      },
    });
  }

  return (
    <>
      <div className="barra-orden">
        <p className="mini" role="status" aria-live="polite" aria-atomic="true">
          {pendiente ? 'Buscando…' : piezas(total)}
        </p>
        <div className="barra-orden-acciones">
          <button
            type="button"
            className="btn btn-3 btn-p abre-filtros"
            onClick={abrirPanel}
            aria-expanded={panelAbierto}
            aria-controls="panel-filtros"
          >
            Filtros
            {activos.length > 0 && <span className="globo-filtros">{activos.length}</span>}
          </button>
          <label htmlFor="orden" className="oculto-vis">
            Ordenar por
          </label>
          <select
            id="orden"
            className="orden"
            value={filtros.orden ?? 'destacados'}
            onChange={(e) => aplicar((f) => ({ ...f, orden: e.target.value as Orden }))}
          >
            {ORDENES.map((o) => (
              <option key={o.id} value={o.id}>
                {o.texto}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activos.length > 0 && (
        <div className="chips activos" role="group" aria-label="Filtros activos">
          {activos.map((a) => (
            <button key={a.clave} type="button" className="chip chip-activo" onClick={a.quitar}>
              <span className="oculto-vis">Quitar el filtro </span>
              {a.texto} <span aria-hidden="true">✕</span>
            </button>
          ))}
          {activos.length > 1 && (
            <button type="button" className="boton-texto" onClick={quitarTodo}>
              Quitar todos
            </button>
          )}
        </div>
      )}
    </>
  );
}

/** Envuelve la rejilla: la atenúa mientras llegan los nuevos resultados. */
export function ZonaResultados({ children }: { children: ReactNode }) {
  const { pendiente } = useFiltros();
  return (
    <div className={pendiente ? 'zona-resultados cargando' : 'zona-resultados'} aria-busy={pendiente}>
      {children}
    </div>
  );
}

export function BotonQuitarFiltros({ className = 'btn btn-2' }: { className?: string }) {
  const { quitarTodo } = useFiltros();
  return (
    <button type="button" className={className} onClick={quitarTodo}>
      Quitar los filtros
    </button>
  );
}
