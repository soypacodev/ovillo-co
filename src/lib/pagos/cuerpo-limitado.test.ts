import { describe, expect, it } from 'vitest';
import { leerCuerpoLimitado } from './cuerpo-limitado';

const peticion = (cuerpo: string, cabeceras: Record<string, string> = {}) =>
  new Request('https://tienda.example/api/stripe/webhook', { method: 'POST', body: cuerpo, headers: cabeceras });

describe('leerCuerpoLimitado', () => {
  it('devuelve los bytes exactos del cuerpo', async () => {
    const bytes = await leerCuerpoLimitado(peticion('{"id":"evt_ñ"}'), 100);
    expect(new TextDecoder().decode(bytes ?? undefined)).toBe('{"id":"evt_ñ"}');
  });

  it('mide en bytes, no en caracteres', async () => {
    // 10 emojis son 20 unidades de texto pero 40 bytes en UTF-8.
    const texto = '🧶'.repeat(10);
    expect(texto.length).toBeLessThanOrEqual(30);
    expect(await leerCuerpoLimitado(peticion(texto), 30)).toBeNull();
    expect((await leerCuerpoLimitado(peticion(texto), 40))?.byteLength).toBe(40);
  });

  it('rechaza sin leer si la cabecera ya declara demasiado', async () => {
    const p = peticion('{}', { 'content-length': '999999' });
    expect(await leerCuerpoLimitado(p, 1024)).toBeNull();
  });
});
