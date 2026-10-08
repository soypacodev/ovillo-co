import { describe, expect, it } from 'vitest';
import { PRODUCTOS } from '@/datos/semilla';
import { calcularConCatalogo } from './recalculo';
import { resumenDemo } from './resumen';
import { leerResumenDemo } from './resumen-guardado';
import { esquemaDatos } from './esquema';

const DATOS = esquemaDatos.parse({
  email: 'ana@correo.example',
  nombre: 'Ana',
  apellidos: 'Pérez',
  envio: 'ordinario',
  calle: 'Calle Larios 1',
  cp: '29005',
  ciudad: 'Málaga',
  provincia: 'Málaga',
  acepta: true,
});
const pedido = calcularConCatalogo({
  lineas: [{ slug: PRODUCTOS[0].slug, variante: PRODUCTOS[0].variantes[0].nombre, cantidad: 1, personalizacion: '' }],
  cupon: null,
  envio: 'ordinario',
});
const RESUMEN = resumenDemo('DEMO-2026-ABC234', DATOS, pedido, '3–5 días');

describe('resumen guardado del modo demostración', () => {
  it('lee lo que guardó el propio servidor', () => {
    const guardado: unknown = JSON.parse(JSON.stringify(RESUMEN));
    expect(leerResumenDemo(guardado, 'DEMO-2026-ABC234')).toEqual(RESUMEN);
  });

  it('descarta lo editado a mano o de otro pedido', () => {
    expect(leerResumenDemo(RESUMEN, 'DEMO-2026-ZZZ999')).toBeNull();
    expect(leerResumenDemo({ ...RESUMEN, total: -1 }, RESUMEN.numero)).toBeNull();
    expect(leerResumenDemo({ ...RESUMEN, lineas: [] }, RESUMEN.numero)).toBeNull();
    const foto = { src: 'https://malo.example/x.jpg', alt: '' };
    expect(leerResumenDemo({ ...RESUMEN, lineas: [{ ...RESUMEN.lineas[0], foto }] }, RESUMEN.numero)).toBeNull();
    expect(leerResumenDemo('basura', RESUMEN.numero)).toBeNull();
  });
});
