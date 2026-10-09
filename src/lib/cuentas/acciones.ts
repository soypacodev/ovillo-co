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
import { conIdioma, textos } from '@/lib/i18n';
import { idiomaActual } from '@/lib/i18n/servidor';
import { rutas } from '@/lib/rutas';
import { esquemaBorrarCuenta, esquemaDatos, esquemaDireccion, esquemaFavoritos } from './esquemas';
import { fusionarFavoritos } from './favoritos';
import { RESPUESTAS, error, ok, validar } from './respuestas';
import { perfilActual, usuarioActual } from './sesion';
import { MAX_DIRECCIONES, type EstadoAccion } from './tipos';

const T = textos(
  {
    datosGuardados: 'Datos guardados.',
    noSeBorran: 'Las cuentas del taller y la de demostración no se borran desde aquí.',
    sinClave: 'Ahora mismo no podemos borrar la cuenta desde aquí. Escríbenos y la borramos nosotros.',
    yaNoExiste: 'Esa dirección ya no existe. Recarga la página.',
    maxDirecciones: (n: number) => `Puedes guardar hasta ${n} direcciones. Borra alguna que ya no uses.`,
    sinPredeterminada: 'La dirección está guardada, pero no hemos podido hacerla la predeterminada. Prueba de nuevo.',
  },
  {
    en: {
      datosGuardados: 'Details saved.',
      noSeBorran: "Workshop accounts and the demo account can't be deleted from here.",
      sinClave: "We can't delete the account from here right now. Drop us a line and we'll delete it for you.",
      yaNoExiste: 'That address no longer exists. Please reload the page.',
      maxDirecciones: (n: number) => `You can save up to ${n} addresses. Delete one you no longer use.`,
      sinPredeterminada: "The address is saved, but we couldn't make it your default. Please try again.",
    },
    fr: {
      datosGuardados: 'Informations enregistrées.',
      noSeBorran: 'Les comptes de l’atelier et celui de démonstration ne se suppriment pas ici.',
      sinClave: 'Nous ne pouvons pas supprimer le compte d’ici pour le moment. Écrivez-nous et nous le supprimerons pour vous.',
      yaNoExiste: 'Cette adresse n’existe plus. Rechargez la page.',
      maxDirecciones: (n: number) =>
        `Vous pouvez enregistrer jusqu’à ${n} adresses. Supprimez-en une que vous n’utilisez plus.`,
      sinPredeterminada: 'L’adresse est enregistrée, mais nous n’avons pas pu en faire l’adresse par défaut. Réessayez.',
    },
    de: {
      datosGuardados: 'Daten gespeichert.',
      noSeBorran: 'Werkstatt-Konten und das Demo-Konto lassen sich hier nicht löschen.',
      sinClave: 'Wir können das Konto gerade nicht hier löschen. Schreiben Sie uns, dann löschen wir es für Sie.',
      yaNoExiste: 'Diese Adresse gibt es nicht mehr. Bitte laden Sie die Seite neu.',
      maxDirecciones: (n: number) => `Sie können bis zu ${n} Adressen speichern. Löschen Sie eine, die Sie nicht mehr nutzen.`,
      sinPredeterminada:
        'Die Adresse ist gespeichert, konnte aber nicht als Standardadresse festgelegt werden. Bitte versuchen Sie es erneut.',
    },
  },
);

/* ------------------------------------------------------------------
   Datos personales y cuenta
   ------------------------------------------------------------------ */

type CampoDatos = 'nombre' | 'telefono' | 'boletin';

/** Guarda nombre, teléfono y la suscripción al boletín de la cuenta. */
export async function guardarDatos(_previo: EstadoAccion<CampoDatos>, formulario: FormData): Promise<EstadoAccion<CampoDatos>> {
  const idioma = await idiomaActual();
  const perfil = await perfilActual();
  if (!perfil) return error(RESPUESTAS[idioma].sesionCaducada);
  const v = validar<ReturnType<typeof esquemaDatos>, CampoDatos>(esquemaDatos(idioma), formulario, idioma);
  if ('fallo' in v) return v.fallo;
  const { nombre, telefono, boletin } = v.datos;

  const supabase = await clienteServidor();
  const { error: fallo } = await supabase
    .from('perfiles')
    .update({ nombre, telefono: telefono || null, acepta_boletin: boletin })
    .eq('id', perfil.id);
  if (fallo) {
    console.error('No se pudieron guardar los datos:', fallo.code, fallo.message);
    return error(RESPUESTAS[idioma].fallo, {}, { nombre, telefono });
  }

  if (boletin !== perfil.aceptaBoletin) await cambiarBoletin(perfil.email, boletin);
  revalidatePath(rutas.cuenta, 'layout');
  return ok(T[idioma].datosGuardados);
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
  const idioma = await idiomaActual();
  const t = T[idioma];
  const perfil = await perfilActual();
  if (!perfil) return error(RESPUESTAS[idioma].sesionCaducada);
  const v = validar<ReturnType<typeof esquemaBorrarCuenta>, 'confirmacion'>(esquemaBorrarCuenta(idioma), formulario, idioma);
  if ('fallo' in v) return v.fallo;
  if (perfil.rol !== 'cliente') {
    return error(t.noSeBorran);
  }
  // Sin la clave de servicio no se puede borrar un usuario de Auth.
  if (!hayClaveServicio()) return error(t.sinClave);

  // Borrar el usuario de Auth arrastra perfil, direcciones y favoritos
  // (on delete cascade). Los pedidos se quedan, sin la cuenta, porque son
  // facturas que hay que conservar.
  const { error: fallo } = await clienteServicio().auth.admin.deleteUser(perfil.id);
  if (fallo) {
    console.error('No se pudo borrar la cuenta:', fallo.code, fallo.message);
    return error(RESPUESTAS[idioma].fallo);
  }
  const supabase = await clienteServidor();
  await supabase.auth.signOut({ scope: 'local' });
  revalidatePath('/', 'layout');
  redirect(conIdioma(`${rutas.entrar}?aviso=cuenta-borrada`, idioma));
}

/* ------------------------------------------------------------------
   Direcciones
   ------------------------------------------------------------------ */

type CampoDireccion = keyof z.input<ReturnType<typeof esquemaDireccion>>;

/** Crea o edita una dirección propia, con un máximo de MAX_DIRECCIONES por cuenta. */
export async function guardarDireccion(
  _previo: EstadoAccion<CampoDireccion>,
  formulario: FormData,
): Promise<EstadoAccion<CampoDireccion>> {
  const idioma = await idiomaActual();
  const t = T[idioma];
  const usuario = await usuarioActual();
  if (!usuario) return error(RESPUESTAS[idioma].sesionCaducada);
  const v = validar<ReturnType<typeof esquemaDireccion>, CampoDireccion>(esquemaDireccion(idioma), formulario, idioma);
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
    if (!count) return error(t.yaNoExiste);
  } else {
    const { count } = await propias();
    if ((count ?? 0) >= MAX_DIRECCIONES) return error(t.maxDirecciones(MAX_DIRECCIONES));
  }

  // Quitar la marca es una sola escritura; ponerla la hace después la
  // base de datos en un solo paso, junto con quitársela a la anterior.
  const consulta = id
    ? supabase.from('direcciones').update(predeterminada ? fila : { ...fila, predeterminada: false }).eq('id', id).eq('usuario_id', usuario.id).select('id').single()
    : supabase.from('direcciones').insert({ ...fila, usuario_id: usuario.id }).select('id').single();
  const { data: guardada, error: fallo } = await consulta;
  if (fallo || !guardada) {
    console.error('No se pudo guardar la dirección:', fallo?.code, fallo?.message);
    return error(RESPUESTAS[idioma].fallo);
  }
  if (predeterminada) {
    const { error: falloPredeterminada } = await marcarPredeterminada(supabase, String(guardada.id));
    if (falloPredeterminada) {
      console.error('No se pudo marcar la dirección como predeterminada:', falloPredeterminada.message);
      return error(t.sinPredeterminada);
    }
  }
  revalidatePath(rutas.cuentaDirecciones);
  redirect(conIdioma(`${rutas.cuentaDirecciones}?guardada=1`, idioma));
}

const idDireccion = (formulario: FormData) => z.uuid().safeParse(formulario.get('id'));

/** Quita la anterior y marca esta en una sola transacción (función SQL):
 *  la cuenta nunca se queda sin predeterminada a medias. */
function marcarPredeterminada(supabase: Awaited<ReturnType<typeof clienteServidor>>, id: string) {
  return supabase.rpc('marcar_direccion_predeterminada', { p_id: id });
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
  // Si la dirección no es suya o ya no existe, la función no toca nada.
  const { error: fallo } = await marcarPredeterminada(await clienteServidor(), id.data);
  if (fallo) console.error('No se pudo marcar la dirección como predeterminada:', fallo.message);
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
