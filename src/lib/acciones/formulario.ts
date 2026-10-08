// Lectura común de los formularios cortos (boletín, aviso de reposición).
// Solo se usa en el servidor: el estado que comparte con el navegador está
// en tipos.ts, para que zod no viaje al cliente.

import { correo } from '@/lib/validacion';
import { CAMPO_TRAMPA } from './opciones';

const esquemaCorreo = correo('Falta el correo.');

/** Correo normalizado (sin espacios y en minúsculas) y si tiene forma de correo. */
export function leerCorreo(datos: FormData, campo = 'correo'): { correo: string; valido: boolean } {
  const bruto = datos.get(campo);
  const limpio = typeof bruto === 'string' ? bruto.trim().toLowerCase() : '';
  return { correo: limpio, valido: esquemaCorreo.safeParse(limpio).success };
}

/** Campo trampa: las personas no lo ven y los robots lo rellenan. */
export function esRobot(datos: FormData): boolean {
  const trampa = datos.get(CAMPO_TRAMPA);
  return typeof trampa === 'string' && trampa.trim() !== '';
}
