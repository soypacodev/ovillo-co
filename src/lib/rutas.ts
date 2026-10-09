// Rutas públicas en un único sitio, para que cabecera, pie, cajón y
// páginas no repitan cadenas que luego hay que cambiar en diez sitios.

import type { SlugCategoria } from '@/lib/catalogo/tipos';
import type { Idioma } from '@/lib/i18n/idiomas';

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
  texto: Record<Idioma, string>;
}

export const MENU_PRINCIPAL: EnlaceMenu[] = [
  { href: rutas.tienda, texto: { es: 'Tienda', en: 'Shop', fr: 'Boutique', de: 'Shop' } },
  { href: rutas.taller, texto: { es: 'El taller', en: 'The workshop', fr: 'L’atelier', de: 'Die Werkstatt' } },
  { href: rutas.encargos, texto: { es: 'Encargos', en: 'Custom orders', fr: 'Sur mesure', de: 'Auftragsarbeiten' } },
  { href: rutas.cuidados, texto: { es: 'Cuidados', en: 'Care', fr: 'Entretien', de: 'Pflege' } },
  { href: rutas.contacto, texto: { es: 'Contacto', en: 'Contact', fr: 'Contact', de: 'Kontakt' } },
];

/** Marca como actual la sección y también sus páginas hijas
 *  (una ficha de producto marca «Tienda»). */
export function esRutaActual(href: string, ruta: string): boolean {
  if (href === '/') return ruta === '/';
  return ruta === href || ruta.startsWith(`${href}/`);
}

const CORREO_AUTOR = 'soypacodev@gmail.com';
const MENSAJE_CONTRATAR: Record<Idioma, { subject: string; body: string }> = {
  es: {
    subject: 'Quiero una tienda como Ovillo & Co.',
    body: 'Hola, Paco:\n\nHe visto la tienda de demostración Ovillo & Co. y me gustaría algo parecido para mi negocio.\n\n',
  },
  en: {
    subject: 'I would like a shop like Ovillo & Co.',
    body: "Hi Paco,\n\nI've seen the Ovillo & Co. demo shop and I'd like something similar for my business.\n\n",
  },
  fr: {
    subject: 'Je voudrais une boutique comme Ovillo & Co.',
    body: "Bonjour Paco,\n\nJ'ai vu la boutique de démonstration Ovillo & Co. et j'aimerais quelque chose de similaire pour mon activité.\n\n",
  },
  de: {
    subject: 'Ich hätte gern einen Shop wie Ovillo & Co.',
    body: 'Hallo Paco,\n\nich habe den Demo-Shop Ovillo & Co. gesehen und hätte gern etwas Ähnliches für mein Geschäft.\n\n',
  },
};

const mailtoContratar = (idioma: Idioma) =>
  `mailto:${CORREO_AUTOR}?${Object.entries(MENSAJE_CONTRATAR[idioma])
    .map(([clave, valor]) => `${clave}=${encodeURIComponent(valor)}`)
    .join('&')}`;

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
  /** Correo a Paco Dev con el asunto ya escrito, en el idioma de la página. */
  contratar: mailtoContratar,
} as const;
