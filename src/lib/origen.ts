import 'server-only';

import { headers } from 'next/headers';
import { entornoPublico } from '@/lib/datos/entorno';

/** URL pública del sitio para los enlaces de los correos de Supabase Auth
 *  y la vuelta de Stripe: la configurada o, si no hay, la de la petición. */
export async function origenSitio(): Promise<string> {
  const configurada = entornoPublico().NEXT_PUBLIC_SITIO_URL;
  if (configurada) return configurada.replace(/\/+$/, '');
  const h = await headers();
  const delNavegador = h.get('origin');
  if (delNavegador) return delNavegador;
  return `${h.get('x-forwarded-proto') ?? 'http'}://${h.get('host') ?? 'localhost:3000'}`;
}
