// Contrato de lectura del panel. Hay dos implementaciones: Supabase (las
// funciones panel_* con la sesión de quien mira) y una local en memoria
// para la demostración sin base de datos. Las páginas solo conocen esto.

import type { EstadoEncargo, EstadoMensaje, EstadoPedido } from './estados';
import type {
  FichaEncargo,
  FichaPedido,
  FichaProductoPanel,
  FilaCliente,
  FilaEncargo,
  FilaMensaje,
  FilaPedido,
  FilaProductoPanel,
  Pagina,
  ResumenPanel,
  StockBajo,
  VentaDia,
} from './filas';

export type ModoPanel = 'local' | 'supabase';

interface FiltroPagina {
  limite: number;
  desplazamiento: number;
}

export interface FuentePanel {
  readonly modo: ModoPanel;

  resumen(): Promise<ResumenPanel>;
  /** Un día por fila, del más antiguo a hoy, también los días sin ventas. */
  ventasPorDia(dias?: number): Promise<VentaDia[]>;
  stockBajo(umbral?: number): Promise<StockBajo[]>;

  pedidos(filtro: FiltroPagina & { estado?: EstadoPedido; busqueda?: string }): Promise<Pagina<FilaPedido>>;
  pedido(id: string): Promise<FichaPedido | null>;

  clientes(filtro: FiltroPagina): Promise<Pagina<FilaCliente>>;

  encargos(filtro: FiltroPagina & { estado?: EstadoEncargo }): Promise<Pagina<FilaEncargo>>;
  encargo(id: string): Promise<FichaEncargo | null>;

  mensajes(filtro: FiltroPagina & { estado?: EstadoMensaje }): Promise<Pagina<FilaMensaje>>;

  productos(): Promise<FilaProductoPanel[]>;
  producto(slug: string): Promise<FichaProductoPanel | null>;
}

/** Filas por página en todas las listas del panel. */
export const POR_PAGINA = 20;
