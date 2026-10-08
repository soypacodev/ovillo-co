import { NextResponse, type NextRequest } from 'next/server';
import { conSiguiente } from '@/lib/cuentas/redireccion';
import { refrescarSesion } from '@/lib/cuentas/sesion-proxy';
import { configuracionSupabase } from '@/lib/datos/entorno';
import { politicaSeguridad } from '@/lib/seguridad/csp';

/** Zonas que piden sesión cuando hay base de datos. Sin ella, la cuenta
 *  enseña un aviso y el panel funciona en modo local de solo lectura. */
const ZONAS_PRIVADAS = ['/cuenta', '/panel'];

const esPrivada = (ruta: string) => ZONAS_PRIVADAS.some((z) => ruta === z || ruta.startsWith(`${z}/`));

// Cada página recibe un nonce nuevo y su CSP, y la sesión de Supabase
// renovada si hacía falta. El resto de cabeceras de seguridad, que no
// cambian, están en next.config.ts.
export async function proxy(peticion: NextRequest) {
  const sesion = await refrescarSesion(peticion);

  // Comprobación optimista: ahorra pintar una página privada para nada.
  // La de verdad la hacen la propia página (getUser) y RLS.
  if (configuracionSupabase() && !sesion.conSesion && esPrivada(peticion.nextUrl.pathname)) {
    const destino = `${peticion.nextUrl.pathname}${peticion.nextUrl.search}`;
    return NextResponse.redirect(new URL(conSiguiente('/entrar', destino), peticion.url));
  }

  const nonce = btoa(crypto.randomUUID());
  const csp = politicaSeguridad(
    nonce,
    process.env.NODE_ENV === 'development',
    peticion.nextUrl.protocol === 'https:',
  );

  // Se copian después de refrescar: así llevan también las cookies nuevas.
  const cabeceras = new Headers(peticion.headers);
  cabeceras.set('x-nonce', nonce);
  // Next lee el nonce de la CSP de la petición para firmar sus scripts.
  cabeceras.set('Content-Security-Policy', csp);

  const respuesta = NextResponse.next({ request: { headers: cabeceras } });
  respuesta.headers.set('Content-Security-Policy', csp);
  sesion.aplicar(respuesta);
  return respuesta;
}

export const config = {
  matcher: [
    {
      // Solo documentos HTML: ni ficheros estáticos, ni imágenes, ni el
      // webhook, ni las precargas de next/link (que no se ejecutan).
      source: '/((?!api/|_next/static|_next/image|fotos/|favicon.ico|icon.svg|robots.txt|sitemap.xml|manifest.webmanifest).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
