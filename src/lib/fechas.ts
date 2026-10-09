// Fechas en hora de Málaga sin librerías. La base de datos agrupa las
// ventas y numera los pedidos «at time zone 'Europe/Madrid'»; la tienda
// y el panel tienen que contar igual o un pedido de las 00:30 saldría en
// el día anterior.

import { DATOS_IDIOMA, type Idioma } from '@/lib/i18n/idiomas';

const ZONA = 'Europe/Madrid';

const PARTES = new Intl.DateTimeFormat('en-US', {
  timeZone: ZONA,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function partes(fecha: Date): Record<'year' | 'month' | 'day' | 'hour' | 'minute' | 'second', number> {
  const salida = { year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0 };
  for (const p of PARTES.formatToParts(fecha)) {
    if (p.type in salida) salida[p.type as keyof typeof salida] = Number(p.value);
  }
  return salida;
}

/** Milisegundos que Madrid va por delante de UTC en ese instante. */
function desfase(fecha: Date): number {
  const p = partes(fecha);
  const comoUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return comoUtc - Math.floor(fecha.getTime() / 1000) * 1000;
}

/** «2026-10-08»: el día de Madrid en que cae ese instante. */
export function diaMadrid(fecha: Date): string {
  const p = partes(fecha);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

/** Medianoche de Madrid del día de `fecha`, como instante. */
export function inicioDiaMadrid(fecha: Date): Date {
  const p = partes(fecha);
  const medianocheUtc = Date.UTC(p.year, p.month - 1, p.day);
  return new Date(medianocheUtc - desfase(new Date(medianocheUtc)));
}

/** Día 1 del mes de Madrid de `fecha`, desplazado `meses` (negativo: hacia atrás). */
export function inicioMesMadrid(fecha: Date, meses = 0): Date {
  const p = partes(fecha);
  const primeroUtc = Date.UTC(p.year, p.month - 1 + meses, 1);
  return new Date(primeroUtc - desfase(new Date(primeroUtc)));
}

/** Suma días a una fecha «AAAA-MM-DD» sin pasar por horas (sin saltos de horario). */
export function sumarDias(dia: string, n: number): string {
  const [a, m, d] = dia.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10);
}

type OpcionesFecha = Intl.DateTimeFormatOptions;

const FORMATOS = new Map<string, Intl.DateTimeFormat>();

/** Formateadores por idioma y opciones, creados una vez. */
function formato(idioma: Idioma, opciones: OpcionesFecha): Intl.DateTimeFormat {
  const clave = `${idioma}|${JSON.stringify(opciones)}`;
  let f = FORMATOS.get(clave);
  if (!f) {
    f = new Intl.DateTimeFormat(DATOS_IDIOMA[idioma].formato, opciones);
    FORMATOS.set(clave, f);
  }
  return f;
}

const LARGA: OpcionesFecha = { timeZone: ZONA, day: 'numeric', month: 'long', year: 'numeric' };
const CON_HORA: OpcionesFecha = { timeZone: ZONA, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
const CORTO: OpcionesFecha = { timeZone: 'UTC', day: 'numeric', month: 'short' };
const DIA: OpcionesFecha = { timeZone: 'UTC', day: 'numeric', month: 'long' };

/** «8 de octubre de 2026» («8 October 2026» en inglés). */
export const fechaLarga = (iso: string, idioma: Idioma = 'es') => formato(idioma, LARGA).format(new Date(iso));
/** «8 oct, 18:05» */
export const fechaHora = (iso: string, idioma: Idioma = 'es') =>
  formato(idioma, CON_HORA)
    .format(new Date(iso))
    .replace(idioma === 'es' ? '.' : /(?!)/, '');

const deDia = (dia: string) => {
  const [a, m, d] = dia.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d));
};

/** «8 oct» para un día «AAAA-MM-DD» (sin zona: ya es un día de Madrid). */
export const diaCorto = (dia: string, idioma: Idioma = 'es') =>
  formato(idioma, CORTO)
    .format(deDia(dia))
    .replace(idioma === 'es' ? '.' : /(?!)/, '');
/** «8 de octubre» para un día «AAAA-MM-DD». */
export const diaLargo = (dia: string, idioma: Idioma = 'es') => formato(idioma, DIA).format(deDia(dia));

/** Año en curso en Madrid: el de la numeración de los pedidos. */
export const anioMadrid = (fecha: Date = new Date()) => diaMadrid(fecha).slice(0, 4);

/** «hace 5 horas», «hace 3 días»: para las bandejas, donde importa lo reciente. */
export function haceCuanto(iso: string, ahora: Date = new Date()): string {
  const minutos = Math.max(0, Math.round((ahora.getTime() - new Date(iso).getTime()) / 60000));
  if (minutos < 1) return 'ahora mismo';
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  const dias = Math.round(horas / 24);
  if (dias < 30) return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
  return fechaLarga(iso);
}
