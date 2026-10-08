// Piezas comunes para montar el resumen de la confirmación, tanto en el
// modo demostración como a partir de una sesión de Stripe.

import type { DatosValidados } from './esquema';
import type { DireccionPedido } from './metadatos';
import type { EntregaResumen, PedidoCalculado, ResumenPedido } from './tipos';

/** Dirección del formulario de pago; null si se recoge en el taller. */
export function direccionDeDatos(d: DatosValidados): DireccionPedido | null {
  if (d.envio === 'recogida') return null;
  return { calle: d.calle, piso: d.piso, cp: d.cp, ciudad: d.ciudad, provincia: d.provincia };
}

/** «Calle Mayor 3, 2.º B, 29001 Málaga, Málaga», sin las partes vacías. */
export function direccionEnLinea(d: DireccionPedido | null): string | null {
  if (!d) return null;
  return [d.calle, d.piso, `${d.cp} ${d.ciudad}`, d.provincia].filter((p) => p.trim()).join(', ');
}

/** Rótulo de la fila de descuentos: «Rebajas y código HOLA10». */
export function nombreDescuento(automatico: number, cupon: number, codigo: string | null): string {
  const partes: string[] = [];
  if (automatico > 0) partes.push('rebajas');
  if (cupon > 0 && codigo) partes.push(`código ${codigo}`);
  const texto = partes.join(' y ') || 'descuento';
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Lo que se le pasa a la base de datos como nota de la clienta. */
export function notaParaPedido(regalo: boolean, dedicatoria: string, nota: string): string | null {
  const partes = [
    regalo && 'Para regalo: envolver y sin precio en el paquete.',
    dedicatoria && `Dedicatoria: «${dedicatoria}»`,
    nota,
  ].filter(Boolean);
  return partes.length ? partes.join('\n') : null;
}

/** Datos de dirección con los nombres de columna de `direcciones`. */
export function direccionParaBaseDeDatos(nombre: string, telefono: string, d: DireccionPedido | null) {
  if (!d) return null;
  return {
    destinatario: nombre,
    linea1: d.calle,
    linea2: d.piso || null,
    codigo_postal: d.cp,
    ciudad: d.ciudad,
    provincia: d.provincia,
    pais: 'ES',
    telefono: telefono || null,
  };
}

/** Resumen de la confirmación en modo demostración, a partir del pedido ya recalculado. */
export function resumenDemo(
  numero: string,
  datos: DatosValidados,
  pedido: PedidoCalculado,
  plazo: string,
  fecha: Date = new Date(),
): ResumenPedido {
  const entrega: EntregaResumen = {
    nombre: `${datos.nombre} ${datos.apellidos}`,
    telefono: datos.telefono,
    envio: { id: pedido.metodoEnvio.id, nombre: pedido.metodoEnvio.nombre, plazo },
    direccion: direccionEnLinea(direccionDeDatos(datos)),
    regalo: datos.regalo,
    dedicatoria: datos.regalo ? datos.dedicatoria : '',
    nota: datos.nota,
  };
  return {
    ...entrega,
    numero,
    fecha: fecha.toISOString(),
    email: datos.email,
    modo: 'demo',
    estado: 'demo',
    lineas: pedido.lineas.map((l) => ({
      slug: l.slug,
      nombre: l.nombre,
      variante: l.variante,
      foto: l.foto,
      cantidad: l.cantidad,
      // Con la rebaja automática ya aplicada, como en la tienda y en Stripe.
      total: l.total,
      personalizacion: l.personalizacion,
    })),
    subtotal: pedido.subtotal - pedido.descuentoAutomatico,
    descuento: pedido.descuentoCupon,
    nombreDescuento: nombreDescuento(0, pedido.descuentoCupon, pedido.codigoCupon),
    envioImporte: pedido.envio,
    total: pedido.total,
    diasConfeccion: pedido.diasConfeccion,
  };
}
