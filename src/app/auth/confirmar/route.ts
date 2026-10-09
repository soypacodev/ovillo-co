// Vuelta de los enlaces que manda Supabase Auth por correo: confirmar la
// cuenta, entrar con enlace mágico y recuperar la contraseña. Admite los
// dos formatos: ?code= (flujo PKCE, el de @supabase/ssr) y
// ?token_hash=&type= (si se personaliza la plantilla del correo).
// Esta ruta no lleva idioma: el de la tienda viaja en el prefijo de
// `siguiente` («/en/cuenta»), que ponen las acciones al pedir el correo.

import { NextResponse, type NextRequest } from 'next/server';
import { destinoSeguro } from '@/lib/cuentas/redireccion';
import { configuracionSupabase } from '@/lib/datos/entorno';
import { clienteServidor } from '@/lib/datos/supabase/servidor';
import { conIdioma, IDIOMA_POR_DEFECTO, separarIdioma } from '@/lib/i18n';
import { rutas } from '@/lib/rutas';

const TIPOS = ['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email'] as const;
type TipoEnlace = (typeof TIPOS)[number];
const esTipo = (v: string | null): v is TipoEnlace => TIPOS.some((t) => t === v);

export async function GET(peticion: NextRequest) {
  const url = peticion.nextUrl;
  const siguiente = destinoSeguro(url.searchParams.get('siguiente'));
  const idioma = separarIdioma(siguiente).idioma ?? IDIOMA_POR_DEFECTO;
  const volver = (ruta: string) => NextResponse.redirect(new URL(conIdioma(ruta, idioma), peticion.url));

  if (!configuracionSupabase()) return volver(rutas.entrar);

  const supabase = await clienteServidor();
  const codigo = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const tipo = url.searchParams.get('type');

  let valido = false;
  if (codigo) {
    valido = !(await supabase.auth.exchangeCodeForSession(codigo)).error;
  } else if (tokenHash && esTipo(tipo)) {
    valido = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo })).error;
  }

  // Supabase añade ?error=… cuando el enlace ya se usó o ha caducado.
  if (!valido) return volver(`${rutas.entrar}?aviso=enlace-caducado`);
  return volver(tipo === 'recovery' ? rutas.nuevaContrasena : siguiente);
}
