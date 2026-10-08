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
    const { estado, resultado } = anadirProducto(CESTA_VACIA, producto('pulpito-reversible'));
    expect(resultado.tipo).toBe('anadido');
    expect(estado.lineas).toHaveLength(1);
    expect(estado.lineas[0]).toMatchObject({
      slug: 'pulpito-reversible',
      variante: 'Gris perla',
      precio: 1800,
      stock: 4,
      uds: 1,
      foto: { src: '/fotos/productos/pulpito-reversible-1.jpg' },
    });
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
    const r = anadirProducto(CESTA_VACIA, producto('pulpito-reversible'), { variante: 'Azul niebla' });
    expect(r.resultado.tipo).toBe('agotado');
    expect(r.estado).toBe(CESTA_VACIA);
    expect(anadirProducto(CESTA_VACIA, producto('scrunchies-degradado')).resultado.tipo).toBe('agotado');
  });

  it('avisa si la variante no existe', () => {
    const r = anadirProducto(CESTA_VACIA, producto('pulpito-reversible'), { variante: 'Fucsia' });
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
  const estado = cestaCon(['pulpito-reversible', { uds: 2 }]);
  const id = estado.lineas[0].id;

  it('cambia y respeta el stock', () => {
    expect(cambiarUnidades(estado, id, 1).lineas[0].uds).toBe(3);
    expect(cambiarUnidades(estado, id, 10).lineas[0].uds).toBe(4);
    expect(maxUnidadesLinea(estado.lineas, estado.lineas[0])).toBe(4);
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
    const estado = cestaCon(['pulpito-reversible', { uds: 4 }], ['cojin-relieve']);
    const catalogo = PRODUCTOS.filter((p) => p.slug !== 'cojin-relieve').map((p) =>
      p.slug === 'pulpito-reversible'
        ? { ...p, precio: 2000, variantes: p.variantes.map((v) => ({ ...v, stock: 2 })) }
        : p,
    );
    const nuevo = sincronizarConCatalogo(estado, catalogo);
    expect(nuevo.lineas).toHaveLength(1);
    expect(nuevo.lineas[0]).toMatchObject({ precio: 2000, uds: 2, stock: 2 });
  });

  it('se queda vacía si todo se ha agotado', () => {
    const estado = cestaCon(['cojin-relieve']);
    const catalogo = PRODUCTOS.map((p) => ({ ...p, variantes: p.variantes.map((v) => ({ ...v, stock: 0 })) }));
    expect(sincronizarConCatalogo(estado, catalogo)).toEqual(CESTA_VACIA);
  });
});
