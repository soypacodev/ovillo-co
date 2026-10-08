import type { Promocion } from '@/lib/catalogo/tipos';
import { PROMOCIONES } from '@/datos/semilla';
import { eur } from '@/lib/formato';
import { buscarCupon, normalizarCodigo, totales } from './totales';
import { CESTA_VACIA, type EstadoCesta, type LineaCesta, type ResultadoCupon } from './tipos';

/**
 * Comprueba un código contra las promociones con mensajes concretos.
 * El mínimo se mide tras la rebaja automática, igual que en `totales`.
 */
export function validarCupon(
  codigo: string,
  lineas: readonly LineaCesta[],
  promociones: readonly Promocion[] = PROMOCIONES,
  fecha: Date = new Date(),
): ResultadoCupon {
  const c = normalizarCodigo(codigo);
  if (!c) return { ok: false, motivo: 'vacio', mensaje: 'Escribe el código para aplicarlo.' };

  const promocion = buscarCupon(c, promociones, fecha);
  if (!promocion) {
    return { ok: false, motivo: 'no-existe', mensaje: 'Ese código no existe o ya no está activo.' };
  }

  const t = totales(lineas, null, { promociones, fecha });
  const base = t.subtotal - t.rebajaAuto;
  if (base < promocion.minimo) {
    return {
      ok: false,
      motivo: 'minimo',
      mensaje: `Este código pide un mínimo de ${eur(promocion.minimo)}; te faltan ${eur(promocion.minimo - base)}.`,
    };
  }

  return { ok: true, codigo: c, promocion, mensaje: `Código «${c}» aplicado: ${promocion.nombre}.` };
}

/** Valida el código y, si vale, lo deja guardado en la cesta. */
export function aplicarCupon(
  estado: EstadoCesta,
  codigo: string,
  promociones: readonly Promocion[] = PROMOCIONES,
  fecha: Date = new Date(),
): { estado: EstadoCesta; resultado: ResultadoCupon } {
  const resultado = validarCupon(codigo, estado.lineas, promociones, fecha);
  if (!resultado.ok) return { estado, resultado };
  return { estado: { ...estado, cupon: resultado.codigo }, resultado };
}

export function quitarCupon(estado: EstadoCesta): EstadoCesta {
  if (!estado.cupon) return estado;
  return estado.lineas.length ? { ...estado, cupon: null } : CESTA_VACIA;
}
