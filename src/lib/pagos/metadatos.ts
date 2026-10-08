// Lo que el webhook necesita para registrar el pedido viaja en los
// metadatos de la sesión de Stripe. Stripe limita cada valor a 500
// caracteres y a 50 claves, así que las líneas se guardan en JSON
// compacto repartido en trozos, y cualquier otro valor que no quepa en
// una clave se reparte igual (`nota_0`, `nota_1`…). Nada se recorta: un
// JSON cortado no se podría leer en el webhook.

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

/** Trozos de como mucho MAX_VALOR caracteres. Se cuenta por caracteres y
 *  no por unidades UTF-16, para no partir un emoji por la mitad. */
function trocear(texto: string): string[] {
  const caracteres = Array.from(texto);
  const trozos: string[] = [];
  for (let i = 0; i < caracteres.length; i += MAX_VALOR) trozos.push(caracteres.slice(i, i + MAX_VALOR).join(''));
  return trozos;
}

/** Guarda un valor en `clave` si cabe; si no, repartido en `clave_0`, `clave_1`… */
function guardar(metadatos: Record<string, string>, clave: string, valor: string): void {
  const trozos = trocear(valor);
  if (trozos.length <= 1) {
    metadatos[clave] = valor;
    return;
  }
  trozos.forEach((trozo, i) => {
    metadatos[`${clave}_${i}`] = trozo;
  });
}

/** Une los trozos de `prefijo0`, `prefijo1`… en orden numérico. */
function juntarTrozos(metadatos: Record<string, string>, prefijo: string): string {
  return Object.keys(metadatos)
    .filter((k) => k.startsWith(prefijo) && /^\d+$/.test(k.slice(prefijo.length)))
    .sort((a, b) => Number(a.slice(prefijo.length)) - Number(b.slice(prefijo.length)))
    .map((k) => metadatos[k])
    .join('');
}

/** Lo contrario de `guardar`: el valor entero, esté en una clave o repartido. */
function leer(metadatos: Record<string, string>, clave: string): string | undefined {
  if (clave in metadatos) return metadatos[clave];
  return juntarTrozos(metadatos, `${clave}_`) || undefined;
}

/** Metadatos de la sesión de Stripe: datos de entrega y líneas troceadas en claves `PREFIJO_LINEAS + n`. */
export function aMetadatos(d: DatosSesion): Record<string, string> {
  const lineas = JSON.stringify(d.lineas.map((l) => [l.slug, l.variante, l.cantidad, l.personalizacion]));
  const metadatos: Record<string, string> = {
    origen: ORIGEN_TIENDA,
    referencia: d.referencia,
    envio: d.envio,
  };
  guardar(metadatos, 'nombre', d.nombre);
  trocear(lineas).forEach((trozo, i) => {
    metadatos[`${PREFIJO_LINEAS}${i}`] = trozo;
  });
  if (d.cupon) metadatos.cupon = d.cupon;
  if (d.telefono) metadatos.telefono = d.telefono;
  if (d.direccion) guardar(metadatos, 'direccion', JSON.stringify(d.direccion));
  if (d.regalo) metadatos.regalo = 'si';
  if (d.dedicatoria) guardar(metadatos, 'dedicatoria', d.dedicatoria);
  if (d.nota) guardar(metadatos, 'nota', d.nota);
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

  const lineas = z.array(lineaCompacta).min(1).safeParse(json(juntarTrozos(metadatos, PREFIJO_LINEAS)));
  const envio = z.enum(METODOS_ENVIO).safeParse(metadatos.envio);
  if (!lineas.success || !envio.success || !metadatos.referencia) return null;

  const dir = direccion.safeParse(json(leer(metadatos, 'direccion')));
  const dias = Number(metadatos.dias);

  return {
    referencia: metadatos.referencia,
    lineas: lineas.data,
    cupon: metadatos.cupon || null,
    envio: envio.data,
    nombre: leer(metadatos, 'nombre') ?? '',
    telefono: metadatos.telefono ?? '',
    direccion: dir.success ? dir.data : null,
    regalo: metadatos.regalo === 'si',
    dedicatoria: leer(metadatos, 'dedicatoria') ?? '',
    nota: leer(metadatos, 'nota') ?? '',
    diasConfeccion: Number.isInteger(dias) && dias > 0 ? dias : null,
    usuario: z.uuid().safeParse(metadatos.usuario).success ? metadatos.usuario : null,
  };
}
