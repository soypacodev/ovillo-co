// La fuente de Supabase contra un PostgREST simulado: comprueba qué
// consultas lanza y que, con los mismos datos, responde igual que la semilla.

import { createClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { CATEGORIAS, ENVIOS, PRODUCTOS, PROMOCIONES } from '@/datos/semilla';
import type { FiltrosCatalogo } from './filtros';
import { crearFuenteSupabase } from './fuente-supabase';
import { fuenteSemilla } from './fuente-semilla';

const URL_SUPABASE = 'https://ejemplo.supabase.co';

const filaProducto = (p: (typeof PRODUCTOS)[number], posicion: number) => ({
  slug: p.slug,
  nombre: p.nombre,
  tipo: p.tipo,
  precio: p.precio,
  antes: p.antes,
  destacado: p.destacado,
  novedad: p.novedad,
  encargo: p.encargo,
  dias: p.dias,
  etiqueta: p.etiqueta,
  corto: p.corto,
  largo: p.largo,
  historia: p.historia,
  materiales: p.materiales,
  cuidados: p.cuidados,
  medidas: p.medidas,
  personalizacion_etiqueta: p.personalizable?.etiqueta ?? null,
  personalizacion_ejemplo: p.personalizable?.ejemplo ?? null,
  personalizacion_max: p.personalizable?.max ?? null,
  personalizacion_pista: p.personalizable?.pista ?? null,
  contenido: p.contenido ?? null,
  posicion,
  categoria: { slug: p.categoria },
  variantes: p.variantes.map((v, i) => ({ ...v, posicion: i })),
  fotos: p.fotos.map((f, i) => ({ ruta: f.src, alt: f.alt, posicion: i })),
});

const TABLAS: Record<string, unknown[]> = {
  categorias: CATEGORIAS.map((c) => ({
    slug: c.slug,
    nombre: c.nombre,
    texto: c.texto,
    foto_ruta: c.foto.src,
    foto_alt: c.foto.alt,
  })),
  productos: PRODUCTOS.map(filaProducto),
  // RLS ya solo deja ver las automáticas.
  promociones: PROMOCIONES.filter((p) => p.codigo === null).map((p) => ({
    ...p,
    categoria: p.categoria ? { slug: p.categoria } : null,
  })),
  metodos_envio: ENVIOS.map((e) => ({
    id: e.id,
    nombre: e.nombre,
    precio: e.precio,
    gratis_desde: e.gratisDesde,
    plazo: e.plazo,
  })),
};

/** Simula PostgREST: solo resuelve «slug=eq.» y la función buscar_cupon. */
function preparar() {
  const peticiones: URL[] = [];
  const fetchFalso: typeof fetch = async (entrada, init) => {
    const url = new URL(entrada instanceof Request ? entrada.url : String(entrada));
    peticiones.push(url);
    const ruta = url.pathname.replace('/rest/v1/', '');

    let cuerpo: unknown;
    if (ruta === 'rpc/buscar_cupon') {
      const { p_codigo } = JSON.parse(String(init?.body)) as { p_codigo: string };
      cuerpo = PROMOCIONES.filter((p) => p.codigo === p_codigo.trim().toUpperCase()).map((p) => ({
        ...p,
        categoria: p.categoria,
      }));
    } else {
      const slug = url.searchParams.get('slug')?.replace(/^eq\./, '');
      const filas = (TABLAS[ruta] ?? []).filter(
        (f) => !slug || (f as { slug: string }).slug === slug,
      );
      const cabeceras = new Headers(init?.headers);
      const unObjeto = cabeceras.get('Accept')?.includes('vnd.pgrst.object');
      cuerpo = unObjeto ? (filas[0] ?? null) : filas;
    }
    return new Response(JSON.stringify(cuerpo), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const cliente = createClient(URL_SUPABASE, 'clave-anonima-de-prueba-larga', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: fetchFalso },
  });
  return { fuente: crearFuenteSupabase(cliente, URL_SUPABASE), peticiones };
}

describe('fuente de Supabase', () => {
  it('pide solo lo publicado y traslada los filtros sencillos a la consulta', async () => {
    const { fuente, peticiones } = preparar();
    await fuente.productos({
      categorias: ['accesorios', 'hogar'],
      rangos: ['hasta-20', 'desde-70'],
      extras: ['ofertas', 'encargo', 'novedades'],
    });
    const consulta = peticiones[0].searchParams;
    expect(peticiones[0].pathname).toBe('/rest/v1/productos');
    expect(consulta.get('estado')).toBe('eq.publicado');
    expect(consulta.get('categoria.slug')).toBe('in.(accesorios,hogar)');
    expect(consulta.get('or')).toBe('(and(precio.gte.0,precio.lte.1999),precio.gte.7001)');
    expect(consulta.get('antes')).toBe('not.is.null');
    expect(consulta.get('encargo')).toBe('eq.true');
    expect(consulta.get('novedad')).toBe('eq.true');
    expect(consulta.get('select')).toContain('categoria:categorias!productos_categoria_id_fkey!inner(slug)');
  });

  it('con los mismos datos responde igual que la semilla', async () => {
    const { fuente } = preparar();
    const casos: FiltrosCatalogo[] = [
      {},
      { orden: 'barato' },
      { orden: 'az' },
      { busqueda: 'bebé' },
      { busqueda: 'COJIN' },
      { categorias: ['accesorios'], extras: ['stock'] },
    ];
    for (const filtros of casos) {
      expect(await fuente.productos(filtros)).toEqual(await fuenteSemilla.productos(filtros));
    }
    expect(await fuente.producto('manta-estrella')).toEqual(await fuenteSemilla.producto('manta-estrella'));
    expect(await fuente.relacionados('pulpito-reversible')).toEqual(
      await fuenteSemilla.relacionados('pulpito-reversible'),
    );
    expect(await fuente.categorias()).toEqual(await fuenteSemilla.categorias());
    expect(await fuente.promociones()).toEqual(await fuenteSemilla.promociones());
    expect(await fuente.metodosEnvio()).toEqual(await fuenteSemilla.metodosEnvio());
  });

  it('un slug inexistente devuelve null', async () => {
    const { fuente } = preparar();
    expect(await fuente.producto('no-existe')).toBeNull();
    expect(await fuente.categoria('bebe')).toEqual(await fuenteSemilla.categoria('bebe'));
  });

  it('los cupones se comprueban por función, no leyendo la tabla', async () => {
    const { fuente, peticiones } = preparar();
    expect((await fuente.cupon('hola10'))?.codigo).toBe('HOLA10');
    expect(peticiones.at(-1)?.pathname).toBe('/rest/v1/rpc/buscar_cupon');
    expect(await fuente.cupon('NOEXISTE')).toBeNull();
    const antes = peticiones.length;
    expect(await fuente.cupon('   ')).toBeNull();
    expect(peticiones.length).toBe(antes);
  });
});
