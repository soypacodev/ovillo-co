// Forma de lo que devuelven las funciones panel_* de la base de datos
// (supabase/migrations/20261009120100_panel.sql). Se conservan los nombres
// de columna tal cual: la fuente local genera exactamente lo mismo, y así
// el panel no sabe ni le importa de dónde salen los datos.

import { z } from 'zod';
import type { SlugCategoria } from '@/lib/catalogo/tipos';
import { ESTADOS_ENCARGO, ESTADOS_MENSAJE, ESTADOS_PEDIDO, ESTADOS_PRODUCTO } from './estados';

const entero = z.number().int();
const fecha = z.string();
const texto = z.string().nullable();

export const filaResumen = z.object({
  ventas_mes: entero,
  pedidos_mes: entero,
  ticket_medio_mes: entero,
  /** Del día 1 del mes pasado a la misma fecha y hora de hoy. */
  ventas_periodo_anterior: entero,
  pedidos_pendientes: entero,
  encargos_nuevos: entero,
  mensajes_nuevos: entero,
  variantes_stock_bajo: entero,
  suscriptores: entero,
});
export type ResumenPanel = z.infer<typeof filaResumen>;

export const filaVentaDia = z.object({ dia: z.string(), pedidos: entero, ventas: entero });
export type VentaDia = z.infer<typeof filaVentaDia>;

export const filaStockBajo = z.object({
  producto_slug: z.string(),
  producto: z.string(),
  variante: z.string(),
  color: z.string(),
  stock: entero,
  encargo: z.boolean(),
});
export type StockBajo = z.infer<typeof filaStockBajo>;

export const filaPedido = z.object({
  id: z.string(),
  numero: z.string(),
  creado_en: fecha,
  estado: z.enum(ESTADOS_PEDIDO),
  nombre_cliente: texto,
  email: z.string(),
  total: entero,
  unidades: entero,
  metodo_envio_nombre: z.string(),
  es_demo: z.boolean(),
  total_filas: entero,
});
export type FilaPedido = z.infer<typeof filaPedido>;

const direccionEnvio = z
  .object({
    destinatario: z.string().nullish(),
    linea1: z.string().nullish(),
    linea2: z.string().nullish(),
    ciudad: z.string().nullish(),
    provincia: z.string().nullish(),
    codigo_postal: z.string().nullish(),
    pais: z.string().nullish(),
    telefono: z.string().nullish(),
  })
  .nullable();

export const fichaPedido = z.object({
  id: z.string(),
  numero: z.string(),
  estado: z.enum(ESTADOS_PEDIDO),
  es_demo: z.boolean(),
  creado_en: fecha,
  pagado_en: fecha.nullable(),
  enviado_en: fecha.nullable(),
  entregado_en: fecha.nullable(),
  cancelado_en: fecha.nullable(),
  email: z.string().nullable(),
  nombre_cliente: texto,
  telefono: texto,
  direccion_envio: direccionEnvio,
  nota_cliente: texto,
  nota_admin: texto,
  subtotal: entero,
  descuento_automatico: entero,
  descuento_cupon: entero,
  envio: entero,
  total: entero,
  codigo_cupon: texto,
  metodo_envio_nombre: z.string(),
  dias_confeccion: entero.nullable(),
  transportista: texto,
  numero_seguimiento: texto,
  tiene_cuenta: z.boolean(),
  lineas: z.array(
    z.object({
      producto_slug: z.string(),
      nombre_producto: z.string(),
      nombre_variante: z.string(),
      color: texto,
      foto_ruta: texto,
      precio_unitario: entero,
      cantidad: entero,
      descuento: entero,
      total: entero,
      personalizacion: texto,
      encargo: z.boolean(),
      dias: entero.nullable(),
    }),
  ),
  eventos: z.array(z.object({ estado: z.enum(ESTADOS_PEDIDO), nota: texto, creado_en: fecha })),
});
export type FichaPedido = z.infer<typeof fichaPedido>;

export const filaCliente = z.object({
  email: z.string(),
  nombre: texto,
  pedidos: entero,
  gastado: entero,
  primer_pedido: fecha,
  ultimo_pedido: fecha,
  tiene_cuenta: z.boolean(),
  es_demo: z.boolean(),
  total_filas: entero,
});
export type FilaCliente = z.infer<typeof filaCliente>;

export const filaEncargo = z.object({
  id: z.string(),
  creado_en: fecha,
  estado: z.enum(ESTADOS_ENCARGO),
  tipo: z.string(),
  descripcion: z.string(),
  fecha_deseada: texto,
  presupuesto: texto,
  colores: texto,
  nombre: z.string(),
  email: z.string(),
  instagram: texto,
  fotos: z.array(z.string()),
  es_demo: z.boolean(),
  total_filas: entero,
});
export type FilaEncargo = z.infer<typeof filaEncargo>;

/** panel_encargo(): la fila de la lista más la nota interna. */
export const fichaEncargo = filaEncargo.omit({ total_filas: true }).extend({ nota_admin: texto });
export type FichaEncargo = z.infer<typeof fichaEncargo> & {
  /** Fotos listas para enseñar: URL firmada (Supabase) o ruta pública (local). */
  urls_fotos: { ruta: string; url: string }[];
};

export const filaMensaje = z.object({
  id: z.string(),
  creado_en: fecha,
  estado: z.enum(ESTADOS_MENSAJE),
  motivo: z.string(),
  numero_pedido: texto,
  nombre: z.string(),
  email: z.string(),
  mensaje: z.string(),
  es_demo: z.boolean(),
  total_filas: entero,
});
export type FilaMensaje = z.infer<typeof filaMensaje>;

/* ------------------------------------------------------------------
   Catálogo para el panel (se lee de las tablas: no hay datos personales)
   ------------------------------------------------------------------ */

interface VarianteProductoPanel {
  id: string | null;
  nombre: string;
  color: string;
  sku: string | null;
  stock: number;
  activa: boolean;
}

export interface FotoProductoPanel {
  id: string;
  ruta: string;
  url: string;
  alt: string;
}

export interface FilaProductoPanel {
  id: string;
  slug: string;
  nombre: string;
  categoria: SlugCategoria;
  estado: (typeof ESTADOS_PRODUCTO)[number];
  precio: number;
  antes: number | null;
  encargo: boolean;
  dias: number | null;
  foto: string | null;
  variantes: VarianteProductoPanel[];
}

export interface FichaProductoPanel extends FilaProductoPanel {
  tipo: 'simple' | 'pack';
  destacado: boolean;
  novedad: boolean;
  etiqueta: string | null;
  corto: string;
  largo: string;
  historia: string | null;
  materiales: string[];
  cuidados: string;
  medidas: string;
  contenido: string[] | null;
  personalizacion_etiqueta: string | null;
  personalizacion_ejemplo: string | null;
  personalizacion_max: number | null;
  personalizacion_pista: string | null;
  fotos: FotoProductoPanel[];
}

export interface Pagina<T> {
  filas: T[];
  total: number;
}
