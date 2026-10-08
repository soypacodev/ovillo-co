// Fuentes de la marca, servidas desde el propio dominio con next/font.
//
// Son Fraunces y DM Sans (licencia OFL, ver OFL-*.txt) de Google Fonts,
// recortadas con fontTools («instancer» y «subset»):
// - Fraunces fija SOFT=50 y WONK=1 (el carácter redondeado de la marca) y
//   el tamaño óptico en 48, el de sus titulares; DM Sans, en 14, el del texto.
// - Las dos dejan el peso variable entre 400 y 500, lo único que usa el sitio.
// - Solo latín básico y Latin-1, más comillas, rayas, puntos suspensivos y €.
// Pasan de 325 KB a 80 KB: en móvil es lo que más adelanta la foto principal.

import localFont from 'next/font/local';

export const fraunces = localFont({
  src: [
    { path: './fraunces.woff2', weight: '400 500', style: 'normal' },
    { path: './fraunces-cursiva.woff2', weight: '400 500', style: 'italic' },
  ],
  variable: '--f-titulos',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
});

export const dmSans = localFont({
  src: [{ path: './dm-sans.woff2', weight: '400 500', style: 'normal' }],
  variable: '--f-texto',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});
