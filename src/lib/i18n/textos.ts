// Textos traducidos junto al componente que los usa. Cada archivo define
// los suyos con `textos()`: el español manda la forma y TypeScript exige
// que los demás idiomas tengan exactamente las mismas claves.
//
//   const T = textos({ titulo: 'Tu cesta', piezas: (n: number) => … }, { en: {…}, fr: {…}, de: {…} });
//   T[idioma].titulo
//
// Los textos con datos son funciones; así cada idioma ordena la frase
// (y los plurales) a su manera.

import type { Idioma } from './idiomas';

type Ampliar<T> = T extends string
  ? string
  : T extends (...args: infer A) => infer R
    ? (...args: A) => R extends string ? string : R
    : T extends readonly (infer E)[]
      ? readonly Ampliar<E>[]
      : T extends object
        ? { readonly [K in keyof T]: Ampliar<T[K]> }
        : T;

export type Textos<T> = Record<Idioma, Ampliar<T>>;

export function textos<const T>(es: T, resto: Record<Exclude<Idioma, 'es'>, Ampliar<T>>): Textos<T> {
  return { es: es as Ampliar<T>, ...resto };
}
