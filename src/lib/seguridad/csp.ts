// Política de seguridad de contenido (CSP). La genera el proxy en cada
// petición porque lleva un nonce de un solo uso: Next lo lee de la
// cabecera y lo pone en sus propios <script>, y el layout en el único
// script en línea propio de la tienda.

/** Origen de Supabase (https://xxxx.supabase.co) o null si no hay. */
function origenSupabase(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export function politicaSeguridad(nonce: string, desarrollo: boolean, https: boolean): string {
  const supabase = origenSupabase();

  const directivas: Record<string, (string | null | undefined | false)[]> = {
    // Todo lo que no se nombra abajo, solo del propio dominio.
    'default-src': ["'self'"],
    // Solo los scripts con el nonce de esta respuesta; 'strict-dynamic'
    // deja que esos carguen los trozos de JavaScript que necesitan.
    // React usa eval en desarrollo para reconstruir las pilas de error.
    'script-src': ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", desarrollo && "'unsafe-eval'"],
    // Hojas de estilo propias o con nonce. En desarrollo Next inyecta el
    // CSS con <style> sin nonce para recargarlo en caliente (y con un nonce
    // presente el navegador ignoraría 'unsafe-inline'). Los atributos
    // style="" sí se permiten: los usan next/image y las variables de las
    // animaciones, y no pueden ejecutar código.
    'style-src': ["'self'", desarrollo ? "'unsafe-inline'" : `'nonce-${nonce}'`],
    'style-src-attr': ["'unsafe-inline'"],
    // Fotos propias, las vistas previas de las fotos de encargo (blob:)
    // y, si hay base de datos, las del almacenamiento de Supabase.
    'img-src': ["'self'", 'data:', 'blob:', supabase],
    // next/font sirve las fuentes desde el propio dominio.
    'font-src': ["'self'"],
    // El navegador solo habla con la propia web: Supabase y Stripe se
    // llaman desde el servidor. En desarrollo, además, la recarga en caliente.
    'connect-src': ["'self'", desarrollo && 'ws:'],
    // Los formularios se envían a la propia web; el pago sale hacia
    // Stripe Checkout por redirección, nunca dentro de un marco.
    'form-action': ["'self'", 'https://checkout.stripe.com'],
    'frame-src': ["'none'"],
    // Nadie puede meter la tienda en un iframe (clickjacking).
    'frame-ancestors': ["'none'"],
    // Sin <object>/<embed> ni <base> que cambie a dónde apuntan las rutas.
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'manifest-src': ["'self'"],
    'worker-src': ["'self'", 'blob:'],
  };

  const partes = Object.entries(directivas).map(([nombre, valores]) =>
    [nombre, ...valores.filter((v): v is string => Boolean(v))].join(' '),
  );
  // Servida por https, ningún recurso puede bajar a http. En local
  // (http://localhost) forzarlo rompería la carga de la propia página.
  if (https) partes.push('upgrade-insecure-requests');
  return partes.join('; ');
}
