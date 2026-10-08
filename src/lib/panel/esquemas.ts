// Esquemas de las acciones del panel. El navegador manda texto; aquí se
// convierte (euros a céntimos, líneas a listas) y se valida con las mismas
// reglas que los check de la base de datos, para que el error se vea junto
// al campo y no como un fallo genérico al guardar.

import { z } from 'zod';
import { listaImagenes } from '@/lib/acciones/esquemas';
import { casilla, texto } from '@/lib/validacion';
import { LIMITES_FOTOS_PRODUCTO } from './limites';
import { ESTADOS_ENCARGO, ESTADOS_MENSAJE, ESTADOS_PEDIDO, ESTADOS_PRODUCTO } from './estados';

const textoMax = (max: number) => texto().pipe(z.string().max(max, `Como mucho ${max} caracteres.`));
const opcional = (max: number) => textoMax(max).transform((v) => v || null);

/** «12,50», «12.5», «12» o «12,50 €» → 1250. Vacío → null. */
export function aCentimos(valor: string): number | null {
  const limpio = valor.replace(/[€\s]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
  if (limpio === '') return null;
  if (!/^\d+(\.\d{1,2})?$/.test(limpio)) return Number.NaN;
  return Math.round(Number(limpio) * 100);
}

const PRECIO_MAL = 'Escribe el precio en euros, por ejemplo 24,90.';

const precio = texto()
  .transform(aCentimos)
  .pipe(
    z
      .number({ error: 'Escribe el precio.' })
      .refine((n) => Number.isFinite(n), PRECIO_MAL)
      .refine((n) => n >= 0 && n <= 1_000_000, 'El precio no parece razonable.'),
  );

const precioOpcional = texto()
  .transform(aCentimos)
  .pipe(z.number().refine((n) => Number.isFinite(n), PRECIO_MAL).nullable());

const entero = (min: number, max: number, mensaje: string) =>
  texto().transform((v, ctx) => {
    const n = v === '' ? Number.NaN : Number(v);
    if (!Number.isInteger(n) || n < min || n > max) {
      ctx.addIssue({ code: 'custom', message: mensaje });
      return z.NEVER;
    }
    return n;
  });

const enteroOpcional = (min: number, max: number, mensaje: string) =>
  texto().transform((v, ctx) => {
    if (v === '') return null;
    const n = Number(v);
    if (!Number.isInteger(n) || n < min || n > max) {
      ctx.addIssue({ code: 'custom', message: mensaje });
      return z.NEVER;
    }
    return n;
  });

const lineas = (maxLineas: number, maxLargo: number) =>
  texto().transform((v, ctx) => {
    const lista = v
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lista.length > maxLineas) ctx.addIssue({ code: 'custom', message: `Como mucho ${maxLineas} líneas.` });
    if (lista.some((l) => l.length > maxLargo)) ctx.addIssue({ code: 'custom', message: `Cada línea, como mucho ${maxLargo} caracteres.` });
    return lista;
  });

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** «Cojín de relieve» → «cojin-de-relieve». */
export function aSlug(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/* ------------------------------------------------------------------
   Pedidos
   ------------------------------------------------------------------ */

export const esquemaEstadoPedido = z.object({
  id: texto().pipe(z.uuid('Pedido no válido.')),
  estado: texto().pipe(z.enum(ESTADOS_PEDIDO, { error: 'Elige un estado de la lista.' })),
  transportista: opcional(60),
  numero_seguimiento: texto()
    .transform((v) => v.toUpperCase().replace(/\s+/g, ''))
    .pipe(
      z.union([
        z.literal(''),
        z.string().regex(/^[A-Z0-9-]{4,40}$/, 'El número de seguimiento solo lleva letras, números y guiones.'),
      ]),
    )
    .transform((v) => v || null),
  nota_admin: opcional(1000),
});

/* ------------------------------------------------------------------
   Encargos y mensajes
   ------------------------------------------------------------------ */

export const esquemaEstadoEncargo = z.object({
  id: texto().pipe(z.uuid('Encargo no válido.')),
  estado: texto().pipe(z.enum(ESTADOS_ENCARGO, { error: 'Elige un estado de la lista.' })),
  nota_admin: opcional(1000),
});

export const esquemaEstadoMensaje = z.object({
  id: texto().pipe(z.uuid('Mensaje no válido.')),
  estado: texto().pipe(z.enum(ESTADOS_MENSAJE, { error: 'Estado no válido.' })),
});

/* ------------------------------------------------------------------
   Productos
   ------------------------------------------------------------------ */

const esquemaVariante = z.object({
  id: texto().pipe(z.union([z.literal(''), z.uuid()])).transform((v) => v || null),
  nombre: texto().pipe(z.string().min(1, 'Ponle nombre a la variante.').max(60, 'Como mucho 60 caracteres.')),
  color: texto().pipe(z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'El color va en formato #RRGGBB.')),
  sku: textoMax(40),
  stock: entero(0, 9999, 'El stock es un número entero, 0 o más.'),
  activa: casilla(),
});

export const esquemaProducto = z
  .object({
    id: texto().pipe(z.union([z.literal(''), z.uuid()])).transform((v) => v || null),
    nombre: texto().pipe(z.string().min(2, 'Ponle nombre al producto.').max(120, 'Como mucho 120 caracteres.')),
    slug: texto().transform((v) => v.toLowerCase()),
    categoria: texto().pipe(z.enum(['amigurumis', 'bebe', 'accesorios', 'hogar', 'packs'], { error: 'Elige una categoría.' })),
    tipo: texto().pipe(z.enum(['simple', 'pack'], { error: 'Elige el tipo.' })),
    estado: texto().pipe(z.enum(ESTADOS_PRODUCTO, { error: 'Elige si se ve en la tienda.' })),
    precio,
    antes: precioOpcional,
    destacado: casilla(),
    novedad: casilla(),
    encargo: casilla(),
    dias: enteroOpcional(1, 90, 'Entre 1 y 90 días.'),
    etiqueta: opcional(30),
    corto: textoMax(160),
    largo: textoMax(4000),
    historia: opcional(2000),
    materiales: lineas(12, 120),
    cuidados: textoMax(1000),
    medidas: textoMax(300),
    contenido: lineas(12, 120),
    personalizacion_etiqueta: opcional(60),
    personalizacion_ejemplo: opcional(60),
    personalizacion_max: enteroOpcional(1, 60, 'Entre 1 y 60 caracteres.'),
    personalizacion_pista: opcional(160),
    variantes: z.array(esquemaVariante).min(1, 'El producto necesita al menos una variante.').max(20, 'Como mucho 20 variantes.'),
  })
  .transform((p) => ({ ...p, slug: p.slug || aSlug(p.nombre) }))
  .superRefine((p, ctx) => {
    if (p.slug === 'nuevo') {
      ctx.addIssue({ code: 'custom', path: ['slug'], message: '«nuevo» está reservado en el panel. Elige otra dirección.' });
    }
    if (!SLUG.test(p.slug)) {
      ctx.addIssue({ code: 'custom', path: ['slug'], message: 'Solo minúsculas, números y guiones: «cojin-de-relieve».' });
    }
    if (p.antes !== null && p.antes <= p.precio) {
      ctx.addIssue({ code: 'custom', path: ['antes'], message: 'El precio anterior tiene que ser mayor que el actual.' });
    }
    if (p.encargo && p.dias === null) {
      ctx.addIssue({ code: 'custom', path: ['dias'], message: 'Si se teje por encargo, di cuántos días tarda.' });
    }
    if ((p.personalizacion_etiqueta === null) !== (p.personalizacion_max === null)) {
      const campo = p.personalizacion_etiqueta === null ? 'personalizacion_etiqueta' : 'personalizacion_max';
      ctx.addIssue({ code: 'custom', path: [campo], message: 'La personalización necesita la etiqueta y el máximo de letras.' });
    }
    if (p.tipo === 'simple' && p.contenido.length > 0) {
      ctx.addIssue({ code: 'custom', path: ['contenido'], message: 'Solo los packs tienen contenido. Cambia el tipo a pack o vacía la lista.' });
    }
    const nombres = p.variantes.map((v) => v.nombre.toLowerCase());
    nombres.forEach((n, i) => {
      if (nombres.indexOf(n) !== i) {
        ctx.addIssue({ code: 'custom', path: ['variantes', i, 'nombre'], message: 'Ya hay otra variante con ese nombre.' });
      }
    });
  });

export type DatosProducto = z.output<typeof esquemaProducto>;

/** Lo que espera panel_guardar_producto(): el producto y sus variantes. */
export function aParametrosGuardado(p: DatosProducto) {
  const { id, variantes, contenido, ...producto } = p;
  return {
    p_id: id,
    p_producto: { ...producto, contenido: producto.tipo === 'pack' ? contenido : null },
    p_variantes: variantes.map((v) => ({ ...v, sku: v.sku || null })),
  };
}

/**
 * Las variantes llegan del formulario como «variantes.0.nombre»,
 * «variantes.0.stock»… Esto las reúne en una lista en su orden. Las
 * casillas sin marcar no se envían: por eso cada fila manda también su id.
 */
export function leerFormularioProducto(datos: FormData): Record<string, unknown> {
  const salida: Record<string, unknown> = {};
  const filas = new Map<number, Record<string, unknown>>();
  for (const [clave, valor] of datos.entries()) {
    if (clave.startsWith('$ACTION')) continue;
    const m = /^variantes\.(\d+)\.(\w+)$/.exec(clave);
    if (m) {
      const i = Number(m[1]);
      const fila = filas.get(i) ?? {};
      fila[m[2]] = valor;
      filas.set(i, fila);
    } else {
      salida[clave] = valor;
    }
  }
  salida.variantes = [...filas.entries()].sort(([a], [b]) => a - b).map(([, fila]) => fila);
  return salida;
}

/* ------------------------------------------------------------------
   Fotos de producto
   ------------------------------------------------------------------ */

export const esquemaSubidaFotos = z.object({
  producto_id: texto().pipe(z.uuid('Producto no válido.')),
  alt: texto().pipe(z.string().min(3, 'Describe la foto para quien no la ve (texto alternativo).').max(200, 'Como mucho 200 caracteres.')),
  fotos: listaImagenes(LIMITES_FOTOS_PRODUCTO, 1),
});

export const esquemaFoto = z.object({
  id: texto().pipe(z.uuid('Foto no válida.')),
  producto_id: texto().pipe(z.uuid('Producto no válido.')),
});

export const esquemaVisibilidad = z.object({
  id: texto().pipe(z.uuid('Producto no válido.')),
  estado: texto().pipe(z.enum(ESTADOS_PRODUCTO)),
});
