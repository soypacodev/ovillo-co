// Acceso a localStorage tolerante a fallos: en una ventana privada, con
// las cookies bloqueadas o con la cuota llena, el navegador lanza
// excepciones. En ese caso la tienda sigue funcionando en memoria.

const PREFIJO = 'ovillo.';
const memoria = new Map<string, string>();

export function leerLocal(clave: string): unknown {
  let texto: string | null = null;
  try {
    texto = window.localStorage.getItem(PREFIJO + clave);
  } catch {
    texto = memoria.get(clave) ?? null;
  }
  return interpretar(texto);
}

export function guardarLocal(clave: string, valor: unknown): void {
  const texto = JSON.stringify(valor);
  memoria.set(clave, texto);
  try {
    window.localStorage.setItem(PREFIJO + clave, texto);
  } catch {
    // Sin almacenamiento disponible: queda en memoria durante la visita.
  }
}

/** JSON que puede venir corrupto o editado a mano: nunca lanza. */
export function interpretar(texto: string | null | undefined): unknown {
  if (texto == null) return null;
  try {
    return JSON.parse(texto) as unknown;
  } catch {
    return null;
  }
}

/** Clave completa, para comparar con `StorageEvent.key`. */
export function claveLocal(clave: string): string {
  return PREFIJO + clave;
}
