// Límites de las fotos de producto. Van aparte de los esquemas para que el
// formulario del navegador los use sin cargar zod.

export const LIMITES_FOTOS_PRODUCTO = {
  cantidad: 6,
  /** Por foto: el límite del bucket «productos». */
  bytes: 5 * 1024 * 1024,
  /** Entre todas: debe caber en serverActions.bodySizeLimit (next.config.ts). */
  bytesTotales: 8 * 1024 * 1024,
  tipos: ['image/jpeg', 'image/png', 'image/webp'] as const,
};
