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
import { textos } from '@/lib/i18n';
import { useIdioma } from '@/lib/i18n/cliente';
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

const T = textos(
  {
    anadido: (nombre: string) => `«${nombre}» en la cesta`,
    limitado: (nombre: string, uds: number) => `«${nombre}» en la cesta: ${uds} más, el máximo disponible`,
    maximo: (nombre: string) => `Ya tienes el máximo disponible de «${nombre}»`,
    agotado: 'Esa opción está agotada',
    sinVariante: 'Elige una opción antes de añadirlo',
    quitado: (nombre: string) => `«${nombre}» fuera de la cesta`,
    favoritoGuardado: 'Guardado en tus favoritos',
    favoritoQuitado: 'Quitado de tus favoritos',
  },
  {
    en: {
      anadido: (nombre: string) => `“${nombre}” added to your basket`,
      limitado: (nombre: string, uds: number) => `“${nombre}” added to your basket: ${uds} more, all that’s available`,
      maximo: (nombre: string) => `You already have all the available “${nombre}”`,
      agotado: 'That option is sold out',
      sinVariante: 'Choose an option before adding it',
      quitado: (nombre: string) => `“${nombre}” removed from your basket`,
      favoritoGuardado: 'Saved to your favourites',
      favoritoQuitado: 'Removed from your favourites',
    },
    fr: {
      anadido: (nombre: string) => `«\u00a0${nombre}\u00a0» ajouté au panier`,
      limitado: (nombre: string, uds: number) =>
        `«\u00a0${nombre}\u00a0» ajouté au panier\u00a0: ${uds} de plus, le maximum disponible`,
      maximo: (nombre: string) => `Vous avez déjà le maximum disponible de «\u00a0${nombre}\u00a0»`,
      agotado: 'Cette option est épuisée',
      sinVariante: 'Choisissez une option avant de l’ajouter',
      quitado: (nombre: string) => `«\u00a0${nombre}\u00a0» retiré du panier`,
      favoritoGuardado: 'Ajouté à vos favoris',
      favoritoQuitado: 'Retiré de vos favoris',
    },
    de: {
      anadido: (nombre: string) => `„${nombre}“ liegt im Warenkorb`,
      limitado: (nombre: string, uds: number) =>
        `„${nombre}“ liegt im Warenkorb: ${uds} mehr, mehr ist nicht verfügbar`,
      maximo: (nombre: string) => `Sie haben bereits alle verfügbaren „${nombre}“ im Warenkorb`,
      agotado: 'Diese Option ist ausverkauft',
      sinVariante: 'Wählen Sie zuerst eine Option aus',
      quitado: (nombre: string) => `„${nombre}“ aus dem Warenkorb entfernt`,
      favoritoGuardado: 'Zu Ihren Favoriten hinzugefügt',
      favoritoQuitado: 'Aus Ihren Favoriten entfernt',
    },
  },
);

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

/** Proveedor de la cesta y los favoritos para toda la tienda. */
export function ProveedorCesta({ children }: { children: ReactNode }) {
  const avisar = useBrindis();
  const idioma = useIdioma();
  const t = T[idioma];
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
          avisar(t.anadido(producto.nombre));
          if (abrirCajon) setAbierta(true);
          break;
        case 'limitado':
          avisar(
            resultado.uds > 0 ? t.limitado(producto.nombre, resultado.uds) : t.maximo(producto.nombre),
          );
          if (abrirCajon && resultado.uds > 0) setAbierta(true);
          break;
        case 'agotado':
          avisar(t.agotado);
          break;
        case 'sin-variante':
          avisar(t.sinVariante);
          break;
      }
      return resultado;
    },
    [avisar, t],
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
      if (linea) avisar(t.quitado(linea.nombre));
    },
    [avisar, t],
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
    if (JSON.stringify(nuevo.lineas) === JSON.stringify(actual.lineas)) return false;
    almacenCesta.escribir(nuevo);
    // Solo se avisa si cambia algo que importa: precio, stock o piezas.
    // Los nombres cambian solos al ver la tienda en otro idioma.
    const huella = (lineas: readonly LineaCesta[]) =>
      JSON.stringify(lineas.map((l) => [l.id, l.precio, l.uds, l.stock, l.encargo, l.dias]));
    return huella(nuevo.lineas) !== huella(actual.lineas);
  }, []);

  const aplicarCupon = useCallback(
    (codigo: string) => {
      const { estado: nuevo, resultado } = aplicarCuponPuro(almacenCesta.leer(), codigo, undefined, undefined, idioma);
      almacenCesta.escribir(nuevo);
      return resultado;
    },
    [idioma],
  );

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
      avisar(guardado ? t.favoritoGuardado : t.favoritoQuitado);
      return guardado;
    },
    [avisar, t],
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

/** Cesta, totales y acciones. Lanza fuera de <ProveedorCesta>. */
export function useCesta(): ValorCesta {
  const valor = useContext(ContextoCesta);
  if (!valor) throw new Error('useCesta necesita <ProveedorCesta>.');
  return valor;
}

/** Lista de favoritos y sus acciones. Lanza fuera de <ProveedorCesta>. */
export function useFavoritos(): ValorFavoritos {
  const valor = useContext(ContextoFavoritos);
  if (!valor) throw new Error('useFavoritos necesita <ProveedorCesta>.');
  return valor;
}
