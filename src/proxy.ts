import { NextResponse, type NextRequest } from 'next/server';
import { conSiguiente } from '@/lib/cuentas/redireccion';
import { refrescarSesion } from '@/lib/cuentas/sesion-proxy';
import { configuracionSupabase } from '@/lib/datos/entorno';
import {
  CABECERA_IDIOMA,
  COOKIE_IDIOMA,
  conIdioma,
  esIdioma,
  IDIOMA_POR_DEFECTO,
  idiomaDeCabecera,
  separarIdioma,
  seTraduce,
  type Idioma,
} from '@/lib/i18n';
import { politicaSeguridad } from '@/lib/seguridad/csp';

/** Zonas que piden sesión cuando hay base de datos. Sin ella, la cuenta
 *  enseña un aviso y el panel funciona en modo local de solo lectura. */
const ZONAS_PRIVADAS = ['/cuenta', '/panel'];

const esPrivada = (ruta: string) => ZONAS_PRIVADAS.some((z) => ruta === z || ruta.startsWith(`${z}/`));

const UN_ANIO = 60 * 60 * 24 * 365;

function recordarIdioma(respuesta: NextResponse, idioma: Idioma) {
  respuesta.cookies.set(COOKIE_IDIOMA, idioma, {
    path: '/',
    maxAge: UN_ANIO,
    sameSite: 'lax',
    httpOnly: true,
  });
}

/** Solo las cargas normales de página se redirigen por idioma; nunca las
 *  peticiones internas de navegación (RSC) ni los envíos de formularios. */
const esCargaDePagina = (peticion: NextRequest) => peticion.method === 'GET' && !peticion.headers.has('rsc');

type DecisionIdioma =
  { tipo: 'redirigir'; url: URL; idioma?: Idioma } | { tipo: 'servir'; idioma: Idioma; ruta: string; prefijo: boolean };

/**
 * Idioma de la petición:
 * - «/en/tienda» se sirve en inglés con la página de «/tienda» y se recuerda.
 * - «/es/tienda» (lo que pide el selector) redirige a «/tienda» y recuerda el español.
 * - «/tienda» se sirve en español, salvo que la visita haya elegido otro
 *   idioma o, la primera vez, su navegador prefiera uno de los nuestros.
 */
function decidirIdioma(peticion: NextRequest): DecisionIdioma {
  const { pathname, search } = peticion.nextUrl;
  const { idioma, ruta } = separarIdioma(pathname);

  if (idioma) {
    // Español explícito o zona sin traducir: a la ruta de siempre.
    if (idioma === IDIOMA_POR_DEFECTO || !seTraduce(ruta)) {
      return {
        tipo: 'redirigir',
        url: new URL(`${ruta}${search}`, peticion.url),
        idioma: seTraduce(ruta) ? idioma : undefined,
      };
    }
    return { tipo: 'servir', idioma, ruta, prefijo: true };
  }

  if (seTraduce(pathname) && esCargaDePagina(peticion)) {
    const guardado = peticion.cookies.get(COOKIE_IDIOMA)?.value;
    const preferido = esIdioma(guardado) ? guardado : idiomaDeCabecera(peticion.headers.get('accept-language'));
    if (preferido && preferido !== IDIOMA_POR_DEFECTO) {
      return {
        tipo: 'redirigir',
        url: new URL(`${conIdioma(pathname, preferido)}${search}`, peticion.url),
      };
    }
  }
  return {
    tipo: 'servir',
    idioma: IDIOMA_POR_DEFECTO,
    ruta: pathname,
    prefijo: false,
  };
}

// Cada página recibe un nonce nuevo y su CSP, y la sesión de Supabase
// renovada si hacía falta. El resto de cabeceras de seguridad, que no
// cambian, están en next.config.ts.
export async function proxy(peticion: NextRequest) {
  const decision = decidirIdioma(peticion);
  if (decision.tipo === 'redirigir') {
    const respuesta = NextResponse.redirect(decision.url);
    if (decision.idioma) recordarIdioma(respuesta, decision.idioma);
    return respuesta;
  }
  const { idioma, ruta } = decision;

  const sesion = await refrescarSesion(peticion);

  // Comprobación optimista: ahorra pintar una página privada para nada.
  // La de verdad la hacen la propia página (getUser) y RLS.
  if (configuracionSupabase() && !sesion.conSesion && esPrivada(ruta)) {
    const destino = `${peticion.nextUrl.pathname}${peticion.nextUrl.search}`;
    const respuesta = NextResponse.redirect(new URL(conSiguiente(conIdioma('/entrar', idioma), destino), peticion.url));
    sesion.aplicar(respuesta);
    return respuesta;
  }

  const nonce = btoa(crypto.randomUUID());
  const csp = politicaSeguridad(nonce, process.env.NODE_ENV === 'development', peticion.nextUrl.protocol === 'https:');

  // Se copian después de refrescar: así llevan también las cookies nuevas.
  const cabeceras = new Headers(peticion.headers);
  cabeceras.set('x-nonce', nonce);
  cabeceras.set(CABECERA_IDIOMA, idioma);
  // Next lee el nonce de la CSP de la petición para firmar sus scripts.
  cabeceras.set('Content-Security-Policy', csp);

  // Con prefijo, la página es la misma que en español: se sirve por dentro
  // la ruta sin él y el idioma va en la cabecera.
  const respuesta = decision.prefijo
    ? NextResponse.rewrite(new URL(`${ruta}${peticion.nextUrl.search}`, peticion.url), {
        request: { headers: cabeceras },
      })
    : NextResponse.next({ request: { headers: cabeceras } });
  respuesta.headers.set('Content-Security-Policy', csp);
  // La misma URL sin prefijo puede acabar en otro idioma según quién la pida.
  if (!decision.prefijo && seTraduce(ruta)) respuesta.headers.append('Vary', 'Cookie, Accept-Language');
  if (decision.prefijo && peticion.cookies.get(COOKIE_IDIOMA)?.value !== idioma) recordarIdioma(respuesta, idioma);
  sesion.aplicar(respuesta);
  return respuesta;
}

export const config = {
  matcher: [
    {
      // Solo documentos HTML: ni ficheros estáticos, ni imágenes, ni el
      // webhook, ni las precargas de next/link (que no se ejecutan).
      source:
        '/((?!api/|_next/static|_next/image|fotos/|favicon.ico|icon.svg|robots.txt|sitemap.xml|manifest.webmanifest).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
