import { afterEach, describe, expect, it, vi } from 'vitest';
import { claveFicticia } from './claves-ficticias';
import { stripeConfigurado } from './stripe';

vi.mock('server-only', () => ({}));

describe('¿hay Stripe configurado?', () => {
  const anterior = process.env.STRIPE_SECRET_KEY;
  afterEach(() => {
    process.env.STRIPE_SECRET_KEY = anterior;
  });

  it('el valor de .env.example sin rellenar deja la tienda en modo demostración', () => {
    for (const valor of ['', '   ', 'sk_test_', 'sk_test_corta', claveFicticia('sk_live', 'ClaveRealQueNuncaDebeFuncionar1234')]) {
      process.env.STRIPE_SECRET_KEY = valor;
      expect(stripeConfigurado()).toBe(false);
    }
  });

  it('una clave de prueba completa activa el pago con Stripe', () => {
    process.env.STRIPE_SECRET_KEY = claveFicticia('sk_test', '51AbCdEfGhIjKlMnOpQrStUvWxYz0123456789');
    expect(stripeConfigurado()).toBe(true);
  });
});
