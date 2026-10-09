// Catálogo sin red, a partir de src/datos/semilla.ts. Es el que se usa
// cuando no hay Supabase configurado y el que sirve de referencia en las
// pruebas.

import type { Promocion } from '@/lib/catalogo/tipos';
import { CATEGORIAS_T as CATEGORIAS, ENVIOS_T as ENVIOS, PRODUCTOS_T as PRODUCTOS, PROMOCIONES_T as PROMOCIONES } from '@/datos/semilla-traducida';
import { diaMadrid } from '@/lib/fechas';
import { aplicarFiltros, elegirRelacionados } from './filtros';
import type { FuenteCatalogo } from './fuente';
import { conRebajas } from './rebajas';

/** Igual que la base de datos: vale hasta el final del día de «hasta». */
function vigente(promocion: Promocion, hoy: string): boolean {
  return promocion.hasta === null || promocion.hasta >= hoy;
}

/** Copia profunda para que nadie pueda modificar la semilla desde fuera. */
const copia = <T>(valor: T): T => structuredClone(valor);

/** Productos con la rebaja automática de hoy ya puesta. */
const productosDeHoy = () => conRebajas(PRODUCTOS, PROMOCIONES);

export const fuenteSemilla: FuenteCatalogo = {
  origen: 'semilla',

  async categorias() {
    return copia(CATEGORIAS);
  },

  async categoria(slug) {
    return copia(CATEGORIAS.find((c) => c.slug === slug) ?? null);
  },

  async productos(filtros = {}) {
    return copia(aplicarFiltros(productosDeHoy(), filtros, CATEGORIAS));
  },

  async producto(slug) {
    return copia(productosDeHoy().find((p) => p.slug === slug) ?? null);
  },

  async relacionados(slug, cantidad = 4) {
    return copia(elegirRelacionados(productosDeHoy(), slug, cantidad));
  },

  async promociones() {
    const hoy = diaMadrid(new Date());
    return copia(PROMOCIONES.filter((p) => p.codigo === null && vigente(p, hoy)));
  },

  async cupon(codigo) {
    const buscado = codigo.trim().toUpperCase();
    if (!buscado) return null;
    const hoy = diaMadrid(new Date());
    return copia(PROMOCIONES.find((p) => p.codigo === buscado && vigente(p, hoy)) ?? null);
  },

  async metodosEnvio() {
    return copia(ENVIOS);
  },
};
