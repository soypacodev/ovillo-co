// Pequeñas utilidades del flujo de compra en el navegador.

import { guardarLocal, leerLocal } from '@/lib/almacen-local';
import type { LineaCesta } from '@/lib/cesta/tipos';
import type { LineaEntrada } from '@/lib/pagos/esquema';
import { METODOS_ENVIO, type IdEnvio } from '@/lib/pagos/opciones';

const CLAVE_ENVIO = 'envio';

/** Método de envío elegido en la cesta, para que el pago empiece con él. */
export function leerEnvioGuardado(): IdEnvio {
  const guardado = leerLocal(CLAVE_ENVIO);
  return METODOS_ENVIO.find((m) => m === guardado) ?? 'ordinario';
}

export function guardarEnvio(id: IdEnvio): void {
  guardarLocal(CLAVE_ENVIO, id);
}

/** Lo único que viaja al servidor de cada línea. */
export function lineasParaPedido(lineas: readonly LineaCesta[]): LineaEntrada[] {
  return lineas.map((l) => ({
    slug: l.slug,
    variante: l.variante,
    cantidad: l.uds,
    personalizacion: l.personalizacion,
  }));
}
