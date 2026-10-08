// Estados de pedidos, encargos y mensajes: nombres para la interfaz y
// caminos permitidos. Los caminos de los pedidos repiten los del trigger
// controlar_estado_pedido(): así el panel solo ofrece cambios que la base
// de datos va a aceptar, y la base de datos sigue siendo la que decide.

export const ESTADOS_PEDIDO = ['pagado', 'en_preparacion', 'enviado', 'entregado', 'cancelado', 'reembolsado'] as const;
export type EstadoPedido = (typeof ESTADOS_PEDIDO)[number];

export const ESTADOS_ENCARGO = ['nuevo', 'respondido', 'aceptado', 'descartado'] as const;
export type EstadoEncargo = (typeof ESTADOS_ENCARGO)[number];

export const ESTADOS_MENSAJE = ['nuevo', 'respondido', 'archivado'] as const;
export type EstadoMensaje = (typeof ESTADOS_MENSAJE)[number];

export const ESTADOS_PRODUCTO = ['borrador', 'publicado', 'archivado'] as const;
export type EstadoProducto = (typeof ESTADOS_PRODUCTO)[number];

export const NOMBRE_ESTADO_PEDIDO: Record<EstadoPedido, string> = {
  pagado: 'Pagado',
  en_preparacion: 'En preparación',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
  reembolsado: 'Reembolsado',
};

export const NOMBRE_ESTADO_ENCARGO: Record<EstadoEncargo, string> = {
  nuevo: 'Nuevo',
  respondido: 'Respondido',
  aceptado: 'Aceptado',
  descartado: 'Descartado',
};

export const NOMBRE_ESTADO_MENSAJE: Record<EstadoMensaje, string> = {
  nuevo: 'Sin leer',
  respondido: 'Respondido',
  archivado: 'Archivado',
};

export const NOMBRE_ESTADO_PRODUCTO: Record<EstadoProducto, string> = {
  borrador: 'Oculto',
  publicado: 'Publicado',
  archivado: 'Archivado',
};

export const TRANSICIONES_PEDIDO: Record<EstadoPedido, readonly EstadoPedido[]> = {
  pagado: ['en_preparacion', 'enviado', 'cancelado', 'reembolsado'],
  en_preparacion: ['enviado', 'cancelado', 'reembolsado'],
  enviado: ['entregado', 'reembolsado'],
  entregado: ['reembolsado'],
  cancelado: ['reembolsado'],
  reembolsado: [],
};

export function puedePasarA(desde: EstadoPedido, hasta: EstadoPedido): boolean {
  return desde === hasta || TRANSICIONES_PEDIDO[desde].includes(hasta);
}

/** Pedidos que aún tiene que mover el taller. */
export const ESTADOS_PENDIENTES: readonly EstadoPedido[] = ['pagado', 'en_preparacion'];

/** Clase de la pastilla de cada estado (ver panel.css). */
export function tonoEstado(estado: string): 'aviso' | 'curso' | 'bien' | 'apagado' | 'mal' {
  switch (estado) {
    case 'pagado':
    case 'nuevo':
      return 'aviso';
    case 'en_preparacion':
    case 'enviado':
    case 'respondido':
    case 'borrador':
      return 'curso';
    case 'entregado':
    case 'aceptado':
    case 'publicado':
      return 'bien';
    case 'cancelado':
    case 'reembolsado':
    case 'descartado':
      return 'mal';
    default:
      return 'apagado';
  }
}
