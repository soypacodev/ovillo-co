-- ============================================================
--  Ovillo & Co. · Catálogo de demostración
--
--  Generado por scripts/generar-semilla.mjs a partir de
--  src/datos/semilla.ts. No se edita a mano: cambia la semilla y
--  ejecuta «npm run db:semilla».
-- ============================================================

begin;

-- Categorías
insert into public.categorias (slug, nombre, texto, foto_ruta, foto_alt, posicion) values
  ('amigurumis', 'Amigurumis', 'Muñecos tejidos de uno en uno.', '/fotos/categorias/amigurumis.jpg', 'Osita de ganchillo con vestido lila y bufanda turquesa', 0),
  ('bebe', 'Bebé', 'Suavidad para los primeros meses.', '/fotos/productos/manta-estrella-2.jpg', 'Manta de bebé de ganchillo en estrella con ondas rosas y crudo', 1),
  ('accesorios', 'Accesorios', 'Bolsos, coleteros y gorros.', '/fotos/productos/bolso-red-mercado-1.jpg', 'Bolsa de red de ganchillo color crudo con fruta dentro', 2),
  ('hogar', 'Hogar', 'Cojines y cestas.', '/fotos/productos/cojin-relieve-1.jpg', 'Cojín de ganchillo en crudo y beis con relieve y flecos', 3),
  ('packs', 'Packs', 'Conjuntos listos para regalar.', '/fotos/productos/set-recien-nacido-1.jpg', 'Capota de bebé de punto gris azulado sobre una muselina', 4);

-- Set recién nacido
insert into public.productos (
  slug, nombre, categoria_id, tipo, estado, precio, antes, variante_etiqueta,
  destacado, novedad, encargo, dias, etiqueta,
  corto, largo, historia, materiales, cuidados, medidas,
  personalizacion_etiqueta, personalizacion_ejemplo, personalizacion_max, personalizacion_pista,
  contenido, posicion, publicado_en
) values (
  'set-recien-nacido', 'Set recién nacido', (select id from public.categorias where slug = 'packs'), 'pack', 'publicado', 4900, 5800, 'Talla',
  true, false, true, 10, 'Lo más regalado',
  'Capota y patucos de punto a juego, en caja de regalo.',
  'Capota de punto con cordones y patucos a juego, en el mismo gris azulado y presentados en una caja con lazo. Eliges la talla y lo tejemos para ti.',
  'Es el regalo que más nos piden para ir al hospital. Lo tejemos en la talla que elijas y te avisamos cuando sale del taller.',
  array['Lana merino extrafina', 'Caja de cartón reciclado', 'Lazo de algodón'],
  'Lavado a mano o programa de lana a 30 °C. Secar en plano.',
  'Talla 0–3 meses (capota de 36 cm de contorno) o 3–6 meses (40 cm)',
  null, null, null, null,
  array['Capota con cordones', 'Par de patucos', 'Caja de regalo con lazo'], 0, now()
);

insert into public.variantes (producto_id, nombre, color, stock, foto_ruta, posicion) values
  ((select id from public.productos where slug = 'set-recien-nacido'), '0–3 meses', '#7E93A8', 3, '/fotos/productos/set-recien-nacido-1.jpg', 0),
  ((select id from public.productos where slug = 'set-recien-nacido'), '3–6 meses', '#7E93A8', 3, '/fotos/productos/set-recien-nacido-1.jpg', 1);

insert into public.fotos_producto (producto_id, ruta, alt, posicion) values
  ((select id from public.productos where slug = 'set-recien-nacido'), '/fotos/productos/set-recien-nacido-1.jpg', 'Capota de bebé de punto gris azulado sobre una muselina', 0),
  ((select id from public.productos where slug = 'set-recien-nacido'), '/fotos/productos/set-recien-nacido-2.jpg', 'Patucos de punto gris azulado junto a una foca de peluche blanca', 1);

-- Osita con vestido lila
insert into public.productos (
  slug, nombre, categoria_id, tipo, estado, precio, antes, variante_etiqueta,
  destacado, novedad, encargo, dias, etiqueta,
  corto, largo, historia, materiales, cuidados, medidas,
  personalizacion_etiqueta, personalizacion_ejemplo, personalizacion_max, personalizacion_pista,
  contenido, posicion, publicado_en
) values (
  'osita-vestido-lila', 'Osita con vestido lila', (select id from public.categorias where slug = 'amigurumis'), 'simple', 'publicado', 2900, null, 'Color',
  true, true, false, null, null,
  'Vestido de volantes, bufanda turquesa y lazo en la oreja.',
  'Osita de ganchillo en algodón beis, con vestido lila de volantes, bufanda turquesa cosida al cuello y lazo rosa. Ojos de seguridad con cierre a presión, hocico bordado y relleno hipoalergénico. Recomendada a partir de 3 años; si es para un bebé, te la hacemos con los ojos bordados.',
  'Es la pieza que más nos piden para cumpleaños. Cada osita lleva unas cinco horas de trabajo, y el vestido se puede pedir en otro color.',
  array['Algodón 100 %', 'Relleno de fibra hueca hipoalergénica'],
  'Lavar a mano en agua fría. Secar en plano, nunca en secadora.',
  '28 cm de alto',
  null, null, null, null,
  null, 1, now()
);

insert into public.variantes (producto_id, nombre, color, stock, foto_ruta, posicion) values
  ((select id from public.productos where slug = 'osita-vestido-lila'), 'Beis y lila', '#C9B3E0', 2, '/fotos/categorias/amigurumis.jpg', 0);

insert into public.fotos_producto (producto_id, ruta, alt, posicion) values
  ((select id from public.productos where slug = 'osita-vestido-lila'), '/fotos/categorias/amigurumis.jpg', 'Osita de ganchillo con vestido lila y bufanda turquesa', 0);

-- Cervatillo dormilón
insert into public.productos (
  slug, nombre, categoria_id, tipo, estado, precio, antes, variante_etiqueta,
  destacado, novedad, encargo, dias, etiqueta,
  corto, largo, historia, materiales, cuidados, medidas,
  personalizacion_etiqueta, personalizacion_ejemplo, personalizacion_max, personalizacion_pista,
  contenido, posicion, publicado_en
) values (
  'cervatillo-dormilon', 'Cervatillo dormilón', (select id from public.categorias where slug = 'amigurumis'), 'simple', 'publicado', 2400, null, 'Color',
  true, false, false, null, null,
  'Ojos cerrados, lazo rosa y un sueño muy profundo.',
  'Cervatillo de ganchillo en crudo y beis, con lazo y cuello rosa y los ojos bordados, siempre dormido. Relleno hipoalergénico y sin piezas que se puedan soltar: apto para bebés desde el primer día.',
  'Con él empezó el taller: lo tejimos para un bebé al que le costaba dormirse y nunca ha salido del catálogo. Cabe en una mano pequeña.',
  array['Algodón 100 %', 'Relleno de fibra hueca hipoalergénica'],
  'Lavar a mano en agua fría. Secar en plano, nunca en secadora.',
  '16 cm de largo',
  null, null, null, null,
  null, 2, now()
);

insert into public.variantes (producto_id, nombre, color, stock, foto_ruta, posicion) values
  ((select id from public.productos where slug = 'cervatillo-dormilon'), 'Crudo y rosa', '#E9D3C4', 3, '/fotos/portada.jpg', 0);

insert into public.fotos_producto (producto_id, ruta, alt, posicion) values
  ((select id from public.productos where slug = 'cervatillo-dormilon'), '/fotos/portada.jpg', 'Cervatillo de ganchillo dormido junto a un corazón rosa tejido', 0);

-- Manta estrella
insert into public.productos (
  slug, nombre, categoria_id, tipo, estado, precio, antes, variante_etiqueta,
  destacado, novedad, encargo, dias, etiqueta,
  corto, largo, historia, materiales, cuidados, medidas,
  personalizacion_etiqueta, personalizacion_ejemplo, personalizacion_max, personalizacion_pista,
  contenido, posicion, publicado_en
) values (
  'manta-estrella', 'Manta estrella', (select id from public.categorias where slug = 'bebe'), 'simple', 'publicado', 6500, null, 'Color',
  true, false, true, 12, null,
  'Manta en estrella, a ondas suaves, para el cochecito o el sofá.',
  'Manta de ganchillo en forma de estrella, con ondas de color que salen del centro. Ligera pero cálida, sirve para el cochecito, el sofá o las fotos de los primeros días. Se puede pedir con las iniciales bordadas.',
  'Cada manta lleva unas doce horas de trabajo. Tejemos una ronda de color, otra de crudo, y así hasta que la estrella mide casi un metro.',
  array['Algodón peinado', 'Sin tintes agresivos'],
  'Lavado a mano o programa de lana a 30 °C. Secar en plano, nunca colgada.',
  '90 cm de punta a punta · 380 g',
  'Iniciales bordadas', 'A.M.', 4, 'Hasta 4 caracteres, en una esquina y en hilo del mismo tono.',
  null, 3, now()
);

insert into public.variantes (producto_id, nombre, color, stock, foto_ruta, posicion) values
  ((select id from public.productos where slug = 'manta-estrella'), 'Menta', '#9FD8B9', 1, '/fotos/productos/manta-estrella-1.jpg', 0),
  ((select id from public.productos where slug = 'manta-estrella'), 'Rosa', '#EFA3B4', 1, '/fotos/productos/manta-estrella-2.jpg', 1);

insert into public.fotos_producto (producto_id, ruta, alt, posicion) values
  ((select id from public.productos where slug = 'manta-estrella'), '/fotos/productos/manta-estrella-1.jpg', 'Manta de bebé de ganchillo en estrella, a ondas verde menta y crudo', 0),
  ((select id from public.productos where slug = 'manta-estrella'), '/fotos/productos/manta-estrella-2.jpg', 'Manta de bebé de ganchillo en estrella con ondas rosas y crudo', 1);

-- Bolso de red para el mercado
insert into public.productos (
  slug, nombre, categoria_id, tipo, estado, precio, antes, variante_etiqueta,
  destacado, novedad, encargo, dias, etiqueta,
  corto, largo, historia, materiales, cuidados, medidas,
  personalizacion_etiqueta, personalizacion_ejemplo, personalizacion_max, personalizacion_pista,
  contenido, posicion, publicado_en
) values (
  'bolso-red-mercado', 'Bolso de red para el mercado', (select id from public.categorias where slug = 'accesorios'), 'simple', 'publicado', 2200, null, 'Color',
  false, false, false, null, null,
  'Se pliega en el bolsillo y aguanta cinco kilos.',
  'Bolso de red en algodón con asas reforzadas. Plegado cabe en cualquier bolsillo y abierto aguanta la compra de la semana.',
  'Es el que más se repite: quien lo prueba ya no vuelve a las bolsas de plástico.',
  array['Algodón reciclado'],
  'Lavadora a 30 °C dentro de una bolsa de red.',
  '38 × 42 cm · asa de 60 cm',
  null, null, null, null,
  null, 4, now()
);

insert into public.variantes (producto_id, nombre, color, stock, foto_ruta, posicion) values
  ((select id from public.productos where slug = 'bolso-red-mercado'), 'Crudo', '#EDE6DA', 6, '/fotos/productos/bolso-red-mercado-1.jpg', 0),
  ((select id from public.productos where slug = 'bolso-red-mercado'), 'Rosa palo', '#E3C3BE', 3, '/fotos/productos/bolso-red-mercado-2.jpg', 1);

insert into public.fotos_producto (producto_id, ruta, alt, posicion) values
  ((select id from public.productos where slug = 'bolso-red-mercado'), '/fotos/productos/bolso-red-mercado-1.jpg', 'Bolsa de red de ganchillo color crudo con fruta dentro', 0),
  ((select id from public.productos where slug = 'bolso-red-mercado'), '/fotos/productos/bolso-red-mercado-2.jpg', 'Bolsa de malla de ganchillo rosa palo con flores blancas', 1);

-- Cojín de relieve
insert into public.productos (
  slug, nombre, categoria_id, tipo, estado, precio, antes, variante_etiqueta,
  destacado, novedad, encargo, dias, etiqueta,
  corto, largo, historia, materiales, cuidados, medidas,
  personalizacion_etiqueta, personalizacion_ejemplo, personalizacion_max, personalizacion_pista,
  contenido, posicion, publicado_en
) values (
  'cojin-relieve', 'Cojín de relieve', (select id from public.categorias where slug = 'hogar'), 'simple', 'publicado', 3400, null, 'Color',
  false, true, false, null, null,
  'Punto en relieve, flecos y funda extraíble.',
  'Cojín de 45 × 45 cm con franjas de punto en relieve y flecos a los lados. La funda lleva cremallera oculta para lavarla sin el relleno.',
  'Combina el crudo con un beis cálido para que encaje en casi cualquier sofá.',
  array['Algodón grueso', 'Cremallera metálica', 'Relleno incluido'],
  'Quitar el relleno y lavar la funda a 30 °C.',
  '45 × 45 cm',
  null, null, null, null,
  null, 5, now()
);

insert into public.variantes (producto_id, nombre, color, stock, foto_ruta, posicion) values
  ((select id from public.productos where slug = 'cojin-relieve'), 'Crudo y beis', '#D9C7AE', 5, '/fotos/productos/cojin-relieve-1.jpg', 0);

insert into public.fotos_producto (producto_id, ruta, alt, posicion) values
  ((select id from public.productos where slug = 'cojin-relieve'), '/fotos/productos/cojin-relieve-1.jpg', 'Cojín de ganchillo en crudo y beis con relieve y flecos', 0),
  ((select id from public.productos where slug = 'cojin-relieve'), '/fotos/productos/cojin-relieve-2.jpg', 'Cojín tejido a rayas crudo y beis con flecos laterales', 1);

-- Scrunchies degradado (pack de 4)
insert into public.productos (
  slug, nombre, categoria_id, tipo, estado, precio, antes, variante_etiqueta,
  destacado, novedad, encargo, dias, etiqueta,
  corto, largo, historia, materiales, cuidados, medidas,
  personalizacion_etiqueta, personalizacion_ejemplo, personalizacion_max, personalizacion_pista,
  contenido, posicion, publicado_en
) values (
  'scrunchies-degradado', 'Scrunchies degradado (pack de 4)', (select id from public.categorias where slug = 'accesorios'), 'simple', 'publicado', 1200, null, 'Color',
  false, false, false, null, null,
  'Cuatro coleteros que no marcan el pelo.',
  'Cuatro scrunchies de ganchillo en degradado, del rojo al crudo, con goma resistente forrada. Sujetan sin apretar y no dejan marca.',
  null,
  array['Algodón peinado', 'Goma elástica forrada'],
  'Lavar a mano.',
  '11 cm de diámetro',
  null, null, null, null,
  null, 6, now()
);

insert into public.variantes (producto_id, nombre, color, stock, foto_ruta, posicion) values
  ((select id from public.productos where slug = 'scrunchies-degradado'), 'Degradado rojo', '#D9534F', 0, '/fotos/productos/scrunchies-degradado-1.jpg', 0);

insert into public.fotos_producto (producto_id, ruta, alt, posicion) values
  ((select id from public.productos where slug = 'scrunchies-degradado'), '/fotos/productos/scrunchies-degradado-1.jpg', 'Scrunchies de ganchillo apilados en degradado de rojo a crudo', 0);

-- Cesta organizadora
insert into public.productos (
  slug, nombre, categoria_id, tipo, estado, precio, antes, variante_etiqueta,
  destacado, novedad, encargo, dias, etiqueta,
  corto, largo, historia, materiales, cuidados, medidas,
  personalizacion_etiqueta, personalizacion_ejemplo, personalizacion_max, personalizacion_pista,
  contenido, posicion, publicado_en
) values (
  'cesta-ovillos', 'Cesta organizadora', (select id from public.categorias where slug = 'hogar'), 'simple', 'publicado', 2900, null, 'Modelo',
  false, true, false, null, null,
  'Se mantiene de pie sola. Para el baño o el rincón de tejer.',
  'Cestas de ganchillo con la base reforzada, que aguantan de pie sin ayuda. La pareja blanca, de algodón, ordena el baño; la de zigzag, de trapillo, es más grande y se traga los ovillos o lo que haga falta recoger.',
  'Empezó como cesta para nuestros propios ovillos y ahora es de lo que más sale.',
  array['Algodón grueso (pareja blanca)', 'Trapillo de algodón (zigzag)', 'Base reforzada'],
  'Paño húmedo. No sumergir.',
  'Pareja blanca: 16 y 11 cm de diámetro · zigzag: 30 × 20 cm y 15 cm de alto',
  null, null, null, null,
  null, 7, now()
);

insert into public.variantes (producto_id, nombre, color, stock, foto_ruta, posicion) values
  ((select id from public.productos where slug = 'cesta-ovillos'), 'Pareja blanca', '#F2EFE9', 2, '/fotos/productos/cesta-ovillos-1.jpg', 0),
  ((select id from public.productos where slug = 'cesta-ovillos'), 'Zigzag', '#3A3A3A', 2, '/fotos/productos/cesta-ovillos-2.jpg', 1);

insert into public.fotos_producto (producto_id, ruta, alt, posicion) values
  ((select id from public.productos where slug = 'cesta-ovillos'), '/fotos/productos/cesta-ovillos-1.jpg', 'Pareja de cestas de ganchillo blancas usadas como organizadores de baño', 0),
  ((select id from public.productos where slug = 'cesta-ovillos'), '/fotos/productos/cesta-ovillos-2.jpg', 'Cesta de trapillo en zigzag blanco y negro llena de madejas', 1);

-- Gorro con pompón
insert into public.productos (
  slug, nombre, categoria_id, tipo, estado, precio, antes, variante_etiqueta,
  destacado, novedad, encargo, dias, etiqueta,
  corto, largo, historia, materiales, cuidados, medidas,
  personalizacion_etiqueta, personalizacion_ejemplo, personalizacion_max, personalizacion_pista,
  contenido, posicion, publicado_en
) values (
  'gorro-pompon', 'Gorro con pompón', (select id from public.categorias where slug = 'accesorios'), 'simple', 'publicado', 2600, null, 'Talla',
  false, true, true, 7, null,
  'Punto grueso a dos agujas y pompón a juego.',
  'Gorro de punto grueso, tejido a dos agujas, con vuelta acanalada y pompón del mismo ovillo. Abriga sin picar. En azul, en talla de niño o de adulto.',
  'Lo tejemos al pedir para ajustar la talla. Si dudas, mide el contorno de la cabeza y nos lo dices en la nota del pedido.',
  array['Lana merino'],
  'Lavar a mano en agua fría.',
  'Niño (2–6 años): 48–52 cm de contorno · adulto: 54–58 cm',
  null, null, null, null,
  null, 8, now()
);

insert into public.variantes (producto_id, nombre, color, stock, foto_ruta, posicion) values
  ((select id from public.productos where slug = 'gorro-pompon'), 'Niño (2–6 años)', '#4A63A8', 2, '/fotos/productos/gorro-pompon-1.jpg', 0),
  ((select id from public.productos where slug = 'gorro-pompon'), 'Adulto', '#4A63A8', 2, '/fotos/productos/gorro-pompon-1.jpg', 1);

insert into public.fotos_producto (producto_id, ruta, alt, posicion) values
  ((select id from public.productos where slug = 'gorro-pompon'), '/fotos/productos/gorro-pompon-1.jpg', 'Gorro de punto azul con pompón sobre madera clara', 0),
  ((select id from public.productos where slug = 'gorro-pompon'), '/fotos/productos/gorro-pompon-2.jpg', 'Gorro de punto azul con pompón, ovillo a juego y agujas de madera', 1);

-- Guirnalda de corazones
insert into public.productos (
  slug, nombre, categoria_id, tipo, estado, precio, antes, variante_etiqueta,
  destacado, novedad, encargo, dias, etiqueta,
  corto, largo, historia, materiales, cuidados, medidas,
  personalizacion_etiqueta, personalizacion_ejemplo, personalizacion_max, personalizacion_pista,
  contenido, posicion, publicado_en
) values (
  'guirnalda-corazones', 'Guirnalda de corazones', (select id from public.categorias where slug = 'bebe'), 'simple', 'publicado', 2400, null, 'Color',
  true, false, false, null, 'Recién sacada',
  'Corazones tejidos, cuentas de madera y lazo.',
  'Guirnalda para la habitación del bebé con corazones de ganchillo rellenos, cuentas de madera natural y lazo de satén. Para colgar en la pared o en la estantería, siempre fuera de su alcance.',
  'Nació como encargo para una habitación en tonos rosas y quedó tan bien que se quedó en el catálogo.',
  array['Algodón 100 %', 'Relleno hipoalergénico', 'Cuentas de haya sin barnizar'],
  'Paño húmedo o lavado a mano muy suave.',
  '60 cm de largo',
  null, null, null, null,
  null, 9, now()
);

insert into public.variantes (producto_id, nombre, color, stock, foto_ruta, posicion) values
  ((select id from public.productos where slug = 'guirnalda-corazones'), 'Rosa', '#F2C4CE', 1, '/fotos/productos/guirnalda-corazones-1.jpg', 0);

insert into public.fotos_producto (producto_id, ruta, alt, posicion) values
  ((select id from public.productos where slug = 'guirnalda-corazones'), '/fotos/productos/guirnalda-corazones-1.jpg', 'Guirnalda infantil con corazón rosa de ganchillo, cuentas y eucalipto', 0);

-- Pack de cocina
insert into public.productos (
  slug, nombre, categoria_id, tipo, estado, precio, antes, variante_etiqueta,
  destacado, novedad, encargo, dias, etiqueta,
  corto, largo, historia, materiales, cuidados, medidas,
  personalizacion_etiqueta, personalizacion_ejemplo, personalizacion_max, personalizacion_pista,
  contenido, posicion, publicado_en
) values (
  'pack-cocina', 'Pack de cocina', (select id from public.categorias where slug = 'packs'), 'pack', 'publicado', 3200, 3900, 'Color',
  false, false, false, null, null,
  'Tres paños y cuatro posavasos.',
  'Para quien estrena casa: tres paños de cocina de algodón y cuatro posavasos a juego. Aguantan la lavadora una y otra vez.',
  null,
  array['Algodón 100 %'],
  'Lavadora a 40 °C.',
  'Paño 25 × 25 cm · posavasos 10 cm',
  null, null, null, null,
  array['3 paños de cocina', '4 posavasos'], 10, now()
);

insert into public.variantes (producto_id, nombre, color, stock, foto_ruta, posicion) values
  ((select id from public.productos where slug = 'pack-cocina'), 'Salvia, coral y crema', '#BFD1C3', 3, '/fotos/productos/pack-cocina-1.jpg', 0),
  ((select id from public.productos where slug = 'pack-cocina'), 'Gris', '#A7A9AC', 2, '/fotos/productos/pack-cocina-2.jpg', 1);

insert into public.fotos_producto (producto_id, ruta, alt, posicion) values
  ((select id from public.productos where slug = 'pack-cocina'), '/fotos/productos/pack-cocina-1.jpg', 'Tres paños de ganchillo en salvia, coral y crema colgados', 0),
  ((select id from public.productos where slug = 'pack-cocina'), '/fotos/productos/pack-cocina-2.jpg', 'Posavasos y paños de ganchillo grises con ovillo y aguja', 1);

-- Promociones
insert into public.promociones (nombre, tipo, valor, codigo, minimo, categoria_id, hasta) values
  ('Rebajas de accesorios', 'porcentaje', 15, null, 0, (select id from public.categorias where slug = 'accesorios'), null),
  ('Bienvenida 10 %', 'porcentaje', 10, 'HOLA10', 1500, null, null),
  ('Envío gratis', 'envio', 0, 'ENVIOGRATIS', 3000, null, null),
  ('5 € de regalo', 'fijo', 500, 'PRIMERA5', 2000, null, null);

-- Métodos de envío
insert into public.metodos_envio (id, nombre, precio, gratis_desde, plazo, posicion) values
  ('ordinario', 'Envío ordinario', 395, 5000, '3–5 días laborables', 0),
  ('express', 'Envío urgente', 695, null, '24–48 horas', 1),
  ('recogida', 'Recogida en el taller', 0, null, 'En Málaga, con cita', 2);

commit;
