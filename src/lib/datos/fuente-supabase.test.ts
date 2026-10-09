// La fuente de Supabase contra un PostgREST simulado: comprueba qué
// consultas lanza y que, con los mismos datos, responde igual que la semilla.

import { createClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { CATEGORIAS, ENVIOS, PRODUCTOS, PROMOCIONES } from '@/datos/semilla';
import { TRADUCCIONES_CATEGORIAS, TRADUCCIONES_PRODUCTOS } from '@/datos/traducciones-catalogo';
import { TRADUCCIONES_ENVIOS, TRADUCCIONES_PROMOCIONES } from '@/datos/traducciones-tarifas';
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
  variante_etiqueta: p.etiquetaVariante,
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
  traducciones: TRADUCCIONES_PRODUCTOS[p.slug] ?? {},
  categoria: { slug: p.categoria },
  variantes: p.variantes.map(({ foto, ...v }, i) => ({ ...v, foto_ruta: foto?.src ?? null, posicion: i })),
  fotos: p.fotos.map((f, i) => ({ ruta: f.src, alt: f.alt, posicion: i })),
});

const TABLAS: Record<string, unknown[]> = {
  categorias: CATEGORIAS.map((c) => ({
    slug: c.slug,
    nombre: c.nombre,
    texto: c.texto,
    foto_ruta: c.foto.src,
    foto_alt: c.foto.alt,
    traducciones: TRADUCCIONES_CATEGORIAS[c.slug] ?? {},
  })),
  productos: PRODUCTOS.map(filaProducto),
  // RLS ya solo deja ver las automáticas.
  promociones: PROMOCIONES.filter((p) => p.codigo === null).map((p) => ({
    ...p,
    traducciones: TRADUCCIONES_PROMOCIONES[p.nombre] ?? {},
    categoria: p.categoria ? { slug: p.categoria } : null,
  })),
  metodos_envio: ENVIOS.map((e) => ({
    id: e.id,
    nombre: e.nombre,
    precio: e.precio,
    gratis_desde: e.gratisDesde,
    plazo: e.plazo,
    traducciones: TRADUCCIONES_ENVIOS[e.id] ?? {},
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
        traducciones: TRADUCCIONES_PROMOCIONES[p.nombre] ?? {},
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
      rangos: ['hasta-20', 'desde-50'],
      extras: ['ofertas', 'encargo', 'novedades'],
    });
    const productos = peticiones.find((u) => u.pathname === '/rest/v1/productos');
    if (!productos) throw new Error('No se pidieron los productos');
    const consulta = productos.searchParams;
    expect(consulta.get('estado')).toBe('eq.publicado');
    expect(consulta.get('categoria.slug')).toBe('in.(accesorios,hogar)');
    expect(consulta.get('encargo')).toBe('eq.true');
    expect(consulta.get('novedad')).toBe('eq.true');
    expect(consulta.get('select')).toContain('categoria:categorias!productos_categoria_id_fkey!inner(slug)');
    // Precio y ofertas van con la rebaja automática aplicada: no se filtran en la base de datos.
    expect(consulta.get('or')).toBeNull();
    expect(consulta.get('antes')).toBeNull();
    expect(peticiones.some((u) => u.pathname === '/rest/v1/promociones')).toBe(true);
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
      { extras: ['ofertas'] },
      { rangos: ['hasta-20', '30-50'], orden: 'caro' },
    ];
    for (const filtros of casos) {
      expect(await fuente.productos(filtros)).toEqual(await fuenteSemilla.productos(filtros));
    }
    expect(await fuente.producto('manta-estrella')).toEqual(await fuenteSemilla.producto('manta-estrella'));
    expect(await fuente.producto('bolso-red-mercado')).toEqual(await fuenteSemilla.producto('bolso-red-mercado'));
    expect(await fuente.relacionados('osita-vestido-lila')).toEqual(
      await fuenteSemilla.relacionados('osita-vestido-lila'),
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
