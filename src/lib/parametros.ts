// Lectura de parámetros de la URL en páginas de servidor. En Next 16
// llegan como promesa y cada valor puede venir repetido.

export type ParametrosUrl = Promise<Record<string, string | string[] | undefined>>;

/** Primer valor de un parámetro, o '' si no viene. */
export function parametro(valor: string | string[] | undefined): string {
  return (Array.isArray(valor) ? valor[0] : valor) ?? '';
}

/** Número de página (desde 1) a partir de ?pagina=. */
export function numeroPagina(valor: string | string[] | undefined): number {
  const n = Number(parametro(valor));
  return Number.isInteger(n) && n > 0 && n < 10_000 ? n : 1;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Para los [id] de las rutas: uno mal formado es un 404, no un error de la base de datos. */
export const esUuid = (valor: string) => UUID.test(valor);
