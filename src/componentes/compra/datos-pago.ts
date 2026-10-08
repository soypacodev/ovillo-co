// Datos del formulario de pago: tipos, pasos, validación por paso y el
// borrador que se guarda en la sesión del navegador mientras se rellena.

import { erroresDatos, type DatosPedido, type ErroresCampos, type IdEnvio } from '@/lib/pagos/opciones';
import type { RefObject } from 'react';
import { idCampo } from './campos';
import { leerEnvioGuardado } from './utiles';

export type ModoPago = 'stripe' | 'demo';

export type Datos = Required<DatosPedido>;
export type Campo = keyof Datos;
export type Paso = 1 | 2 | 3;

/** Cambia un campo del formulario (y limpia su error). */
export type Cambiar = <C extends Campo>(campo: C, valor: Datos[C]) => void;

/** Lo que recibe cada paso del formulario. */
export interface PropsPaso {
  datos: Datos;
  errores: ErroresCampos;
  cambiar: Cambiar;
  /** Título del paso: recibe el foco al llegar a él. */
  titulo: RefObject<HTMLHeadingElement | null>;
}

export const PASOS: { n: Paso; nombre: string }[] = [
  { n: 1, nombre: 'Tus datos' },
  { n: 2, nombre: 'Entrega' },
  { n: 3, nombre: 'Revisión y pago' },
];

export const CAMPOS_PASO: Record<Paso, Campo[]> = {
  1: ['email', 'nombre', 'apellidos', 'telefono'],
  2: ['envio', 'calle', 'piso', 'cp', 'ciudad', 'provincia', 'dedicatoria', 'nota'],
  3: ['acepta'],
};

/** Clave de la sesión del navegador: se olvida al cerrar la pestaña. */
const CLAVE_BORRADOR = 'ovillo.pago-borrador';

function vacio(envio: IdEnvio): Datos {
  return {
    email: '',
    nombre: '',
    apellidos: '',
    telefono: '',
    envio,
    calle: '',
    piso: '',
    cp: '',
    ciudad: '',
    provincia: '',
    regalo: false,
    dedicatoria: '',
    nota: '',
    acepta: false,
  };
}

/** Recupera lo escrito si se vuelve de Stripe o se recarga la página. */
export function leerBorrador(): Datos {
  const base = vacio(leerEnvioGuardado());
  try {
    const guardado: unknown = JSON.parse(window.sessionStorage.getItem(CLAVE_BORRADOR) ?? 'null');
    if (!guardado || typeof guardado !== 'object') return base;
    const g = guardado as Record<string, unknown>;
    const datos = { ...base };
    for (const campo of Object.keys(base) as Campo[]) {
      if (campo === 'acepta' || campo === 'envio') continue;
      const valor = g[campo];
      if (campo === 'regalo') datos.regalo = valor === true;
      else if (typeof valor === 'string') datos[campo] = valor.slice(0, 500);
    }
    return datos;
  } catch {
    return base;
  }
}

export function guardarBorrador(datos: Datos) {
  try {
    // La aceptación de los términos no se recuerda: se marca cada vez.
    window.sessionStorage.setItem(CLAVE_BORRADOR, JSON.stringify({ ...datos, acepta: undefined }));
  } catch {
    // Sin almacenamiento de sesión el formulario funciona igual.
  }
}

export function borrarBorrador() {
  try {
    window.sessionStorage.removeItem(CLAVE_BORRADOR);
  } catch {
    // Nada que borrar.
  }
}

export function erroresDe(datos: Datos, campos: readonly Campo[]): ErroresCampos {
  const todos = erroresDatos(datos);
  return Object.fromEntries(campos.filter((c) => todos[c]).map((c) => [c, todos[c]]));
}

export function enfocar(campo: Campo) {
  requestAnimationFrame(() => document.getElementById(idCampo(campo))?.focus());
}
