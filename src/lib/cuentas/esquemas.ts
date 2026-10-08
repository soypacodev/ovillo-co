// Esquemas de los formularios de la cuenta. Se validan en el servidor;
// los atributos del HTML (required, minLength…) son solo una ayuda.

import { z } from 'zod';
import { NOMBRES_PROVINCIA } from '@/lib/pagos/esquema';
import { casilla, correo, texto } from '@/lib/validacion';
import { MIN_CONTRASENA, PALABRA_BORRAR } from './tipos';



const correoCuenta = correo('Escribe tu correo.');

// Sin trim: un espacio al principio o al final también es parte de la contraseña.
const contrasenaNueva = z.preprocess(
  (v) => (typeof v === 'string' ? v : ''),
  z
    .string()
    .min(MIN_CONTRASENA, `Necesita al menos ${MIN_CONTRASENA} caracteres. Mejor larga que complicada.`)
    .max(72, 'Como mucho 72 caracteres.'),
);

export const esquemaEntrar = z.object({
  correo: correoCuenta,
  contrasena: z.preprocess((v) => (typeof v === 'string' ? v : ''), z.string().min(1, 'Falta la contraseña.')),
  siguiente: texto(),
});

export const esquemaEnlace = z.object({ correo: correoCuenta, siguiente: texto() });

export const esquemaRegistro = z.object({
  nombre: texto().pipe(z.string().min(1, '¿Cómo te llamas?').max(120, 'Como mucho 120 caracteres.')),
  correo: correoCuenta,
  contrasena: contrasenaNueva,
  acepta: z.preprocess(
    (v) => v === 'on',
    z.literal(true, { error: 'Para crear la cuenta hay que aceptar la privacidad y los términos.' }),
  ),
  boletin: casilla(),
});

export const esquemaRecuperar = z.object({ correo: correoCuenta });

export const esquemaNuevaContrasena = z
  .object({ contrasena: contrasenaNueva, repetida: z.preprocess((v) => (typeof v === 'string' ? v : ''), z.string()) })
  .refine((d) => d.contrasena === d.repetida, { path: ['repetida'], message: 'Las dos contraseñas no coinciden.' });

export const esquemaDatos = z.object({
  nombre: texto().pipe(z.string().min(1, '¿Cómo te llamas?').max(120, 'Como mucho 120 caracteres.')),
  telefono: texto().pipe(
    z.union([z.literal(''), z.string().regex(/^[+0-9 ()-]{6,30}$/, 'Escribe solo números, espacios o el prefijo con +.')]),
  ),
  boletin: casilla(),
});

export const esquemaDireccion = z.object({
  id: texto().pipe(z.union([z.literal(''), z.uuid()])),
  etiqueta: texto().pipe(z.string().max(40, 'Como mucho 40 caracteres.')),
  destinatario: texto().pipe(z.string().min(1, '¿A nombre de quién?').max(120, 'Como mucho 120 caracteres.')),
  linea1: texto().pipe(z.string().min(3, 'Escribe la calle y el número.').max(160, 'Como mucho 160 caracteres.')),
  linea2: texto().pipe(z.string().max(120, 'Como mucho 120 caracteres.')),
  codigo_postal: texto().pipe(z.string().regex(/^\d{5}$/, 'El código postal tiene 5 cifras.')),
  ciudad: texto().pipe(z.string().min(1, 'Falta la localidad.').max(80, 'Como mucho 80 caracteres.')),
  provincia: texto().pipe(
    z.string().refine((p) => NOMBRES_PROVINCIA.includes(p), 'Elige una provincia de la lista.'),
  ),
  telefono: texto().pipe(
    z.union([z.literal(''), z.string().regex(/^[+0-9 ()-]{6,30}$/, 'Escribe solo números, espacios o el prefijo con +.')]),
  ),
  predeterminada: casilla(),
});


export const esquemaBorrarCuenta = z.object({
  confirmacion: texto().pipe(
    z.string().refine((v) => v.toUpperCase() === PALABRA_BORRAR, `Escribe ${PALABRA_BORRAR} para confirmar.`),
  ),
});

export const esquemaFavoritos = z.object({
  anadir: z.array(z.string().min(1).max(120)).max(100),
  quitar: z.array(z.string().min(1).max(120)).max(100),
});
