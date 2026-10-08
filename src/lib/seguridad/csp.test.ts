import { describe, expect, it } from 'vitest';
import { politicaSeguridad } from './csp';

const directivas = (csp: string) =>
  Object.fromEntries(csp.split('; ').map((d) => [d.split(' ')[0], d.split(' ').slice(1)]));

describe('política de seguridad de contenido', () => {
  it('en producción solo ejecuta scripts con el nonce de la respuesta', () => {
    const d = directivas(politicaSeguridad('abc', false, true));
    expect(d['script-src']).toContain("'nonce-abc'");
    expect(d['script-src']).not.toContain("'unsafe-inline'");
    expect(d['script-src']).not.toContain("'unsafe-eval'");
    expect(d['style-src']).not.toContain("'unsafe-inline'");
    expect(d['frame-ancestors']).toEqual(["'none'"]);
    expect(d['object-src']).toEqual(["'none'"]);
    expect(d['upgrade-insecure-requests']).toEqual([]);
  });

  it('el navegador no puede mandar datos a ningún otro dominio', () => {
    const d = directivas(politicaSeguridad('abc', false, true));
    expect(d['connect-src']).toEqual(["'self'"]);
  });

  it('en local por http no fuerza https', () => {
    expect(politicaSeguridad('abc', true, false)).not.toContain('upgrade-insecure-requests');
  });
});
