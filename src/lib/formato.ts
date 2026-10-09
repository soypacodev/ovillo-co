// Los importes viajan siempre en céntimos y solo se formatean al mostrarlos.

import { DATOS_IDIOMA, type Idioma } from '@/lib/i18n/idiomas';

const FORMATOS_EUROS = Object.fromEntries(
  Object.entries(DATOS_IDIOMA).map(([idioma, d]) => [
    idioma,
    new Intl.NumberFormat(d.formato, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  ]),
) as Record<Idioma, Intl.NumberFormat>;

/** 1200 → «12,00 €» («€12.00» en inglés). El espacio es de no separación
 *  para que la cifra y el símbolo no se separen nunca en dos líneas. */
export function eur(centimos: number, idioma: Idioma = 'es'): string {
  const cifra = FORMATOS_EUROS[idioma].format(centimos / 100);
  return idioma === 'en' ? `€${cifra}` : `${cifra} €`;
}

/** Importe en negativo con el signo menos tipográfico: «−3,30 €». */
export function eurMenos(centimos: number, idioma: Idioma = 'es'): string {
  return `−${eur(Math.abs(centimos), idioma)}`;
}

/** Porcentaje de rebaja redondeado entre un precio anterior y el actual. */
export function porcentajeRebaja(antes: number | null, precio: number): number {
  if (!antes || antes <= precio) return 0;
  return Math.round((100 * (antes - precio)) / antes);
}

const PIEZAS: Record<Idioma, [string, string]> = {
  es: ['pieza', 'piezas'],
  en: ['item', 'items'],
  fr: ['pièce', 'pièces'],
  de: ['Stück', 'Stück'],
};

/** «1 pieza», «3 piezas». */
export function piezas(n: number, idioma: Idioma = 'es'): string {
  return `${n} ${PIEZAS[idioma][n === 1 ? 0 : 1]}`;
}
