import { describe, expect, it, vi } from 'vitest';
import { LONGITUD_MINIMA_SECRETO, mantenerActivo, type DependenciasMantenerActivo } from './mantener-activo';

const SECRETO = 'secreto-de-prueba-largo-123';

function dependencias(cambios: Partial<DependenciasMantenerActivo> = {}) {
  const consultar = vi.fn<DependenciasMantenerActivo['consultar']>().mockResolvedValue({ error: null });
  const deps: DependenciasMantenerActivo = { secreto: SECRETO, hayBaseDeDatos: true, consultar, ...cambios };
  return { deps, consultar: deps.consultar as typeof consultar };
}

describe('mantenerActivo', () => {
  it('con el secreto correcto hace una sola consulta y responde 200', async () => {
    const { deps, consultar } = dependencias();
    const r = await mantenerActivo(`Bearer ${SECRETO}`, deps);
    expect(r).toEqual({ estado: 200, cuerpo: { ok: true, consulta: true } });
    expect(consultar).toHaveBeenCalledTimes(1);
  });

  it('sin cabecera Authorization responde 401 y no consulta', async () => {
    const { deps, consultar } = dependencias();
    const r = await mantenerActivo(null, deps);
    expect(r.estado).toBe(401);
    expect(consultar).not.toHaveBeenCalled();
  });

  it.each([
    ['otro secreto', 'Bearer otro-secreto-distinto-123'],
    ['sin «Bearer»', SECRETO],
    ['vacío', ''],
    ['con la longitud del secreto pero distinto', `Bearer ${'x'.repeat(SECRETO.length)}`],
  ])('con %s responde 401 y no consulta', async (_caso, cabecera) => {
    const { deps, consultar } = dependencias();
    const r = await mantenerActivo(cabecera, deps);
    expect(r.estado).toBe(401);
    expect(consultar).not.toHaveBeenCalled();
  });

  it('sin CRON_SECRET se cierra con 503, aunque llegue una cabecera, y no consulta', async () => {
    const { deps, consultar } = dependencias({ secreto: undefined });
    const r = await mantenerActivo('Bearer undefined', deps);
    expect(r.estado).toBe(503);
    expect(r.cuerpo.ok).toBe(false);
    expect(consultar).not.toHaveBeenCalled();
  });

  it('un secreto vacío o demasiado corto también se cierra con 503', async () => {
    for (const secreto of ['', 'x'.repeat(LONGITUD_MINIMA_SECRETO - 1)]) {
      const { deps, consultar } = dependencias({ secreto });
      const r = await mantenerActivo(`Bearer ${secreto}`, deps);
      expect(r.estado).toBe(503);
      expect(consultar).not.toHaveBeenCalled();
    }
  });

  it('sin Supabase (modo demostración) responde 200 sin consultar', async () => {
    const { deps, consultar } = dependencias({ hayBaseDeDatos: false });
    const r = await mantenerActivo(`Bearer ${SECRETO}`, deps);
    expect(r).toEqual({ estado: 200, cuerpo: { ok: true, consulta: false } });
    expect(consultar).not.toHaveBeenCalled();
  });

  it('si Supabase devuelve un error responde 502 con el motivo, no un 200 falso', async () => {
    const { deps } = dependencias({ consultar: async () => ({ error: { message: 'project is paused' } }) });
    const r = await mantenerActivo(`Bearer ${SECRETO}`, deps);
    expect(r.estado).toBe(502);
    expect(r.cuerpo).toEqual({ ok: false, error: expect.stringContaining('project is paused') });
  });
});
