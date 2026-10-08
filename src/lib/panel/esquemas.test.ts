import { describe, expect, it } from 'vitest';
import {
  aCentimos,
  aParametrosGuardado,
  aSlug,
  esquemaEstadoEncargo,
  esquemaEstadoMensaje,
  esquemaEstadoPedido,
  esquemaProducto,
  esquemaSubidaFotos,
  leerFormularioProducto,
} from './esquemas';

const ID = '00000000-0000-4000-8000-000000000001';

function formulario(campos: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(campos)) f.append(k, v);
  return f;
}

const PRODUCTO = {
  id: '',
  nombre: 'Cojín de relieve',
  slug: '',
  categoria: 'hogar',
  tipo: 'simple',
  estado: 'borrador',
  precio: '34,00',
  antes: '',
  'variantes.0.id': '',
  'variantes.0.nombre': 'Crudo',
  'variantes.0.color': '#D9C7AE',
  'variantes.0.sku': '',
  'variantes.0.stock': '5',
  'variantes.0.activa': 'on',
};

const producto = (cambios: Record<string, string> = {}) =>
  esquemaProducto.safeParse(leerFormularioProducto(formulario({ ...PRODUCTO, ...cambios })));

describe('importes y direcciones', () => {
  it('convierte euros escritos a mano en céntimos', () => {
    expect(aCentimos('12,50')).toBe(1250);
    expect(aCentimos('12.5')).toBe(1250);
    expect(aCentimos('1.250,00 €')).toBe(125000);
    expect(aCentimos('')).toBeNull();
    expect(aCentimos('doce')).toBeNaN();
  });

  it('sugiere la dirección a partir del nombre', () => {
    expect(aSlug('Cojín de relieve')).toBe('cojin-de-relieve');
    expect(aSlug('  Pack «cocina» (3) ')).toBe('pack-cocina-3');
  });
});

describe('estado de un pedido', () => {
  it('acepta un cambio válido y normaliza el seguimiento', () => {
    const r = esquemaEstadoPedido.parse({ id: ID, estado: 'enviado', transportista: 'Correos', numero_seguimiento: ' pk 123 456 es ' });
    expect(r).toMatchObject({ estado: 'enviado', numero_seguimiento: 'PK123456ES', nota_admin: null });
  });

  it('rechaza estados inventados, ids que no son UUID y seguimientos raros', () => {
    expect(esquemaEstadoPedido.safeParse({ id: ID, estado: 'perdido' }).success).toBe(false);
    expect(esquemaEstadoPedido.safeParse({ id: '1; drop table', estado: 'enviado' }).success).toBe(false);
    expect(esquemaEstadoPedido.safeParse({ id: ID, estado: 'enviado', numero_seguimiento: '<script>' }).success).toBe(false);
  });

  it('encargos y mensajes solo admiten sus estados', () => {
    expect(esquemaEstadoEncargo.safeParse({ id: ID, estado: 'aceptado' }).success).toBe(true);
    expect(esquemaEstadoEncargo.safeParse({ id: ID, estado: 'enviado' }).success).toBe(false);
    expect(esquemaEstadoMensaje.safeParse({ id: ID, estado: 'archivado' }).success).toBe(true);
    expect(esquemaEstadoMensaje.safeParse({ id: ID, estado: 'borrado' }).success).toBe(false);
  });
});

describe('producto', () => {
  it('lee variantes del formulario y prepara lo que pide la base de datos', () => {
    const r = producto({ 'variantes.1.id': '', 'variantes.1.nombre': 'Gris', 'variantes.1.color': '#A7A9AC', 'variantes.1.stock': '0' });
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.slug).toBe('cojin-de-relieve');
    expect(r.data.precio).toBe(3400);
    expect(r.data.variantes).toEqual([
      { id: null, nombre: 'Crudo', color: '#D9C7AE', sku: '', stock: 5, activa: true },
      // Sin casilla marcada no llega «activa»: queda inactiva.
      { id: null, nombre: 'Gris', color: '#A7A9AC', sku: '', stock: 0, activa: false },
    ]);
    const p = aParametrosGuardado(r.data);
    expect(p.p_id).toBeNull();
    expect(p.p_producto.contenido).toBeNull();
    expect(p.p_variantes[0].sku).toBeNull();
    expect(p.p_producto).not.toHaveProperty('variantes');
  });

  it('aplica las mismas reglas que los check de la base de datos', () => {
    const errores = (r: ReturnType<typeof producto>) => (r.success ? [] : r.error.issues.map((i) => i.path.join('.')));
    expect(errores(producto({ antes: '30' }))).toContain('antes');
    expect(errores(producto({ encargo: 'on' }))).toContain('dias');
    expect(errores(producto({ encargo: 'on', dias: '12' }))).toEqual([]);
    expect(errores(producto({ personalizacion_etiqueta: 'Iniciales' }))).toContain('personalizacion_max');
    expect(errores(producto({ contenido: 'Un paño' }))).toContain('contenido');
    expect(errores(producto({ slug: 'Con Espacios' }))).toContain('slug');
    expect(errores(producto({ slug: 'nuevo' }))).toContain('slug');
    expect(errores(producto({ precio: 'gratis' }))).toContain('precio');
    expect(errores(producto({ 'variantes.0.stock': '-1' }))).toContain('variantes.0.stock');
    expect(errores(producto({ 'variantes.0.color': 'rojo' }))).toContain('variantes.0.color');
    expect(errores(producto({ 'variantes.1.nombre': 'crudo', 'variantes.1.color': '#000000', 'variantes.1.stock': '1' }))).toContain(
      'variantes.1.nombre',
    );
  });

  it('un pack guarda su contenido', () => {
    const r = producto({ tipo: 'pack', contenido: 'Paño\n\n  Agarrador  ' });
    expect(r.success && aParametrosGuardado(r.data).p_producto.contenido).toEqual(['Paño', 'Agarrador']);
  });
});

describe('subida de fotos', () => {
  const jpeg = (bytes = 100) => new File([new Uint8Array([0xff, 0xd8, 0xff, ...new Array(bytes).fill(0)])], 'a.jpg', { type: 'image/jpeg' });

  it('acepta imágenes de verdad y exige texto alternativo', async () => {
    expect((await esquemaSubidaFotos.safeParseAsync({ producto_id: ID, alt: 'Cojín crudo', fotos: [jpeg()] })).success).toBe(true);
    expect((await esquemaSubidaFotos.safeParseAsync({ producto_id: ID, alt: '', fotos: [jpeg()] })).success).toBe(false);
  });

  it('rechaza archivos que dicen ser imagen y no lo son, y demasiadas fotos', async () => {
    const falsa = new File(['<?php echo 1; ?>'], 'a.jpg', { type: 'image/jpeg' });
    expect((await esquemaSubidaFotos.safeParseAsync({ producto_id: ID, alt: 'Foto', fotos: [falsa] })).success).toBe(false);
    const muchas = Array.from({ length: 7 }, () => jpeg());
    expect((await esquemaSubidaFotos.safeParseAsync({ producto_id: ID, alt: 'Foto', fotos: muchas })).success).toBe(false);
  });
});
