import { manejarWebhook } from '@/lib/pagos/webhook-servidor';

export async function POST(peticion: Request): Promise<Response> {
  return manejarWebhook(peticion);
}
