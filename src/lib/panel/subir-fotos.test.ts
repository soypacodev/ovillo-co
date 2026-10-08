import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const subidas: Uint8Array[] = [];
const upload = vi.fn(async (_ruta: string, cuerpo: Uint8Array) => {
  subidas.push(cuerpo);
  return { error: null };
});

/** Lo justo de supabase-js para subirFotosProducto: storage y fotos_producto. */
const consulta = {
  select: () => consulta,
  eq: () => consulta,
  order: () => consulta,
  limit: () => consulta,
  maybeSingle: async () => ({ data: null }),
  insert: async () => ({ error: null }),
};
const supabase = { from: () => consulta, storage: { from: () => ({ upload, remove: vi.fn() }) } };

vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn(), notFound: vi.fn() }));
vi.mock('@/lib/datos/supabase/servidor', () => ({ clienteServidor: async () => supabase }));
vi.mock('./servidor', () => ({ permisoParaEscribir: async () => ({ ok: true }) }));

const { subirFotosProducto } = await import('./acciones');

describe('subir fotos de producto', () => {
  beforeEach(() => {
    subidas.length = 0;
    upload.mockClear();
  });

  it('el bucket público recibe la foto sin el GPS ni los datos del móvil', async () => {
    const foto = readFileSync(new URL('../../../public/fotos/portada.jpg', import.meta.url));
    const privado = 'GPS 36.7213 -4.4214';
    const texto = Array.from(`Exif\0\0MM\0*\0\0\0\x08\0\0\0\0\0\0${privado}`, (c) => c.charCodeAt(0));
    const app1 = [0xff, 0xe1, (texto.length + 2) >> 8, (texto.length + 2) & 0xff, ...texto];
    const conGps = new Uint8Array([0xff, 0xd8, ...app1, ...foto.subarray(2)]);

    const f = new FormData();
    f.set('producto_id', '00000000-0000-4000-8000-000000000001');
    f.set('alt', 'Manta de estrellas sobre la cama');
    f.append('fotos', new File([conGps], 'IMG_0001.jpg', { type: 'image/jpeg' }));

    const r = await subirFotosProducto({ estado: 'inicial' }, f);
    expect(r.estado).toBe('ok');
    expect(subidas).toHaveLength(1);
    expect(Buffer.from(subidas[0]).includes(Buffer.from(privado))).toBe(false);
  });
});
