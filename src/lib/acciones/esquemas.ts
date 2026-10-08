// Esquemas de los formularios públicos. Se usan en el servidor, que es
// donde se decide si un envío vale: lo que valide el navegador es solo
// una ayuda para no hacer esperar a nadie.

import { z } from 'zod';
import { correo, texto } from '@/lib/validacion';
import { tipoDeImagen, type TipoImagen } from './fotos';
import {
  CAMPO_TRAMPA,
  LIMITES_FOTOS,
  MOTIVOS_CONTACTO,
  PRESUPUESTOS,
  TIPOS_ENCARGO,
  megas,
  type MotivoContacto,
  type TipoEncargo,
} from './opciones';

export { LIMITES_FOTOS, MOTIVOS_CONTACTO, TIPOS_ENCARGO };

/* ------------------------------------------------------------------
   Piezas comunes
   ------------------------------------------------------------------ */

const textoOpcional = (max: number, mensaje: string) =>
  texto().pipe(z.string().max(max, mensaje));

const nombre = texto().pipe(
  z.string().min(1, '¿Cómo te llamas?').max(120, 'El nombre es demasiado largo (máximo 120 caracteres).'),
);

const correoContacto = correo('Necesitamos tu correo para contestarte.');

/** Una casilla marcada llega como «on»; sin marcar, no llega. */
const consentimiento = z.preprocess(
  (v) => v === 'on' || v === 'true',
  z.literal(true, { error: 'Sin tu permiso no podemos guardar tus datos para contestarte.' }),
);

/* ------------------------------------------------------------------
   Encargo a medida
   ------------------------------------------------------------------ */

export interface LimitesImagenes {
  cantidad: number;
  /** Por foto. */
  bytes: number;
  /** Entre todas: debe caber en serverActions.bodySizeLimit (next.config.ts). */
  bytesTotales: number;
  tipos: readonly TipoImagen[];
}

/** Lista de fotos subidas con un formulario, común a encargos y panel. */
export function listaImagenes(limites: LimitesImagenes, minimo = 0) {
  const imagen = z
    .file()
    .max(limites.bytes, `Cada foto puede pesar como mucho ${megas(limites.bytes)}.`)
    .mime([...limites.tipos], 'Solo admitimos fotos JPG, PNG o WebP.')
    // El tipo lo declara el navegador y se puede falsear: miramos los
    // primeros bytes del archivo para saber qué es de verdad.
    .refine(
      async (f) => tipoDeImagen(new Uint8Array(await f.slice(0, 16).arrayBuffer())) !== null,
      'Una de las fotos no es una imagen válida.',
    );
  // Un input de archivo vacío envía un File sin contenido.
  return z.preprocess(
    (v) => (Array.isArray(v) ? v.filter((f) => !(f instanceof File && f.size === 0)) : []),
    z
      .array(imagen)
      .min(minimo, 'Elige al menos una foto.')
      .max(limites.cantidad, `Puedes mandar hasta ${limites.cantidad} fotos.`)
      .refine(
        (fs) => fs.reduce((t, f) => t + f.size, 0) <= limites.bytesTotales,
        `Entre todas, las fotos no pueden pasar de ${megas(limites.bytesTotales)}.`,
      ),
  );
}

export const esquemaEncargo = z.object({
  tipo: texto().pipe(
    z.enum(Object.keys(TIPOS_ENCARGO) as [TipoEncargo, ...TipoEncargo[]], {
      error: 'Dinos al menos de qué tipo es.',
    }),
  ),
  descripcion: texto().pipe(
    z
      .string()
      .min(20, 'Cuéntanos un poco más: con menos de 20 caracteres no podemos calcular nada.')
      .max(4000, 'Es muy largo: resúmelo en 4000 caracteres como mucho.'),
  ),
  fecha: textoOpcional(80, 'Escribe la fecha en menos de 80 caracteres.'),
  presupuesto: texto().pipe(
    z.union([z.literal(''), z.enum(PRESUPUESTOS)], { error: 'Elige uno de los presupuestos de la lista.' }),
  ),
  colores: textoOpcional(200, 'Los colores, en menos de 200 caracteres.'),
  nombre,
  correo: correoContacto,
  instagram: texto().pipe(
    z.union([
      z.literal(''),
      z.string().regex(/^@?[A-Za-z0-9._]{1,30}$/, 'Escribe solo el usuario de Instagram, por ejemplo @tuusuario.'),
    ]),
  ),
  acepta: consentimiento,
  fotos: listaImagenes(LIMITES_FOTOS),
});

export type DatosEncargo = z.output<typeof esquemaEncargo>;
export type CampoEncargo = keyof DatosEncargo;

/* ------------------------------------------------------------------
   Contacto
   ------------------------------------------------------------------ */

export const esquemaContacto = z.object({
  motivo: texto().pipe(
    z.enum(Object.keys(MOTIVOS_CONTACTO) as [MotivoContacto, ...MotivoContacto[]], {
      error: 'Dinos de qué va, aunque sea por encima.',
    }),
  ),
  pedido: texto()
    .transform((v) => v.toUpperCase())
    .pipe(
      z.union([
        z.literal(''),
        z.string().regex(/^OV-\d{4}-\d{3,7}$/, 'El número de pedido tiene esta forma: OV-2026-1042.'),
      ]),
    ),
  nombre,
  correo: correoContacto,
  mensaje: texto().pipe(
    z
      .string()
      .min(10, 'Escríbenos algo más, aunque sea corto (10 caracteres como mínimo).')
      .max(3000, 'Es muy largo: resúmelo en 3000 caracteres como mucho.'),
  ),
  acepta: consentimiento,
});

export type DatosContacto = z.output<typeof esquemaContacto>;
export type CampoContacto = keyof DatosContacto;

/* ------------------------------------------------------------------
   Utilidades
   ------------------------------------------------------------------ */

/** FormData → objeto plano. Los campos repetidos (las fotos) llegan como lista. */
export function formularioAObjeto(datos: FormData, listas: readonly string[] = []): Record<string, unknown> {
  const salida: Record<string, unknown> = {};
  for (const clave of new Set(datos.keys())) {
    if (clave.startsWith('$ACTION')) continue;
    salida[clave] = listas.includes(clave) ? datos.getAll(clave) : datos.get(clave);
  }
  return salida;
}

/** Primer mensaje de error de cada campo, listo para pintar junto al campo. */
export function erroresPorCampo<C extends string>(error: z.ZodError): Partial<Record<C, string>> {
  const errores: Partial<Record<C, string>> = {};
  for (const fallo of error.issues) {
    const campo = fallo.path[0];
    if (typeof campo !== 'string') continue;
    const clave = campo as C;
    if (!errores[clave]) errores[clave] = fallo.message;
  }
  return errores;
}

/** Los campos de texto tal como llegaron, para devolverlos al formulario. */
export function valoresDeTexto<C extends string>(crudo: Record<string, unknown>): Partial<Record<C, string>> {
  const valores: Partial<Record<C, string>> = {};
  for (const [clave, valor] of Object.entries(crudo)) {
    if (typeof valor === 'string' && clave !== CAMPO_TRAMPA) valores[clave as C] = valor.slice(0, 4000);
  }
  return valores;
}
