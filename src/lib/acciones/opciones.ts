// Opciones y límites de los formularios. Van aparte de los esquemas para
// que los componentes de cliente puedan usarlos sin cargar zod.

/** Campo trampa: las personas no lo ven; los robots lo rellenan. */
export const CAMPO_TRAMPA = 'sitio_web';

export const TIPOS_ENCARGO = {
  'amigurumi-mascota': 'Amigurumi de mascota',
  'amigurumi-persona': 'Amigurumi de persona',
  manta: 'Manta o mantita',
  bebe: 'Pieza de bebé (gorrito, patucos, guirnalda…)',
  accesorio: 'Accesorio (bolso, gorro, bufanda…)',
  hogar: 'Algo para la casa (cojín, cesta, alfombra)',
  pack: 'Pack de regalo a medida',
  otro: 'Otra cosa / aún no lo sabemos',
} as const;

export type TipoEncargo = keyof typeof TIPOS_ENCARGO;

export const PRESUPUESTOS = ['Hasta 25 €', '25–50 €', '50–100 €', 'Más de 100 €'] as const;

export const LIMITES_FOTOS = {
  cantidad: 4,
  /** Por foto. */
  bytes: 3 * 1024 * 1024,
  /** Entre todas: debe caber en serverActions.bodySizeLimit (next.config.ts). */
  bytesTotales: 8 * 1024 * 1024,
  tipos: ['image/jpeg', 'image/png', 'image/webp'] as const,
} as const;

/** 3145728 → «3 MB». */
export const megas = (bytes: number) => `${Math.round(bytes / 1024 / 1024)} MB`;

export const MOTIVOS_CONTACTO = {
  producto: 'Duda sobre un producto',
  'estado-pedido': 'Estado de un pedido que ya hice',
  problema: 'Problema con algo que me llegó',
  devolucion: 'Devolución o cambio',
  arreglo: 'Arreglar una pieza vuestra',
  encargo: 'Encargo a medida',
  foto: 'Mandaros una foto de mi pieza',
  colaboracion: 'Colaboración o prensa',
  otro: 'Otra cosa',
} as const;

export type MotivoContacto = keyof typeof MOTIVOS_CONTACTO;

/** Motivos en los que tiene sentido pedir el número de pedido. */
export const MOTIVOS_CON_PEDIDO: readonly MotivoContacto[] = ['estado-pedido', 'problema', 'devolucion'];
