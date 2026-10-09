// Idioma de la petición en curso, en el servidor. Lo decide el proxy
// (src/proxy.ts) y llega en una cabecera interna.
import 'server-only';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { CABECERA_IDIOMA, conIdioma, esIdioma, IDIOMA_POR_DEFECTO, type Idioma } from './idiomas';
import type { Textos } from './textos';

export async function idiomaActual(): Promise<Idioma> {
  const valor = (await headers()).get(CABECERA_IDIOMA);
  return esIdioma(valor) ? valor : IDIOMA_POR_DEFECTO;
}

/** Los textos de ese archivo en el idioma de la petición. */
export async function textosServidor<T>(t: Textos<T>): Promise<Textos<T>[Idioma]> {
  return t[await idiomaActual()];
}

/** redirect() a una ruta de la tienda, en el idioma de la petición. */
export async function redirigir(ruta: string): Promise<never> {
  redirect(conIdioma(ruta, await idiomaActual()));
}

/** Ruta de la tienda en el idioma de la petición. */
export async function rutaEnIdioma(ruta: string): Promise<string> {
  return conIdioma(ruta, await idiomaActual());
}
