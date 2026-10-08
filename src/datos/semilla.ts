// Catálogo de ejemplo. Se usa cuando no hay base de datos configurada y es
// también la semilla que carga supabase/seed.sql. Ovillo & Co. es una tienda
// ficticia: productos, precios y textos son de demostración.

import type {
  Categoria,
  MetodoEnvio,
  PreguntaFrecuente,
  Producto,
  Promocion,
} from '@/lib/catalogo/tipos';

// La anotación deja al empaquetador descartar el catálogo de los trozos
// del navegador que solo necesitan las tarifas y promociones.
const foto = /*#__NO_SIDE_EFFECTS__*/ (src: string, alt: string) => ({ src: `/fotos/${src}`, alt });

export const CATEGORIAS: Categoria[] = [
  {
    slug: 'amigurumis',
    nombre: 'Amigurumis',
    texto: 'Muñecos tejidos de uno en uno.',
    foto: foto('categorias/amigurumis.jpg', 'Osita de ganchillo con vestido lila y bufanda turquesa'),
  },
  {
    slug: 'bebe',
    nombre: 'Bebé',
    texto: 'Suavidad para los primeros meses.',
    foto: foto('categorias/bebe.jpg', 'Manta de bebé de ganchillo en estrella con ondas rosas y crudo'),
  },
  {
    slug: 'accesorios',
    nombre: 'Accesorios',
    texto: 'Bolsos, coleteros y gorros.',
    foto: foto('categorias/accesorios.jpg', 'Scrunchies de ganchillo apilados en degradado de rojo a crudo'),
  },
  {
    slug: 'hogar',
    nombre: 'Hogar',
    texto: 'Cojines, cestas y paños.',
    foto: foto('categorias/hogar.jpg', 'Tapete de ganchillo blanco junto a un ovillo de hilo'),
  },
  {
    slug: 'packs',
    nombre: 'Packs',
    texto: 'Conjuntos listos para regalar.',
    foto: foto('categorias/packs.jpg', 'Caja de regalo con diademas de lazos tejidos en tonos crudos'),
  },
];

export const PRODUCTOS: Producto[] = [
  {
    slug: 'set-recien-nacido',
    nombre: 'Set recién nacido',
    categoria: 'packs',
    tipo: 'pack',
    precio: 4900,
    antes: 5800,
    destacado: true,
    novedad: false,
    encargo: true,
    dias: 10,
    etiqueta: 'Lo más regalado',
    corto: 'Capota y patucos a juego, en caja de regalo.',
    largo:
      'Capota de punto con cordones y patucos a juego, en el mismo gris azulado y presentados en una caja con lazo. Sale más barato que comprar las dos piezas por separado.',
    historia:
      'Es el regalo que más nos piden para ir al hospital. Lo preparamos en la talla que nos digas y te avisamos cuando sale.',
    materiales: ['Lana merino extrafina', 'Caja de cartón reciclado', 'Lazo de algodón'],
    cuidados: 'Lavado a mano o programa de lana a 30 °C. Secar en plano.',
    medidas: 'Talla 0-3 o 3-6 meses',
    fotos: [
      foto('productos/set-recien-nacido-1.jpg', 'Capota de bebé de punto gris azulado sobre una muselina'),
      foto('productos/set-recien-nacido-2.jpg', 'Patucos de punto gris azulado junto a una foca de peluche blanca'),
    ],
    variantes: [{ nombre: 'Gris azulado', color: '#7E93A8', stock: 3 }],
    contenido: ['Capota con cordones', 'Par de patucos', 'Caja de regalo con lazo'],
  },
  {
    slug: 'pulpito-reversible',
    nombre: 'Pulpito reversible',
    categoria: 'amigurumis',
    tipo: 'simple',
    precio: 1800,
    antes: null,
    destacado: true,
    novedad: false,
    encargo: false,
    dias: null,
    etiqueta: null,
    corto: 'Contento por un lado, enfurruñado por el otro.',
    largo:
      'Amigurumi de doble cara: le das la vuelta y cambia de humor. Relleno hipoalergénico y sin piezas pequeñas, así que es apto desde el primer día.',
    historia:
      'Sirve para que los peques digan cómo se sienten sin tener que explicarlo. Es de los primeros que hicimos y nunca ha salido del catálogo.',
    materiales: ['Algodón 100 %', 'Relleno de fibra hueca hipoalergénica'],
    cuidados: 'Lavar a mano en agua fría. Secar en plano, nunca en secadora.',
    medidas: '14 × 14 × 10 cm',
    fotos: [
      foto('productos/pulpito-reversible-1.jpg', 'Dos pulpitos de ganchillo grises, uno contento y otro enfurruñado'),
      foto('productos/pulpito-reversible-2.jpg', 'Pulpito de ganchillo gris sobre una maceta blanca junto a un robot tejido'),
    ],
    variantes: [
      { nombre: 'Gris perla', color: '#B9BEC4', stock: 4 },
      { nombre: 'Verde salvia', color: '#BFD1C3', stock: 2 },
      { nombre: 'Azul niebla', color: '#AEC0CC', stock: 0 },
    ],
  },
  {
    slug: 'manta-estrella',
    nombre: 'Manta estrella',
    categoria: 'bebe',
    tipo: 'simple',
    precio: 6500,
    antes: null,
    destacado: true,
    novedad: false,
    encargo: true,
    dias: 12,
    etiqueta: null,
    corto: 'Manta de cuna en estrella, a ondas suaves.',
    largo:
      'Manta de ganchillo en forma de estrella, con ondas de color que salen del centro. Ligera pero cálida, sirve para la cuna, el carrito o el suelo del salón. Se puede pedir con las iniciales bordadas.',
    historia:
      'Cada manta lleva unas doce horas de trabajo. Tejemos una ronda de color, otra de crudo, y así hasta que la estrella mide casi un metro.',
    materiales: ['Algodón peinado', 'Sin tintes agresivos'],
    cuidados: 'Lavado a mano o programa de lana a 30 °C. Secar en plano, nunca colgada.',
    medidas: '90 cm de punta a punta · 380 g',
    personalizable: {
      etiqueta: 'Iniciales bordadas',
      ejemplo: 'A.M.',
      max: 4,
      pista: 'Hasta 4 caracteres, en una esquina y en hilo del mismo tono.',
    },
    fotos: [
      foto('productos/manta-estrella-1.jpg', 'Manta de bebé de ganchillo en estrella, a ondas verde menta y crudo'),
      foto('productos/manta-estrella-2.jpg', 'Manta de bebé de ganchillo en estrella con ondas rosas y crudo'),
    ],
    variantes: [
      { nombre: 'Menta', color: '#9FD8B9', stock: 1 },
      { nombre: 'Rosa', color: '#EFA3B4', stock: 1 },
    ],
  },
  {
    slug: 'bolso-red-mercado',
    nombre: 'Bolso de red para el mercado',
    categoria: 'accesorios',
    tipo: 'simple',
    precio: 2200,
    antes: 2800,
    destacado: false,
    novedad: false,
    encargo: false,
    dias: null,
    etiqueta: null,
    corto: 'Se pliega en el bolsillo y aguanta cinco kilos.',
    largo:
      'Bolso de red en algodón con asas reforzadas. Plegado cabe en cualquier bolsillo y abierto aguanta la compra de la semana.',
    historia: 'Es el que más se repite: quien lo prueba ya no vuelve a las bolsas de plástico.',
    materiales: ['Algodón reciclado'],
    cuidados: 'Lavadora a 30 °C dentro de una bolsa de red.',
    medidas: '38 × 42 cm · asa de 60 cm',
    fotos: [
      foto('productos/bolso-red-mercado-1.jpg', 'Bolsa de red de ganchillo color crudo con fruta dentro'),
      foto('productos/bolso-red-mercado-2.jpg', 'Bolsa de malla de ganchillo rosa palo con flores blancas'),
    ],
    variantes: [
      { nombre: 'Crudo', color: '#EDE6DA', stock: 6 },
      { nombre: 'Rosa palo', color: '#B98A80', stock: 3 },
    ],
  },
  {
    slug: 'cojin-relieve',
    nombre: 'Cojín de relieve',
    categoria: 'hogar',
    tipo: 'simple',
    precio: 3400,
    antes: null,
    destacado: false,
    novedad: true,
    encargo: false,
    dias: null,
    etiqueta: null,
    corto: 'Punto en relieve, flecos y funda extraíble.',
    largo:
      'Cojín de 45 × 45 cm con franjas de punto en relieve y flecos a los lados. La funda lleva cremallera oculta para lavarla sin el relleno.',
    historia: 'Combina el crudo con un beis cálido para que encaje en casi cualquier sofá.',
    materiales: ['Algodón grueso', 'Cremallera metálica', 'Relleno incluido'],
    cuidados: 'Quitar el relleno y lavar la funda a 30 °C.',
    medidas: '45 × 45 cm',
    fotos: [
      foto('productos/cojin-relieve-1.jpg', 'Cojín de ganchillo en crudo y beis con relieve y flecos'),
      foto('productos/cojin-relieve-2.jpg', 'Cojín tejido a rayas crudo y beis con flecos laterales'),
    ],
    variantes: [{ nombre: 'Crudo y beis', color: '#D9C7AE', stock: 5 }],
  },
  {
    slug: 'scrunchies-degradado',
    nombre: 'Scrunchies degradado (pack de 4)',
    categoria: 'accesorios',
    tipo: 'simple',
    precio: 1200,
    antes: 1500,
    destacado: false,
    novedad: false,
    encargo: false,
    dias: null,
    etiqueta: null,
    corto: 'Cuatro coleteros que no marcan el pelo.',
    largo:
      'Cuatro scrunchies de ganchillo en degradado, del rojo al crudo, con goma resistente forrada. Sujetan sin apretar y no dejan marca.',
    historia: null,
    materiales: ['Algodón peinado', 'Goma elástica forrada'],
    cuidados: 'Lavar a mano.',
    medidas: '11 cm de diámetro',
    fotos: [
      foto('productos/scrunchies-degradado-1.jpg', 'Scrunchies de ganchillo apilados en degradado de rojo a crudo'),
    ],
    variantes: [{ nombre: 'Degradado rojo', color: '#D9534F', stock: 0 }],
  },
  {
    slug: 'cesta-ovillos',
    nombre: 'Cesta organizadora',
    categoria: 'hogar',
    tipo: 'simple',
    precio: 2900,
    antes: null,
    destacado: false,
    novedad: true,
    encargo: false,
    dias: null,
    etiqueta: null,
    corto: 'Se mantiene de pie sola. Para el baño o el rincón de tejer.',
    largo:
      'Cesta de ganchillo con base firme, tejida en espiral. Aguanta de pie sin ayuda y sirve para toallitas, ovillos o lo que haga falta ordenar.',
    historia: 'Empezó como cesta para nuestros propios ovillos y ahora es de lo que más sale.',
    materiales: ['Trapillo de algodón', 'Base de cartón prensado'],
    cuidados: 'Paño húmedo. No sumergir.',
    medidas: 'Grande: 22 cm de diámetro · pequeña: 14 cm',
    fotos: [
      foto('productos/cesta-ovillos-1.jpg', 'Cestitas de ganchillo blancas usadas como organizadores de baño'),
      foto('productos/cesta-ovillos-2.jpg', 'Cesta de trapillo en zigzag blanco y negro llena de madejas'),
    ],
    variantes: [
      { nombre: 'Blanca', color: '#F2EFE9', stock: 2 },
      { nombre: 'Zigzag', color: '#3A3A3A', stock: 2 },
    ],
  },
  {
    slug: 'gorro-pompon',
    nombre: 'Gorro con pompón',
    categoria: 'accesorios',
    tipo: 'simple',
    precio: 2600,
    antes: null,
    destacado: false,
    novedad: true,
    encargo: true,
    dias: 7,
    etiqueta: null,
    corto: 'Punto grueso y pompón a juego.',
    largo:
      'Gorro de punto grueso con vuelta acanalada y pompón del mismo ovillo. Abriga sin picar. Tallas de niño y de adulto.',
    historia: 'Lo tejemos al pedir para ajustar la talla. Si dudas, mide el contorno de la cabeza y nos lo dices.',
    materiales: ['Lana merino'],
    cuidados: 'Lavar a mano en agua fría.',
    medidas: 'Talla niño (2-6 años) y adulto',
    fotos: [
      foto('productos/gorro-pompon-1.jpg', 'Gorro de punto azul con pompón sobre madera clara'),
      foto('productos/gorro-pompon-2.jpg', 'Gorro de punto azul con pompón, ovillo a juego y agujas de madera'),
    ],
    variantes: [
      { nombre: 'Azul', color: '#4A63A8', stock: 2 },
      { nombre: 'Gris perla', color: '#DBDFE4', stock: 1 },
    ],
  },
  {
    slug: 'guirnalda-corazones',
    nombre: 'Guirnalda de corazones',
    categoria: 'bebe',
    tipo: 'simple',
    precio: 2400,
    antes: null,
    destacado: true,
    novedad: true,
    encargo: true,
    dias: 8,
    etiqueta: 'Recién sacada',
    corto: 'Corazón tejido, cuentas de madera y lazo.',
    largo:
      'Guirnalda para la habitación del bebé con corazón de ganchillo relleno, cuentas de madera natural y lazo de satén. Se cuelga en la cuna, la pared o la estantería.',
    historia: 'Nació como encargo para una habitación en tonos rosas y quedó tan bien que se quedó en el catálogo.',
    materiales: ['Algodón 100 %', 'Relleno hipoalergénico', 'Cuentas de haya sin barnizar'],
    cuidados: 'Paño húmedo o lavado a mano muy suave.',
    medidas: '60 cm de largo',
    fotos: [
      foto('productos/guirnalda-corazones-1.jpg', 'Guirnalda infantil con corazón rosa de ganchillo, cuentas y eucalipto'),
    ],
    variantes: [
      { nombre: 'Rosa', color: '#F2C4CE', stock: 1 },
      { nombre: 'Crudo', color: '#EDE6DA', stock: 1 },
    ],
  },
  {
    slug: 'pack-cocina',
    nombre: 'Pack de cocina',
    categoria: 'packs',
    tipo: 'pack',
    precio: 3200,
    antes: 3900,
    destacado: false,
    novedad: false,
    encargo: false,
    dias: null,
    etiqueta: null,
    corto: 'Tres paños y cuatro posavasos.',
    largo:
      'El regalo perfecto para quien estrena casa: tres paños de cocina de algodón y cuatro posavasos a juego. Lavables cientos de veces.',
    historia: null,
    materiales: ['Algodón 100 %'],
    cuidados: 'Lavadora a 40 °C.',
    medidas: 'Paño 25 × 25 cm · posavasos 10 cm',
    fotos: [
      foto('productos/pack-cocina-1.jpg', 'Tres paños de ganchillo en salvia, coral y crema colgados'),
      foto('productos/pack-cocina-2.jpg', 'Posavasos y paños de ganchillo grises con ovillo y aguja'),
    ],
    variantes: [
      { nombre: 'Salvia, coral y crema', color: '#BFD1C3', stock: 3 },
      { nombre: 'Gris', color: '#A7A9AC', stock: 2 },
    ],
    contenido: ['3 paños de cocina', '4 posavasos'],
  },
];

export const PROMOCIONES: Promocion[] = [
  {
    nombre: 'Rebajas de accesorios',
    tipo: 'porcentaje',
    valor: 15,
    codigo: null,
    minimo: 0,
    categoria: 'accesorios',
    hasta: null,
  },
  { nombre: 'Bienvenida 10 %', tipo: 'porcentaje', valor: 10, codigo: 'HOLA10', minimo: 1500, categoria: null, hasta: null },
  { nombre: 'Envío gratis', tipo: 'envio', valor: 0, codigo: 'ENVIOGRATIS', minimo: 3000, categoria: null, hasta: null },
  { nombre: '5 € de regalo', tipo: 'fijo', valor: 500, codigo: 'PRIMERA5', minimo: 2000, categoria: null, hasta: null },
];

export const ENVIOS: MetodoEnvio[] = [
  { id: 'ordinario', nombre: 'Envío ordinario', precio: 395, gratisDesde: 5000, plazo: '3-5 días laborables' },
  { id: 'express', nombre: 'Envío urgente', precio: 695, gratisDesde: null, plazo: '24-48 horas' },
  { id: 'recogida', nombre: 'Recogida en el taller', precio: 0, gratisDesde: null, plazo: 'En Málaga, con cita' },
];

export const ENVIO_GRATIS_DESDE = 5000;

export const PREGUNTAS: PreguntaFrecuente[] = [
  {
    p: '¿Cuánto tardáis en enviar un pedido?',
    r: 'Lo que ya está hecho sale en 24-48 h. Lo que pone «se teje al pedir» tarda lo que indica la ficha, normalmente entre 7 y 14 días, más el envío. Te avisamos por correo cuando lo empezamos y cuando sale.',
  },
  {
    p: '¿Puedo pedir un color que no está en la web?',
    r: 'Casi siempre. Escríbenos y te decimos si tenemos ese ovillo o si podemos conseguirlo. Cambiar de color no cuesta nada.',
  },
  {
    p: '¿Es seguro para un bebé?',
    r: 'Las piezas de la categoría Bebé no llevan ojos de plástico ni piezas pequeñas: todo va bordado. El relleno es fibra hueca hipoalergénica. Aun así, no dejes a un bebé dormir con nada suelto en la cuna.',
  },
  {
    p: '¿Y si no me gusta?',
    r: 'Tienes 14 días para devolverlo, siempre que no esté personalizado con iniciales o nombres. Las piezas a medida no se pueden revender, así que esas no admiten devolución.',
  },
  {
    p: '¿Hacéis encargos grandes o para tiendas?',
    r: 'Depende de las fechas. Somos un taller pequeño y hay un límite de lo que podemos tejer. Cuéntanos qué necesitas y para cuándo, y te diremos con sinceridad si llegamos.',
  },
  {
    p: '¿Cómo se lava el crochet sin estropearlo?',
    r: 'A mano, en agua fría y sin retorcer. Se seca en plano sobre una toalla. Cada ficha trae sus instrucciones y tienes una guía completa en Cuidados.',
  },
  {
    p: '¿Puedo recogerlo en persona?',
    r: 'Sí, si estás en Málaga. Elige «Recogida en el taller» al pagar y quedamos en un horario que te venga bien.',
  },
  {
    p: '¿Enviáis fuera de España?',
    r: 'De momento, solo a la península y Baleares. Si estás fuera, escríbenos y vemos el coste antes de que pidas nada.',
  },
];
