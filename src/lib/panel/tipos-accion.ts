// Respuesta de las acciones del panel. Va aparte de acciones.ts porque un
// archivo 'use server' solo puede exportar funciones.

export type ResultadoPanel =
  | { estado: 'inicial' }
  | { estado: 'ok'; mensaje: string; intento: number }
  | { estado: 'error'; mensaje: string; errores: Record<string, string>; intento: number };

export const PANEL_INICIAL: ResultadoPanel = { estado: 'inicial' };
