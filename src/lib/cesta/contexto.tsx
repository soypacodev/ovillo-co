'use client';

// Estado de la cesta y de los favoritos en el cliente. Los datos viven en
// almacenes externos persistidos en localStorage; el contexto solo añade
// las acciones, el cajón abierto o cerrado y los avisos flotantes.
//
// En el servidor y en el primer render la cesta está vacía; justo después
// de hidratar aparece la guardada. `hidratada` permite distinguir «vacía»
// de «todavía no la he leído» (por ejemplo, en el pago).

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { useBrindis } from '@/componentes/brindis';
import { crearAlmacen } from './almacen';
import { aplicarCupon as aplicarCuponPuro, quitarCupon as quitarCuponPuro } from './cupones';
import { alternarFavorito as alternarFavoritoPuro, normalizarFavoritos } from './favoritos';
import {
  anadirProducto,
  cambiarUnidades as cambiarUnidadesPuro,
  fijarUnidades as fijarUnidadesPuro,
  maxUnidadesLinea,
  quitarLinea,
  sincronizarConCatalogo,
  vaciarCesta,
} from './lineas';
import { normalizarCesta, serializarCesta } from './persistencia';
import {
  CESTA_VACIA,
  type EstadoCesta,
  type LineaCesta,
  type OpcionesAnadir,
  type ProductoCesta,
  type ResultadoAnadir,
  type ResultadoCupon,
  type Totales,
} from './tipos';
import { totales as calcularTotales } from './totales';

const almacenCesta = crearAlmacen<EstadoCesta>('cesta', CESTA_VACIA, normalizarCesta, serializarCesta);
const SIN_FAVORITOS: string[] = [];
const almacenFavoritos = crearAlmacen<string[]>('favoritos', SIN_FAVORITOS, normalizarFavoritos);

const nadaQueEscuchar = () => () => {};

export interface ValorCesta {
  lineas: LineaCesta[];
  cupon: string | null;
  /** Totales con el envío ordinario. Para otro método, `totales()` de
   *  `@/lib/cesta/totales` con `{ envioId }`. */
  totales: Totales;
  unidades: number;
  hidratada: boolean;

  abierta: boolean;
  abrir: () => void;
  cerrar: () => void;

  /** Añade y, si sale bien, avisa y abre el cajón (salvo `abrir: false`). */
  anadir: (producto: ProductoCesta, opciones?: OpcionesAnadir & { abrir?: boolean }) => ResultadoAnadir;
  cambiarUnidades: (id: string, delta: number) => void;
  fijarUnidades: (id: string, uds: number) => void;
  quitar: (id: string) => void;
  vaciar: () => void;
  maxUnidades: (id: string) => number;
  /** Pone la cesta al día con el catálogo. Devuelve true si algo cambió. */
  sincronizar: (productos: readonly ProductoCesta[]) => boolean;

  aplicarCupon: (codigo: string) => ResultadoCupon;
  quitarCupon: () => void;
}

export interface ValorFavoritos {
  favoritos: string[];
  esFavorito: (slug: string) => boolean;
  /** Devuelve true si queda guardado. */
  alternar: (slug: string) => boolean;
  /** Sustituye la lista entera, sin aviso (al fusionarla con la de la cuenta). */
  reemplazar: (lista: readonly string[]) => void;
}

const ContextoCesta = createContext<ValorCesta | null>(null);
const ContextoFavoritos = createContext<ValorFavoritos | null>(null);

export function ProveedorCesta({ children }: { children: ReactNode }) {
  const avisar = useBrindis();
  const [abierta, setAbierta] = useState(false);

  const estado = useSyncExternalStore(almacenCesta.suscribir, almacenCesta.leer, () => almacenCesta.inicial);
  const favoritos = useSyncExternalStore(
    almacenFavoritos.suscribir,
    almacenFavoritos.leer,
    () => almacenFavoritos.inicial,
  );
  const hidratada = useSyncExternalStore(nadaQueEscuchar, () => true, () => false);

  const abrir = useCallback(() => setAbierta(true), []);
  const cerrar = useCallback(() => setAbierta(false), []);

  // Las acciones leen siempre el estado del almacén, no el del render:
  // dos clics seguidos no pueden pisarse.
  const anadir = useCallback<ValorCesta['anadir']>(
    (producto, { abrir: abrirCajon = true, ...opciones } = {}) => {
      const { estado: nuevo, resultado } = anadirProducto(almacenCesta.leer(), producto, opciones);
      almacenCesta.escribir(nuevo);
      switch (resultado.tipo) {
        case 'anadido':
          avisar(`«${producto.nombre}» en la cesta`);
          if (abrirCajon) setAbierta(true);
          break;
        case 'limitado':
          avisar(
            resultado.uds > 0
              ? `«${producto.nombre}» en la cesta: ${resultado.uds} más, el máximo disponible`
              : `Ya tienes el máximo disponible de «${producto.nombre}»`,
          );
          if (abrirCajon && resultado.uds > 0) setAbierta(true);
          break;
        case 'agotado':
          avisar('Ese color está agotado');
          break;
        case 'sin-variante':
          avisar('Elige un color antes de añadirlo');
          break;
      }
      return resultado;
    },
    [avisar],
  );

  const cambiarUnidades = useCallback((id: string, delta: number) => {
    almacenCesta.escribir(cambiarUnidadesPuro(almacenCesta.leer(), id, delta));
  }, []);

  const fijarUnidades = useCallback((id: string, uds: number) => {
    almacenCesta.escribir(fijarUnidadesPuro(almacenCesta.leer(), id, uds));
  }, []);

  const quitar = useCallback(
    (id: string) => {
      const actual = almacenCesta.leer();
      const linea = actual.lineas.find((l) => l.id === id);
      almacenCesta.escribir(quitarLinea(actual, id));
      if (linea) avisar(`«${linea.nombre}» fuera de la cesta`);
    },
    [avisar],
  );

  const vaciar = useCallback(() => almacenCesta.escribir(vaciarCesta()), []);

  const maxUnidades = useCallback((id: string) => {
    const { lineas } = almacenCesta.leer();
    const linea = lineas.find((l) => l.id === id);
    return linea ? maxUnidadesLinea(lineas, linea) : 0;
  }, []);

  const sincronizar = useCallback((productos: readonly ProductoCesta[]) => {
    const actual = almacenCesta.leer();
    if (!actual.lineas.length) return false;
    const nuevo = sincronizarConCatalogo(actual, productos);
    const cambio = JSON.stringify(nuevo.lineas) !== JSON.stringify(actual.lineas);
    if (cambio) almacenCesta.escribir(nuevo);
    return cambio;
  }, []);

  const aplicarCupon = useCallback((codigo: string) => {
    const { estado: nuevo, resultado } = aplicarCuponPuro(almacenCesta.leer(), codigo);
    almacenCesta.escribir(nuevo);
    return resultado;
  }, []);

  const quitarCupon = useCallback(() => almacenCesta.escribir(quitarCuponPuro(almacenCesta.leer())), []);

  const totales = useMemo(() => calcularTotales(estado.lineas, estado.cupon), [estado]);

  const valorCesta = useMemo<ValorCesta>(
    () => ({
      lineas: estado.lineas,
      cupon: estado.cupon,
      totales,
      unidades: totales.unidades,
      hidratada,
      abierta,
      abrir,
      cerrar,
      anadir,
      cambiarUnidades,
      fijarUnidades,
      quitar,
      vaciar,
      maxUnidades,
      sincronizar,
      aplicarCupon,
      quitarCupon,
    }),
    [estado, totales, hidratada, abierta, abrir, cerrar, anadir, cambiarUnidades, fijarUnidades, quitar, vaciar, maxUnidades, sincronizar, aplicarCupon, quitarCupon],
  );

  const alternar = useCallback(
    (slug: string) => {
      const { favoritos: nuevos, guardado } = alternarFavoritoPuro(almacenFavoritos.leer(), slug);
      almacenFavoritos.escribir(nuevos);
      avisar(guardado ? 'Guardado en tus favoritos' : 'Quitado de tus favoritos');
      return guardado;
    },
    [avisar],
  );

  const reemplazar = useCallback((lista: readonly string[]) => {
    almacenFavoritos.escribir(normalizarFavoritos(lista));
  }, []);

  const valorFavoritos = useMemo<ValorFavoritos>(
    () => ({ favoritos, esFavorito: (slug) => favoritos.includes(slug), alternar, reemplazar }),
    [favoritos, alternar, reemplazar],
  );

  return (
    <ContextoCesta.Provider value={valorCesta}>
      <ContextoFavoritos.Provider value={valorFavoritos}>{children}</ContextoFavoritos.Provider>
    </ContextoCesta.Provider>
  );
}

export function useCesta(): ValorCesta {
  const valor = useContext(ContextoCesta);
  if (!valor) throw new Error('useCesta necesita <ProveedorCesta>.');
  return valor;
}

export function useFavoritos(): ValorFavoritos {
  const valor = useContext(ContextoFavoritos);
  if (!valor) throw new Error('useFavoritos necesita <ProveedorCesta>.');
  return valor;
}
