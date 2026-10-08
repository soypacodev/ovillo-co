import type { NextConfig } from 'next';

// Cabeceras de seguridad fijas para todas las respuestas. La CSP no está
// aquí porque lleva un nonce distinto en cada petición: la pone src/proxy.ts.
const CABECERAS_SEGURIDAD = [
  // Solo HTTPS durante dos años, también en subdominios. Los navegadores
  // la ignoran en http://localhost, así que no molesta en desarrollo.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // El navegador no adivina tipos: un .txt subido nunca se ejecuta como script.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // A otras webs solo les llega el dominio, nunca la ruta (que puede
  // llevar el número de pedido o la sesión de Stripe).
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // La tienda no usa cámara, micro, ubicación ni pagos del navegador
  // (el pago es en la página de Stripe), así que se apagan para todos.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=(), interest-cohort=()',
  },
  // Respaldo de frame-ancestors para navegadores antiguos.
  { key: 'X-Frame-Options', value: 'DENY' },
  // La pestaña no comparte contexto con ventanas que abra o que la abran.
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

// Las fotos que se suben desde el panel viven en el bucket público
// «productos» de Supabase: next/image solo las optimiza si se lo permitimos.
function fotosSupabase(): URL[] {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) return [];
  try {
    return [new URL('/storage/v1/object/public/productos/**', url)];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    // AVIF pesa en torno a un 30 % menos que WebP con la misma calidad; el
    // navegador que no lo entienda recibe WebP.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: fotosSupabase(),
  },
  experimental: {
    // El formulario de encargos y el panel admiten fotos (8 MB entre todas,
    // ver LIMITES_FOTOS y LIMITES_FOTOS_PRODUCTO); el resto, solo texto.
    serverActions: { bodySizeLimit: '9mb' },
  },
  async headers() {
    return [{ source: '/:ruta*', headers: CABECERAS_SEGURIDAD }];
  },
};

export default nextConfig;
