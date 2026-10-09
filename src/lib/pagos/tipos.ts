// Tipos del flujo de compra compartidos por el servidor y las pantallas.
// Todos los importes van en céntimos.

import type { Foto } from '@/lib/catalogo/tipos';
import { textos, type Idioma } from '@/lib/i18n';
import type { ErroresCampos, IdEnvio } from './esquema';

/** Una línea ya calculada con los precios del catálogo. */
interface LineaCalculada {
  slug: string;
  nombre: string;
  /** Nombre de la variante en español: la clave en Stripe y en la base de datos. */
  variante: string;
  /** Nombre visible de la variante en el idioma de la clienta; sin él, `variante`. */
  rotulo?: string;
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

/** Distingue un error de negocio conocido de cualquier otro mensaje de la base de datos. */
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

const T_ERRORES = textos(
  {
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
  },
  {
    en: {
      CESTA_VACIA: 'Your basket is empty.',
      CESTA_DEMASIADO_GRANDE: 'Your basket has too many lines. Drop us a line and we’ll set it up as a custom order.',
      PRODUCTO_NO_DISPONIBLE: 'One of the items is no longer for sale. We’ve updated your basket.',
      VARIANTE_NO_DISPONIBLE: 'One of the colours is no longer available. We’ve updated your basket.',
      CANTIDAD_NO_VALIDA: 'Please check the quantities in your basket.',
      PERSONALIZACION_NO_ADMITIDA: 'One of the items can’t be personalised.',
      PERSONALIZACION_DEMASIADO_LARGA: 'One of the personalisations is too long.',
      SIN_STOCK: 'In the meantime some items have sold and there aren’t enough left. We’ve adjusted your basket.',
      ENVIO_NO_VALIDO: 'That delivery method isn’t available. Please choose another.',
      IMPORTE_NO_COINCIDE: 'The amounts have changed. Please check the summary before paying.',
    },
    fr: {
      CESTA_VACIA: 'Votre panier est vide.',
      CESTA_DEMASIADO_GRANDE:
        'Votre panier contient trop de lignes. Écrivez-nous et nous le préparerons comme une commande sur mesure.',
      PRODUCTO_NO_DISPONIBLE: 'L’une des pièces n’est plus en vente. Nous avons mis votre panier à jour.',
      VARIANTE_NO_DISPONIBLE: 'L’un des coloris n’est plus disponible. Nous avons mis votre panier à jour.',
      CANTIDAD_NO_VALIDA: 'Vérifiez les quantités de votre panier.',
      PERSONALIZACION_NO_ADMITIDA: 'L’une des pièces ne peut pas être personnalisée.',
      PERSONALIZACION_DEMASIADO_LARGA: 'L’une des personnalisations est trop longue.',
      SIN_STOCK:
        'Entre-temps, certaines pièces ont été vendues et il n’en reste pas assez. Nous avons ajusté votre panier.',
      ENVIO_NO_VALIDO: 'Ce mode de livraison n’est pas disponible. Choisissez-en un autre.',
      IMPORTE_NO_COINCIDE: 'Les montants ont changé. Vérifiez le récapitulatif avant de payer.',
    },
    de: {
      CESTA_VACIA: 'Ihr Warenkorb ist leer.',
      CESTA_DEMASIADO_GRANDE:
        'Ihr Warenkorb hat zu viele Positionen. Schreiben Sie uns, dann bereiten wir es als Auftragsarbeit vor.',
      PRODUCTO_NO_DISPONIBLE: 'Eines der Stücke ist nicht mehr erhältlich. Wir haben Ihren Warenkorb aktualisiert.',
      VARIANTE_NO_DISPONIBLE: 'Eine der Farben ist nicht mehr verfügbar. Wir haben Ihren Warenkorb aktualisiert.',
      CANTIDAD_NO_VALIDA: 'Bitte prüfen Sie die Mengen im Warenkorb.',
      PERSONALIZACION_NO_ADMITIDA: 'Eines der Stücke lässt sich nicht personalisieren.',
      PERSONALIZACION_DEMASIADO_LARGA: 'Eine der Personalisierungen ist zu lang.',
      SIN_STOCK:
        'Inzwischen wurden einige Stücke verkauft und es sind nicht mehr genug da. Wir haben Ihren Warenkorb angepasst.',
      ENVIO_NO_VALIDO: 'Diese Versandart ist nicht verfügbar. Bitte wählen Sie eine andere.',
      IMPORTE_NO_COINCIDE: 'Die Beträge haben sich geändert. Bitte prüfen Sie die Übersicht vor dem Bezahlen.',
    },
  },
);

/** Mensajes para la clienta, en español. */
export const MENSAJES_ERROR: Record<CodigoError, string> = T_ERRORES.es;

/** Mensaje de un error de negocio en el idioma de la clienta. */
export const mensajeError = (codigo: CodigoError, idioma: Idioma): string => T_ERRORES[idioma][codigo];

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
  lineas: Pick<
    LineaCalculada,
    'slug' | 'nombre' | 'variante' | 'rotulo' | 'foto' | 'cantidad' | 'total' | 'personalizacion'
  >[];
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
