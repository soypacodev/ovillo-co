'use client';

import type { ReactNode } from 'react';
import { extrasEn, ordenesEn, rangosPrecioEn, type Orden } from '@/lib/datos/filtros';
import { piezas } from '@/lib/formato';
import { textos } from '@/lib/i18n';
import { useIdioma, useTextos } from '@/lib/i18n/cliente';
import type { CategoriaFiltro } from './panel-filtros';
import { alternar, useFiltros } from './contexto-filtros';

const T = textos(
  {
    buscando: 'Buscando…',
    filtros: 'Filtros',
    ordenar: 'Ordenar por',
    activos: 'Filtros activos',
    quitarFiltro: 'Quitar el filtro ',
    quitarTodos: 'Quitar todos',
    quitarLosFiltros: 'Quitar los filtros',
    busqueda: (texto: string) => `«${texto}»`,
  },
  {
    en: {
      buscando: 'Searching…',
      filtros: 'Filters',
      ordenar: 'Sort by',
      activos: 'Active filters',
      quitarFiltro: 'Remove filter ',
      quitarTodos: 'Clear all',
      quitarLosFiltros: 'Clear filters',
      busqueda: (texto: string) => `“${texto}”`,
    },
    fr: {
      buscando: 'Recherche…',
      filtros: 'Filtres',
      ordenar: 'Trier par',
      activos: 'Filtres actifs',
      quitarFiltro: 'Retirer le filtre ',
      quitarTodos: 'Tout effacer',
      quitarLosFiltros: 'Effacer les filtres',
      busqueda: (texto: string) => `«\u00a0${texto}\u00a0»`,
    },
    de: {
      buscando: 'Wird gesucht…',
      filtros: 'Filter',
      ordenar: 'Sortieren nach',
      activos: 'Aktive Filter',
      quitarFiltro: 'Filter entfernen: ',
      quitarTodos: 'Alle entfernen',
      quitarLosFiltros: 'Filter zurücksetzen',
      busqueda: (texto: string) => `„${texto}“`,
    },
  },
);

/** Contador, botón de filtros (móvil), orden y chips de filtros activos. */
export function BarraResultados({ categorias }: { categorias: CategoriaFiltro[] }) {
  const { filtros, aplicar, quitarTodo, total, pendiente, abrirPanel, panelAbierto, setTexto } = useFiltros();
  const idioma = useIdioma();
  const t = useTextos(T);
  const rangos = rangosPrecioEn(idioma);
  const extras = extrasEn(idioma);

  const activos: { clave: string; texto: string; quitar: () => void }[] = [
    ...(filtros.categorias ?? []).map((slug) => ({
      clave: `cat-${slug}`,
      texto: categorias.find((c) => c.slug === slug)?.nombre ?? slug,
      quitar: () => aplicar((f) => ({ ...f, categorias: alternar(f.categorias, slug) })),
    })),
    ...(filtros.rangos ?? []).map((id) => ({
      clave: `precio-${id}`,
      texto: rangos.find((r) => r.id === id)?.texto ?? id,
      quitar: () => aplicar((f) => ({ ...f, rangos: alternar(f.rangos, id) })),
    })),
    ...(filtros.extras ?? []).map((id) => ({
      clave: `extra-${id}`,
      texto: extras.find((e) => e.id === id)?.texto ?? id,
      quitar: () => aplicar((f) => ({ ...f, extras: alternar(f.extras, id) })),
    })),
  ];
  const busqueda = filtros.busqueda?.trim();
  if (busqueda) {
    activos.push({
      clave: 'busqueda',
      texto: t.busqueda(busqueda),
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
          {pendiente ? t.buscando : piezas(total, idioma)}
        </p>
        <div className="barra-orden-acciones">
          <button
            type="button"
            className="btn btn-3 btn-p abre-filtros"
            onClick={abrirPanel}
            aria-expanded={panelAbierto}
            aria-controls="panel-filtros"
          >
            {t.filtros}
            {activos.length > 0 && <span className="globo-filtros">{activos.length}</span>}
          </button>
          <label htmlFor="orden" className="oculto-vis">
            {t.ordenar}
          </label>
          <select
            id="orden"
            className="orden"
            value={filtros.orden ?? 'destacados'}
            onChange={(e) => aplicar((f) => ({ ...f, orden: e.target.value as Orden }))}
          >
            {ordenesEn(idioma).map((o) => (
              <option key={o.id} value={o.id}>
                {o.texto}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activos.length > 0 && (
        <div className="chips activos" role="group" aria-label={t.activos}>
          {activos.map((a) => (
            <button key={a.clave} type="button" className="chip chip-activo" onClick={a.quitar}>
              <span className="oculto-vis">{t.quitarFiltro}</span>
              {a.texto} <span aria-hidden="true">✕</span>
            </button>
          ))}
          {activos.length > 1 && (
            <button type="button" className="boton-texto" onClick={quitarTodo}>
              {t.quitarTodos}
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
  const t = useTextos(T);
  return (
    <button type="button" className={className} onClick={quitarTodo}>
      {t.quitarLosFiltros}
    </button>
  );
}
