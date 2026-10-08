import { describe, expect, it } from 'vitest';
import { normalizarCesta, serializarCesta } from './persistencia';
import { cestaCon } from './prueba-utiles';
import { CESTA_VACIA, MAX_UDS_LINEA } from './tipos';

describe('persistencia de la cesta', () => {
  it('lo que se guarda se recupera igual', () => {
    const estado = { ...cestaCon(['manta-estrella', { personalizacion: 'L' }], ['cojin-relieve']), cupon: 'HOLA10' };
    const guardado = JSON.parse(JSON.stringify(serializarCesta(estado)));
    expect(normalizarCesta(guardado)).toEqual(estado);
  });

  it('tolera datos corruptos o vacíos', () => {
    for (const dato of [null, undefined, 42, 'texto', {}, { v: 1 }, { v: 1, lineas: 'x' }, []]) {
      expect(normalizarCesta(dato)).toEqual(CESTA_VACIA);
    }
  });

  it('ignora una versión futura que no sabe leer', () => {
    const estado = serializarCesta(cestaCon(['cojin-relieve']));
    expect(normalizarCesta({ ...estado, v: 2 })).toEqual(CESTA_VACIA);
  });

  it('descarta líneas inválidas y conserva las buenas', () => {
    const buena = cestaCon(['cojin-relieve']).lineas[0];
    const dato = {
      v: 1,
      cupon: 'hola10',
      lineas: [
        buena,
        { ...buena, precio: -5 },
        { ...buena, uds: 0 },
        { ...buena, categoria: 'otra' },
        { ...buena, slug: '' },
        'basura',
        null,
      ],
    };
    const r = normalizarCesta(dato);
    expect(r.lineas).toEqual([buena]);
    expect(r.cupon).toBe('HOLA10');
  });

  it('no acepta fotos externas', () => {
    const buena = cestaCon(['cojin-relieve']).lineas[0];
    const r = normalizarCesta({ v: 1, lineas: [{ ...buena, foto: { src: 'https://malo.example/x.jpg', alt: '' } }] });
    expect(r.lineas[0].foto).toBeNull();
  });

  it('lee el formato antiguo (lista suelta) y junta las líneas repetidas', () => {
    const antigua = [
      { slug: 'bolso-red-mercado', nombre: 'Bolso', variante: 'Crudo', patron: 'pt-crudo', precio: 2200, uds: 2, personalizacion: '', categoria: 'accesorios', encargo: false, dias: null },
      { slug: 'bolso-red-mercado', nombre: 'Bolso', variante: 'Crudo', patron: 'pt-crudo', precio: 2200, uds: 9, personalizacion: '', categoria: 'accesorios', encargo: false, dias: null },
    ];
    const r = normalizarCesta(antigua);
    expect(r.lineas).toHaveLength(1);
    expect(r.lineas[0]).toMatchObject({ id: 'bolso-red-mercado|Crudo|', uds: MAX_UDS_LINEA, foto: null, stock: MAX_UDS_LINEA });
    expect(r.cupon).toBeNull();
  });
});
