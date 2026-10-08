// Almacén externo para useSyncExternalStore. Mantiene el estado en
// memoria, lo persiste en localStorage y escucha el evento `storage`
// para que dos pestañas abiertas vean la misma cesta.

import { claveLocal, guardarLocal, interpretar, leerLocal } from '@/lib/almacen-local';

export interface Almacen<T> {
  leer: () => T;
  escribir: (valor: T) => void;
  suscribir: (oyente: () => void) => () => void;
  /** Estado que ve el servidor y el primer render del cliente. */
  inicial: T;
}

/**
 * Crea un almacén persistido en la clave `clave`. `normalizar` limpia lo
 * que se lee (puede venir corrupto o de otra versión) y `serializar`
 * decide qué se escribe. El escucha de `storage` solo vive mientras hay
 * suscriptores.
 */
export function crearAlmacen<T>(
  clave: string,
  inicial: T,
  normalizar: (dato: unknown) => T,
  serializar: (valor: T) => unknown = (v) => v,
): Almacen<T> {
  let estado: T | undefined;
  const oyentes = new Set<() => void>();

  const avisar = () => oyentes.forEach((o) => o());

  const alCambiarEnOtraPestana = (e: StorageEvent) => {
    if (e.key !== claveLocal(clave)) return;
    estado = normalizar(interpretar(e.newValue));
    avisar();
  };

  return {
    inicial,
    leer() {
      if (typeof window === 'undefined') return inicial;
      if (estado === undefined) estado = normalizar(leerLocal(clave));
      return estado;
    },
    escribir(valor) {
      if (valor === estado) return;
      estado = valor;
      guardarLocal(clave, serializar(valor));
      avisar();
    },
    suscribir(oyente) {
      oyentes.add(oyente);
      if (oyentes.size === 1) window.addEventListener('storage', alCambiarEnOtraPestana);
      return () => {
        oyentes.delete(oyente);
        if (oyentes.size === 0) window.removeEventListener('storage', alCambiarEnOtraPestana);
      };
    },
  };
}
