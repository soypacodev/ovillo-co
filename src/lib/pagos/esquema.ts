// Qué puede mandar el navegador al confirmar un pedido. Las reglas de los
// datos de entrega están en opciones.ts, que también usa el formulario.
//
// Las líneas solo dicen qué pieza, qué color y cuántas: cualquier otro
// campo (un precio, por ejemplo) se descarta al validar.

import { z } from 'zod';
import { MAX_UDS_LINEA } from '@/lib/cesta/tipos';
import { METODOS_ENVIO, erroresDatos, type ErroresCampos } from './opciones';

export {
  MAX_DEDICATORIA,
  MAX_NOTA,
  METODOS_ENVIO,
  NOMBRES_PROVINCIA,
  provinciaDeCodigo,
  type DatosPedido,
  type ErroresCampos,
  type IdEnvio,
} from './opciones';

const textoLibre = z.string().trim().default('');

/** Tipos y recortes con zod; las reglas, las mismas que en el navegador. */
export const esquemaDatos = z
  .object({
    email: z.string().trim(),
    nombre: z.string().trim(),
    apellidos: z.string().trim(),
    telefono: textoLibre,
    envio: z.enum(METODOS_ENVIO, 'Elige cómo quieres recibirlo.'),
    calle: textoLibre,
    piso: textoLibre,
    cp: textoLibre,
    ciudad: textoLibre,
    provincia: textoLibre,
    regalo: z.boolean().default(false),
    dedicatoria: textoLibre,
    nota: textoLibre,
    acepta: z.boolean().default(false),
  })
  .superRefine((d, ctx) => {
    for (const [campo, mensaje] of Object.entries(erroresDatos(d))) {
      ctx.addIssue({ code: 'custom', path: [campo], message: mensaje });
    }
  });

export type DatosValidados = z.output<typeof esquemaDatos>;

export const esquemaLinea = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(120),
  variante: z.string().trim().min(1).max(120),
  cantidad: z.number().int().min(1).max(MAX_UDS_LINEA),
  personalizacion: z.string().trim().max(60).default(''),
});

export type LineaEntrada = z.input<typeof esquemaLinea>;
export type LineaPedido = z.output<typeof esquemaLinea>;

export const esquemaPedido = z.object({
  datos: esquemaDatos,
  lineas: z
    .array(esquemaLinea)
    .min(1, 'La cesta está vacía.')
    .max(50, 'Demasiadas líneas en la cesta.')
    // La cesta ya junta las líneas iguales; dos repetidas indican una
    // petición hecha a mano.
    .refine(
      (lineas) => new Set(lineas.map((l) => `${l.slug}|${l.variante}|${l.personalizacion}`)).size === lineas.length,
      'Hay líneas repetidas en la cesta.',
    ),
  cupon: z
    .string()
    .trim()
    .max(40)
    .transform((c) => c.toUpperCase() || null)
    .nullable()
    .default(null),
  /** Total que vio la clienta: si el servidor calcula otro, no se cobra. */
  totalVisto: z.number().int().min(0),
});


/** Primer error de cada campo, con la ruta sin el prefijo «datos.». */
export function erroresPorCampo(issues: readonly z.core.$ZodIssue[]): ErroresCampos {
  const errores: Record<string, string> = {};
  for (const issue of issues) {
    const ruta = issue.path.filter((p) => p !== 'datos').join('.');
    if (ruta && !(ruta in errores)) errores[ruta] = issue.message;
  }
  return errores as ErroresCampos;
}
