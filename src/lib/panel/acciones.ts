'use server';

// Escrituras del panel. Cada acción, antes de nada, valida lo que llega con
// zod y vuelve a mirar el rol de quien llama con su sesión: el botón
// desactivado del navegador es solo una pista. Después escribe con esa
// misma sesión, así que RLS también decide (demo no puede escribir nada).

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { formularioAObjeto } from '@/lib/acciones/esquemas';
import { EXTENSION_IMAGEN, tipoDeImagen } from '@/lib/acciones/fotos';
import { sinMetadatos } from '@/lib/acciones/metadatos-imagen';
import { configuracionSupabase } from '@/lib/datos/entorno';
import { credencialesDemoPanel } from '@/lib/datos/entorno-servidor';
import { clienteServidor } from '@/lib/datos/supabase/servidor';
import { rutas } from '@/lib/rutas';
import { ESTADOS_PEDIDO, NOMBRE_ESTADO_PEDIDO, puedePasarA } from './estados';
import {
  aParametrosGuardado,
  esquemaEstadoEncargo,
  esquemaEstadoMensaje,
  esquemaEstadoPedido,
  esquemaFoto,
  esquemaProducto,
  esquemaSubidaFotos,
  esquemaVisibilidad,
  leerFormularioProducto,
} from './esquemas';
import { permisoParaEscribir } from './servidor';
import type { ResultadoPanel } from './tipos-accion';

const FALLO = 'No se ha podido guardar. Vuelve a intentarlo en un momento.';

let intentos = 0;
const ok = (mensaje: string): ResultadoPanel => ({ estado: 'ok', mensaje, intento: ++intentos });
const error = (mensaje: string, errores: Record<string, string> = {}): ResultadoPanel => ({
  estado: 'error',
  mensaje,
  errores,
  intento: ++intentos,
});

/** Errores por campo; las variantes llegan como «variantes.2.nombre». */
function errores(e: z.ZodError): Record<string, string> {
  const salida: Record<string, string> = {};
  for (const fallo of e.issues) {
    const clave = fallo.path.join('.');
    if (clave && !salida[clave]) salida[clave] = fallo.message;
  }
  return salida;
}

function resumenErrores(e: z.ZodError): ResultadoPanel {
  const lista = errores(e);
  const n = Object.keys(lista).length;
  return error(n === 1 ? 'Hay un campo que revisar.' : `Hay ${n} campos que revisar.`, lista);
}

/** Comprobación común: rol en el servidor antes de tocar nada. */
async function sinPermiso(): Promise<ResultadoPanel | null> {
  const permiso = await permisoParaEscribir();
  return permiso.ok ? null : error(permiso.motivo);
}

/* ------------------------------------------------------------------
   Entrar a la demostración
   ------------------------------------------------------------------ */

/**
 * Botón público «Ver el panel de demostración». Con Supabase entra con la
 * cuenta de rol demo (credenciales solo en variables del servidor); sin
 * Supabase, el panel ya funciona en modo local y basta con ir.
 */
export async function entrarPanelDemo(): Promise<void> {
  if (!configuracionSupabase()) redirect(rutas.panel);

  const credenciales = credencialesDemoPanel();
  if (!credenciales) redirect(`${rutas.entrar}?aviso=demo-no-disponible`);

  const supabase = await clienteServidor();
  const { error: fallo } = await supabase.auth.signInWithPassword({
    email: credenciales.email,
    password: credenciales.contrasena,
  });
  if (fallo) {
    console.error('No se pudo entrar con la cuenta de demostración:', fallo.code, fallo.message);
    redirect(`${rutas.entrar}?aviso=demo-no-disponible`);
  }
  revalidatePath('/', 'layout');
  redirect(rutas.panel);
}

/* ------------------------------------------------------------------
   Pedidos
   ------------------------------------------------------------------ */

/** Cambia el estado y los datos de envío de un pedido, solo por los caminos permitidos. */
export async function cambiarEstadoPedido(_previo: ResultadoPanel, formulario: FormData): Promise<ResultadoPanel> {
  const r = esquemaEstadoPedido.safeParse(formularioAObjeto(formulario));
  if (!r.success) return resumenErrores(r.error);
  const bloqueo = await sinPermiso();
  if (bloqueo) return bloqueo;

  const { id, estado, transportista, numero_seguimiento, nota_admin } = r.data;
  const supabase = await clienteServidor();
  const { data: actual } = await supabase.from('pedidos').select('estado').eq('id', id).maybeSingle();
  const leido = z.enum(ESTADOS_PEDIDO).safeParse(actual?.estado);
  if (!leido.success) return error('Ese pedido ya no existe.');
  const desde = leido.data;
  if (!puedePasarA(desde, estado)) {
    return error(
      `Un pedido ${NOMBRE_ESTADO_PEDIDO[desde].toLowerCase()} no puede pasar a ${NOMBRE_ESTADO_PEDIDO[estado].toLowerCase()}.`,
      { estado: 'Elige uno de los estados que se ofrecen.' },
    );
  }

  const { error: fallo } = await supabase
    .from('pedidos')
    .update({ estado, transportista, numero_seguimiento, nota_admin })
    .eq('id', id);
  if (fallo) {
    if (fallo.message.includes('CAMBIO_DE_ESTADO_NO_VALIDO')) return error('Ese cambio de estado no está permitido.');
    console.error('No se pudo cambiar el pedido:', fallo.code, fallo.message);
    return error(FALLO);
  }

  revalidatePath(rutas.panel, 'layout');
  revalidatePath(rutas.panelPedido(id));
  return ok(desde === estado ? 'Pedido guardado.' : `Pedido marcado como ${NOMBRE_ESTADO_PEDIDO[estado].toLowerCase()}.`);
}

/* ------------------------------------------------------------------
   Encargos y mensajes
   ------------------------------------------------------------------ */

/** Cambia el estado y la nota interna de un encargo. */
export async function cambiarEstadoEncargo(_previo: ResultadoPanel, formulario: FormData): Promise<ResultadoPanel> {
  const r = esquemaEstadoEncargo.safeParse(formularioAObjeto(formulario));
  if (!r.success) return resumenErrores(r.error);
  const bloqueo = await sinPermiso();
  if (bloqueo) return bloqueo;

  const { id, estado, nota_admin } = r.data;
  const supabase = await clienteServidor();
  const { data, error: fallo } = await supabase.from('encargos').update({ estado, nota_admin }).eq('id', id).select('id');
  if (fallo || !data?.length) {
    if (fallo) console.error('No se pudo cambiar el encargo:', fallo.code, fallo.message);
    return error(fallo ? FALLO : 'Ese encargo ya no existe.');
  }
  revalidatePath(rutas.panel, 'layout');
  return ok('Encargo guardado.');
}

/** Marca un mensaje de contacto como sin leer, respondido o archivado. */
export async function cambiarEstadoMensaje(_previo: ResultadoPanel, formulario: FormData): Promise<ResultadoPanel> {
  const r = esquemaEstadoMensaje.safeParse(formularioAObjeto(formulario));
  if (!r.success) return resumenErrores(r.error);
  const bloqueo = await sinPermiso();
  if (bloqueo) return bloqueo;

  const supabase = await clienteServidor();
  const { data, error: fallo } = await supabase
    .from('mensajes_contacto')
    .update({ estado: r.data.estado })
    .eq('id', r.data.id)
    .select('id');
  if (fallo || !data?.length) {
    if (fallo) console.error('No se pudo cambiar el mensaje:', fallo.code, fallo.message);
    return error(fallo ? FALLO : 'Ese mensaje ya no existe.');
  }
  revalidatePath(rutas.panel, 'layout');
  return ok(r.data.estado === 'nuevo' ? 'Marcado como sin leer.' : r.data.estado === 'respondido' ? 'Marcado como respondido.' : 'Mensaje archivado.');
}

/* ------------------------------------------------------------------
   Productos
   ------------------------------------------------------------------ */

const ERRORES_PRODUCTO: Record<string, [string, string]> = {
  productos_slug_key: ['slug', 'Ya hay otro producto con esa dirección.'],
  variantes_producto_id_nombre_key: ['variantes', 'Dos variantes no pueden llamarse igual.'],
  variantes_sku_key: ['variantes', 'Ese SKU ya lo usa otra variante.'],
};

/**
 * Crea o edita un producto con sus variantes en una sola transacción.
 * Si cambia la dirección (o es nuevo), lleva a la ficha en su URL nueva.
 */
export async function guardarProducto(_previo: ResultadoPanel, formulario: FormData): Promise<ResultadoPanel> {
  const r = esquemaProducto.safeParse(leerFormularioProducto(formulario));
  if (!r.success) return resumenErrores(r.error);
  const bloqueo = await sinPermiso();
  if (bloqueo) return bloqueo;

  const supabase = await clienteServidor();
  const { data: id, error: fallo } = await supabase.rpc('panel_guardar_producto', aParametrosGuardado(r.data));
  if (fallo) {
    const conocido = Object.entries(ERRORES_PRODUCTO).find(([restriccion]) => fallo.message.includes(restriccion));
    if (conocido) return error(conocido[1][1], { [conocido[1][0]]: conocido[1][1] });
    console.error('No se pudo guardar el producto:', fallo.code, fallo.message);
    return error(FALLO);
  }

  revalidatePath(rutas.panelProductos);
  revalidatePath(rutas.tienda, 'layout');
  revalidatePath(rutas.inicio);
  // Al crear (o al cambiar la dirección) la ficha pasa a vivir en otra URL.
  if (!r.data.id || formulario.get('slug_original') !== r.data.slug) {
    redirect(`${rutas.panelProducto(r.data.slug)}?guardado=${id ? '1' : '0'}`);
  }
  revalidatePath(rutas.panelProducto(r.data.slug));
  return ok('Producto guardado.');
}

/** Publica u oculta un producto. La primera publicación fija `publicado_en`. */
export async function cambiarVisibilidad(_previo: ResultadoPanel, formulario: FormData): Promise<ResultadoPanel> {
  const r = esquemaVisibilidad.safeParse(formularioAObjeto(formulario));
  if (!r.success) return resumenErrores(r.error);
  const bloqueo = await sinPermiso();
  if (bloqueo) return bloqueo;

  const supabase = await clienteServidor();
  const cambios: Record<string, unknown> = { estado: r.data.estado };
  if (r.data.estado === 'publicado') {
    const { data } = await supabase.from('productos').select('publicado_en').eq('id', r.data.id).maybeSingle();
    if (!data?.publicado_en) cambios.publicado_en = new Date().toISOString();
  }
  const { error: fallo } = await supabase.from('productos').update(cambios).eq('id', r.data.id);
  if (fallo) {
    console.error('No se pudo cambiar la visibilidad:', fallo.code, fallo.message);
    return error(FALLO);
  }
  revalidatePath(rutas.panelProductos, 'layout');
  revalidatePath(rutas.tienda, 'layout');
  return ok(r.data.estado === 'publicado' ? 'Ya se ve en la tienda.' : 'Oculto en la tienda.');
}

/**
 * Sube fotos al bucket «productos» y las añade al final de la galería.
 * Si una falla, las anteriores se quedan guardadas.
 */
export async function subirFotosProducto(_previo: ResultadoPanel, formulario: FormData): Promise<ResultadoPanel> {
  const r = await esquemaSubidaFotos.safeParseAsync(formularioAObjeto(formulario, ['fotos']));
  if (!r.success) return resumenErrores(r.error);
  const bloqueo = await sinPermiso();
  if (bloqueo) return bloqueo;

  const { producto_id, alt, fotos } = r.data;
  const supabase = await clienteServidor();
  const { data: ultima } = await supabase
    .from('fotos_producto')
    .select('posicion')
    .eq('producto_id', producto_id)
    .order('posicion', { ascending: false })
    .limit(1)
    .maybeSingle();
  let posicion = (typeof ultima?.posicion === 'number' ? ultima.posicion : -1) + 1;

  for (const foto of fotos) {
    const bytes = new Uint8Array(await foto.arrayBuffer());
    // El tipo que se guarda es el de los primeros bytes, no el que declara
    // el navegador; el esquema ya ha descartado lo que no es imagen.
    const tipo = tipoDeImagen(bytes);
    // El bucket es público y sirve el original: sin GPS ni datos del móvil.
    const limpia = tipo && sinMetadatos(bytes, tipo);
    if (!tipo || !limpia) return error('Una de las fotos no es una imagen válida.');
    // Nombre propio y aleatorio: el del archivo puede llevar datos personales.
    const ruta = `${producto_id}/${crypto.randomUUID()}.${EXTENSION_IMAGEN[tipo]}`;
    const subida = await supabase.storage.from('productos').upload(ruta, limpia, { contentType: tipo, upsert: false });
    if (subida.error) {
      console.error('No se pudo subir una foto:', subida.error.message);
      return error('No se ha podido subir una de las fotos. Las anteriores sí se han guardado.');
    }
    const { error: fallo } = await supabase.from('fotos_producto').insert({ producto_id, ruta, alt, posicion: posicion++ });
    if (fallo) {
      await supabase.storage.from('productos').remove([ruta]);
      console.error('No se pudo registrar una foto:', fallo.message);
      return error(FALLO);
    }
  }
  revalidatePath(rutas.panelProductos, 'layout');
  revalidatePath(rutas.tienda, 'layout');
  return ok(fotos.length === 1 ? 'Foto añadida.' : `${fotos.length} fotos añadidas.`);
}

/** Las rutas que empiezan por «/» o por http no están en Storage (son de public/ o de otro dominio). */
const enStorage = (ruta: string) => !ruta.startsWith('/') && !/^https?:\/\//.test(ruta);

/** Quita una foto del producto y, si está en Storage, borra también el archivo. */
export async function quitarFoto(_previo: ResultadoPanel, formulario: FormData): Promise<ResultadoPanel> {
  const r = esquemaFoto.safeParse(formularioAObjeto(formulario));
  if (!r.success) return resumenErrores(r.error);
  const bloqueo = await sinPermiso();
  if (bloqueo) return bloqueo;

  const supabase = await clienteServidor();
  const { data, error: fallo } = await supabase
    .from('fotos_producto')
    .delete()
    .eq('id', r.data.id)
    .eq('producto_id', r.data.producto_id)
    .select('ruta');
  if (fallo) {
    console.error('No se pudo quitar la foto:', fallo.message);
    return error(FALLO);
  }
  const rutasBorradas = (data ?? []).map((f) => String(f.ruta)).filter(enStorage);
  if (rutasBorradas.length) await supabase.storage.from('productos').remove(rutasBorradas);
  revalidatePath(rutas.panelProductos, 'layout');
  revalidatePath(rutas.tienda, 'layout');
  return ok('Foto quitada.');
}

/** Pone una foto la primera de la galería y corre las demás un puesto. */
export async function hacerFotoPrincipal(_previo: ResultadoPanel, formulario: FormData): Promise<ResultadoPanel> {
  const r = esquemaFoto.safeParse(formularioAObjeto(formulario));
  if (!r.success) return resumenErrores(r.error);
  const bloqueo = await sinPermiso();
  if (bloqueo) return bloqueo;

  const supabase = await clienteServidor();
  const { data } = await supabase
    .from('fotos_producto')
    .select('id')
    .eq('producto_id', r.data.producto_id)
    .order('posicion');
  const ids = (data ?? []).map((f) => String(f.id));
  // Solo se reordenan fotos de este producto: un id ajeno no se cuela.
  if (!ids.includes(r.data.id)) return error('Esa foto ya no está en este producto.');
  const orden = [r.data.id, ...ids.filter((id) => id !== r.data.id)];
  for (const [posicion, id] of orden.entries()) {
    const { error: fallo } = await supabase
      .from('fotos_producto')
      .update({ posicion })
      .eq('id', id)
      .eq('producto_id', r.data.producto_id);
    if (fallo) {
      console.error('No se pudo ordenar las fotos:', fallo.message);
      return error(FALLO);
    }
  }
  revalidatePath(rutas.panelProductos, 'layout');
  revalidatePath(rutas.tienda, 'layout');
  return ok('Ahora es la foto principal.');
}
