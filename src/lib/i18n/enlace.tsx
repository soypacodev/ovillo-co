'use client';

// next/link que añade solo el prefijo del idioma de la página. Se usa en
// toda la tienda con rutas sin idioma: <Enlace href={rutas.tienda}>.

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { conIdioma } from './idiomas';
import { useIdioma } from './cliente';

export function Enlace({ href, ...props }: ComponentProps<typeof Link>) {
  const idioma = useIdioma();
  return <Link href={typeof href === 'string' ? conIdioma(href, idioma) : href} {...props} />;
}
