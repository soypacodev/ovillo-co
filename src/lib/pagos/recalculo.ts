// Recalcula un pedido en el servidor a partir de lo único que se acepta
// del navegador: qué pieza, qué color, cuántas y la personalización.
// Con Supabase lo hace `calcular_pedido` en la base de datos; sin él, las
// mismas funciones puras de la cesta con el catálogo de la semilla. Las
// dos vías lanzan los mismos códigos de error.

import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { fotoVariante } from '@/lib/catalogo/precio';
import type { MetodoEnvio, Producto, Promocion } from '@/lib/catalogo/tipos';
import { ENVIO_GRATIS_DESDE, ENVIOS, PRODUCTOS, PROMOCIONES } from '@/datos/semilla';
import { idLinea } from '@/lib/cesta/lineas';
import { normalizarCodigo, totales } from '@/lib/cesta/totales';
import { MAX_UDS_LINEA, type LineaCesta } from '@/lib/cesta/tipos';
import { urlFoto } from '@/lib/datos/supabase/mapeo';
import { METODOS_ENVIO, type IdEnvio, type LineaPedido } from './esquema';
import { ErrorPedido, esCodigoError, type AvisoCupon, type PedidoCalculado } from './tipos';

export interface EntradaCalculo {
  lineas: readonly LineaPedido[];
  cupon: string | null;
  envio: IdEnvio;
}

export interface CatalogoCalculo {
  productos: readonly Producto[];
  promociones: readonly Promocion[];
  envios: readonly MetodoEnvio[];
  umbralEnvioGratis?: number;
  fecha?: Date;
}

const CATALOGO_SEMILLA: CatalogoCalculo = {
  productos: PRODUCTOS,
  promociones: PROMOCIONES,
  envios: ENVIOS,
  umbralEnvioGratis: ENVIO_GRATIS_DESDE,
};

const longitud = (texto: string) => Array.from(texto).length;

/** Mismo algoritmo y mismas comprobaciones que `calcular_pedido`. */
export function calcularConCatalogo(
  entrada: EntradaCalculo,
  catalogo: CatalogoCalculo = CATALOGO_SEMILLA,
): PedidoCalculado {
  const { lineas: pedidas, cupon, envio } = entrada;
  if (pedidas.length === 0) throw new ErrorPedido('CESTA_VACIA');
  if (pedidas.length > 50) throw new ErrorPedido('CESTA_DEMASIADO_GRANDE');

  const metodo = catalogo.envios.find((e) => e.id === envio);
  if (!metodo) throw new ErrorPedido('ENVIO_NO_VALIDO', envio);

  const lineas: LineaCesta[] = pedidas.map((pedida) => {
    const producto = catalogo.productos.find((p) => p.slug === pedida.slug);
    if (!producto) throw new ErrorPedido('PRODUCTO_NO_DISPONIBLE', pedida.slug);
    const variante = producto.variantes.find((v) => v.nombre === pedida.variante);
    if (!variante) throw new ErrorPedido('VARIANTE_NO_DISPONIBLE', producto.slug);
    if (!Number.isInteger(pedida.cantidad) || pedida.cantidad < 1 || pedida.cantidad > MAX_UDS_LINEA) {
      throw new ErrorPedido('CANTIDAD_NO_VALIDA', producto.slug);
    }
    const personalizacion = pedida.personalizacion.trim();
    if (personalizacion) {
      if (!producto.personalizable) throw new ErrorPedido('PERSONALIZACION_NO_ADMITIDA', producto.slug);
      if (longitud(personalizacion) > producto.personalizable.max) {
        throw new ErrorPedido('PERSONALIZACION_DEMASIADO_LARGA', producto.slug);
      }
    }
    return {
      id: idLinea(producto.slug, variante.nombre, personalizacion),
      slug: producto.slug,
      nombre: producto.nombre,
      categoria: producto.categoria,
      variante: variante.nombre,
      color: variante.color,
      foto: fotoVariante(producto, variante),
      precio: producto.precio,
      encargo: producto.encargo,
      dias: producto.dias,
      stock: variante.stock,
      personalizacion,
      uds: pedida.cantidad,
    };
  });

  // El stock se comparte entre las líneas de la misma variante.
  const porVariante = new Map<string, { uds: number; stock: number }>();
  for (const l of lineas) {
    const clave = `${l.slug}|${l.variante}`;
    const previo = porVariante.get(clave);
    porVariante.set(clave, { uds: (previo?.uds ?? 0) + l.uds, stock: l.stock });
  }
  for (const [clave, { uds, stock }] of porVariante) {
    if (uds > stock) throw new ErrorPedido('SIN_STOCK', clave);
  }

  const t = totales(lineas, cupon, {
    promociones: catalogo.promociones,
    envios: catalogo.envios,
    envioId: metodo.id,
    umbralEnvioGratis: catalogo.umbralEnvioGratis,
    fecha: catalogo.fecha,
  });

  let avisoCupon: AvisoCupon | null = null;
  if (normalizarCodigo(cupon)) {
    if (!t.promocionCupon) avisoCupon = 'NO_VALIDO';
    else if (t.cuponFaltaMinimo > 0) avisoCupon = 'MINIMO_NO_ALCANZADO';
  }

  return {
    lineas: lineas.map((l) => {
      const descuento = t.rebajaPorLinea[l.id] ?? 0;
      return {
        slug: l.slug,
        nombre: l.nombre,
        variante: l.variante,
        color: l.color,
        foto: l.foto,
        precioUnitario: l.precio,
        cantidad: l.uds,
        descuento,
        total: l.precio * l.uds - descuento,
        personalizacion: l.personalizacion,
        encargo: l.encargo,
        dias: l.dias,
      };
    }),
    subtotal: t.subtotal,
    descuentoAutomatico: t.rebajaAuto,
    descuentoCupon: t.rebajaCupon,
    codigoCupon: avisoCupon ? null : (t.promocionCupon?.codigo ?? null),
    avisoCupon,
    envio: t.envio,
    metodoEnvio: { id: metodo.id, nombre: metodo.nombre },
    total: t.total,
    diasConfeccion: t.plazoEncargo,
  };
}

// ------------------------------------------------------------
// Supabase
// ------------------------------------------------------------

const entero = z.number().int();

const respuestaCalculo = z.object({
  lineas: z.array(
    z.object({
      producto_slug: z.string(),
      nombre_producto: z.string(),
      nombre_variante: z.string(),
      color: z.string().nullable(),
      foto_ruta: z.string().nullable(),
      precio_unitario: entero,
      cantidad: entero,
      descuento: entero,
      total: entero,
      personalizacion: z.string().nullable(),
      encargo: z.boolean(),
      dias: entero.nullable(),
    }),
  ),
  subtotal: entero,
  descuento_automatico: entero,
  descuento_cupon: entero,
  envio: entero,
  total: entero,
  codigo_cupon: z.string().nullable(),
  aviso_cupon: z.enum(['NO_VALIDO', 'MINIMO_NO_ALCANZADO']).nullable(),
  metodo_envio_id: z.enum(METODOS_ENVIO),
  metodo_envio_nombre: z.string(),
  dias_confeccion: entero.nullable(),
});

/** Formato de líneas que esperan `calcular_pedido` y `registrar_pedido_pagado`. */
export function lineasParaBaseDeDatos(lineas: readonly LineaPedido[]) {
  return lineas.map((l) => ({
    producto: l.slug,
    variante: l.variante,
    cantidad: l.cantidad,
    personalizacion: l.personalizacion || null,
  }));
}

interface ErrorPostgrest {
  code?: string;
  message: string;
  details?: string | null;
}

/** Los `raise exception` de las funciones llegan con código P0001. */
function errorDeBaseDeDatos(error: ErrorPostgrest): Error {
  if (error.code === 'P0001' && esCodigoError(error.message)) {
    return new ErrorPedido(error.message, error.details ?? undefined);
  }
  return new Error(`La base de datos no pudo calcular el pedido: ${error.message}`);
}

/**
 * Recalcula con `calcular_pedido` en la base de datos. Los errores de
 * negocio llegan como ErrorPedido; cualquier otro fallo, como Error.
 */
export async function calcularConSupabase(
  cliente: SupabaseClient,
  urlSupabase: string,
  entrada: EntradaCalculo,
): Promise<PedidoCalculado> {
  const { data, error } = await cliente.rpc('calcular_pedido', {
    p_lineas: lineasParaBaseDeDatos(entrada.lineas),
    p_cupon: entrada.cupon,
    p_envio: entrada.envio,
  });
  if (error) throw errorDeBaseDeDatos(error);

  const r = respuestaCalculo.parse(data);
  return {
    lineas: r.lineas.map((l) => ({
      slug: l.producto_slug,
      nombre: l.nombre_producto,
      variante: l.nombre_variante,
      color: l.color,
      foto: l.foto_ruta ? { src: urlFoto(l.foto_ruta, urlSupabase), alt: '' } : null,
      precioUnitario: l.precio_unitario,
      cantidad: l.cantidad,
      descuento: l.descuento,
      total: l.total,
      personalizacion: l.personalizacion ?? '',
      encargo: l.encargo,
      dias: l.dias,
    })),
    subtotal: r.subtotal,
    descuentoAutomatico: r.descuento_automatico,
    descuentoCupon: r.descuento_cupon,
    codigoCupon: r.codigo_cupon,
    avisoCupon: r.aviso_cupon,
    envio: r.envio,
    metodoEnvio: { id: r.metodo_envio_id, nombre: r.metodo_envio_nombre },
    total: r.total,
    diasConfeccion: r.dias_confeccion,
  };
}
