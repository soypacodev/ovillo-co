// Límite básico de envíos por origen, en memoria. Frena a quien pulsa
// enviar en bucle o a un script sencillo; no sustituye a un límite
// compartido (cada instancia del servidor lleva su propia cuenta).

export interface OpcionesLimite {
  /** Envíos permitidos dentro de la ventana. */
  maximo: number;
  /** Duración de la ventana, en milisegundos. */
  ventana: number;
}

export interface Limitador {
  /** true si el envío entra dentro del límite (y entonces cuenta). */
  permitir(clave: string, ahora?: number): boolean;
}

/** Más claves que esto y se purgan las caducadas, para no crecer sin fin. */
const MAX_CLAVES = 5000;

/** Ventana deslizante por clave: cuenta los envíos de los últimos `ventana` ms. */
export function crearLimitador({ maximo, ventana }: OpcionesLimite): Limitador {
  const registros = new Map<string, number[]>();

  function purgar(ahora: number) {
    for (const [clave, marcas] of registros) {
      if (marcas.every((t) => ahora - t >= ventana)) registros.delete(clave);
    }
  }

  return {
    permitir(clave, ahora = Date.now()) {
      if (registros.size > MAX_CLAVES) purgar(ahora);
      const recientes = (registros.get(clave) ?? []).filter((t) => ahora - t < ventana);
      if (recientes.length >= maximo) {
        registros.set(clave, recientes);
        return false;
      }
      recientes.push(ahora);
      registros.set(clave, recientes);
      return true;
    },
  };
}

/**
 * Origen de la petición según las cabeceras del proxy; «anonimo» si no hay.
 * La primera IP de x-forwarded-for la escribe el propio cliente y se puede
 * inventar en cada envío para saltarse el límite: vale x-real-ip o, si no
 * está, la última de la lista, que es la que añade el proxy de confianza.
 */
export function origenPeticion(cabeceras: Headers): string {
  const real = cabeceras.get('x-real-ip')?.trim();
  if (real) return real;
  const reenviada = cabeceras.get('x-forwarded-for')?.split(',').at(-1)?.trim();
  return reenviada || 'anonimo';
}
