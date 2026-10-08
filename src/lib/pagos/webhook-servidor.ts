// Webhook de Stripe con sus dependencias reales: firma, base de datos
// con el rol de servicio y reembolsos.
import 'server-only';

import type Stripe from 'stripe';
import { configuracionSupabase } from '@/lib/datos/entorno';
import { entornoStripe } from '@/lib/datos/entorno-servidor';
import { clienteServicio } from '@/lib/datos/supabase/servicio';
import { clienteStripe, stripeConfigurado } from './stripe';
import { procesarEvento, type DependenciasWebhook } from './webhook';

function dependencias(): DependenciasWebhook {
  const hayBaseDeDatos = configuracionSupabase() !== null;
  const bd = () => clienteServicio();

  return {
    hayBaseDeDatos,

    async yaProcesado(eventoId) {
      const { data, error } = await bd().from('eventos_stripe').select('id').eq('id', eventoId).maybeSingle();
      if (error) throw new Error(error.message);
      return data !== null;
    },

    async registrar(datos) {
      const { data, error } = await bd().rpc('registrar_pedido_pagado', datos);
      if (!error) return { ok: true, pedidoId: String(data) };
      // Los `raise exception` de la función son reglas de negocio.
      if (error.code === 'P0001') return { ok: false, permanente: true, codigo: error.message };
      return { ok: false, permanente: false, error: error.message };
    },

    async reembolsar(pagoId, sesionId, motivo) {
      await clienteStripe().refunds.create(
        { payment_intent: pagoId, reason: 'requested_by_customer', metadata: { motivo, sesion: sesionId } },
        // Si el webhook se reintenta, Stripe no devuelve el dinero dos veces.
        { idempotencyKey: `reembolso-${sesionId}` },
      );
    },

    async anotar(eventoId, tipo) {
      const { error } = await bd()
        .from('eventos_stripe')
        .upsert({ id: eventoId, tipo }, { onConflict: 'id', ignoreDuplicates: true });
      if (error) throw new Error(error.message);
    },
    async marcarReembolsado(pagoId) {
      // El disparador de estados valida el cambio y deja constancia en el historial.
      const { data, error } = await bd()
        .from('pedidos')
        .update({ estado: 'reembolsado' })
        .eq('stripe_pago_id', pagoId)
        .neq('estado', 'reembolsado')
        .select('id');
      if (error) throw new Error(error.message);
      return data.length;
    },
  };
}

const responder = (estado: number, mensaje: string) => Response.json({ mensaje }, { status: estado });

/** Los eventos de Stripe ocupan unos pocos KB; más que esto no es suyo. */
const MAX_CUERPO_WEBHOOK = 256 * 1024;

/**
 * Punto de entrada de la ruta del webhook: limita el tamaño del cuerpo,
 * comprueba la firma de Stripe y delega en `procesarEvento`. Un 5xx pide
 * a Stripe que reintente.
 */
export async function manejarWebhook(peticion: Request): Promise<Response> {
  if (!stripeConfigurado()) return responder(503, 'Stripe no está configurado.');

  let stripe: Stripe;
  let secreto: string;
  try {
    stripe = clienteStripe();
    secreto = entornoStripe().STRIPE_WEBHOOK_SECRET;
  } catch (error) {
    console.error(error);
    return responder(500, 'La configuración de Stripe está incompleta.');
  }

  const firma = peticion.headers.get('stripe-signature');
  if (!firma) return responder(400, 'Falta la firma de Stripe.');

  if (Number(peticion.headers.get('content-length') ?? 0) > MAX_CUERPO_WEBHOOK) {
    return responder(413, 'Cuerpo demasiado grande.');
  }
  // La firma se calcula sobre el cuerpo exacto: hay que leerlo como texto.
  const cuerpo = await peticion.text();
  if (cuerpo.length > MAX_CUERPO_WEBHOOK) return responder(413, 'Cuerpo demasiado grande.');
  let evento: Stripe.Event;
  try {
    evento = stripe.webhooks.constructEvent(cuerpo, firma, secreto);
  } catch {
    return responder(400, 'Firma no válida.');
  }

  try {
    const { estado, mensaje } = await procesarEvento(evento, dependencias());
    return responder(estado, mensaje);
  } catch (error) {
    console.error(`Fallo al procesar el evento ${evento.id}`, error);
    return responder(500, 'Error temporal; Stripe lo reintentará.');
  }
}
