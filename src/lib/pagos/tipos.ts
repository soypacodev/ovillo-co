// Tipos del flujo de compra compartidos por el servidor y las pantallas.
// Todos los importes van en céntimos.

import type { Foto } from '@/lib/catalogo/tipos';
import type { ErroresCampos, IdEnvio } from './esquema';

/** Una línea ya calculada con los precios del catálogo. */
interface LineaCalculada {
  slug: string;
  nombre: string;
  variante: string;
  color: string | null;
  foto: Foto | null;
  precioUnitario: number;
  cantidad: number;
  /** Rebaja automática de la línea. */
  descuento: number;
  total: number;
  personalizacion: string;
  encargo: boolean;
  dias: number | null;
}

export type AvisoCupon = 'NO_VALIDO' | 'MINIMO_NO_ALCANZADO';

/** Lo que devuelve el recálculo: igual con la semilla que con `calcular_pedido`. */
export interface PedidoCalculado {
  lineas: LineaCalculada[];
  subtotal: number;
  descuentoAutomatico: number;
  descuentoCupon: number;
  /** Código aplicado de verdad (null si no había o no valía). */
  codigoCupon: string | null;
  avisoCupon: AvisoCupon | null;
  envio: number;
  metodoEnvio: { id: IdEnvio; nombre: string };
  total: number;
  diasConfeccion: number | null;
}

/** Errores de negocio con el mismo código que lanza la base de datos. */
const CODIGOS_ERROR = [
  'CESTA_VACIA',
  'CESTA_DEMASIADO_GRANDE',
  'PRODUCTO_NO_DISPONIBLE',
  'VARIANTE_NO_DISPONIBLE',
  'CANTIDAD_NO_VALIDA',
  'PERSONALIZACION_NO_ADMITIDA',
  'PERSONALIZACION_DEMASIADO_LARGA',
  'SIN_STOCK',
  'ENVIO_NO_VALIDO',
  'IMPORTE_NO_COINCIDE',
] as const;

export type CodigoError = (typeof CODIGOS_ERROR)[number];

export function esCodigoError(x: unknown): x is CodigoError {
  return typeof x === 'string' && (CODIGOS_ERROR as readonly string[]).includes(x);
}

export class ErrorPedido extends Error {
  constructor(
    readonly codigo: CodigoError,
    readonly detalle?: string,
  ) {
    super(codigo);
    this.name = 'ErrorPedido';
  }
}

export const MENSAJES_ERROR: Record<CodigoError, string> = {
  CESTA_VACIA: 'Tu cesta está vacía.',
  CESTA_DEMASIADO_GRANDE: 'La cesta tiene demasiadas líneas. Escríbenos y lo preparamos como encargo.',
  PRODUCTO_NO_DISPONIBLE: 'Una de las piezas ya no está a la venta. Hemos puesto tu cesta al día.',
  VARIANTE_NO_DISPONIBLE: 'Uno de los colores ya no está disponible. Hemos puesto tu cesta al día.',
  CANTIDAD_NO_VALIDA: 'Revisa las unidades de la cesta.',
  PERSONALIZACION_NO_ADMITIDA: 'Una de las piezas no admite personalización.',
  PERSONALIZACION_DEMASIADO_LARGA: 'Una de las personalizaciones es demasiado larga.',
  SIN_STOCK: 'Mientras tanto se ha vendido alguna pieza y no queda bastante. Hemos ajustado tu cesta.',
  ENVIO_NO_VALIDO: 'Ese método de envío no está disponible. Elige otro.',
  IMPORTE_NO_COINCIDE: 'Los importes han cambiado. Revisa el resumen antes de pagar.',
};

/** Datos de entrega que se enseñan en la confirmación. */
export interface EntregaResumen {
  nombre: string;
  telefono: string;
  envio: { id: IdEnvio; nombre: string; plazo: string };
  /** Dirección en una línea, o null si se recoge en el taller. */
  direccion: string | null;
  regalo: boolean;
  dedicatoria: string;
  nota: string;
}

/** Lo que pinta la página de confirmación, venga de Stripe o del modo demostración. */
export interface ResumenPedido extends EntregaResumen {
  numero: string;
  /** ISO 8601. */
  fecha: string;
  email: string;
  modo: 'demo' | 'stripe';
  /** `pendiente`: Stripe aún no ha confirmado el cobro (pagos diferidos). */
  estado: 'pagado' | 'pendiente' | 'demo';
  lineas: Pick<LineaCalculada, 'slug' | 'nombre' | 'variante' | 'foto' | 'cantidad' | 'total' | 'personalizacion'>[];
  subtotal: number;
  descuento: number;
  /** Nombre de las rebajas para la fila del descuento. */
  nombreDescuento: string;
  envioImporte: number;
  total: number;
  diasConfeccion: number | null;
}

export type ResultadoConfirmar =
  | { ok: true; modo: 'stripe'; url: string }
  | { ok: true; modo: 'demo'; url: string; resumen: ResumenPedido }
  | { ok: false; tipo: 'datos'; mensaje: string; errores: ErroresCampos }
  | { ok: false; tipo: 'cesta'; mensaje: string; codigo: CodigoError | 'CAMBIO_DE_PRECIO' | 'CUPON' }
  | { ok: false; tipo: 'servidor'; mensaje: string };
