import type { Promocion } from '@/lib/catalogo/tipos';
import { PROMOCIONES } from '@/datos/semilla';
import { eur } from '@/lib/formato';
import { textos, type Idioma } from '@/lib/i18n';
import { nombrePromocion } from './nombres';
import { buscarCupon, normalizarCodigo, totales } from './totales';
import { CESTA_VACIA, type EstadoCesta, type LineaCesta, type ResultadoCupon } from './tipos';

const T = textos(
  {
    vacio: 'Escribe el código para aplicarlo.',
    noExiste: 'Ese código no existe o ya no está activo.',
    minimo: (minimo: string, falta: string) => `Este código pide un mínimo de ${minimo}; te faltan ${falta}.`,
    avisoEnvio: (falta: string) => ` Con este código te faltan ${falta} para el envío gratis.`,
    aplicado: (codigo: string, nombre: string, aviso: string) => `Código «${codigo}» aplicado: ${nombre}.${aviso}`,
  },
  {
    en: {
      vacio: 'Type in the code to apply it.',
      noExiste: 'That code doesn’t exist or is no longer active.',
      minimo: (minimo: string, falta: string) => `This code needs a minimum spend of ${minimo}; you’re ${falta} short.`,
      avisoEnvio: (falta: string) => ` With this code you’re ${falta} away from free delivery.`,
      aplicado: (codigo: string, nombre: string, aviso: string) => `Code “${codigo}” applied: ${nombre}.${aviso}`,
    },
    fr: {
      vacio: 'Saisissez le code pour l’appliquer.',
      noExiste: 'Ce code n’existe pas ou n’est plus actif.',
      minimo: (minimo: string, falta: string) =>
        `Ce code demande un minimum de ${minimo}\u202f; il vous manque ${falta}.`,
      avisoEnvio: (falta: string) => ` Avec ce code, il vous manque ${falta} pour la livraison offerte.`,
      aplicado: (codigo: string, nombre: string, aviso: string) =>
        `Code «\u00a0${codigo}\u00a0» appliqué\u00a0: ${nombre}.${aviso}`,
    },
    de: {
      vacio: 'Geben Sie den Code ein, um ihn einzulösen.',
      noExiste: 'Diesen Code gibt es nicht oder er ist nicht mehr gültig.',
      minimo: (minimo: string, falta: string) => `Dieser Code gilt ab ${minimo}; es fehlen noch ${falta}.`,
      avisoEnvio: (falta: string) => ` Mit diesem Code fehlen Ihnen noch ${falta} bis zum kostenlosen Versand.`,
      aplicado: (codigo: string, nombre: string, aviso: string) => `Code „${codigo}“ eingelöst: ${nombre}.${aviso}`,
    },
  },
);

/**
 * Comprueba un código contra las promociones con mensajes concretos.
 * El mínimo se mide tras la rebaja automática, igual que en `totales`.
 */
export function validarCupon(
  codigo: string,
  lineas: readonly LineaCesta[],
  promociones: readonly Promocion[] = PROMOCIONES,
  fecha: Date = new Date(),
  idioma: Idioma = 'es',
): ResultadoCupon {
  const t = T[idioma];
  const c = normalizarCodigo(codigo);
  if (!c) return { ok: false, motivo: 'vacio', mensaje: t.vacio };

  const promocion = buscarCupon(c, promociones, fecha);
  if (!promocion) {
    return { ok: false, motivo: 'no-existe', mensaje: t.noExiste };
  }

  const sinCupon = totales(lineas, null, { promociones, fecha });
  const base = sinCupon.subtotal - sinCupon.rebajaAuto;
  if (base < promocion.minimo) {
    return {
      ok: false,
      motivo: 'minimo',
      mensaje: t.minimo(eur(promocion.minimo, idioma), eur(promocion.minimo - base, idioma)),
    };
  }

  const conCupon = totales(lineas, c, { promociones, fecha });
  const aviso = conCupon.cuponQuitaEnvioGratis ? t.avisoEnvio(eur(conCupon.faltaEnvioGratis, idioma)) : '';
  return { ok: true, codigo: c, promocion, mensaje: t.aplicado(c, nombrePromocion(promocion, idioma), aviso) };
}

/** Valida el código y, si vale, lo deja guardado en la cesta. */
export function aplicarCupon(
  estado: EstadoCesta,
  codigo: string,
  promociones: readonly Promocion[] = PROMOCIONES,
  fecha: Date = new Date(),
  idioma: Idioma = 'es',
): { estado: EstadoCesta; resultado: ResultadoCupon } {
  const resultado = validarCupon(codigo, estado.lineas, promociones, fecha, idioma);
  if (!resultado.ok) return { estado, resultado };
  return { estado: { ...estado, cupon: resultado.codigo }, resultado };
}

export function quitarCupon(estado: EstadoCesta): EstadoCesta {
  if (!estado.cupon) return estado;
  return estado.lineas.length ? { ...estado, cupon: null } : CESTA_VACIA;
}
