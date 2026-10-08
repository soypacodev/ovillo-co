import { describe, expect, it } from 'vitest';
import { MOTIVO_SOLO_LECTURA, accesoPanel, permisoEscritura } from './acceso';
import { TRANSICIONES_PEDIDO, puedePasarA } from './estados';

describe('acceso al panel', () => {
  it('sin base de datos se abre en modo local de solo lectura', () => {
    expect(accesoPanel(null, false)).toEqual({ modo: 'local', rol: 'demo', soloLectura: true });
    // Ni siquiera un admin escribe sin base de datos.
    expect(permisoEscritura(accesoPanel('admin', false))).toEqual({ ok: false, motivo: MOTIVO_SOLO_LECTURA });
  });

  it('con base de datos solo entran admin y demo', () => {
    expect(accesoPanel(null, true)).toBeNull();
    expect(accesoPanel('cliente', true)).toBeNull();
    expect(accesoPanel('demo', true)).toEqual({ modo: 'supabase', rol: 'demo', soloLectura: true });
    expect(accesoPanel('admin', true)).toEqual({ modo: 'supabase', rol: 'admin', soloLectura: false });
  });

  it('solo admin puede escribir; el resto recibe el motivo', () => {
    expect(permisoEscritura(accesoPanel('admin', true))).toEqual({ ok: true });
    expect(permisoEscritura(accesoPanel('demo', true))).toEqual({ ok: false, motivo: MOTIVO_SOLO_LECTURA });
    const cliente = permisoEscritura(accesoPanel('cliente', true));
    expect(cliente.ok).toBe(false);
    expect(!cliente.ok && cliente.motivo).toMatch(/solo para el taller/);
  });
});

describe('caminos de un pedido', () => {
  it('coinciden con el trigger de la base de datos', () => {
    expect(puedePasarA('pagado', 'enviado')).toBe(true);
    expect(puedePasarA('enviado', 'pagado')).toBe(false);
    expect(puedePasarA('entregado', 'cancelado')).toBe(false);
    expect(puedePasarA('cancelado', 'reembolsado')).toBe(true);
    expect(TRANSICIONES_PEDIDO.reembolsado).toEqual([]);
    expect(puedePasarA('enviado', 'enviado')).toBe(true);
  });
});
