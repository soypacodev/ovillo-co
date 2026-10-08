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
  favoritos: '/favoritos',
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

const CORREO_AUTOR = 'soypacodev@gmail.com';
const MENSAJE_CONTRATAR = {
  subject: 'Quiero una tienda como Ovillo & Co.',
  body: 'Hola, Paco:\n\nHe visto la tienda de demostración Ovillo & Co. y me gustaría algo parecido para mi negocio.\n\n',
};

/** La tienda es ficticia; el autor de la demo, no. `correo` es el de la
 *  tienda (dominio de ejemplo) y `contratar`, el de Paco Dev con el asunto
 *  ya escrito para quien quiera una tienda así. */
export const DEMO = {
  autor: 'Paco Dev',
  enlace: 'https://github.com/soypacodev',
  instagram: 'https://www.instagram.com/soypacodev/',
  usuarioInstagram: '@soypacodev',
  correo: 'hola@ovilloandco.example',
  correoAutor: CORREO_AUTOR,
  contratar: `mailto:${CORREO_AUTOR}?${Object.entries(MENSAJE_CONTRATAR)
    .map(([clave, valor]) => `${clave}=${encodeURIComponent(valor)}`)
    .join('&')}`,
} as const;
