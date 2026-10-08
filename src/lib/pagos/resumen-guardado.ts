// El modo demostración no tiene base de datos: el servidor devuelve el
// resumen ya calculado y el navegador lo guarda para la confirmación. Al
// leerlo se valida, porque localStorage se puede editar a mano. Se hace a
// mano y no con zod para no cargarlo en el navegador.

import { METODOS_ENVIO } from './opciones';
import type { ResumenPedido } from './tipos';

type Objeto = Record<string, unknown>;

const esObjeto = (v: unknown): v is Objeto => typeof v === 'object' && v !== null && !Array.isArray(v);
const texto = (v: unknown, max: number): v is string => typeof v === 'string' && v.length <= max;
const entero = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0;
/** Solo rutas propias: una foto no puede apuntar a otra web. */
const ruta = (v: unknown): v is string => typeof v === 'string' && v.startsWith('/') && !v.startsWith('//');

function lineaValida(l: unknown): boolean {
  if (!esObjeto(l)) return false;
  const foto = l.foto;
  return (
    texto(l.slug, 120) &&
    texto(l.nombre, 200) &&
    texto(l.variante, 120) &&
    (foto === null || (esObjeto(foto) && ruta(foto.src) && typeof foto.alt === 'string')) &&
    entero(l.cantidad) &&
    entero(l.total) &&
    texto(l.personalizacion, 60)
  );
}

function esResumen(r: unknown): r is ResumenPedido {
  if (!esObjeto(r) || !esObjeto(r.envio)) return false;
  const { envio, lineas } = r;
  return (
    typeof r.numero === 'string' &&
    /^DEMO-\d{4}-[A-Z0-9]{6}$/.test(r.numero) &&
    typeof r.fecha === 'string' &&
    !Number.isNaN(Date.parse(r.fecha)) &&
    texto(r.email, 254) &&
    r.modo === 'demo' &&
    r.estado === 'demo' &&
    texto(r.nombre, 200) &&
    texto(r.telefono, 30) &&
    (METODOS_ENVIO as readonly unknown[]).includes(envio.id) &&
    texto(envio.nombre, 80) &&
    texto(envio.plazo, 80) &&
    (r.direccion === null || texto(r.direccion, 400)) &&
    typeof r.regalo === 'boolean' &&
    texto(r.dedicatoria, 300) &&
    texto(r.nota, 600) &&
    Array.isArray(lineas) &&
    lineas.length >= 1 &&
    lineas.length <= 50 &&
    lineas.every(lineaValida) &&
    entero(r.subtotal) &&
    entero(r.descuento) &&
    texto(r.nombreDescuento, 80) &&
    entero(r.envioImporte) &&
    entero(r.total) &&
    (r.diasConfeccion === null || entero(r.diasConfeccion))
  );
}

/** Resumen guardado en el navegador si es válido y corresponde a `numero`; si no, null. */
export function leerResumenDemo(dato: unknown, numero: string): ResumenPedido | null {
  return esResumen(dato) && dato.numero === numero ? dato : null;
}
