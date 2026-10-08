// A dónde volver después de entrar. El destino llega en la URL
// (?siguiente=…), así que se limita a rutas internas: si no, un enlace
// trampa podría mandar a alguien a otra web justo después de identificarse.

const BASE = 'http://interno.invalid';

export function destinoSeguro(valor: unknown, porDefecto = '/cuenta'): string {
  if (typeof valor !== 'string' || valor === '') return porDefecto;
  // «//otra.web» y «/\otra.web» los navegadores los leen como otro dominio.
  if (!valor.startsWith('/') || valor.startsWith('//') || valor.startsWith('/\\')) return porDefecto;
  try {
    const url = new URL(valor, BASE);
    // «/.//otra.web» o «/a/..//otra.web» se normalizan a «//otra.web»:
    // se vuelve a comprobar la ruta ya resuelta.
    if (url.origin !== BASE || url.pathname.startsWith('//')) return porDefecto;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return porDefecto;
  }
}

/** «/entrar» + «/cuenta/pedidos» → «/entrar?siguiente=%2Fcuenta%2Fpedidos». */
export function conSiguiente(ruta: string, siguiente: string): string {
  return `${ruta}?siguiente=${encodeURIComponent(siguiente)}`;
}
