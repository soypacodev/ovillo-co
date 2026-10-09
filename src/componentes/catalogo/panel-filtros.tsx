'use client';

// Columna de filtros. En escritorio va pegada al lado de los resultados;
// por debajo de 900 px es una capa a pantalla completa que se abre con el
// botón «Filtros» y se comporta como un diálogo.

import { useEffect, useId, useRef, useState } from 'react';
import { IcoCerrar, IcoLupa } from '@/componentes/iconos';
import { ANCLA_BUSCAR, EVENTO_BUSCAR } from '@/componentes/marco/enlaces-cabecera';
import { usePanelModal } from '@/componentes/use-panel-modal';
import type { SlugCategoria } from '@/lib/catalogo/tipos';
import { extrasEn, rangosPrecioEn } from '@/lib/datos/filtros';
import { piezas } from '@/lib/formato';
import { textos } from '@/lib/i18n';
import { useIdioma, useTextos } from '@/lib/i18n/cliente';
import { alternar, useFiltros } from './contexto-filtros';

const RETARDO_BUSQUEDA_MS = 220;

const T = textos(
  {
    panel: 'Filtros del catálogo',
    filtros: 'Filtros',
    cerrar: 'Cerrar los filtros',
    buscar: 'Buscar',
    ejemplo: 'manta, osita, cesta…',
    categoria: 'Categoría',
    precio: 'Precio',
    disponibilidad: 'Disponibilidad',
    quitarTodos: 'Quitar todos los filtros',
    buscando: 'Buscando…',
    ver: (cuantas: string) => `Ver ${cuantas}`,
  },
  {
    en: {
      panel: 'Catalogue filters',
      filtros: 'Filters',
      cerrar: 'Close filters',
      buscar: 'Search',
      ejemplo: 'blanket, bear, basket…',
      categoria: 'Category',
      precio: 'Price',
      disponibilidad: 'Availability',
      quitarTodos: 'Clear all filters',
      buscando: 'Searching…',
      ver: (cuantas: string) => `Show ${cuantas}`,
    },
    fr: {
      panel: 'Filtres du catalogue',
      filtros: 'Filtres',
      cerrar: 'Fermer les filtres',
      buscar: 'Rechercher',
      ejemplo: 'couverture, ourson, panier…',
      categoria: 'Catégorie',
      precio: 'Prix',
      disponibilidad: 'Disponibilité',
      quitarTodos: 'Effacer tous les filtres',
      buscando: 'Recherche…',
      ver: (cuantas: string) => `Voir ${cuantas}`,
    },
    de: {
      panel: 'Katalogfilter',
      filtros: 'Filter',
      cerrar: 'Filter schließen',
      buscar: 'Suchen',
      ejemplo: 'Decke, Bär, Korb…',
      categoria: 'Kategorie',
      precio: 'Preis',
      disponibilidad: 'Verfügbarkeit',
      quitarTodos: 'Alle Filter entfernen',
      buscando: 'Wird gesucht…',
      ver: (cuantas: string) => `${cuantas} ansehen`,
    },
  },
);

export interface CategoriaFiltro {
  slug: SlugCategoria;
  nombre: string;
}

export function PanelFiltros({ categorias }: { categorias: CategoriaFiltro[] }) {
  const { filtros, aplicar, quitarTodo, texto, setTexto, total, pendiente, panelAbierto, abrirPanel, cerrarPanel } =
    useFiltros();
  const idioma = useIdioma();
  const t = useTextos(T);
  const panel = useRef<HTMLElement>(null);
  const cerrar = useRef<HTMLButtonElement>(null);
  const entrada = useRef<HTMLInputElement>(null);
  const reloj = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const id = useId();
  // Al llegar desde la lupa de la cabecera, el foco va al buscador.
  const [paraBuscar, setParaBuscar] = useState(false);

  usePanelModal(panelAbierto, cerrarPanel, panel, paraBuscar ? entrada : cerrar);
  useEffect(() => () => clearTimeout(reloj.current), []);
  // Al cerrar la capa se olvida: el botón «Filtros» la abre con el foco en «Cerrar».
  const [abiertoVisto, setAbiertoVisto] = useState(panelAbierto);
  if (abiertoVisto !== panelAbierto) {
    setAbiertoVisto(panelAbierto);
    if (!panelAbierto) setParaBuscar(false);
  }

  // La lupa de la cabecera lleva a /tienda#buscar o, si ya estamos aquí,
  // avisa con un evento. En móvil el buscador vive dentro de la capa de
  // filtros, así que se abre; en escritorio basta con enfocarlo.
  useEffect(() => {
    const enfocar = () => {
      if (window.location.hash === `#${ANCLA_BUSCAR}`) {
        window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
      }
      if (window.matchMedia('(max-width: 900px)').matches) {
        setParaBuscar(true);
        abrirPanel();
      } else {
        entrada.current?.focus();
        entrada.current?.scrollIntoView({ block: 'center' });
      }
    };
    if (window.location.hash === `#${ANCLA_BUSCAR}`) enfocar();
    window.addEventListener(EVENTO_BUSCAR, enfocar);
    return () => window.removeEventListener(EVENTO_BUSCAR, enfocar);
  }, [abrirPanel]);

  const buscar = (valor: string) => {
    setTexto(valor);
    clearTimeout(reloj.current);
    reloj.current = setTimeout(() => {
      aplicar((f) => ({ ...f, busqueda: valor.trim() }));
    }, RETARDO_BUSQUEDA_MS);
  };

  const hayFiltros =
    Boolean(filtros.categorias?.length || filtros.rangos?.length || filtros.extras?.length) ||
    Boolean(filtros.busqueda?.trim());

  return (
    <aside
      ref={panel}
      id="panel-filtros"
      className={panelAbierto ? 'cuadro-filtros abierto' : 'cuadro-filtros'}
      aria-label={t.panel}
      // tabIndex para poder llevar el foco al panel al abrirlo en móvil.
      tabIndex={-1}
    >
      <div className="cab-filtros">
        <h2 className="tit-panel">{t.filtros}</h2>
        <button ref={cerrar} type="button" className="icono" onClick={cerrarPanel} aria-label={t.cerrar}>
          <IcoCerrar />
        </button>
      </div>

      <div className="grupo-filtro">
        <label className="titulo-mini" htmlFor={`${id}-buscar`}>
          {t.buscar}
        </label>
        <div className="busca">
          <IcoLupa width={17} height={17} />
          <input
            ref={entrada}
            id={`${id}-buscar`}
            type="search"
            value={texto}
            onChange={(e) => buscar(e.target.value)}
            onKeyDown={(e) => {
              // Intro busca ya, sin esperar al retardo.
              if (e.key === 'Enter') {
                e.preventDefault();
                clearTimeout(reloj.current);
                aplicar((f) => ({ ...f, busqueda: texto.trim() }));
              }
            }}
            placeholder={t.ejemplo}
            autoComplete="off"
            enterKeyHint="search"
            maxLength={80}
          />
        </div>
      </div>

      <div className="grupo-filtro" role="group" aria-labelledby={`${id}-cat`}>
        <p className="titulo-mini" id={`${id}-cat`}>
          {t.categoria}
        </p>
        <div className="chips">
          {categorias.map((c) => (
            <button
              key={c.slug}
              type="button"
              className="chip"
              aria-pressed={filtros.categorias?.includes(c.slug) ?? false}
              onClick={() => aplicar((f) => ({ ...f, categorias: alternar(f.categorias, c.slug) }))}
            >
              {c.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="grupo-filtro" role="group" aria-labelledby={`${id}-precio`}>
        <p className="titulo-mini" id={`${id}-precio`}>
          {t.precio}
        </p>
        <div className="chips">
          {rangosPrecioEn(idioma).map((r) => (
            <button
              key={r.id}
              type="button"
              className="chip"
              aria-pressed={filtros.rangos?.includes(r.id) ?? false}
              onClick={() => aplicar((f) => ({ ...f, rangos: alternar(f.rangos, r.id) }))}
            >
              {r.texto}
            </button>
          ))}
        </div>
      </div>

      <div className="grupo-filtro" role="group" aria-labelledby={`${id}-extra`}>
        <p className="titulo-mini" id={`${id}-extra`}>
          {t.disponibilidad}
        </p>
        <div className="chips">
          {extrasEn(idioma).map((e) => (
            <button
              key={e.id}
              type="button"
              className="chip"
              aria-pressed={filtros.extras?.includes(e.id) ?? false}
              onClick={() => aplicar((f) => ({ ...f, extras: alternar(f.extras, e.id) }))}
            >
              {e.texto}
            </button>
          ))}
        </div>
      </div>

      <button type="button" className="btn btn-4 btn-p quitar-filtros" onClick={quitarTodo} disabled={!hayFiltros}>
        {t.quitarTodos}
      </button>

      {/* Solo en móvil: cierra la capa y deja ver los resultados. */}
      <div className="pie-filtros">
        <button type="button" className="btn btn-1 btn-bloque" onClick={cerrarPanel} aria-busy={pendiente}>
          {pendiente ? t.buscando : t.ver(piezas(total, idioma))}
        </button>
      </div>
    </aside>
  );
}
