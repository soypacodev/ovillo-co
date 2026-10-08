'use client';

// Estado de los filtros de la tienda. La fuente de verdad es la URL: el
// servidor pinta los resultados a partir de `searchParams` y aquí solo se
// cambia la URL con router.replace, dentro de una transición. Mientras
// llega la respuesta, useOptimistic deja los chips ya marcados para que
// la interfaz responda al instante.

import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from 'react';
import { filtrosAParametros, type FiltrosCatalogo } from '@/lib/datos/filtros';

export interface ValorFiltros {
  filtros: FiltrosCatalogo;
  /** Sustituye los filtros (o calcula los nuevos a partir de los actuales). */
  aplicar: (nuevos: FiltrosCatalogo | ((actuales: FiltrosCatalogo) => FiltrosCatalogo)) => void;
  quitarTodo: () => void;
  pendiente: boolean;
  /** Resultados de la última respuesta del servidor. */
  total: number;

  /** Texto del buscador, que va por delante de la URL mientras se escribe. */
  texto: string;
  setTexto: (texto: string) => void;

  panelAbierto: boolean;
  abrirPanel: () => void;
  cerrarPanel: () => void;
}

const Contexto = createContext<ValorFiltros | null>(null);

export function ProveedorFiltros({
  filtros: delServidor,
  total,
  children,
}: {
  filtros: FiltrosCatalogo;
  total: number;
  children: ReactNode;
}) {
  const router = useRouter();
  const ruta = usePathname();
  const [pendiente, empezar] = useTransition();
  const [filtros, ponerOptimos] = useOptimistic(delServidor);
  const [panelAbierto, setPanelAbierto] = useState(false);

  // El buscador sigue a la URL cuando esta cambia por otro camino (quitar
  // el chip de búsqueda, «quitar todos», volver atrás en el navegador).
  const busquedaServidor = delServidor.busqueda ?? '';
  const [texto, setTexto] = useState(busquedaServidor);
  const [busquedaVista, setBusquedaVista] = useState(busquedaServidor);
  if (busquedaVista !== busquedaServidor) {
    setBusquedaVista(busquedaServidor);
    setTexto(busquedaServidor);
  }

  // Dos clics seguidos se encadenan sobre el último estado pedido, no
  // sobre el que había al pintar.
  const ultimos = useRef(filtros);
  useEffect(() => {
    ultimos.current = filtros;
  }, [filtros]);

  const aplicar = useCallback<ValorFiltros['aplicar']>(
    (nuevos) => {
      const siguientes = typeof nuevos === 'function' ? nuevos(ultimos.current) : nuevos;
      ultimos.current = siguientes;
      const parametros = filtrosAParametros(siguientes).toString();
      empezar(() => {
        ponerOptimos(siguientes);
        router.replace(parametros ? `${ruta}?${parametros}` : ruta, { scroll: false });
      });
    },
    [router, ruta, ponerOptimos],
  );

  const quitarTodo = useCallback(() => {
    setTexto('');
    aplicar((f) => ({ orden: f.orden }));
  }, [aplicar]);

  const abrirPanel = useCallback(() => setPanelAbierto(true), []);
  const cerrarPanel = useCallback(() => setPanelAbierto(false), []);

  // Si la pantalla se ensancha con el panel abierto, el panel deja de ser
  // una capa y hay que soltar el bloqueo de scroll.
  useEffect(() => {
    if (!panelAbierto) return;
    const escritorio = window.matchMedia('(min-width: 901px)');
    const alCambiar = () => escritorio.matches && setPanelAbierto(false);
    escritorio.addEventListener('change', alCambiar);
    return () => escritorio.removeEventListener('change', alCambiar);
  }, [panelAbierto]);

  const valor = useMemo<ValorFiltros>(
    () => ({
      filtros,
      aplicar,
      quitarTodo,
      pendiente,
      total,
      texto,
      setTexto,
      panelAbierto,
      abrirPanel,
      cerrarPanel,
    }),
    [filtros, aplicar, quitarTodo, pendiente, total, texto, panelAbierto, abrirPanel, cerrarPanel],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useFiltros(): ValorFiltros {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useFiltros necesita <ProveedorFiltros>.');
  return valor;
}

/** Añade o quita un valor de una lista de filtros. */
export function alternar<T>(lista: readonly T[] | undefined, valor: T): T[] {
  const actual = lista ?? [];
  return actual.includes(valor) ? actual.filter((v) => v !== valor) : [...actual, valor];
}
