// Variables de entorno públicas, validadas una sola vez. Next solo
// incrusta en el navegador las NEXT_PUBLIC_* que se leen de forma
// literal, por eso cada una aparece escrita entera.

import { z } from 'zod';

/** Una variable vacía en .env cuenta como no definida. */
const opcional = <T extends z.ZodType>(esquema: T) =>
  z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), esquema.optional());

const esquemaPublico = z
  .object({
    NEXT_PUBLIC_SUPABASE_URL: opcional(z.url({ protocol: /^https?$/ })),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: opcional(z.string().min(20)),
    NEXT_PUBLIC_SITIO_URL: opcional(z.url({ protocol: /^https?$/ })),
  })
  .refine(
    (e) => Boolean(e.NEXT_PUBLIC_SUPABASE_URL) === Boolean(e.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    'NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY van juntas: define las dos o ninguna.',
  );

export type EntornoPublico = z.infer<typeof esquemaPublico>;

let cache: EntornoPublico | undefined;

/** Variables públicas validadas. Lanza con un mensaje claro si alguna no es válida. */
export function entornoPublico(): EntornoPublico {
  if (cache) return cache;
  const resultado = esquemaPublico.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITIO_URL: process.env.NEXT_PUBLIC_SITIO_URL,
  });
  if (!resultado.success) {
    throw new Error(`Variables de entorno no válidas:\n${z.prettifyError(resultado.error)}`);
  }
  cache = resultado.data;
  return cache;
}

export interface ConfiguracionSupabase {
  url: string;
  claveAnonima: string;
}

/** null cuando no hay Supabase: entonces la tienda usa la semilla. */
export function configuracionSupabase(): ConfiguracionSupabase | null {
  const e = entornoPublico();
  if (!e.NEXT_PUBLIC_SUPABASE_URL || !e.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
  return { url: e.NEXT_PUBLIC_SUPABASE_URL, claveAnonima: e.NEXT_PUBLIC_SUPABASE_ANON_KEY };
}

/**
 * URL pública del sitio, sin barra final. Si no está configurada, en Vercel se
 * usa el dominio de producción del proyecto, que Vercel expone en el entorno.
 */
export function urlSitio(): string {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const url = entornoPublico().NEXT_PUBLIC_SITIO_URL ?? (vercel ? `https://${vercel}` : 'http://localhost:3000');
  return url.replace(/\/+$/, '');
}
