import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Perfil } from './tipos';

const updateUser = vi.fn();
const perfilActual = vi.fn<() => Promise<Perfil | null>>();

vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({ headers: async () => new Headers() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('@/lib/datos/entorno', () => ({
  configuracionSupabase: () => ({ url: 'https://proyecto.supabase.co', claveAnonima: 'anon' }),
}));
vi.mock('@/lib/datos/supabase/servidor', () => ({ clienteServidor: async () => ({ auth: { updateUser } }) }));
vi.mock('@/lib/datos/supabase/publico', () => ({ clientePublico: vi.fn() }));
vi.mock('@/lib/origen', () => ({ origenSitio: async () => 'https://tienda.example' }));
vi.mock('./sesion', () => ({ perfilActual, usuarioActual: vi.fn() }));

const { cambiarContrasena } = await import('./acciones-acceso');
const { ACCION_INICIAL } = await import('./tipos');

const perfil = (rol: Perfil['rol']): Perfil => ({
  id: '00000000-0000-4000-8000-000000000001',
  email: 'cuenta@ovilloandco.example',
  rol,
  nombre: '',
  telefono: '',
  aceptaBoletin: false,
});

function formulario(contrasena: string): FormData {
  const f = new FormData();
  f.set('contrasena', contrasena);
  f.set('repetida', contrasena);
  return f;
}

describe('cambiar la contraseña', () => {
  beforeEach(() => {
    updateUser.mockReset().mockResolvedValue({ error: null });
    perfilActual.mockReset();
  });

  it('la cuenta compartida de demostración no puede cambiarla', async () => {
    perfilActual.mockResolvedValue(perfil('demo'));
    const r = await cambiarContrasena(ACCION_INICIAL, formulario('una frase nueva y larga'));
    expect(r.estado).toBe('error');
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('una clienta con sesión sí puede', async () => {
    perfilActual.mockResolvedValue(perfil('cliente'));
    const r = await cambiarContrasena(ACCION_INICIAL, formulario('una frase nueva y larga'));
    expect(r.estado).toBe('ok');
    expect(updateUser).toHaveBeenCalledWith({ password: 'una frase nueva y larga' });
  });

  it('sin sesión no llega a Supabase', async () => {
    perfilActual.mockResolvedValue(null);
    const r = await cambiarContrasena(ACCION_INICIAL, formulario('una frase nueva y larga'));
    expect(r.estado).toBe('error');
    expect(updateUser).not.toHaveBeenCalled();
  });
});
