// Renovación de la sesión de Supabase en el proxy. El token de acceso
// dura poco; si caduca entre dos visitas, aquí se cambia por uno nuevo
// antes de que las páginas lo lean. Los componentes de servidor no pueden
// escribir cookies, así que este es el único sitio donde se hace al
// cargar una página.

import { createServerClient } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';
import { configuracionSupabase } from '@/lib/datos/entorno';
import { esCookieDeSesion } from './cookies';

type CookieNueva = { name: string; value: string; options: Parameters<NextResponse['cookies']['set']>[2] };

export interface SesionProxy {
  /** Si hay una sesión válida (después de renovarla si hacía falta). */
  conSesion: boolean;
  /** Aplica a la respuesta las cookies nuevas y las cabeceras anticaché. */
  aplicar(respuesta: NextResponse): void;
}

const SIN_CAMBIOS: SesionProxy = { conSesion: false, aplicar: () => {} };

/**
 * Lee y, si hace falta, renueva la sesión. Las cookies nuevas se copian en
 * la propia petición (para que las páginas de esta misma petición vean la
 * sesión renovada) y se devuelven para ponerlas en la respuesta.
 */
export async function refrescarSesion(peticion: NextRequest): Promise<SesionProxy> {
  const config = configuracionSupabase();
  // Sin cookie de sesión no hay nada que renovar: así las visitas anónimas
  // no cuestan una llamada a Supabase Auth.
  if (!config || !peticion.cookies.getAll().some((c) => esCookieDeSesion(c.name))) return SIN_CAMBIOS;

  const nuevas: CookieNueva[] = [];
  let cabecerasExtra: Record<string, string> = {};

  const supabase = createServerClient(config.url, config.claveAnonima, {
    cookies: {
      getAll: () => peticion.cookies.getAll(),
      setAll: (lista, cabeceras) => {
        for (const { name, value, options } of lista) {
          peticion.cookies.set(name, value);
          nuevas.push({ name, value, options });
        }
        cabecerasExtra = { ...cabecerasExtra, ...cabeceras };
      },
    },
  });

  // getClaims() comprueba la firma del token y lo renueva si ha caducado.
  const { data, error } = await supabase.auth.getClaims();
  const conSesion = !error && Boolean(data?.claims?.sub);

  return {
    conSesion,
    aplicar(respuesta) {
      for (const { name, value, options } of nuevas) respuesta.cookies.set(name, value, options);
      for (const [clave, valor] of Object.entries(cabecerasExtra)) respuesta.headers.set(clave, valor);
    },
  };
}
