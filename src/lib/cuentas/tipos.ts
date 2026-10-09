// Tipos y límites de las cuentas que comparten servidor y cliente (sin zod).

import type { Idioma } from '@/lib/i18n/idiomas';

export const MIN_CONTRASENA = 8;
export const MAX_DIRECCIONES = 10;

/** Para borrar la cuenta hay que escribir esta palabra: un clic no basta. */
export const PALABRA_BORRAR = 'BORRAR';
/** La misma palabra en cada idioma de la tienda. */
export const PALABRAS_BORRAR: Record<Idioma, string> = { es: PALABRA_BORRAR, en: 'DELETE', fr: 'SUPPRIMER', de: 'LÖSCHEN' };

export type RolCuenta = 'cliente' | 'admin' | 'demo';

export interface Perfil {
  id: string;
  email: string;
  rol: RolCuenta;
  nombre: string;
  telefono: string;
  aceptaBoletin: boolean;
}

export interface Direccion {
  id: string;
  etiqueta: string;
  destinatario: string;
  linea1: string;
  linea2: string;
  ciudad: string;
  provincia: string;
  codigo_postal: string;
  telefono: string;
  predeterminada: boolean;
}

/** Respuesta de las acciones de la cuenta, pensada para useActionState. */
export type EstadoAccion<C extends string = string> =
  | { estado: 'inicial' }
  | { estado: 'ok'; mensaje: string; intento: number }
  | {
      estado: 'error';
      mensaje: string;
      errores: Partial<Record<C, string>>;
      valores: Partial<Record<C, string>>;
      intento: number;
    };

export const ACCION_INICIAL = { estado: 'inicial' } as const;
