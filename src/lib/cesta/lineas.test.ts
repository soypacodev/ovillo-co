import { describe, expect, it } from 'vitest';
import {
  anadirProducto,
  cambiarUnidades,
  fijarUnidades,
  limpiarPersonalizacion,
  maxUnidadesLinea,
  quitarLinea,
  sincronizarConCatalogo,
  unidades,
  vaciarCesta,
} from './lineas';
import { PRODUCTOS } from '@/datos/semilla';
import { cestaCon, producto } from './prueba-utiles';
import { CESTA_VACIA, MAX_UDS_LINEA } from './tipos';

describe('anadirProducto', () => {
  it('copia los datos del producto y elige la primera variante con stock', () => {
    const { estado, resultado } = anadirProducto(CESTA_VACIA, producto('bolso-red-mercado'));
    expect(resultado.tipo).toBe('anadido');
    expect(estado.lineas).toHaveLength(1);
    expect(estado.lineas[0]).toMatchObject({
      slug: 'bolso-red-mercado',
      variante: 'Crudo',
      precio: 2200,
      stock: 6,
      uds: 1,
      foto: { src: '/fotos/productos/bolso-red-mercado-1.jpg' },
    });
  });

  it('la línea lleva la foto de su variante', () => {
    const rosa = cestaCon(['bolso-red-mercado', { variante: 'Rosa palo' }]);
    expect(rosa.lineas[0].foto?.src).toBe('/fotos/productos/bolso-red-mercado-2.jpg');
    // Dos tallas comparten foto.
    const gorro = cestaCon(['gorro-pompon', { variante: 'Adulto' }]);
    expect(gorro.lineas[0]).toMatchObject({ variante: 'Adulto', foto: { src: '/fotos/productos/gorro-pompon-1.jpg' } });
  });

  it('suma las líneas iguales', () => {
    const estado = cestaCon(['cojin-relieve'], ['cojin-relieve', { uds: 2 }]);
    expect(estado.lineas).toHaveLength(1);
    expect(estado.lineas[0].uds).toBe(3);
  });

  it('separa la misma pieza con distinta personalización', () => {
    const estado = cestaCon(
      ['manta-estrella', { variante: 'Menta', personalizacion: '' }],
      ['manta-estrella', { variante: 'Rosa', personalizacion: 'AM' }],
    );
    expect(estado.lineas.map((l) => l.personalizacion)).toEqual(['', 'AM']);
    expect(unidades(estado.lineas)).toBe(2);
  });

  it('no deja añadir una variante agotada', () => {
    const bolso = producto('bolso-red-mercado');
    const sinRosa = { ...bolso, variantes: bolso.variantes.map((v) => (v.nombre === 'Rosa palo' ? { ...v, stock: 0 } : v)) };
    const r = anadirProducto(CESTA_VACIA, sinRosa, { variante: 'Rosa palo' });
    expect(r.resultado.tipo).toBe('agotado');
    expect(r.estado).toBe(CESTA_VACIA);
    expect(anadirProducto(CESTA_VACIA, producto('scrunchies-degradado')).resultado.tipo).toBe('agotado');
  });

  it('avisa si la variante no existe', () => {
    const r = anadirProducto(CESTA_VACIA, producto('bolso-red-mercado'), { variante: 'Fucsia' });
    expect(r.resultado.tipo).toBe('sin-variante');
  });

  it('limita al stock de la variante, contando todas sus líneas', () => {
    // Menta tiene 1 unidad: con iniciales distintas sigue siendo la misma manta.
    const estado = cestaCon(['manta-estrella', { variante: 'Menta' }]);
    const r = anadirProducto(estado, producto('manta-estrella'), { variante: 'Menta', personalizacion: 'L' });
    expect(r.resultado).toMatchObject({ tipo: 'limitado', uds: 0, maximo: 1 });
    expect(r.estado).toBe(estado);
  });

  it('añade solo las unidades que caben', () => {
    const r = anadirProducto(CESTA_VACIA, producto('bolso-red-mercado'), { variante: 'Crudo', uds: 8 });
    expect(r.resultado).toMatchObject({ tipo: 'limitado', uds: 6, maximo: 6 });
    expect(r.estado.lineas[0].uds).toBe(6);
  });

  it('respeta el tope de unidades por línea', () => {
    const mucho = { ...producto('cojin-relieve'), variantes: [{ nombre: 'Crudo', color: '#fff', stock: 50 }] };
    const r = anadirProducto(CESTA_VACIA, mucho, { uds: 20 });
    expect(r.estado.lineas[0].uds).toBe(MAX_UDS_LINEA);
  });

  it('ignora unidades no válidas y añade una', () => {
    const r = anadirProducto(CESTA_VACIA, producto('cojin-relieve'), { uds: Number.NaN });
    expect(r.estado.lineas[0].uds).toBe(1);
  });
});

describe('limpiarPersonalizacion', () => {
  it('recorta espacios y aplica el límite del producto', () => {
    expect(limpiarPersonalizacion(producto('manta-estrella'), '  a   b  c d e ')).toBe('a b');
  });
  it('descarta el texto si el producto no se personaliza', () => {
    expect(limpiarPersonalizacion(producto('cojin-relieve'), 'ABC')).toBe('');
  });
});

describe('unidades de una línea', () => {
  const estado = cestaCon(['bolso-red-mercado', { uds: 2 }]);
  const id = estado.lineas[0].id;

  it('cambia y respeta el stock', () => {
    expect(cambiarUnidades(estado, id, 1).lineas[0].uds).toBe(3);
    expect(cambiarUnidades(estado, id, 10).lineas[0].uds).toBe(6);
    expect(maxUnidadesLinea(estado.lineas, estado.lineas[0])).toBe(6);
  });

  it('quita la línea al bajar de 1', () => {
    expect(cambiarUnidades(estado, id, -2).lineas).toHaveLength(0);
    expect(fijarUnidades(estado, id, 0)).toEqual(CESTA_VACIA);
  });

  it('no cambia nada con un id desconocido', () => {
    expect(cambiarUnidades(estado, 'nada', 1)).toBe(estado);
    expect(quitarLinea(estado, 'nada')).toBe(estado);
  });

  it('al vaciar la cesta también se va el cupón', () => {
    const conCupon = { ...estado, cupon: 'HOLA10' };
    expect(quitarLinea(conCupon, id)).toEqual(CESTA_VACIA);
    expect(vaciarCesta()).toEqual(CESTA_VACIA);
  });
});

describe('sincronizarConCatalogo', () => {
  it('actualiza precios, recorta al stock y quita lo que ya no existe', () => {
    const estado = cestaCon(['bolso-red-mercado', { uds: 4 }], ['cojin-relieve']);
    const catalogo = PRODUCTOS.filter((p) => p.slug !== 'cojin-relieve').map((p) =>
      p.slug === 'bolso-red-mercado'
        ? { ...p, precio: 2000, variantes: p.variantes.map((v) => ({ ...v, stock: 2 })) }
        : p,
    );
    const nuevo = sincronizarConCatalogo(estado, catalogo);
    expect(nuevo.lineas).toHaveLength(1);
    expect(nuevo.lineas[0]).toMatchObject({ precio: 2000, uds: 2, stock: 2 });
  });

  it('al fundir dos líneas por encima del tope no gasta el stock de las unidades recortadas', () => {
    const manta = producto('manta-estrella');
    const conStock = (stock: number, max: number) => ({
      ...manta,
      personalizable: manta.personalizable && { ...manta.personalizable, max },
      variantes: [{ nombre: 'Menta', color: '#9FD8B9', stock }],
    });
    const antes = [conStock(15, 4)];
    const estado = [
      { personalizacion: 'AB', uds: 6 },
      { personalizacion: 'ABCD', uds: 6 },
      { personalizacion: 'XY', uds: 3 },
    ].reduce((e, o) => anadirProducto(e, antes[0], { variante: 'Menta', ...o }).estado, CESTA_VACIA);
    expect(estado.lineas.map((l) => l.uds)).toEqual([6, 6, 3]);

    // Ahora solo caben 2 letras: «ABCD» pasa a ser «AB» y se funde con la
    // primera, que se queda en 9 (el tope). Las 3 que sobran no cuentan:
    // la línea «XY» conserva sus 3 unidades del stock de 12.
    const nuevo = sincronizarConCatalogo(estado, [conStock(12, 2)]);
    expect(nuevo.lineas.map((l) => [l.personalizacion, l.uds])).toEqual([
      ['AB', MAX_UDS_LINEA],
      ['XY', 3],
    ]);
  });

  it('se queda vacía si todo se ha agotado', () => {
    const estado = cestaCon(['cojin-relieve']);
    const catalogo = PRODUCTOS.map((p) => ({ ...p, variantes: p.variantes.map((v) => ({ ...v, stock: 0 })) }));
    expect(sincronizarConCatalogo(estado, catalogo)).toEqual(CESTA_VACIA);
  });
});
