// Secretos que solo existen en el servidor. Importar este módulo desde
// un componente de cliente rompe la compilación a propósito.
import 'server-only';

import { z } from 'zod';

const esquemaServidor = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20, 'Falta SUPABASE_SERVICE_ROLE_KEY.'),
});

/** Clave secreta de prueba completa. El prefijo solo («sk_test_», como en
 *  .env.example sin rellenar) no cuenta: la tienda sigue en modo demostración.
 *  Una clave real (sk_live_…) no encaja nunca. */
export const PATRON_CLAVE_STRIPE = /^sk_test_[A-Za-z0-9]{24,}$/;
const PATRON_SECRETO_WEBHOOK = /^whsec_[A-Za-z0-9]{24,}$/;

const esquemaStripe = z.object({
  STRIPE_SECRET_KEY: z.string().regex(PATRON_CLAVE_STRIPE, 'Solo se admiten claves de prueba de Stripe completas (sk_test_…).'),
  STRIPE_WEBHOOK_SECRET: z.string().regex(PATRON_SECRETO_WEBHOOK, 'Falta STRIPE_WEBHOOK_SECRET completo (whsec_…).'),
});

function validar<T extends z.ZodType>(esquema: T, valores: Record<string, string | undefined>): z.infer<T> {
  const resultado = esquema.safeParse(valores);
  if (!resultado.success) {
    throw new Error(`Variables de entorno no válidas:\n${z.prettifyError(resultado.error)}`);
  }
  return resultado.data;
}

export function claveServicioSupabase(): string {
  return validar(esquemaServidor, {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }).SUPABASE_SERVICE_ROLE_KEY;
}

export type EntornoStripe = z.infer<typeof esquemaStripe>;

export function entornoStripe(): EntornoStripe {
  return validar(esquemaStripe, {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  });
}

const esquemaDemoPanel = z.object({
  DEMO_PANEL_EMAIL: z.email(),
  DEMO_PANEL_PASSWORD: z.string().min(8),
});

export type CredencialesDemo = { email: string; contrasena: string };

/** Cuenta de rol «demo» para el botón público del panel, o null si no está
 *  configurada. Las credenciales solo viven en el entorno del servidor. */
export function credencialesDemoPanel(): CredencialesDemo | null {
  const r = esquemaDemoPanel.safeParse({
    DEMO_PANEL_EMAIL: process.env.DEMO_PANEL_EMAIL?.trim(),
    DEMO_PANEL_PASSWORD: process.env.DEMO_PANEL_PASSWORD,
  });
  return r.success ? { email: r.data.DEMO_PANEL_EMAIL, contrasena: r.data.DEMO_PANEL_PASSWORD } : null;
}

/** true si hay clave de servicio (sin lanzar si falta). */
export function hayClaveServicio(): boolean {
  return esquemaServidor.safeParse({ SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY }).success;
}
