-- ============================================================
--  Ovillo & Co. · Datos de demostración para el panel
--
--  25 pedidos de los últimos 60 días en todos los estados, 6 encargos
--  y 7 mensajes de contacto. Clientes, correos y direcciones son
--  inventados (@ejemplo.com). Todo va marcado con es_demo = true.
--
--  Se carga después de seed.sql:
--    psql "$DATABASE_URL" -f supabase/seed-demo.sql
--  (o pegándolo en el editor SQL de Supabase). Se puede repetir: borra
--  primero lo ficticio y lo vuelve a crear con fechas relativas a hoy.
--
--  Los importes no se escriben a mano: los calcula calcular_pedido()
--  con el catálogo y las promociones vigentes, así que siempre cuadran.
--  No toca el stock: son ventas pasadas y el stock de la semilla ya es
--  el que queda.
-- ============================================================

begin;

delete from public.pedidos           where es_demo;
delete from public.encargos          where es_demo;
delete from public.mensajes_contacto where es_demo;

-- ------------------------------------------------------------
-- Pedidos
-- ------------------------------------------------------------
do $$
declare
  v_clientes constant jsonb := '[
    {"nombre": "Lucía Martín",   "email": "lucia.martin@ejemplo.com",   "telefono": "600 000 101", "ciudad": "Málaga",   "provincia": "Málaga",   "cp": "29002"},
    {"nombre": "Carmen Ruiz",    "email": "carmen.ruiz@ejemplo.com",    "telefono": "600 000 102", "ciudad": "Madrid",   "provincia": "Madrid",   "cp": "28004"},
    {"nombre": "Javier López",   "email": "javier.lopez@ejemplo.com",   "telefono": "600 000 103", "ciudad": "Sevilla",  "provincia": "Sevilla",  "cp": "41003"},
    {"nombre": "Marta Sánchez",  "email": "marta.sanchez@ejemplo.com",  "telefono": "600 000 104", "ciudad": "Granada",  "provincia": "Granada",  "cp": "18001"},
    {"nombre": "Pablo Gómez",    "email": "pablo.gomez@ejemplo.com",    "telefono": "600 000 105", "ciudad": "Córdoba",  "provincia": "Córdoba",  "cp": "14002"},
    {"nombre": "Elena Díaz",     "email": "elena.diaz@ejemplo.com",     "telefono": "600 000 106", "ciudad": "Bilbao",   "provincia": "Bizkaia",  "cp": "48001"},
    {"nombre": "Sergio Moreno",  "email": "sergio.moreno@ejemplo.com",  "telefono": "600 000 107", "ciudad": "Zaragoza", "provincia": "Zaragoza", "cp": "50001"},
    {"nombre": "Nuria Romero",   "email": "nuria.romero@ejemplo.com",   "telefono": "600 000 108", "ciudad": "Murcia",   "provincia": "Murcia",   "cp": "30001"},
    {"nombre": "David Navarro",  "email": "david.navarro@ejemplo.com",  "telefono": "600 000 109", "ciudad": "Palma",    "provincia": "Illes Balears", "cp": "07001"},
    {"nombre": "Ana Torres",     "email": "ana.torres@ejemplo.com",     "telefono": "600 000 110", "ciudad": "Cádiz",    "provincia": "Cádiz",    "cp": "11001"},
    {"nombre": "Raquel Jiménez", "email": "raquel.jimenez@ejemplo.com", "telefono": "600 000 111", "ciudad": "Marbella", "provincia": "Málaga",   "cp": "29601"},
    {"nombre": "Miguel Álvarez", "email": "miguel.alvarez@ejemplo.com", "telefono": "600 000 112", "ciudad": "Madrid",   "provincia": "Madrid",   "cp": "28015"}
  ]';
  v_pedido   record;
  v_cliente  jsonb;
  v_calculo  jsonb;
  v_id       uuid;
  v_creado   timestamptz;
  v_enviado  timestamptz;
  v_entregado timestamptz;
  v_cancelado timestamptz;
  v_direccion jsonb;
begin
  for v_pedido in
    select * from (values
      --  n, días, hora, cliente, estado,          envío,       cupón,         líneas
      ( 1, 58, 10,  0, 'entregado',      'ordinario', null,          '[{"producto":"osita-vestido-lila","variante":"Beis y lila","cantidad":1}]'),
      ( 2, 55, 18,  1, 'entregado',      'ordinario', 'HOLA10',      '[{"producto":"cojin-relieve","variante":"Crudo y beis","cantidad":1}]'),
      ( 3, 52, 12,  2, 'entregado',      'express',   null,          '[{"producto":"bolso-red-mercado","variante":"Crudo","cantidad":2}]'),
      ( 4, 49, 20,  3, 'reembolsado',    'ordinario', null,          '[{"producto":"cesta-ovillos","variante":"Zigzag","cantidad":1}]'),
      ( 5, 46,  9,  4, 'entregado',      'ordinario', null,          '[{"producto":"set-recien-nacido","variante":"0–3 meses","cantidad":1}]'),
      ( 6, 43, 16,  5, 'entregado',      'recogida',  null,          '[{"producto":"pack-cocina","variante":"Salvia, coral y crema","cantidad":1}]'),
      ( 7, 40, 11,  6, 'cancelado',      'ordinario', null,          '[{"producto":"gorro-pompon","variante":"Niño (2–6 años)","cantidad":1}]'),
      ( 8, 37, 19,  7, 'entregado',      'ordinario', 'PRIMERA5',    '[{"producto":"bolso-red-mercado","variante":"Rosa palo","cantidad":1},{"producto":"cervatillo-dormilon","variante":"Crudo y rosa","cantidad":1}]'),
      ( 9, 34, 13,  0, 'entregado',      'ordinario', null,          '[{"producto":"manta-estrella","variante":"Menta","cantidad":1,"personalizacion":"L.M."}]'),
      (10, 31, 17,  8, 'entregado',      'express',   null,          '[{"producto":"cojin-relieve","variante":"Crudo y beis","cantidad":2}]'),
      (11, 28, 10,  9, 'entregado',      'ordinario', 'ENVIOGRATIS', '[{"producto":"pack-cocina","variante":"Gris","cantidad":1}]'),
      (12, 25, 21, 10, 'entregado',      'ordinario', null,          '[{"producto":"gorro-pompon","variante":"Adulto","cantidad":1},{"producto":"bolso-red-mercado","variante":"Crudo","cantidad":1}]'),
      (13, 22, 12, 11, 'entregado',      'ordinario', null,          '[{"producto":"cervatillo-dormilon","variante":"Crudo y rosa","cantidad":2}]'),
      (14, 19,  9,  1, 'entregado',      'recogida',  null,          '[{"producto":"cesta-ovillos","variante":"Pareja blanca","cantidad":2}]'),
      (15, 16, 18,  3, 'cancelado',      'ordinario', null,          '[{"producto":"set-recien-nacido","variante":"3–6 meses","cantidad":1}]'),
      (16, 14, 15,  5, 'enviado',        'ordinario', 'HOLA10',      '[{"producto":"manta-estrella","variante":"Rosa","cantidad":1},{"producto":"cervatillo-dormilon","variante":"Crudo y rosa","cantidad":1}]'),
      (17, 12, 11,  2, 'entregado',      'express',   null,          '[{"producto":"bolso-red-mercado","variante":"Rosa palo","cantidad":1}]'),
      (18, 10, 20,  6, 'enviado',        'ordinario', null,          '[{"producto":"pack-cocina","variante":"Salvia, coral y crema","cantidad":2}]'),
      (19,  8, 10,  7, 'enviado',        'ordinario', null,          '[{"producto":"cojin-relieve","variante":"Crudo y beis","cantidad":1},{"producto":"cesta-ovillos","variante":"Pareja blanca","cantidad":1}]'),
      (20,  6, 13,  8, 'en_preparacion', 'ordinario', null,          '[{"producto":"set-recien-nacido","variante":"3–6 meses","cantidad":1}]'),
      (21,  5, 17,  4, 'en_preparacion', 'express',   'PRIMERA5',    '[{"producto":"gorro-pompon","variante":"Adulto","cantidad":1}]'),
      (22,  3,  9,  9, 'en_preparacion', 'ordinario', null,          '[{"producto":"manta-estrella","variante":"Menta","cantidad":1,"personalizacion":"A.T."}]'),
      (23,  2, 19, 10, 'pagado',         'ordinario', null,          '[{"producto":"osita-vestido-lila","variante":"Beis y lila","cantidad":1},{"producto":"bolso-red-mercado","variante":"Crudo","cantidad":1}]'),
      (24,  1, 12, 11, 'pagado',         'recogida',  null,          '[{"producto":"cesta-ovillos","variante":"Zigzag","cantidad":1}]'),
      (25,  0,  1,  0, 'pagado',         'ordinario', 'HOLA10',      '[{"producto":"pack-cocina","variante":"Gris","cantidad":1},{"producto":"cervatillo-dormilon","variante":"Crudo y rosa","cantidad":1}]')
    ) as t(n, dias, hora, cliente, estado, envio, cupon, lineas)
  loop
    v_cliente := v_clientes -> v_pedido.cliente;
    v_calculo := public.calcular_pedido(v_pedido.lineas::jsonb, v_pedido.cupon, v_pedido.envio);

    -- El último pedido es de hace un rato, sea la hora que sea.
    v_creado := case when v_pedido.dias = 0 then now() - interval '1 hour'
                     else date_trunc('day', now() at time zone 'Europe/Madrid') at time zone 'Europe/Madrid'
                          - make_interval(days => v_pedido.dias) + make_interval(hours => v_pedido.hora) end;
    v_enviado   := case when v_pedido.estado in ('enviado', 'entregado', 'reembolsado') then v_creado + interval '1 day 5 hours' end;
    v_entregado := case when v_pedido.estado in ('entregado', 'reembolsado') then v_creado + interval '3 days 2 hours' end;
    v_cancelado := case when v_pedido.estado = 'cancelado' then v_creado + interval '20 hours' end;
    v_direccion := case when v_pedido.envio = 'recogida' then null else jsonb_build_object(
      'destinatario',  v_cliente ->> 'nombre',
      'linea1',        format('Calle de Ejemplo %s', 10 + v_pedido.n),
      'linea2',        null,
      'ciudad',        v_cliente ->> 'ciudad',
      'provincia',     v_cliente ->> 'provincia',
      'codigo_postal', v_cliente ->> 'cp',
      'pais',          'ES',
      'telefono',      v_cliente ->> 'telefono'
    ) end;

    insert into public.pedidos (
      numero, email, nombre_cliente, telefono, estado,
      subtotal, descuento_automatico, descuento_cupon, envio, total,
      promocion_id, codigo_cupon, metodo_envio_id, metodo_envio_nombre,
      direccion_envio, dias_confeccion, nota_cliente,
      transportista, numero_seguimiento,
      stripe_sesion_id, stripe_pago_id,
      creado_en, pagado_en, enviado_en, entregado_en, cancelado_en, es_demo
    ) values (
      format('OV-%s-%s', to_char(v_creado at time zone 'Europe/Madrid', 'YYYY'), lpad((900 + v_pedido.n)::text, 4, '0')),
      v_cliente ->> 'email', v_cliente ->> 'nombre', v_cliente ->> 'telefono', v_pedido.estado::public.estado_pedido,
      (v_calculo ->> 'subtotal')::integer,
      (v_calculo ->> 'descuento_automatico')::integer,
      (v_calculo ->> 'descuento_cupon')::integer,
      (v_calculo ->> 'envio')::integer,
      (v_calculo ->> 'total')::integer,
      (v_calculo ->> 'promocion_id')::uuid,
      v_calculo ->> 'codigo_cupon',
      v_calculo ->> 'metodo_envio_id',
      v_calculo ->> 'metodo_envio_nombre',
      v_direccion,
      (v_calculo ->> 'dias_confeccion')::integer,
      case when v_pedido.n in (9, 16) then 'Es para un regalo: si podéis, sin el precio dentro.' end,
      case when v_enviado is not null and v_pedido.envio <> 'recogida' then 'Correos' end,
      case when v_enviado is not null and v_pedido.envio <> 'recogida'
           then format('PK%sES', lpad(v_pedido.n::text, 9, '0')) end,
      format('cs_demo_%s', lpad(v_pedido.n::text, 3, '0')),
      format('pi_demo_%s', lpad(v_pedido.n::text, 3, '0')),
      v_creado, v_creado, v_enviado, v_entregado, v_cancelado, true
    )
    returning id into v_id;

    insert into public.lineas_pedido (
      pedido_id, producto_id, variante_id, producto_slug, nombre_producto, nombre_variante,
      color, foto_ruta, precio_unitario, cantidad, descuento, total, personalizacion, encargo, dias, creado_en
    )
    select v_id, (l ->> 'producto_id')::uuid, (l ->> 'variante_id')::uuid, l ->> 'producto_slug',
           l ->> 'nombre_producto', l ->> 'nombre_variante', l ->> 'color', l ->> 'foto_ruta',
           (l ->> 'precio_unitario')::integer, (l ->> 'cantidad')::integer, (l ->> 'descuento')::integer,
           (l ->> 'total')::integer, l ->> 'personalizacion', (l ->> 'encargo')::boolean,
           (l ->> 'dias')::integer, v_creado
    from jsonb_array_elements(v_calculo -> 'lineas') l;

    -- Historial coherente con el estado final.
    insert into public.eventos_pedido (pedido_id, estado, creado_en)
    select v_id, e.estado::public.estado_pedido, e.fecha
    from (values
      ('pagado',         v_creado,                          true),
      ('en_preparacion', v_creado + interval '3 hours',     v_pedido.estado in ('en_preparacion', 'enviado', 'entregado', 'reembolsado')),
      ('enviado',        v_enviado,                         v_enviado is not null),
      ('entregado',      v_entregado,                       v_entregado is not null),
      ('cancelado',      v_cancelado,                       v_cancelado is not null),
      ('reembolsado',    v_entregado + interval '4 days',   v_pedido.estado = 'reembolsado')
    ) as e(estado, fecha, incluir)
    where e.incluir;
  end loop;
end;
$$;

-- ------------------------------------------------------------
-- Encargos
-- ------------------------------------------------------------
insert into public.encargos (
  tipo, descripcion, fecha_deseada, presupuesto, colores, nombre, email, instagram,
  acepta_privacidad, estado, nota_admin, creado_en, es_demo
) values
  ('Amigurumi de mascota',
   'Un amigurumi de nuestro perro, un teckel marrón con una mancha blanca en el pecho. Unos 20 cm, sentado.',
   'Para el 20 de diciembre', '25–50 €', 'marrón chocolate y blanco', 'Lucía Martín', 'lucia.martin@ejemplo.com',
   '@lucia.ejemplo', true, 'nuevo', null, now() - interval '1 day 4 hours', true),
  ('Manta o mantita',
   'Una manta para el cochecito en tonos verdes suaves, con las iniciales del bebé en una esquina.',
   'Sin prisa', '50–100 €', 'verde salvia y crudo', 'Elena Díaz', 'elena.diaz@ejemplo.com',
   null, true, 'nuevo', null, now() - interval '2 days 7 hours', true),
  ('Pieza de bebé (gorrito, patucos, guirnalda…)',
   'Guirnalda con el nombre «Martina» en letras sueltas y dos corazones a los lados, para la habitación.',
   'Antes de febrero', '25–50 €', 'rosa empolvado', 'Marta Sánchez', 'marta.sanchez@ejemplo.com',
   null, true, 'respondido', 'Enviado presupuesto: 38 € y tres semanas.', now() - interval '6 days', true),
  ('Pack de regalo a medida',
   'Un pack para una compañera que se jubila: cojín, paño de cocina y algo pequeño que tenga que ver con el mar.',
   '15 de noviembre', 'Más de 100 €', 'azules y crudo', 'Sergio Moreno', 'sergio.moreno@ejemplo.com',
   null, true, 'respondido', 'Propuestos dos packs; espera respuesta.', now() - interval '11 days', true),
  ('Amigurumi de persona',
   'Una muñeca que se parezca a mi abuela: pelo blanco recogido, gafas redondas y su chaqueta de punto azul.',
   'Para su cumpleaños, en un mes', '50–100 €', 'azul marino, gris y blanco', 'Ana Torres', 'ana.torres@ejemplo.com',
   '@ana.ejemplo', true, 'aceptado', 'Aceptado. Empezamos la semana que viene.', now() - interval '18 days', true),
  ('Algo para la casa (cojín, cesta, alfombra)',
   'Una alfombra redonda de trapillo de dos metros para el salón, en gris oscuro.',
   null, 'Hasta 25 €', 'gris marengo', 'David Navarro', 'david.navarro@ejemplo.com',
   null, true, 'descartado', 'No llegamos con ese presupuesto; ofrecida una de 90 cm.', now() - interval '27 days', true);

-- ------------------------------------------------------------
-- Mensajes de contacto
-- ------------------------------------------------------------
insert into public.mensajes_contacto (
  motivo, numero_pedido, nombre, email, mensaje, acepta_privacidad, estado, nota_admin, creado_en, es_demo
)
select m.motivo, m.numero, m.nombre, m.email, m.mensaje, true, m.estado::public.estado_mensaje, m.nota, m.creado, true
from (values
  ('Estado de un pedido que ya hice',
   (select numero from public.pedidos where stripe_sesion_id = 'cs_demo_021'),
   'Pablo Gómez', 'pablo.gomez@ejemplo.com',
   '¡Hola! Quería saber si el gorro llegará antes del fin de semana que viene. ¡Gracias!',
   'nuevo', null, now() - interval '5 hours'),
  ('Duda sobre un producto', null, 'Carmen Ruiz', 'carmen.ruiz@ejemplo.com',
   '¿La manta estrella se puede hacer en gris perla? No la veo entre los colores.',
   'nuevo', null, now() - interval '1 day 2 hours'),
  ('Colaboración o prensa', null, 'Raquel Jiménez', 'raquel.jimenez@ejemplo.com',
   'Escribo desde una revista local de artesanía y nos gustaría contar vuestra historia en el número de primavera.',
   'nuevo', null, now() - interval '2 days 6 hours'),
  ('Problema con algo que me llegó',
   (select numero from public.pedidos where stripe_sesion_id = 'cs_demo_017'),
   'Javier López', 'javier.lopez@ejemplo.com',
   'Al bolso se le ha soltado un punto del asa después de la primera semana. ¿Tiene arreglo?',
   'respondido', 'Le mandamos uno nuevo y nos devuelve el otro para repararlo.', now() - interval '9 days'),
  ('Devolución o cambio',
   (select numero from public.pedidos where stripe_sesion_id = 'cs_demo_004'),
   'Marta Sánchez', 'marta.sanchez@ejemplo.com',
   'La cesta es más grande de lo que esperaba y no me cabe en la estantería. ¿Puedo devolverla?',
   'respondido', 'Devolución aceptada y reembolsada.', now() - interval '44 days'),
  ('Mandaros una foto de mi pieza', null, 'Nuria Romero', 'nuria.romero@ejemplo.com',
   'Os mando la foto del cervatillo en la estantería de su cuarto: es lo primero que busca al despertarse.',
   'respondido', 'Pedido permiso para compartirla.', now() - interval '21 days'),
  ('Otra cosa', null, 'Miguel Álvarez', 'miguel.alvarez@ejemplo.com',
   '¿Hacéis talleres para aprender ganchillo? Me gustaría apuntarme con mi hija.',
   'archivado', null, now() - interval '35 days')
) as m(motivo, numero, nombre, email, mensaje, estado, nota, creado);

commit;
