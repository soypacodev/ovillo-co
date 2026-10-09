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
  'cesta-organizadora', 'Cesta organizadora', (select id from public.categorias where slug = 'hogar'), 'simple', 'publicado', 2900, null, 'Modelo',
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
  ((select id from public.productos where slug = 'cesta-organizadora'), 'Pareja blanca', '#F2EFE9', 2, '/fotos/productos/cesta-organizadora-1.jpg', 0),
  ((select id from public.productos where slug = 'cesta-organizadora'), 'Zigzag', '#3A3A3A', 2, '/fotos/productos/cesta-organizadora-2.jpg', 1);

insert into public.fotos_producto (producto_id, ruta, alt, posicion) values
  ((select id from public.productos where slug = 'cesta-organizadora'), '/fotos/productos/cesta-organizadora-1.jpg', 'Pareja de cestas de ganchillo blancas usadas como organizadores de baño', 0),
  ((select id from public.productos where slug = 'cesta-organizadora'), '/fotos/productos/cesta-organizadora-2.jpg', 'Cesta de trapillo en zigzag blanco y negro llena de madejas', 1);

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

-- Traducciones (inglés, francés y alemán)
update public.categorias set traducciones = '{"en":{"nombre":"Amigurumi","texto":"Little characters crocheted one at a time.","alt":"Crocheted teddy bear in a lilac dress and turquoise scarf"},"fr":{"nombre":"Amigurumis","texto":"Des petits personnages crochetés un à un.","alt":"Ourse au crochet en robe lilas et écharpe turquoise"},"de":{"nombre":"Amigurumis","texto":"Kuschelfiguren, Stück für Stück gehäkelt.","alt":"Gehäkelte Bärin mit fliederfarbenem Kleid und türkisem Schal"}}'::jsonb where slug = 'amigurumis';
update public.categorias set traducciones = '{"en":{"nombre":"Baby","texto":"Softness for those very first months.","alt":"Crocheted star-shaped baby blanket with pink and natural ripples"},"fr":{"nombre":"Bébé","texto":"De la douceur pour les premiers mois.","alt":"Couverture bébé étoile au crochet, à vagues roses et écru"},"de":{"nombre":"Baby","texto":"Ganz viel Weiches für die ersten Monate.","alt":"Gehäkelte Babydecke in Sternform mit rosa und naturweißen Wellen"}}'::jsonb where slug = 'bebe';
update public.categorias set traducciones = '{"en":{"nombre":"Accessories","texto":"Bags, scrunchies and hats.","alt":"Natural-coloured crochet string bag with fruit inside"},"fr":{"nombre":"Accessoires","texto":"Sacs, chouchous et bonnets.","alt":"Filet à provisions au crochet écru rempli de fruits"},"de":{"nombre":"Accessoires","texto":"Taschen, Scrunchies und Mützen.","alt":"Gehäkeltes Einkaufsnetz in Naturweiß mit Obst darin"}}'::jsonb where slug = 'accesorios';
update public.categorias set traducciones = '{"en":{"nombre":"Home","texto":"Cushions and baskets.","alt":"Natural and beige textured crochet cushion with fringing"},"fr":{"nombre":"Maison","texto":"Coussins et paniers.","alt":"Coussin au crochet écru et beige, en relief et à franges"},"de":{"nombre":"Wohnen","texto":"Kissen und Körbe.","alt":"Gehäkeltes Kissen in Naturweiß und Beige mit Reliefmuster und Fransen"}}'::jsonb where slug = 'hogar';
update public.categorias set traducciones = '{"en":{"nombre":"Gift sets","texto":"Sets that are ready to give.","alt":"Grey-blue knitted baby bonnet on a muslin cloth"},"fr":{"nombre":"Coffrets","texto":"Des ensembles prêts à offrir.","alt":"Béguin bébé tricoté gris-bleu posé sur une mousseline"},"de":{"nombre":"Sets","texto":"Fertig zum Verschenken.","alt":"Gestricktes Babyhäubchen in Graublau auf einem Musselintuch"}}'::jsonb where slug = 'packs';
update public.productos set traducciones = '{"en":{"nombre":"Newborn gift set","etiquetaVariante":"Size","etiqueta":"Our most-gifted","corto":"A matching knitted bonnet and booties, in a gift box.","largo":"A knitted bonnet with ties and matching booties, both in the same soft grey-blue and presented in a box finished with a ribbon. Choose the size and we’ll knit it just for you.","historia":"It’s the present we’re asked for most when someone’s off to the hospital. We knit it in the size you choose and let you know as soon as it leaves the workshop.","materiales":["Extra-fine merino wool","Recycled cardboard box","Cotton ribbon"],"cuidados":"Hand wash or wool cycle at 30 °C. Dry flat.","medidas":"Size 0–3 months (bonnet 36 cm around) or 3–6 months (40 cm)","contenido":["Bonnet with ties","Pair of booties","Gift box with ribbon"],"variantes":{"0–3 meses":"0–3 months","3–6 meses":"3–6 months"},"fotos":["Grey-blue knitted baby bonnet on a muslin cloth","Grey-blue knitted booties beside a white cuddly seal"]},"fr":{"nombre":"Coffret naissance","etiquetaVariante":"Taille","etiqueta":"Le plus offert","corto":"Béguin et chaussons tricotés assortis, en boîte cadeau.","largo":"Un béguin tricoté à lacets et ses chaussons assortis, dans le même gris-bleu tout doux, présentés dans une boîte fermée d’un ruban. Vous choisissez la taille, nous le tricotons pour vous.","historia":"C’est le cadeau qu’on nous demande le plus pour une visite à la maternité. Nous le tricotons dans la taille choisie et vous prévenons dès qu’il quitte l’atelier.","materiales":["Laine mérinos extrafine","Boîte en carton recyclé","Ruban en coton"],"cuidados":"Lavage à la main ou programme laine à 30 °C. Séchage à plat.","medidas":"Taille 0–3 mois (béguin de 36 cm de tour de tête) ou 3–6 mois (40 cm)","contenido":["Béguin à lacets","Paire de chaussons","Boîte cadeau avec ruban"],"variantes":{"0–3 meses":"0–3 mois","3–6 meses":"3–6 mois"},"fotos":["Béguin bébé tricoté gris-bleu posé sur une mousseline","Chaussons tricotés gris-bleu à côté d’un phoque en peluche blanc"]},"de":{"nombre":"Erstlingsset","etiquetaVariante":"Größe","etiqueta":"Unser Geschenk-Liebling","corto":"Gestricktes Häubchen und passende Schühchen in der Geschenkbox.","largo":"Ein gestricktes Häubchen zum Binden und passende Schühchen, beides im selben sanften Graublau und in einer Schachtel mit Schleife verpackt. Sie wählen die Größe, wir stricken es für Sie.","historia":"Das Geschenk, das man sich bei uns für den Besuch im Krankenhaus am häufigsten wünscht. Wir stricken es in Ihrer Wunschgröße und sagen Ihnen Bescheid, sobald es die Werkstatt verlässt.","materiales":["Extrafeine Merinowolle","Schachtel aus Recyclingkarton","Baumwollschleife"],"cuidados":"Handwäsche oder Wollprogramm bei 30 °C. Liegend trocknen.","medidas":"Größe 0–3 Monate (Häubchen mit 36 cm Kopfumfang) oder 3–6 Monate (40 cm)","contenido":["Häubchen zum Binden","Ein Paar Schühchen","Geschenkbox mit Schleife"],"variantes":{"0–3 meses":"0–3 Monate","3–6 meses":"3–6 Monate"},"fotos":["Gestricktes Babyhäubchen in Graublau auf einem Musselintuch","Gestrickte Schühchen in Graublau neben einer weißen Plüschrobbe"]}}'::jsonb where slug = 'set-recien-nacido';
update public.productos set traducciones = '{"en":{"nombre":"Teddy bear in a lilac dress","etiquetaVariante":"Colour","corto":"A ruffled dress, a turquoise scarf and a bow on one ear.","largo":"A crocheted teddy in beige cotton, wearing a ruffled lilac dress, a turquoise scarf stitched at the neck and a pink bow. Snap-lock safety eyes, an embroidered snout and hypoallergenic stuffing. Recommended for ages 3 and up; if she’s for a baby, we’ll make her with embroidered eyes instead.","historia":"She’s the piece we’re asked for most for birthdays. Each bear takes about five hours to make, and her dress can be ordered in another colour.","materiales":["100% cotton","Hypoallergenic hollow-fibre stuffing"],"cuidados":"Hand wash in cold water. Dry flat, never tumble dry.","medidas":"28 cm tall","variantes":{"Beis y lila":"Beige and lilac"},"fotos":["Crocheted teddy bear in a lilac dress and turquoise scarf"]},"fr":{"nombre":"Ourse à la robe lilas","etiquetaVariante":"Couleur","corto":"Robe à volants, écharpe turquoise et nœud sur l’oreille.","largo":"Une petite ourse au crochet en coton beige, vêtue d’une robe lilas à volants, d’une écharpe turquoise cousue au cou et d’un nœud rose. Yeux de sécurité à clip, museau brodé et rembourrage hypoallergénique. Recommandée dès 3 ans ; pour un bébé, nous la réalisons avec des yeux brodés.","historia":"C’est la pièce qu’on nous demande le plus pour les anniversaires. Chaque ourse représente environ cinq heures de travail, et sa robe peut être commandée dans une autre couleur.","materiales":["100 % coton","Rembourrage en fibre creuse hypoallergénique"],"cuidados":"Lavage à la main à l’eau froide. Séchage à plat, jamais au sèche-linge.","medidas":"28 cm de haut","variantes":{"Beis y lila":"Beige et lilas"},"fotos":["Ourse au crochet en robe lilas et écharpe turquoise"]},"de":{"nombre":"Bärin im Fliederkleid","etiquetaVariante":"Farbe","corto":"Rüschenkleid, türkiser Schal und eine Schleife am Ohr.","largo":"Gehäkelte Bärin aus beiger Baumwolle mit fliederfarbenem Rüschenkleid, einem am Hals festgenähten türkisen Schal und rosa Schleife. Sicherheitsaugen mit Druckverschluss, gestickte Schnauze und hypoallergene Füllung. Empfohlen ab 3 Jahren; ist sie für ein Baby gedacht, häkeln wir sie Ihnen gern mit gestickten Augen.","historia":"Unser meistgewünschtes Stück zum Geburtstag. In jeder Bärin stecken rund fünf Stunden Arbeit, und das Kleid gibt es auf Wunsch auch in einer anderen Farbe.","materiales":["100 % Baumwolle","Hypoallergene Hohlfaserfüllung"],"cuidados":"Handwäsche in kaltem Wasser. Liegend trocknen, nie in den Trockner.","medidas":"28 cm hoch","variantes":{"Beis y lila":"Beige und Flieder"},"fotos":["Gehäkelte Bärin mit fliederfarbenem Kleid und türkisem Schal"]}}'::jsonb where slug = 'osita-vestido-lila';
update public.productos set traducciones = '{"en":{"nombre":"Sleepy fawn","etiquetaVariante":"Colour","corto":"Closed eyes, a pink bow and a very deep sleep.","largo":"A crocheted fawn in natural and beige, with a pink bow and collar and embroidered eyes, always fast asleep. Hypoallergenic stuffing and no parts that could come loose: safe for babies from day one.","historia":"This is where the workshop began: we made him for a baby who struggled to drift off, and he’s never left the catalogue since. He fits in a small hand.","materiales":["100% cotton","Hypoallergenic hollow-fibre stuffing"],"cuidados":"Hand wash in cold water. Dry flat, never tumble dry.","medidas":"16 cm long","variantes":{"Crudo y rosa":"Natural and pink"},"fotos":["Sleeping crocheted fawn beside a pink crocheted heart"]},"fr":{"nombre":"Petit faon endormi","etiquetaVariante":"Couleur","corto":"Yeux fermés, nœud rose et un sommeil bien profond.","largo":"Un faon au crochet écru et beige, avec nœud et col roses et yeux brodés, toujours endormi. Rembourrage hypoallergénique et aucune pièce susceptible de se détacher : il convient aux bébés dès la naissance.","historia":"C’est avec lui que l’atelier a commencé : nous l’avons crocheté pour un bébé qui avait du mal à s’endormir, et il n’a jamais quitté le catalogue. Il tient dans une petite main.","materiales":["100 % coton","Rembourrage en fibre creuse hypoallergénique"],"cuidados":"Lavage à la main à l’eau froide. Séchage à plat, jamais au sèche-linge.","medidas":"16 cm de long","variantes":{"Crudo y rosa":"Écru et rose"},"fotos":["Faon au crochet endormi à côté d’un cœur rose au crochet"]},"de":{"nombre":"Verschlafenes Rehkitz","etiquetaVariante":"Farbe","corto":"Geschlossene Augen, rosa Schleife und ein ganz tiefer Schlaf.","largo":"Gehäkeltes Rehkitz in Naturweiß und Beige, mit rosa Schleife, rosa Kragen und gestickten Augen – immer im Land der Träume. Hypoallergene Füllung und keine Teile, die sich lösen könnten: vom ersten Tag an für Babys geeignet.","historia":"Mit ihm hat die Werkstatt angefangen: Wir haben es für ein Baby gehäkelt, das schwer in den Schlaf fand, und seitdem ist es nie aus dem Sortiment verschwunden. Es passt in eine kleine Hand.","materiales":["100 % Baumwolle","Hypoallergene Hohlfaserfüllung"],"cuidados":"Handwäsche in kaltem Wasser. Liegend trocknen, nie in den Trockner.","medidas":"16 cm lang","variantes":{"Crudo y rosa":"Naturweiß und Rosa"},"fotos":["Schlafendes gehäkeltes Rehkitz neben einem rosa Häkelherz"]}}'::jsonb where slug = 'cervatillo-dormilon';
update public.productos set traducciones = '{"en":{"nombre":"Star blanket","etiquetaVariante":"Colour","corto":"A star-shaped blanket in soft ripples, for the pram or the sofa.","largo":"A crocheted star-shaped blanket with ripples of colour radiating from the centre. Light yet warm, it’s lovely in the pram, on the sofa or in those first-days photos. Can be ordered with embroidered initials.","historia":"Each blanket takes about twelve hours. We crochet a round of colour, then a round of natural, and so on until the star measures almost a metre across.","materiales":["Combed cotton","No harsh dyes"],"cuidados":"Hand wash or wool cycle at 30 °C. Dry flat, never hang to dry.","medidas":"90 cm from point to point · 380 g","personalizable":{"etiqueta":"Embroidered initials","ejemplo":"A.M.","pista":"Up to 4 characters, in one corner, in thread of the same shade."},"variantes":{"Menta":"Mint","Rosa":"Pink"},"fotos":["Crocheted star baby blanket with mint green and natural ripples","Crocheted star baby blanket with pink and natural ripples"]},"fr":{"nombre":"Couverture étoile","etiquetaVariante":"Couleur","corto":"Une couverture en étoile aux vagues douces, pour la poussette ou le canapé.","largo":"Couverture au crochet en forme d’étoile, avec des vagues de couleur qui rayonnent depuis le centre. Légère mais chaude, elle accompagne la poussette, le canapé ou les photos des premiers jours. Elle peut être commandée avec des initiales brodées.","historia":"Chaque couverture représente environ douze heures de travail. Nous crochetons un rang de couleur, puis un rang d’écru, et ainsi de suite jusqu’à ce que l’étoile mesure presque un mètre.","materiales":["Coton peigné","Sans teintures agressives"],"cuidados":"Lavage à la main ou programme laine à 30 °C. Séchage à plat, jamais suspendue.","medidas":"90 cm d’une pointe à l’autre · 380 g","personalizable":{"etiqueta":"Initiales brodées","ejemplo":"A.M.","pista":"Jusqu’à 4 caractères, brodés dans un coin avec un fil du même ton."},"variantes":{"Menta":"Menthe","Rosa":"Rose"},"fotos":["Couverture bébé étoile au crochet, à vagues vert menthe et écru","Couverture bébé étoile au crochet, à vagues roses et écru"]},"de":{"nombre":"Sterndecke","etiquetaVariante":"Farbe","corto":"Decke in Sternform mit sanften Wellen – für Kinderwagen oder Sofa.","largo":"Gehäkelte Decke in Sternform, deren Farbwellen von der Mitte aus nach außen laufen. Leicht und trotzdem warm – ideal für den Kinderwagen, das Sofa oder die Fotos der ersten Tage. Auf Wunsch mit gestickten Initialen.","historia":"In jeder Decke stecken rund zwölf Stunden Arbeit. Wir häkeln eine Runde in Farbe, eine in Naturweiß und immer so weiter, bis der Stern fast einen Meter misst.","materiales":["Gekämmte Baumwolle","Ohne aggressive Farbstoffe"],"cuidados":"Handwäsche oder Wollprogramm bei 30 °C. Liegend trocknen, nie aufhängen.","medidas":"90 cm von Spitze zu Spitze · 380 g","personalizable":{"etiqueta":"Gestickte Initialen","ejemplo":"A.M.","pista":"Bis zu 4 Zeichen, in einer Ecke und mit Garn im gleichen Farbton."},"variantes":{"Menta":"Mint","Rosa":"Rosa"},"fotos":["Gehäkelte Babydecke in Sternform mit Wellen in Mintgrün und Naturweiß","Gehäkelte Babydecke in Sternform mit rosa und naturweißen Wellen"]}}'::jsonb where slug = 'manta-estrella';
update public.productos set traducciones = '{"en":{"nombre":"Market string bag","etiquetaVariante":"Colour","corto":"Folds into your pocket and carries up to five kilos.","largo":"A cotton string bag with reinforced handles. Folded up, it fits in any pocket; opened out, it carries the whole week’s shopping.","historia":"It’s our most re-ordered piece: once people try it, they never go back to plastic bags.","materiales":["Recycled cotton"],"cuidados":"Machine wash at 30 °C inside a mesh laundry bag.","medidas":"38 × 42 cm · 60 cm handle","variantes":{"Crudo":"Natural","Rosa palo":"Dusty pink"},"fotos":["Natural-coloured crochet string bag with fruit inside","Dusty pink crochet mesh bag with white flowers"]},"fr":{"nombre":"Filet à provisions","etiquetaVariante":"Couleur","corto":"Il se glisse dans la poche et porte jusqu’à cinq kilos.","largo":"Filet en coton aux anses renforcées. Plié, il tient dans n’importe quelle poche ; ouvert, il emporte les courses de la semaine.","historia":"C’est celui que l’on nous recommande le plus : qui l’essaie ne revient plus aux sacs en plastique.","materiales":["Coton recyclé"],"cuidados":"Lavage en machine à 30 °C dans un filet de lavage.","medidas":"38 × 42 cm · anse de 60 cm","variantes":{"Crudo":"Écru","Rosa palo":"Vieux rose"},"fotos":["Filet à provisions au crochet écru rempli de fruits","Filet au crochet vieux rose orné de fleurs blanches"]},"de":{"nombre":"Einkaufsnetz für den Markt","etiquetaVariante":"Farbe","corto":"Passt gefaltet in die Hosentasche und trägt bis zu fünf Kilo.","largo":"Einkaufsnetz aus Baumwolle mit verstärkten Henkeln. Zusammengefaltet passt es in jede Tasche, aufgefaltet trägt es den ganzen Wocheneinkauf.","historia":"Unser Nachbestell-Favorit: Wer es einmal ausprobiert, greift nie wieder zur Plastiktüte.","materiales":["Recycelte Baumwolle"],"cuidados":"Maschinenwäsche bei 30 °C in einem Wäschenetz.","medidas":"38 × 42 cm · Henkel 60 cm","variantes":{"Crudo":"Naturweiß","Rosa palo":"Altrosa"},"fotos":["Gehäkeltes Einkaufsnetz in Naturweiß mit Obst darin","Gehäkeltes Netz in Altrosa mit weißen Blumen"]}}'::jsonb where slug = 'bolso-red-mercado';
update public.productos set traducciones = '{"en":{"nombre":"Textured cushion","etiquetaVariante":"Colour","corto":"Raised stitches, fringing and a removable cover.","largo":"A 45 × 45 cm cushion with bands of raised stitches and fringing along the sides. The cover has a hidden zip, so you can wash it without the pad.","historia":"It pairs natural with a warm beige, so it sits happily on almost any sofa.","materiales":["Chunky cotton","Metal zip","Cushion pad included"],"cuidados":"Remove the pad and wash the cover at 30 °C.","medidas":"45 × 45 cm","variantes":{"Crudo y beis":"Natural and beige"},"fotos":["Natural and beige textured crochet cushion with fringing","Striped knitted cushion in natural and beige with fringed sides"]},"fr":{"nombre":"Coussin en relief","etiquetaVariante":"Couleur","corto":"Points en relief, franges et housse amovible.","largo":"Coussin de 45 × 45 cm à bandes de points en relief, avec des franges sur les côtés. La housse se ferme par une fermeture éclair invisible pour la laver sans le garnissage.","historia":"Il marie l’écru à un beige chaleureux pour trouver sa place sur presque tous les canapés.","materiales":["Coton épais","Fermeture éclair métallique","Garnissage inclus"],"cuidados":"Retirer le garnissage et laver la housse à 30 °C.","medidas":"45 × 45 cm","variantes":{"Crudo y beis":"Écru et beige"},"fotos":["Coussin au crochet écru et beige, en relief et à franges","Coussin tricoté à rayures écru et beige, franges sur les côtés"]},"de":{"nombre":"Kissen mit Reliefmuster","etiquetaVariante":"Farbe","corto":"Reliefmuster, Fransen und abnehmbarer Bezug.","largo":"Kissen in 45 × 45 cm mit Streifen im Reliefmuster und Fransen an den Seiten. Der Bezug hat einen verdeckten Reißverschluss, sodass Sie ihn ohne Füllung waschen können.","historia":"Naturweiß trifft auf warmes Beige – so passt es zu fast jedem Sofa.","materiales":["Kräftige Baumwolle","Metallreißverschluss","Inklusive Füllung"],"cuidados":"Füllung herausnehmen und den Bezug bei 30 °C waschen.","medidas":"45 × 45 cm","variantes":{"Crudo y beis":"Naturweiß und Beige"},"fotos":["Gehäkeltes Kissen in Naturweiß und Beige mit Reliefmuster und Fransen","Gestreiftes Strickkissen in Naturweiß und Beige mit seitlichen Fransen"]}}'::jsonb where slug = 'cojin-relieve';
update public.productos set traducciones = '{"en":{"nombre":"Ombré scrunchies (set of 4)","etiquetaVariante":"Colour","corto":"Four scrunchies that won’t leave a kink in your hair.","largo":"Four crocheted scrunchies in an ombré from red to natural, with a strong covered elastic. They hold without pulling and leave no marks.","materiales":["Combed cotton","Covered elastic"],"cuidados":"Hand wash.","medidas":"11 cm in diameter","variantes":{"Degradado rojo":"Red ombré"},"fotos":["Stack of crocheted scrunchies fading from red to natural"]},"fr":{"nombre":"Chouchous dégradés (lot de 4)","etiquetaVariante":"Couleur","corto":"Quatre chouchous qui ne marquent pas les cheveux.","largo":"Quatre chouchous au crochet en dégradé, du rouge à l’écru, avec un élastique gainé bien résistant. Ils tiennent sans serrer et ne laissent aucune trace.","materiales":["Coton peigné","Élastique gainé"],"cuidados":"Lavage à la main.","medidas":"11 cm de diamètre","variantes":{"Degradado rojo":"Dégradé rouge"},"fotos":["Chouchous au crochet empilés, en dégradé du rouge à l’écru"]},"de":{"nombre":"Scrunchies im Farbverlauf (4er-Set)","etiquetaVariante":"Farbe","corto":"Vier Haargummis, die keine Abdrücke im Haar hinterlassen.","largo":"Vier gehäkelte Scrunchies im Farbverlauf von Rot bis Naturweiß, mit kräftigem, ummanteltem Gummiband. Sie halten, ohne zu ziepen, und hinterlassen keine Abdrücke.","materiales":["Gekämmte Baumwolle","Ummanteltes Gummiband"],"cuidados":"Handwäsche.","medidas":"11 cm Durchmesser","variantes":{"Degradado rojo":"Rotverlauf"},"fotos":["Gestapelte gehäkelte Scrunchies im Farbverlauf von Rot bis Naturweiß"]}}'::jsonb where slug = 'scrunchies-degradado';
update public.productos set traducciones = '{"en":{"nombre":"Storage basket","etiquetaVariante":"Style","corto":"Stands up all by itself. For the bathroom or your crafting corner.","largo":"Crocheted baskets with a reinforced base that stand up without any help. The white pair, in cotton, keeps the bathroom tidy; the zigzag one, in T-shirt yarn, is bigger and swallows balls of yarn or whatever else needs tidying away.","historia":"It started out as a basket for our own yarn and is now one of our best sellers.","materiales":["Chunky cotton (white pair)","Cotton T-shirt yarn (zigzag)","Reinforced base"],"cuidados":"Wipe with a damp cloth. Do not submerge.","medidas":"White pair: 16 and 11 cm in diameter · zigzag: 30 × 20 cm and 15 cm tall","variantes":{"Pareja blanca":"White pair","Zigzag":"Zigzag"},"fotos":["Pair of white crocheted baskets used as bathroom organisers","Black and white zigzag T-shirt yarn basket full of skeins"]},"fr":{"nombre":"Panier de rangement","etiquetaVariante":"Modèle","corto":"Il tient debout tout seul. Pour la salle de bains ou le coin tricot.","largo":"Paniers au crochet à la base renforcée, qui tiennent debout sans aide. Le duo blanc, en coton, range la salle de bains ; le zigzag, en trapilho, plus grand, avale les pelotes et tout ce qui traîne.","historia":"Au départ, c’était le panier de nos propres pelotes ; aujourd’hui, c’est l’un de nos best-sellers.","materiales":["Coton épais (duo blanc)","Trapilho en coton (zigzag)","Base renforcée"],"cuidados":"Chiffon humide. Ne pas immerger.","medidas":"Duo blanc : 16 et 11 cm de diamètre · zigzag : 30 × 20 cm et 15 cm de haut","variantes":{"Pareja blanca":"Duo blanc","Zigzag":"Zigzag"},"fotos":["Deux paniers au crochet blancs pour ranger la salle de bains","Panier en trapilho à zigzag noir et blanc rempli d’écheveaux"]},"de":{"nombre":"Aufbewahrungskorb","etiquetaVariante":"Modell","corto":"Steht ganz von allein. Fürs Bad oder die Handarbeitsecke.","largo":"Gehäkelte Körbe mit verstärktem Boden, die ohne Hilfe stehen. Das weiße Duo aus Baumwolle bringt Ordnung ins Bad; der Zickzack-Korb aus Textilgarn ist größer und schluckt Wollknäuel oder was sonst aufgeräumt werden will.","historia":"Angefangen hat er als Korb für unsere eigenen Wollknäuel – heute gehört er zu unseren Bestsellern.","materiales":["Kräftige Baumwolle (weißes Duo)","Textilgarn aus Baumwolle (Zickzack)","Verstärkter Boden"],"cuidados":"Mit einem feuchten Tuch abwischen. Nicht eintauchen.","medidas":"Weißes Duo: 16 und 11 cm Durchmesser · Zickzack: 30 × 20 cm, 15 cm hoch","variantes":{"Pareja blanca":"Weißes Duo","Zigzag":"Zickzack"},"fotos":["Zwei weiße gehäkelte Körbe als Ordnungshelfer im Bad","Korb aus Textilgarn im schwarz-weißen Zickzackmuster voller Wollstränge"]}}'::jsonb where slug = 'cesta-organizadora';
update public.productos set traducciones = '{"en":{"nombre":"Bobble hat","etiquetaVariante":"Size","corto":"Chunky knit on two needles, with a matching pompom.","largo":"A chunky knitted hat, worked on two needles, with a ribbed turn-up and a pompom made from the same ball of yarn. All the warmth, none of the itch. In blue, in child or adult size.","historia":"We knit it to order so the size is just right. If you’re unsure, measure around the head and let us know in the order note.","materiales":["Merino wool"],"cuidados":"Hand wash in cold water.","medidas":"Child (2–6 years): 48–52 cm head circumference · adult: 54–58 cm","variantes":{"Niño (2–6 años)":"Child (2–6 years)","Adulto":"Adult"},"fotos":["Blue knitted bobble hat on pale wood","Blue knitted bobble hat with matching yarn and wooden needles"]},"fr":{"nombre":"Bonnet à pompon","etiquetaVariante":"Taille","corto":"Grosse maille tricotée aux deux aiguilles et pompon assorti.","largo":"Bonnet en grosse maille, tricoté aux deux aiguilles, avec revers côtelé et pompon fait de la même pelote. Il tient chaud sans gratter. En bleu, taille enfant ou adulte.","historia":"Nous le tricotons à la commande pour ajuster la taille. En cas de doute, mesurez le tour de tête et indiquez-le-nous dans la note de commande.","materiales":["Laine mérinos"],"cuidados":"Lavage à la main à l’eau froide.","medidas":"Enfant (2–6 ans) : 48–52 cm de tour de tête · adulte : 54–58 cm","variantes":{"Niño (2–6 años)":"Enfant (2–6 ans)","Adulto":"Adulte"},"fotos":["Bonnet tricoté bleu à pompon sur du bois clair","Bonnet bleu à pompon avec pelote assortie et aiguilles en bois"]},"de":{"nombre":"Bommelmütze","etiquetaVariante":"Größe","corto":"Grobstrick mit zwei Nadeln und passendem Bommel.","largo":"Mütze aus grobem Strick, mit zwei Nadeln gestrickt, mit gerippter Krempe und einem Bommel aus demselben Knäuel. Wärmt, ohne zu kratzen. In Blau, in Kinder- oder Erwachsenengröße.","historia":"Wir stricken sie erst nach Ihrer Bestellung, damit die Größe genau passt. Wenn Sie unsicher sind, messen Sie den Kopfumfang und schreiben Sie ihn uns in die Bestellnotiz.","materiales":["Merinowolle"],"cuidados":"Handwäsche in kaltem Wasser.","medidas":"Kinder (2–6 Jahre): 48–52 cm Kopfumfang · Erwachsene: 54–58 cm","variantes":{"Niño (2–6 años)":"Kinder (2–6 Jahre)","Adulto":"Erwachsene"},"fotos":["Blaue Strickmütze mit Bommel auf hellem Holz","Blaue Bommelmütze mit passendem Knäuel und Holznadeln"]}}'::jsonb where slug = 'gorro-pompon';
update public.productos set traducciones = '{"en":{"nombre":"Heart garland","etiquetaVariante":"Colour","etiqueta":"Fresh off the hook","corto":"Crocheted hearts, wooden beads and a ribbon.","largo":"A nursery garland with stuffed crochet hearts, natural wooden beads and a satin ribbon. Hang it on the wall or from a shelf, always well out of baby’s reach.","historia":"It began as a custom order for a nursery in shades of pink and turned out so well that it stayed in the catalogue.","materiales":["100% cotton","Hypoallergenic stuffing","Unvarnished beech beads"],"cuidados":"Damp cloth or a very gentle hand wash.","medidas":"60 cm long","variantes":{"Rosa":"Pink"},"fotos":["Nursery garland with a pink crochet heart, beads and eucalyptus"]},"fr":{"nombre":"Guirlande de cœurs","etiquetaVariante":"Couleur","etiqueta":"Tout juste crochetée","corto":"Cœurs au crochet, perles en bois et ruban.","largo":"Guirlande pour la chambre de bébé, avec des cœurs au crochet rembourrés, des perles en bois naturel et un ruban de satin. À suspendre au mur ou à une étagère, toujours hors de sa portée.","historia":"Elle est née d’une commande sur mesure pour une chambre aux tons roses, et le résultat nous a tant plu qu’elle est restée au catalogue.","materiales":["100 % coton","Rembourrage hypoallergénique","Perles en hêtre non vernies"],"cuidados":"Chiffon humide ou lavage à la main très délicat.","medidas":"60 cm de long","variantes":{"Rosa":"Rose"},"fotos":["Guirlande pour enfant avec cœur rose au crochet, perles et eucalyptus"]},"de":{"nombre":"Herzgirlande","etiquetaVariante":"Farbe","etiqueta":"Frisch gehäkelt","corto":"Gehäkelte Herzen, Holzperlen und eine Schleife.","largo":"Girlande fürs Babyzimmer mit gefüllten Häkelherzen, Perlen aus Naturholz und Satinschleife. Zum Aufhängen an der Wand oder am Regal – immer außer Reichweite des Babys.","historia":"Entstanden ist sie als Auftragsarbeit für ein Kinderzimmer in Rosatönen – und sie ist so schön geworden, dass sie im Sortiment geblieben ist.","materiales":["100 % Baumwolle","Hypoallergene Füllung","Unlackierte Buchenholzperlen"],"cuidados":"Feuchtes Tuch oder sehr sanfte Handwäsche.","medidas":"60 cm lang","variantes":{"Rosa":"Rosa"},"fotos":["Kindergirlande mit rosa Häkelherz, Perlen und Eukalyptus"]}}'::jsonb where slug = 'guirnalda-corazones';
update public.productos set traducciones = '{"en":{"nombre":"Kitchen set","etiquetaVariante":"Colour","corto":"Three dishcloths and four coasters.","largo":"For anyone setting up a new home: three cotton dishcloths and four matching coasters. They’ll go through the washing machine time and time again.","materiales":["100% cotton"],"cuidados":"Machine wash at 40 °C.","medidas":"Dishcloth 25 × 25 cm · coasters 10 cm","contenido":["3 dishcloths","4 coasters"],"variantes":{"Salvia, coral y crema":"Sage, coral and cream","Gris":"Grey"},"fotos":["Three crocheted dishcloths in sage, coral and cream, hanging up","Grey crocheted coasters and dishcloths with a ball of yarn and a hook"]},"fr":{"nombre":"Coffret cuisine","etiquetaVariante":"Couleur","corto":"Trois lavettes et quatre sous-verres.","largo":"Pour ceux qui emménagent : trois lavettes en coton et quatre sous-verres assortis. Ils passent en machine encore et encore.","materiales":["100 % coton"],"cuidados":"Lavage en machine à 40 °C.","medidas":"Lavette 25 × 25 cm · sous-verres 10 cm","contenido":["3 lavettes","4 sous-verres"],"variantes":{"Salvia, coral y crema":"Sauge, corail et crème","Gris":"Gris"},"fotos":["Trois lavettes au crochet sauge, corail et crème, suspendues","Sous-verres et lavettes au crochet gris avec une pelote et un crochet"]},"de":{"nombre":"Küchenset","etiquetaVariante":"Farbe","corto":"Drei Spültücher und vier Untersetzer.","largo":"Für alle, die gerade ein neues Zuhause beziehen: drei Spültücher aus Baumwolle und vier passende Untersetzer. Sie überstehen die Waschmaschine wieder und wieder.","materiales":["100 % Baumwolle"],"cuidados":"Maschinenwäsche bei 40 °C.","medidas":"Spültuch 25 × 25 cm · Untersetzer 10 cm","contenido":["3 Spültücher","4 Untersetzer"],"variantes":{"Salvia, coral y crema":"Salbei, Koralle und Creme","Gris":"Grau"},"fotos":["Drei gehäkelte Spültücher in Salbei, Koralle und Creme, aufgehängt","Graue gehäkelte Untersetzer und Spültücher mit Wollknäuel und Häkelnadel"]}}'::jsonb where slug = 'pack-cocina';
update public.promociones set traducciones = '{"en":{"nombre":"Accessories sale"},"fr":{"nombre":"Soldes accessoires"},"de":{"nombre":"Accessoires-Sale"}}'::jsonb where nombre = 'Rebajas de accesorios';
update public.promociones set traducciones = '{"en":{"nombre":"Welcome 10% off"},"fr":{"nombre":"Bienvenue -10 %"},"de":{"nombre":"Willkommen: 10 % Rabatt"}}'::jsonb where nombre = 'Bienvenida 10 %';
update public.promociones set traducciones = '{"en":{"nombre":"Free delivery"},"fr":{"nombre":"Livraison offerte"},"de":{"nombre":"Kostenloser Versand"}}'::jsonb where nombre = 'Envío gratis';
update public.promociones set traducciones = '{"en":{"nombre":"€5 off"},"fr":{"nombre":"5 € offerts"},"de":{"nombre":"5 € geschenkt"}}'::jsonb where nombre = '5 € de regalo';
update public.metodos_envio set traducciones = '{"en":{"nombre":"Standard delivery","plazo":"3–5 working days"},"fr":{"nombre":"Livraison standard","plazo":"3–5 jours ouvrés"},"de":{"nombre":"Standardversand","plazo":"3–5 Werktage"}}'::jsonb where id = 'ordinario';
update public.metodos_envio set traducciones = '{"en":{"nombre":"Express delivery","plazo":"24–48 hours"},"fr":{"nombre":"Livraison express","plazo":"24–48 heures"},"de":{"nombre":"Expressversand","plazo":"24–48 Stunden"}}'::jsonb where id = 'express';
update public.metodos_envio set traducciones = '{"en":{"nombre":"Collection from the workshop","plazo":"In Málaga, by appointment"},"fr":{"nombre":"Retrait à l’atelier","plazo":"À Málaga, sur rendez-vous"},"de":{"nombre":"Abholung in der Werkstatt","plazo":"In Málaga, nach Terminvereinbarung"}}'::jsonb where id = 'recogida';

commit;
