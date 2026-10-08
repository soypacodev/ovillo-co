// Rutas públicas en un único sitio, para que cabecera, pie, cajón y
// páginas no repitan cadenas que luego hay que cambiar en diez sitios.

import type { SlugCategoria } from '@/lib/catalogo/tipos';

export const rutas = {
  inicio: '/',
  tienda: '/tienda',
  categoria: (slug: SlugCategoria) => `/tienda?cat=${slug}`,
  ofertas: '/tienda?filtro=ofertas',
  buscar: (q: string) => `/tienda?q=${encodeURIComponent(q)}`,
  producto: (slug: string) => `/tienda/${slug}`,
  taller: '/taller',
  encargos: '/encargos',
  cuidados: '/cuidados',
  contacto: '/contacto',
  envios: '/envios',
  devoluciones: '/envios#devoluciones',
  legal: '/legal',
  cuenta: '/cuenta',
  cuentaPedidos: '/cuenta/pedidos',
  cuentaPedido: (numero: string) => `/cuenta/pedidos/${encodeURIComponent(numero)}`,
  cuentaFavoritos: '/cuenta/favoritos',
  cuentaDirecciones: '/cuenta/direcciones',
  cuentaDatos: '/cuenta/datos',
  entrar: '/entrar',
  registro: '/registro',
  recuperar: '/recuperar',
  nuevaContrasena: '/nueva-contrasena',
  confirmarAuth: '/auth/confirmar',
  panel: '/panel',
  panelPedidos: '/panel/pedidos',
  panelPedido: (id: string) => `/panel/pedidos/${id}`,
  panelProductos: '/panel/productos',
  panelProductoNuevo: '/panel/productos/nuevo',
  panelProducto: (slug: string) => `/panel/productos/${slug}`,
  panelEncargos: '/panel/encargos',
  panelEncargo: (id: string) => `/panel/encargos/${id}`,
  panelMensajes: '/panel/mensajes',
  panelClientes: '/panel/clientes',
  cesta: '/cesta',
  pago: '/pago',
  gracias: '/gracias',
} as const;

export interface EnlaceMenu {
  href: string;
  texto: string;
}

export const MENU_PRINCIPAL: EnlaceMenu[] = [
  { href: rutas.tienda, texto: 'Tienda' },
  { href: rutas.taller, texto: 'El taller' },
  { href: rutas.encargos, texto: 'Encargos' },
  { href: rutas.cuidados, texto: 'Cuidados' },
  { href: rutas.contacto, texto: 'Contacto' },
];

/** Marca como actual la sección y también sus páginas hijas
 *  (una ficha de producto marca «Tienda»). */
export function esRutaActual(href: string, ruta: string): boolean {
  if (href === '/') return ruta === '/';
  return ruta === href || ruta.startsWith(`${href}/`);
}

export const DEMO = {
  autor: 'Paco Dev',
  enlace: 'https://github.com/soypacodev',
  correo: 'hola@ovilloandco.example',
} as const;
