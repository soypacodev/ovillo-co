// Cifras del taller que se repiten en la portada y en «El taller». Son de
// una tienda ficticia, pero tienen que cuadrar entre páginas.

import { textos, type Idioma } from '@/lib/i18n';

export const CIFRAS_TALLER = [
  { valor: 1260, texto: 'piezas tejidas' },
  { valor: 830, texto: 'pedidos enviados' },
  { valor: 7, texto: 'años con la aguja' },
] as const;

const TEXTOS_CIFRAS = textos(
  CIFRAS_TALLER.map((c) => c.texto),
  {
    en: ['pieces made', 'orders shipped', 'years with the hook'],
    fr: ['pièces réalisées', 'commandes expédiées', 'ans de crochet'],
    de: ['gehäkelte Stücke', 'verschickte Bestellungen', 'Jahre an der Häkelnadel'],
  },
);

/** Las mismas cifras con su texto en ese idioma. */
export const cifrasTaller = (idioma: Idioma) =>
  CIFRAS_TALLER.map((c, i) => ({ valor: c.valor, texto: TEXTOS_CIFRAS[idioma][i] ?? c.texto }));

/** Horas que lleva tejer una manta grande. */
export const HORAS_MANTA = 12;
