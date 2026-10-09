// La semilla con sus traducciones puestas, tal como la devolvería la base
// de datos. La usan la fuente local del catálogo y el pie.

import type { Categoria, MetodoEnvio, Producto, Promocion } from '@/lib/catalogo/tipos';
import { CATEGORIAS, ENVIOS, PRODUCTOS, PROMOCIONES } from './semilla';
import { TRADUCCIONES_CATEGORIAS, TRADUCCIONES_PRODUCTOS } from './traducciones-catalogo';
import { TRADUCCIONES_ENVIOS, TRADUCCIONES_PROMOCIONES } from './traducciones-tarifas';

const con = <T extends object>(valor: T, traducciones: object | undefined): T =>
  traducciones && Object.keys(traducciones).length ? { ...valor, traducciones } : valor;

export const CATEGORIAS_T: Categoria[] = CATEGORIAS.map((c) => con(c, TRADUCCIONES_CATEGORIAS[c.slug]));
export const PRODUCTOS_T: Producto[] = PRODUCTOS.map((p) => con(p, TRADUCCIONES_PRODUCTOS[p.slug]));
export const PROMOCIONES_T: Promocion[] = PROMOCIONES.map((p) => con(p, TRADUCCIONES_PROMOCIONES[p.nombre]));
export const ENVIOS_T: MetodoEnvio[] = ENVIOS.map((e) => con(e, TRADUCCIONES_ENVIOS[e.id]));
