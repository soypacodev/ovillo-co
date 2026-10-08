// Los importes viajan siempre en céntimos y solo se formatean al mostrarlos.

const FORMATO_EUROS = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 1200 → «12,00 €». El espacio es de no separación para que la cifra y
 *  el símbolo no se separen nunca en dos líneas. */
export function eur(centimos: number): string {
  return `${FORMATO_EUROS.format(centimos / 100)} €`;
}

/** Importe en negativo con el signo menos tipográfico: «−3,30 €». */
export function eurMenos(centimos: number): string {
  return `−${eur(Math.abs(centimos))}`;
}

/** Porcentaje de rebaja redondeado entre un precio anterior y el actual. */
export function porcentajeRebaja(antes: number | null, precio: number): number {
  if (!antes || antes <= precio) return 0;
  return Math.round((100 * (antes - precio)) / antes);
}

/** «1 pieza», «3 piezas». */
export function piezas(n: number): string {
  return `${n} ${n === 1 ? 'pieza' : 'piezas'}`;
}
