'use server';

// Datos personales, direcciones, favoritos y borrar la cuenta. Van con la
// sesión de quien llama y RLS limita cada tabla a lo propio; aun así cada
// consulta se filtra por su id, porque admin puede leer las de todos.

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { hayClaveServicio } from '@/lib/datos/entorno-servidor';
import { clientePublico } from '@/lib/datos/supabase/publico';
import { clienteServicio } from '@/lib/datos/supabase/servicio';
import { clienteServidor } from '@/lib/datos/supabase/servidor';
import { rutas } from '@/lib/rutas';
import { esquemaBorrarCuenta, esquemaDatos, esquemaDireccion, esquemaFavoritos } from './esquemas';
import { fusionarFavoritos } from './favoritos';
import { FALLO, error, ok, validar } from './respuestas';
import { perfilActual, usuarioActual } from './sesion';
import { MAX_DIRECCIONES, type EstadoAccion } from './tipos';

/* ------------------------------------------------------------------
   Datos personales y cuenta
   ------------------------------------------------------------------ */

type CampoDatos = 'nombre' | 'telefono' | 'boletin';

/** Guarda nombre, teléfono y la suscripción al boletín de la cuenta. */
export async function guardarDatos(_previo: EstadoAccion<CampoDatos>, formulario: FormData): Promise<EstadoAccion<CampoDatos>> {
  const perfil = await perfilActual();
  if (!perfil) return error('Tu sesión ha caducado. Vuelve a entrar.');
  const v = validar<typeof esquemaDatos, CampoDatos>(esquemaDatos, formulario);
  if ('fallo' in v) return v.fallo;
  const { nombre, telefono, boletin } = v.datos;

  const supabase = await clienteServidor();
  const { error: fallo } = await supabase
    .from('perfiles')
    .update({ nombre, telefono: telefono || null, acepta_boletin: boletin })
    .eq('id', perfil.id);
  if (fallo) {
    console.error('No se pudieron guardar los datos:', fallo.code, fallo.message);
    return error(FALLO, {}, { nombre, telefono });
  }

  if (boletin !== perfil.aceptaBoletin) await cambiarBoletin(perfil.email, boletin);
  revalidatePath(rutas.cuenta, 'layout');
  return ok('Datos guardados.');
}

/** El alta va por la función pública; la baja solo la puede marcar el
 *  servidor, porque RLS no deja a la clienta leer ni cambiar el boletín. */
async function cambiarBoletin(email: string, alta: boolean): Promise<void> {
  if (alta) {
    const { error: e } = await clientePublico().rpc('suscribir_boletin', { p_email: email, p_origen: 'cuenta' });
    if (e) console.error('No se pudo apuntar al boletín:', e.message);
  } else if (hayClaveServicio()) {
    const { error: e } = await clienteServicio()
      .from('suscripciones_boletin')
      .update({ baja_en: new Date().toISOString() })
      .ilike('email', email);
    if (e) console.error('No se pudo dar de baja del boletín:', e.message);
  }
}

/**
 * Borra la cuenta de una clienta tras escribir la palabra de confirmación.
 * Necesita la clave de servicio; las cuentas admin y demo no se borran aquí.
 */
export async function borrarCuenta(_previo: EstadoAccion<'confirmacion'>, formulario: FormData): Promise<EstadoAccion<'confirmacion'>> {
  const perfil = await perfilActual();
  if (!perfil) return error('Tu sesión ha caducado. Vuelve a entrar.');
  const v = validar<typeof esquemaBorrarCuenta, 'confirmacion'>(esquemaBorrarCuenta, formulario);
  if ('fallo' in v) return v.fallo;
  if (perfil.rol !== 'cliente') {
    return error('Las cuentas del taller y la de demostración no se borran desde aquí.');
  }
  if (!hayClaveServicio()) return error('Borrar cuentas necesita la clave de servicio de Supabase en el servidor.');

  // Borrar el usuario de Auth arrastra perfil, direcciones y favoritos
  // (on delete cascade). Los pedidos se quedan, sin la cuenta, porque son
  // facturas que hay que conservar.
  const { error: fallo } = await clienteServicio().auth.admin.deleteUser(perfil.id);
  if (fallo) {
    console.error('No se pudo borrar la cuenta:', fallo.code, fallo.message);
    return error(FALLO);
  }
  const supabase = await clienteServidor();
  await supabase.auth.signOut({ scope: 'local' });
  revalidatePath('/', 'layout');
  redirect(`${rutas.entrar}?aviso=cuenta-borrada`);
}

/* ------------------------------------------------------------------
   Direcciones
   ------------------------------------------------------------------ */

type CampoDireccion = keyof z.input<typeof esquemaDireccion>;

/** Crea o edita una dirección propia, con un máximo de MAX_DIRECCIONES por cuenta. */
export async function guardarDireccion(
  _previo: EstadoAccion<CampoDireccion>,
  formulario: FormData,
): Promise<EstadoAccion<CampoDireccion>> {
  const usuario = await usuarioActual();
  if (!usuario) return error('Tu sesión ha caducado. Vuelve a entrar.');
  const v = validar<typeof esquemaDireccion, CampoDireccion>(esquemaDireccion, formulario);
  if ('fallo' in v) return v.fallo;
  const { id, predeterminada, ...resto } = v.datos;
  const fila = {
    ...resto,
    etiqueta: resto.etiqueta || null,
    linea2: resto.linea2 || null,
    telefono: resto.telefono || null,
  };

  const supabase = await clienteServidor();
  // Todas las consultas se filtran por la cuenta: RLS deja a admin leer
  // las direcciones de todo el mundo y no deben contar ni mezclarse.
  const propias = () => supabase.from('direcciones').select('id', { count: 'exact', head: true }).eq('usuario_id', usuario.id);
  if (id) {
    const { count } = await propias().eq('id', id);
    if (!count) return error('Esa dirección ya no existe. Recarga la página.');
  } else {
    const { count } = await propias();
    if ((count ?? 0) >= MAX_DIRECCIONES) return error(`Puedes guardar hasta ${MAX_DIRECCIONES} direcciones. Borra alguna que ya no uses.`);
  }

  // El índice único solo admite una predeterminada: primero se quita la anterior.
  if (predeterminada) await quitarPredeterminada(supabase, usuario.id);
  const consulta = id
    ? supabase.from('direcciones').update({ ...fila, predeterminada }).eq('id', id).eq('usuario_id', usuario.id)
    : supabase.from('direcciones').insert({ ...fila, predeterminada, usuario_id: usuario.id });
  const { error: fallo } = await consulta;
  if (fallo) {
    console.error('No se pudo guardar la dirección:', fallo.code, fallo.message);
    return error(FALLO);
  }
  revalidatePath(rutas.cuentaDirecciones);
  redirect(`${rutas.cuentaDirecciones}?guardada=1`);
}

const idDireccion = (formulario: FormData) => z.uuid().safeParse(formulario.get('id'));

async function quitarPredeterminada(supabase: Awaited<ReturnType<typeof clienteServidor>>, usuarioId: string) {
  await supabase.from('direcciones').update({ predeterminada: false }).eq('usuario_id', usuarioId).eq('predeterminada', true);
}

/** Borra una dirección; si no es de quien llama, no hace nada. */
export async function borrarDireccion(formulario: FormData): Promise<void> {
  const id = idDireccion(formulario);
  const usuario = await usuarioActual();
  if (!id.success || !usuario) return;
  const supabase = await clienteServidor();
  await supabase.from('direcciones').delete().eq('id', id.data).eq('usuario_id', usuario.id);
  revalidatePath(rutas.cuentaDirecciones);
}

/** Marca una dirección propia como la predeterminada. */
export async function predeterminarDireccion(formulario: FormData): Promise<void> {
  const id = idDireccion(formulario);
  const usuario = await usuarioActual();
  if (!id.success || !usuario) return;
  const supabase = await clienteServidor();
  // Si la dirección no es suya o ya no existe, no se toca la que había.
  const { count } = await supabase
    .from('direcciones')
    .select('id', { count: 'exact', head: true })
    .eq('id', id.data)
    .eq('usuario_id', usuario.id);
  if (!count) return;
  await quitarPredeterminada(supabase, usuario.id);
  await supabase.from('direcciones').update({ predeterminada: true }).eq('id', id.data).eq('usuario_id', usuario.id);
  revalidatePath(rutas.cuentaDirecciones);
}

/* ------------------------------------------------------------------
   Favoritos
   ------------------------------------------------------------------ */

async function idsDeProductos(slugs: readonly string[]): Promise<Map<string, string>> {
  if (!slugs.length) return new Map();
  const supabase = await clienteServidor();
  const { data } = await supabase.from('productos').select('id, slug').in('slug', slugs);
  return new Map((data ?? []).map((f) => [String(f.slug), String(f.id)]));
}

async function favoritosDeLaCuenta(usuarioId: string): Promise<string[]> {
  const supabase = await clienteServidor();
  const { data } = await supabase
    .from('favoritos')
    .select('producto:productos!favoritos_producto_id_fkey!inner(slug)')
    .eq('usuario_id', usuarioId)
    .order('creado_en');
  return (data ?? []).flatMap((f) => {
    const producto = f.producto as { slug?: unknown } | { slug?: unknown }[] | null;
    const slug = Array.isArray(producto) ? producto[0]?.slug : producto?.slug;
    return typeof slug === 'string' ? [slug] : [];
  });
}

/**
 * Al cargar la tienda con sesión: une los favoritos del navegador con los
 * de la cuenta, guarda en la cuenta los que faltaban y devuelve la lista
 * final para que el navegador se quede con la misma. null si no hay sesión.
 */
export async function fusionarFavoritosCuenta(locales: unknown): Promise<string[] | null> {
  const usuario = await usuarioActual();
  if (!usuario) return null;
  const { favoritos, subir } = fusionarFavoritos(locales, await favoritosDeLaCuenta(usuario.id));
  const ids = await idsDeProductos(subir);
  if (ids.size) {
    const supabase = await clienteServidor();
    const { error: fallo } = await supabase
      .from('favoritos')
      .upsert([...ids.values()].map((producto_id) => ({ usuario_id: usuario.id, producto_id })), { ignoreDuplicates: true });
    if (fallo) console.error('No se pudieron guardar los favoritos:', fallo.message);
  }
  // Un favorito de un producto que ya no existe se descarta.
  return favoritos.filter((slug) => !subir.includes(slug) || ids.has(slug));
}

/** Refleja en la cuenta lo que se acaba de guardar o quitar en el navegador. */
export async function actualizarFavoritosCuenta(cambios: unknown): Promise<void> {
  const usuario = await usuarioActual();
  const r = esquemaFavoritos.safeParse(cambios);
  if (!usuario || !r.success) return;
  const { anadir, quitar } = r.data;
  const ids = await idsDeProductos([...anadir, ...quitar]);
  const supabase = await clienteServidor();
  const nuevos = anadir.flatMap((s) => (ids.has(s) ? [{ usuario_id: usuario.id, producto_id: ids.get(s) as string }] : []));
  const fuera = quitar.flatMap((s) => (ids.has(s) ? [ids.get(s) as string] : []));
  if (nuevos.length) await supabase.from('favoritos').upsert(nuevos, { ignoreDuplicates: true });
  if (fuera.length) await supabase.from('favoritos').delete().eq('usuario_id', usuario.id).in('producto_id', fuera);
  revalidatePath(rutas.cuentaFavoritos);
}
