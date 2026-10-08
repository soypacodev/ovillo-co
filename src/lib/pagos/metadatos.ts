// Lo que el webhook necesita para registrar el pedido viaja en los
// metadatos de la sesión de Stripe. Stripe limita cada valor a 500
// caracteres y a 50 claves, así que las líneas se guardan en JSON
// compacto repartido en trozos.

import { z } from 'zod';
import { esquemaLinea, METODOS_ENVIO, type IdEnvio, type LineaPedido } from './esquema';

const MAX_VALOR = 500;
const PREFIJO_LINEAS = 'lineas_';
/** Marca las sesiones creadas por esta tienda. */
const ORIGEN_TIENDA = 'ovillo-tienda';

export interface DireccionPedido {
  calle: string;
  piso: string;
  cp: string;
  ciudad: string;
  provincia: string;
}

export interface DatosSesion {
  referencia: string;
  lineas: LineaPedido[];
  cupon: string | null;
  envio: IdEnvio;
  nombre: string;
  telefono: string;
  direccion: DireccionPedido | null;
  regalo: boolean;
  dedicatoria: string;
  nota: string;
  diasConfeccion: number | null;
  /** Cuenta con la que se compró, para que el pedido salga en «Mis pedidos». */
  usuario: string | null;
}

function trocear(texto: string): string[] {
  const trozos: string[] = [];
  for (let i = 0; i < texto.length; i += MAX_VALOR) trozos.push(texto.slice(i, i + MAX_VALOR));
  return trozos;
}

export function aMetadatos(d: DatosSesion): Record<string, string> {
  const lineas = JSON.stringify(d.lineas.map((l) => [l.slug, l.variante, l.cantidad, l.personalizacion]));
  const metadatos: Record<string, string> = {
    origen: ORIGEN_TIENDA,
    referencia: d.referencia,
    envio: d.envio,
    nombre: d.nombre.slice(0, MAX_VALOR),
  };
  trocear(lineas).forEach((trozo, i) => {
    metadatos[`${PREFIJO_LINEAS}${i}`] = trozo;
  });
  if (d.cupon) metadatos.cupon = d.cupon;
  if (d.telefono) metadatos.telefono = d.telefono;
  if (d.direccion) metadatos.direccion = JSON.stringify(d.direccion).slice(0, MAX_VALOR);
  if (d.regalo) metadatos.regalo = 'si';
  if (d.dedicatoria) metadatos.dedicatoria = d.dedicatoria.slice(0, MAX_VALOR);
  if (d.nota) metadatos.nota = d.nota.slice(0, MAX_VALOR);
  if (d.diasConfeccion) metadatos.dias = String(d.diasConfeccion);
  if (d.usuario) metadatos.usuario = d.usuario;
  return metadatos;
}

const lineaCompacta = z
  .tuple([z.string(), z.string(), z.number(), z.string()])
  .transform(([slug, variante, cantidad, personalizacion], ctx) => {
    const linea = esquemaLinea.safeParse({ slug, variante, cantidad, personalizacion });
    if (linea.success) return linea.data;
    ctx.addIssue({ code: 'custom', message: 'Línea no válida en los metadatos.' });
    return z.NEVER;
  });

const direccion = z.object({
  calle: z.string(),
  piso: z.string(),
  cp: z.string(),
  ciudad: z.string(),
  provincia: z.string(),
});

function json(texto: string | undefined): unknown {
  if (!texto) return undefined;
  try {
    return JSON.parse(texto) as unknown;
  } catch {
    return undefined;
  }
}

/** null si la sesión no es de esta tienda o los metadatos no encajan. */
export function deMetadatos(metadatos: Record<string, string> | null | undefined): DatosSesion | null {
  if (!metadatos || metadatos.origen !== ORIGEN_TIENDA) return null;

  const trozos = Object.keys(metadatos)
    .filter((k) => k.startsWith(PREFIJO_LINEAS))
    .sort((a, b) => Number(a.slice(PREFIJO_LINEAS.length)) - Number(b.slice(PREFIJO_LINEAS.length)))
    .map((k) => metadatos[k]);
  const lineas = z.array(lineaCompacta).min(1).safeParse(json(trozos.join('')));
  const envio = z.enum(METODOS_ENVIO).safeParse(metadatos.envio);
  if (!lineas.success || !envio.success || !metadatos.referencia) return null;

  const dir = direccion.safeParse(json(metadatos.direccion));
  const dias = Number(metadatos.dias);

  return {
    referencia: metadatos.referencia,
    lineas: lineas.data,
    cupon: metadatos.cupon || null,
    envio: envio.data,
    nombre: metadatos.nombre ?? '',
    telefono: metadatos.telefono ?? '',
    direccion: dir.success ? dir.data : null,
    regalo: metadatos.regalo === 'si',
    dedicatoria: metadatos.dedicatoria ?? '',
    nota: metadatos.nota ?? '',
    diasConfeccion: Number.isInteger(dias) && dias > 0 ? dias : null,
    usuario: z.uuid().safeParse(metadatos.usuario).success ? metadatos.usuario : null,
  };
}
