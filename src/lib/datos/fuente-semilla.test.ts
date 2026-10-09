import { describe, expect, it } from 'vitest';
import { PRODUCTOS } from '@/datos/semilla';
import { precioVenta } from '@/lib/catalogo/precio';
import { filtrosAParametros, leerFiltros, normalizarTexto, stockTotal } from './filtros';
import { fuenteSemilla as fuente } from './fuente-semilla';

const slugs = (lista: { slug: string }[]) => lista.map((p) => p.slug);

describe('fuente de la semilla', () => {
  it('se identifica como semilla', () => {
    expect(fuente.origen).toBe('semilla');
  });

  it('devuelve todo el catálogo sin filtros, destacados primero', async () => {
    const productos = await fuente.productos();
    expect(productos).toHaveLength(PRODUCTOS.length);
    const primerNoDestacado = productos.findIndex((p) => !p.destacado);
    expect(productos.slice(primerNoDestacado).every((p) => !p.destacado)).toBe(true);
  });

  it('dentro de los destacados pone delante lo que tiene stock', async () => {
    const productos = await fuente.productos();
    const sinDestacar = productos.filter((p) => !p.destacado);
    const primeraAgotada = sinDestacar.findIndex((p) => stockTotal(p) === 0);
    expect(primeraAgotada).toBeGreaterThan(-1);
    expect(sinDestacar.slice(primeraAgotada).every((p) => stockTotal(p) === 0)).toBe(true);
  });

  describe('filtros', () => {
    it('por categoría', async () => {
      const productos = await fuente.productos({ categorias: ['accesorios'] });
      expect(slugs(productos).sort()).toEqual(['bolso-red-mercado', 'gorro-pompon', 'scrunchies-degradado']);
    });

    it('varias categorías se suman', async () => {
      const productos = await fuente.productos({ categorias: ['hogar', 'packs'] });
      expect(productos.every((p) => p.categoria === 'hogar' || p.categoria === 'packs')).toBe(true);
      expect(productos).toHaveLength(4);
    });

    it('por rango del precio final, con los extremos incluidos', async () => {
      const productos = await fuente.productos({ rangos: ['20-30'] });
      expect(productos.length).toBeGreaterThan(0);
      expect(productos.map((p) => precioVenta(p).final).every((precio) => precio >= 2001 && precio <= 3000)).toBe(true);
      // El gorro cuesta 26 € de catálogo y 22,10 € con la rebaja de accesorios.
      expect(slugs(productos)).toContain('gorro-pompon');
      expect(slugs(await fuente.productos({ rangos: ['hasta-20'] }))).toContain('bolso-red-mercado');
      expect(slugs(await fuente.productos({ rangos: ['desde-50'] }))).toEqual(['manta-estrella']);
    });

    it('cada rango de precio tiene alguna pieza', async () => {
      for (const rango of ['hasta-20', '20-30', '30-50', 'desde-50'] as const) {
        expect((await fuente.productos({ rangos: [rango] })).length).toBeGreaterThan(0);
      }
    });

    it('en oferta: lo que tiene precio anterior y lo que tiene rebaja automática', async () => {
      const productos = await fuente.productos({ extras: ['ofertas'] });
      expect(slugs(productos).sort()).toEqual([
        'bolso-red-mercado',
        'gorro-pompon',
        'pack-cocina',
        'scrunchies-degradado',
        'set-recien-nacido',
      ]);
    });

    it('listo para enviar: no es por encargo y queda stock', async () => {
      const productos = await fuente.productos({ extras: ['stock'] });
      expect(productos.every((p) => !p.encargo && stockTotal(p) > 0)).toBe(true);
      expect(slugs(productos)).not.toContain('scrunchies-degradado');
      expect(slugs(productos)).not.toContain('manta-estrella');
    });

    it('los filtros se acumulan', async () => {
      const productos = await fuente.productos({ categorias: ['accesorios'], extras: ['ofertas', 'stock'] });
      expect(slugs(productos)).toEqual(['bolso-red-mercado']);
    });
  });

  describe('búsqueda', () => {
    it('no distingue tildes ni mayúsculas', async () => {
      const conTilde = await fuente.productos({ busqueda: 'COJÍN' });
      const sinTilde = await fuente.productos({ busqueda: 'cojin' });
      expect(slugs(conTilde)).toEqual(['cojin-relieve']);
      expect(sinTilde).toEqual(conTilde);
    });

    it('encuentra por el nombre de la categoría', async () => {
      const productos = await fuente.productos({ busqueda: 'bebé' });
      expect(slugs(productos)).toEqual(expect.arrayContaining(['manta-estrella', 'guirnalda-corazones']));
    });

    it('busca cada palabra por separado', async () => {
      const productos = await fuente.productos({ busqueda: 'estrella manta' });
      expect(slugs(productos)).toEqual(['manta-estrella']);
    });

    it('sin coincidencias devuelve una lista vacía', async () => {
      expect(await fuente.productos({ busqueda: 'submarino' })).toEqual([]);
    });

    it('ignora la puntuación', async () => {
      expect(normalizarTexto('  ¡Cojín, de RELIEVE!  ')).toBe('cojin de relieve');
      expect(normalizarTexto('Año')).toBe('ano');
    });
  });

  describe('orden', () => {
    it('precio de menor a mayor y al revés', async () => {
      const baratos = (await fuente.productos({ orden: 'barato' })).map((p) => precioVenta(p).final);
      expect(baratos).toEqual([...baratos].sort((a, b) => a - b));
      const caros = (await fuente.productos({ orden: 'caro' })).map((p) => precioVenta(p).final);
      expect(caros).toEqual([...caros].sort((a, b) => b - a));
    });

    it('nombre A–Z con reglas del español', async () => {
      const nombres = (await fuente.productos({ orden: 'az' })).map((p) => p.nombre);
      expect(nombres).toEqual([...nombres].sort((a, b) => a.localeCompare(b, 'es')));
      expect(nombres[0]).toBe('Bolso de red para el mercado');
    });

    it('novedades primero', async () => {
      const productos = await fuente.productos({ orden: 'nuevo' });
      const primeraVieja = productos.findIndex((p) => !p.novedad);
      expect(productos.slice(primeraVieja).every((p) => !p.novedad)).toBe(true);
    });
  });

  describe('producto por slug', () => {
    it('devuelve la ficha completa', async () => {
      const manta = await fuente.producto('manta-estrella');
      expect(manta?.nombre).toBe('Manta estrella');
      expect(manta?.personalizable?.max).toBe(4);
    });

    it('un slug inexistente devuelve null', async () => {
      expect(await fuente.producto('no-existe')).toBeNull();
      expect(await fuente.producto('')).toBeNull();
    });

    it('trae la rebaja automática de su categoría y el precio final', async () => {
      const bolso = await fuente.producto('bolso-red-mercado');
      if (!bolso) throw new Error('Falta el bolso en la semilla');
      expect(bolso.rebaja).toMatchObject({ nombre: 'Rebajas de accesorios', porcentaje: 15, hasta: null });
      expect(precioVenta(bolso)).toMatchObject({ final: 1870, anterior: 2200, porcentaje: 15 });
      expect((await fuente.producto('cojin-relieve'))?.rebaja).toBeNull();
    });

    it('devuelve una copia: modificarla no altera la semilla', async () => {
      const osita = await fuente.producto('osita-vestido-lila');
      if (!osita) throw new Error('Falta la osita en la semilla');
      osita.variantes[0].stock = 999;
      const otraVez = await fuente.producto('osita-vestido-lila');
      expect(otraVez?.variantes[0].stock).not.toBe(999);
    });
  });

  describe('relacionados', () => {
    it('prioriza la misma categoría y excluye el propio producto', async () => {
      const relacionados = await fuente.relacionados('bolso-red-mercado');
      expect(relacionados).toHaveLength(4);
      expect(slugs(relacionados)).not.toContain('bolso-red-mercado');
      expect(relacionados.slice(0, 2).every((p) => p.categoria === 'accesorios')).toBe(true);
    });

    it('después de la misma categoría, solo las que la complementan', async () => {
      const relacionados = await fuente.relacionados('osita-vestido-lila');
      expect(relacionados[0].slug).toBe('cervatillo-dormilon');
      expect(relacionados.every((p) => ['amigurumis', 'bebe', 'packs'].includes(p.categoria))).toBe(true);
    });

    it('un slug inexistente no tiene relacionados', async () => {
      expect(await fuente.relacionados('no-existe')).toEqual([]);
    });
  });

  describe('categorías, promociones y envíos', () => {
    it('categoría por slug', async () => {
      expect((await fuente.categoria('bebe'))?.nombre).toBe('Bebé');
      expect(await fuente.categorias()).toHaveLength(5);
    });

    it('solo lista las promociones automáticas', async () => {
      const promociones = await fuente.promociones();
      expect(promociones.length).toBeGreaterThan(0);
      expect(promociones.every((p) => p.codigo === null)).toBe(true);
    });

    it('comprueba un cupón sin distinguir mayúsculas', async () => {
      expect((await fuente.cupon(' hola10 '))?.codigo).toBe('HOLA10');
      expect(await fuente.cupon('NOEXISTE')).toBeNull();
      expect(await fuente.cupon('')).toBeNull();
    });

    it('métodos de envío', async () => {
      expect((await fuente.metodosEnvio()).map((e) => e.id)).toEqual(['ordinario', 'express', 'recogida']);
    });
  });
});

describe('filtros en la URL', () => {
  it('lee los parámetros e ignora lo desconocido', () => {
    expect(
      leerFiltros({ cat: 'accesorios,inventada', filtro: ['ofertas', 'raro'], q: ' manta ', orden: 'barato', precio: '20-30' }),
    ).toEqual({
      categorias: ['accesorios'],
      rangos: ['20-30'],
      extras: ['ofertas'],
      busqueda: 'manta',
      orden: 'barato',
    });
  });

  it('un orden desconocido vuelve a destacados', () => {
    expect(leerFiltros({ orden: 'aleatorio' }).orden).toBe('destacados');
  });

  it('ida y vuelta', () => {
    const filtros = leerFiltros({ cat: 'bebe,hogar', filtro: 'stock', q: 'cesta', orden: 'az' });
    const parametros = Object.fromEntries(filtrosAParametros(filtros));
    expect(parametros).toEqual({ cat: 'bebe,hogar', filtro: 'stock', q: 'cesta', orden: 'az' });
    expect(leerFiltros(parametros)).toEqual(filtros);
  });
});
