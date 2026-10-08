-- ============================================================
--  Ovillo & Co. · Pruebas del panel: rol demo, datos de ejemplo,
--  mensajes, fotos de encargos y funciones panel_*.
--
--  Se ejecuta después de rls.sql (reutiliza sus utilidades del esquema
--  «prueba» y sus pedidos reales) y de cargar seed-demo.sql dos veces.
-- ============================================================

\set QUIET on
\o /dev/null
set client_min_messages = notice;

\set cliente_a '00000000-0000-4000-8000-00000000000a'
\set admin     '00000000-0000-4000-8000-0000000000ad'
\set demo      '00000000-0000-4000-8000-0000000000de'
\set encargo_real '00000000-0000-4000-8000-0000000000e1'
\set encargo_ficticio '00000000-0000-4000-8000-0000000000e2'

reset role;
update prueba.contador set aciertos = 0;

-- Recorre todas las tablas de public intentando borrar y modificar. Vale
-- un error de permisos o cero filas afectadas; cualquier otra cosa falla.
create function prueba.nadie_escribe(p_quien text)
returns void
language plpgsql
as $$
declare
  v_tabla   record;
  v_columna text;
  v_filas   integer;
  v_sql     text;
begin
  for v_tabla in
    select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' order by c.relname
  loop
    select a.attname into v_columna from pg_attribute a
    where a.attrelid = format('public.%I', v_tabla.relname)::regclass and a.attnum > 0 and not a.attisdropped
    order by a.attnum limit 1;

    foreach v_sql in array array[
      format('delete from public.%I', v_tabla.relname),
      format('update public.%I set %I = %I', v_tabla.relname, v_columna, v_columna)
    ] loop
      begin
        execute v_sql;
        get diagnostics v_filas = row_count;
        if v_filas <> 0 then
          raise exception 'FALLA: % pudo ejecutar «%» (% filas)', p_quien, v_sql, v_filas;
        end if;
      exception when insufficient_privilege then
        null;
      end;
    end loop;
  end loop;
  perform prueba.ok(true, p_quien || ' no borra ni modifica nada en ninguna tabla');
end;
$$;
grant execute on function prueba.nadie_escribe(text) to authenticated;

-- ------------------------------------------------------------
-- 0. Datos de demostración
-- ------------------------------------------------------------
select prueba.ok((select count(*) from public.pedidos where es_demo) = 25,
  'la semilla de demostración trae 25 pedidos y cargarla dos veces no los duplica');
select prueba.ok((select count(distinct estado) from public.pedidos where es_demo) = 6,
  'los pedidos de demostración cubren los 6 estados');
select prueba.ok(
  (select min(creado_en) from public.pedidos where es_demo) > now() - interval '61 days'
  and (select max(creado_en) from public.pedidos where es_demo) <= now(),
  'los pedidos de demostración caen en los últimos 60 días');
select prueba.ok(
  not exists (
    select 1 from public.pedidos o
    where o.es_demo and o.subtotal <> (select sum(l.precio_unitario * l.cantidad) from public.lineas_pedido l where l.pedido_id = o.id)
  ),
  'las líneas de cada pedido de demostración suman su subtotal');
select prueba.ok(
  not exists (
    select 1 from public.lineas_pedido l
    join public.pedidos o on o.id = l.pedido_id
    left join public.variantes v on v.id = l.variante_id
    where o.es_demo and (v.id is null or v.nombre <> l.nombre_variante)
  ),
  'cada línea de demostración apunta a una variante real del catálogo');
select prueba.ok(
  not exists (
    select 1 from public.pedidos o
    where o.es_demo and o.estado <> (
      select e.estado from public.eventos_pedido e where e.pedido_id = o.id order by e.creado_en desc limit 1)
  ),
  'el historial de cada pedido de demostración acaba en su estado');
select prueba.ok(
  (select count(*) from public.encargos where es_demo) = 6
  and (select count(distinct estado) from public.encargos where es_demo) = 4,
  '6 encargos de demostración en los 4 estados');
select prueba.ok(
  (select count(*) from public.mensajes_contacto where es_demo) between 6 and 8
  and (select count(distinct estado) from public.mensajes_contacto where es_demo) = 3,
  '7 mensajes de demostración en los 3 estados');
select prueba.ok(
  not exists (select 1 from public.pedidos where es_demo and email !~ '@ejemplo\.com$'),
  'los clientes de demostración usan correos @ejemplo.com');

-- ------------------------------------------------------------
-- 1. Nombrar roles
-- ------------------------------------------------------------
insert into auth.users (id, email, encrypted_password, raw_user_meta_data)
values (:'demo', 'demo@ovilloandco.example', 'hash-original', '{"nombre": "Taller de demostración"}');

select public.asignar_rol('DEMO@ovilloandco.example', 'demo');
select prueba.ok((select rol from public.perfiles where id = :'demo') = 'demo', 'asignar_rol() nombra la cuenta de demostración');

-- Quien entra con el botón público tiene la sesión de demo y podría
-- pedir a Supabase Auth un cambio de contraseña o de correo.
update auth.users
set encrypted_password = 'hash-intruso', email = 'intruso@ejemplo.com', email_change = 'intruso@ejemplo.com'
where id = :'demo';
select prueba.ok(
  (select encrypted_password = 'hash-original' and email = 'demo@ovilloandco.example' and email_change = ''
   from auth.users where id = :'demo'),
  'nadie cambia la contraseña ni el correo de la cuenta de demostración');
update auth.users set encrypted_password = 'hash-nuevo' where id = :'cliente_a';
select prueba.ok((select encrypted_password from auth.users where id = :'cliente_a') = 'hash-nuevo',
  'una clienta sí cambia su contraseña');
-- Para renovarla, el dueño la pasa a cliente, la cambia y la vuelve a nombrar.
select public.asignar_rol('demo@ovilloandco.example', 'cliente');
update auth.users set encrypted_password = 'hash-renovado' where id = :'demo';
select public.asignar_rol('demo@ovilloandco.example', 'demo');
select prueba.ok((select encrypted_password from auth.users where id = :'demo') = 'hash-renovado',
  'el dueño puede renovar la contraseña de demo quitándole antes el rol');
select prueba.falla($$select public.asignar_rol('nadie@ovilloandco.example', 'admin')$$,
  'USUARIO_NO_ENCONTRADO', 'asignar_rol() exige que la cuenta exista');
select prueba.falla($$select public.asignar_rol('taller@ovilloandco.example', 'cliente')$$,
  'ULTIMO_ADMIN', 'asignar_rol() no deja la tienda sin admin');

select prueba.como('service_role');
select prueba.falla($$select public.asignar_rol('cliente.a@ovilloandco.example', 'admin')$$,
  '42501', 'ni el rol de servicio puede usar asignar_rol()');
select prueba.como('authenticated', :'cliente_a');
select prueba.falla($$select public.asignar_rol('cliente.a@ovilloandco.example', 'admin')$$,
  '42501', 'un cliente no puede usar asignar_rol()');
select prueba.como('anon');
select prueba.falla($$select public.asignar_rol('cliente.a@ovilloandco.example', 'admin')$$,
  '42501', 'anon no puede usar asignar_rol()');

-- ------------------------------------------------------------
-- 2. Altas desde el servidor: mensajes y encargos con fotos
-- ------------------------------------------------------------
select prueba.falla(
  $$select public.registrar_mensaje_contacto('Otra cosa', 'Pícaro', 'p@ovilloandco.example', 'Mensaje directo a la API.', true)$$,
  '42501', 'anon no puede guardar mensajes sin pasar por el servidor');
select prueba.falla(
  $$insert into public.mensajes_contacto (motivo, nombre, email, mensaje, acepta_privacidad)
    values ('Otra cosa', 'Pícaro', 'p@ovilloandco.example', 'Mensaje directo a la tabla.', true)$$,
  '42501', 'anon no puede insertar en mensajes_contacto');
select prueba.falla(
  format($$select public.registrar_encargo(%L, 'Otra cosa', 'Descripción suficientemente larga.', 'Pícaro', 'p@ovilloandco.example', true)$$,
         :'encargo_real'),
  '42501', 'anon no puede registrar encargos con fotos');

select prueba.como('service_role');
select public.registrar_mensaje_contacto(
  'Estado de un pedido que ya hice', 'Cliente A', 'Cliente.A@ovilloandco.example ',
  'Mi pedido todavía no ha llegado, ¿sabéis algo?', true, ' ov-2026-1000 ', :'cliente_a'
);
select prueba.ok(
  exists (select 1 from public.mensajes_contacto
          where email = 'cliente.a@ovilloandco.example' and numero_pedido = 'OV-2026-1000' and not es_demo),
  'el servidor guarda un mensaje de contacto normalizado');
select prueba.falla(
  $$select public.registrar_mensaje_contacto('Otra cosa', 'X', 'x@ovilloandco.example', 'corto', true)$$,
  '23514', 'un mensaje demasiado corto no se guarda');

select public.registrar_encargo(
  :'encargo_real', 'Amigurumi de mascota', 'Una gata siamesa de unos veinte centímetros, sentada.',
  'Cliente A', 'cliente.a@ovilloandco.example', true,
  p_usuario => :'cliente_a',
  p_fotos => format('[{"ruta":"%s/1.jpg","tipo_mime":"image/jpeg","bytes":120000},
                     {"ruta":"%s/2.webp","tipo_mime":"image/webp","bytes":80000}]', :'encargo_real', :'encargo_real')::jsonb
);
select prueba.ok((select count(*) from public.fotos_encargo where encargo_id = :'encargo_real') = 2,
  'el encargo queda registrado con sus dos fotos');
select prueba.falla(
  $$select public.registrar_encargo(gen_random_uuid(), 'Otra cosa', 'Intento de colar una foto de otro encargo.',
      'X', 'x@ovilloandco.example', true,
      p_fotos => '[{"ruta":"00000000-0000-4000-8000-0000000000e1/3.jpg","tipo_mime":"image/jpeg","bytes":1}]')$$,
  '23514', 'una foto solo puede vivir en la carpeta de su encargo');
select prueba.falla(
  $$select public.registrar_encargo(gen_random_uuid(), 'Otra cosa', 'Intento de subir un ejecutable disfrazado.',
      'X', 'x@ovilloandco.example', true,
      p_fotos => jsonb_build_array(jsonb_build_object('ruta', '00000000-0000-4000-8000-000000000000/a.exe', 'tipo_mime', 'application/x-msdownload', 'bytes', 1)))$$,
  '23514', 'solo se admiten fotos JPG, PNG o WebP');

-- El servidor sube los ficheros al bucket privado.
insert into storage.objects (bucket_id, name)
values ('encargos', :'encargo_real' || '/1.jpg'), ('encargos', :'encargo_real' || '/2.webp');

-- Un encargo ficticio con foto, para comprobar lo que ve demo.
reset role;
insert into public.encargos (id, tipo, descripcion, nombre, email, acepta_privacidad, es_demo)
values (:'encargo_ficticio', 'Manta o mantita', 'Encargo ficticio con una foto de referencia.',
        'Elena Díaz', 'elena.diaz@ejemplo.com', true, true);
insert into public.fotos_encargo (encargo_id, ruta, tipo_mime, bytes)
values (:'encargo_ficticio', :'encargo_ficticio' || '/1.jpg', 'image/jpeg', 1000);
insert into storage.objects (bucket_id, name) values ('encargos', :'encargo_ficticio' || '/1.jpg');

select prueba.ok(
  (select not public from storage.buckets where id = 'encargos'),
  'el bucket de encargos es privado');

-- Nota interna y seguimiento de un pedido real: el número de Correos
-- lleva a la localidad y la fecha de entrega.
update public.pedidos
set nota_admin = 'Llamar a Cliente A al 600 000 000 antes de enviar.', transportista = 'Correos',
    numero_seguimiento = 'PK123456789ES'
where email = 'cliente.a@ovilloandco.example';

-- Datos de referencia calculados como superusuario.
select id as pedido_real from public.pedidos where email = 'cliente.a@ovilloandco.example' \gset
select count(*) as pedidos_totales from public.pedidos \gset
select coalesce(sum(total), 0) as ventas_30_dias from public.pedidos
where estado not in ('cancelado', 'reembolsado')
  and (creado_en at time zone 'Europe/Madrid')::date > (now() at time zone 'Europe/Madrid')::date - 30 \gset

-- ------------------------------------------------------------
-- 3. Demo: lee como admin, enmascarado
-- ------------------------------------------------------------
select prueba.como('authenticated', :'demo');

select prueba.ok(public.es_cuenta_demo() and public.puede_ver_panel() and not public.es_admin(),
  'demo ve el panel sin ser admin');

select prueba.ok((select pedidos_mes from public.panel_resumen()) > 0, 'demo ve el resumen del mes');
select prueba.ok((select count(*) from public.panel_ventas_por_dia()) = 30, 'ventas por día: 30 días, también los vacíos');
select prueba.ok((select sum(ventas) from public.panel_ventas_por_dia()) = :ventas_30_dias,
  'las ventas por día suman lo vendido en 30 días sin cancelados ni reembolsos');
select prueba.ok((select count(*) from public.panel_ventas_por_dia(7)) = 7, 'ventas por día con otro plazo');
select prueba.ok(
  exists (select 1 from public.panel_stock_bajo() where producto_slug = 'guirnalda-corazones' and variante = 'Rosa' and stock = 0),
  'el stock bajo incluye lo agotado');
select prueba.ok(
  (select count(*) from public.panel_stock_bajo(0)) <= (select count(*) from public.panel_stock_bajo(3)),
  'el umbral de stock bajo se puede ajustar');

select prueba.ok((select max(total_filas) from public.panel_pedidos()) = :pedidos_totales,
  'demo cuenta todos los pedidos, reales y ficticios');
select prueba.ok((select count(*) from public.panel_pedidos(p_limite => 5)) = 5, 'los pedidos se paginan');
select prueba.ok((select count(*) from public.panel_pedidos(p_estado => 'cancelado')) >= 2, 'los pedidos se filtran por estado');
select prueba.ok(
  not exists (select 1 from public.panel_pedidos(p_limite => 200) where not es_demo and email not like '%•••%'),
  'demo ve enmascarados los correos de los pedidos reales');
select prueba.ok(
  exists (select 1 from public.panel_pedidos(p_limite => 200) where es_demo and email like '%@ejemplo.com'),
  'y enteros los de los pedidos ficticios');
select prueba.ok((select count(*) from public.panel_pedidos(p_busqueda => 'cliente.a')) = 0,
  'demo no puede buscar por el correo de un cliente real');
select prueba.ok((select count(*) from public.panel_pedidos(p_busqueda => 'lucia')) >= 1,
  'demo sí busca entre los clientes ficticios');

select public.panel_pedido(:'pedido_real') as ficha \gset
select prueba.ok(
  (:'ficha'::jsonb ->> 'email') = 'c•••@o•••.example'
  and (:'ficha'::jsonb -> 'telefono') = 'null'::jsonb
  and (:'ficha'::jsonb -> 'nota_cliente') = 'null'::jsonb,
  'en la ficha de un pedido real demo no ve correo, teléfono ni notas');
select prueba.ok(
  (:'ficha'::jsonb -> 'nota_admin') = 'null'::jsonb and (:'ficha'::jsonb -> 'numero_seguimiento') = 'null'::jsonb,
  'ni la nota interna del taller ni el número de seguimiento');
select prueba.ok(jsonb_array_length(:'ficha'::jsonb -> 'lineas') = 1 and jsonb_array_length(:'ficha'::jsonb -> 'eventos') >= 1,
  'pero sí las líneas y el seguimiento');
select prueba.ok(public.panel_pedido('00000000-0000-0000-0000-000000000000') is null, 'un pedido inexistente devuelve null');

select prueba.ok(
  not exists (select 1 from public.panel_clientes(200) where not es_demo and (email not like '%•••%' or nombre ~ '[a-z]{2}')),
  'demo ve enmascarados nombre y correo de los clientes reales');
select prueba.ok((select count(*) from public.panel_clientes(200) where es_demo) = 12, 'los 12 clientes ficticios aparecen');

select prueba.ok(
  (select descripcion from public.panel_encargos(p_limite => 200) where id = :'encargo_real') = 'Oculto en la cuenta de demostración.'
  and (select fotos from public.panel_encargos(p_limite => 200) where id = :'encargo_real') = '{}',
  'demo no ve la descripción ni las fotos de un encargo real');
select prueba.ok(
  (select cardinality(fotos) from public.panel_encargos(p_limite => 200) where id = :'encargo_ficticio') = 1,
  'demo ve las fotos de un encargo ficticio');
select prueba.ok(
  not exists (select 1 from public.panel_mensajes(p_limite => 200) where not es_demo and email not like '%•••%')
  and exists (select 1 from public.panel_mensajes(p_estado => 'nuevo') where es_demo),
  'demo ve los mensajes, con los reales enmascarados');

-- Directamente en las tablas, demo solo ve lo ficticio.
select prueba.ok((select count(*) from public.pedidos) = 25, 'en la tabla, demo solo ve los pedidos ficticios');
select prueba.ok((select count(*) from public.encargos) = 7, 'en la tabla, demo solo ve los encargos ficticios');
select prueba.ok(not exists (select 1 from public.mensajes_contacto where not es_demo), 'en la tabla, demo solo ve los mensajes ficticios');
select prueba.ok((select count(*) from public.fotos_encargo) = 1, 'demo solo ve las fotos de encargos ficticios');
select prueba.ok((select count(*) from public.perfiles) = 1, 'demo solo ve su propio perfil');
select prueba.ok((select count(*) from public.suscripciones_boletin) = 0, 'demo no ve los correos del boletín');
select prueba.ok(exists (select 1 from public.productos where slug = 'borrador-secreto'), 'demo ve los borradores del catálogo');
select prueba.ok((select count(*) from public.promociones where codigo is not null) = 3, 'demo ve los cupones');
select prueba.ok(
  (select count(*) from storage.objects where bucket_id = 'encargos') = 1,
  'en Storage, demo solo puede firmar la foto del encargo ficticio');

-- Demo no escribe nada.
select prueba.nadie_escribe('demo');
select prueba.ok(
  prueba.filas($$update public.perfiles set nombre = 'Cambiado'$$) = 0,
  'demo no puede editar ni su propio perfil');
select prueba.falla($$insert into public.categorias (slug, nombre, foto_ruta) values ('demo', 'Demo', '/x.jpg')$$,
  '42501', 'demo no crea categorías');
select prueba.falla(
  $$insert into public.productos (slug, nombre, categoria_id, precio)
    values ('demo', 'Demo', (select id from public.categorias limit 1), 1)$$,
  '42501', 'demo no crea productos');
select prueba.falla(
  format($$insert into public.favoritos (usuario_id, producto_id)
           values (%L, (select id from public.productos where slug = 'manta-estrella'))$$, :'demo'),
  '42501', 'demo no guarda favoritos');
select prueba.falla(
  format($$insert into public.direcciones (usuario_id, destinatario, linea1, ciudad, provincia, codigo_postal)
           values (%L, 'Demo', 'Calle', 'Málaga', 'Málaga', '29001')$$, :'demo'),
  '42501', 'demo no guarda direcciones');
select prueba.falla(
  format($$insert into public.encargos (usuario_id, tipo, descripcion, nombre, email, acepta_privacidad)
           values (%L, 'Otra cosa', 'Encargo enviado desde la cuenta de demostración.', 'Demo', 'demo@ovilloandco.example', true)$$, :'demo'),
  '42501', 'demo no envía encargos');
select prueba.falla(
  $$insert into public.pedidos (email, subtotal, total, metodo_envio_nombre, stripe_sesion_id)
    values ('demo@ovilloandco.example', 0, 0, 'Envío ordinario', 'cs_demo_falso')$$,
  '42501', 'demo no crea pedidos');
select prueba.falla($$select public.suscribir_boletin('demo@ovilloandco.example')$$, '42501', 'demo no se apunta al boletín');
select prueba.falla($$select public.pedir_aviso_stock('pulpito-reversible', 'Azul niebla', 'demo@ovilloandco.example')$$,
  '42501', 'demo no pide avisos de stock');
select prueba.falla($$select public.registrar_mensaje_contacto('Otra cosa', 'Demo', 'demo@ovilloandco.example', 'Mensaje desde demo.', true)$$,
  '42501', 'demo no registra mensajes');
select prueba.falla($$insert into storage.objects (bucket_id, name) values ('productos', 'demo.jpg')$$,
  '42501', 'demo no sube fotos de productos');
select prueba.falla(format($$insert into storage.objects (bucket_id, name) values ('encargos', %L)$$, :'encargo_ficticio' || '/2.jpg'),
  '42501', 'demo no sube fotos de encargos');
select prueba.ok(prueba.filas($$delete from storage.objects$$) = 0, 'demo no borra ficheros');

reset role;
select prueba.ok(
  (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r') * 3
  = (select count(*) from pg_policies
     where schemaname = 'public' and permissive = 'RESTRICTIVE' and policyname like 'demo: %'),
  'toda tabla de public tiene las tres políticas restrictivas de demo');

-- ------------------------------------------------------------
-- 4. Cliente y anon no ven nada del panel
-- ------------------------------------------------------------
select prueba.como('authenticated', :'cliente_a');
select prueba.falla('select * from public.panel_resumen()', 'SOLO_PANEL', 'un cliente no puede ver el resumen');
select prueba.falla('select * from public.panel_pedidos()', 'SOLO_PANEL', 'un cliente no puede listar pedidos');
select prueba.falla('select * from public.panel_clientes()', 'SOLO_PANEL', 'un cliente no puede listar clientes');
select prueba.falla(format('select public.panel_pedido(%L)', :'pedido_real'), 'SOLO_PANEL', 'un cliente no puede abrir la ficha del panel');
select prueba.falla('select * from public.panel_encargos()', 'SOLO_PANEL', 'un cliente no puede listar encargos');
select prueba.falla('select * from public.panel_mensajes()', 'SOLO_PANEL', 'un cliente no puede listar mensajes');
select prueba.ok((select count(*) from public.pedidos) = 1, 'un cliente sigue viendo solo su pedido, nunca los ficticios');
select prueba.ok((select count(*) from public.mensajes_contacto) = 0, 'un cliente no lee mensajes de contacto, ni los suyos');
select prueba.ok((select count(*) from public.fotos_encargo) = 0, 'un cliente no lee fotos de encargos');
select prueba.ok((select count(*) from storage.objects where bucket_id = 'encargos') = 0, 'un cliente no puede firmar fotos de encargos');
select prueba.ok(not exists (select 1 from public.productos where slug = 'borrador-secreto'), 'un cliente no ve borradores');

select prueba.como('anon');
select prueba.falla('select * from public.panel_resumen()', '42501', 'anon no puede ver el resumen');
select prueba.falla('select count(*) from public.mensajes_contacto', '42501', 'anon no lee mensajes de contacto');
select prueba.falla('select count(*) from public.fotos_encargo', '42501', 'anon no lee fotos de encargos');

-- ------------------------------------------------------------
-- 5. Admin ve y gestiona sin máscara
-- ------------------------------------------------------------
select prueba.como('authenticated', :'admin');
select prueba.ok(
  (public.panel_pedido(:'pedido_real') ->> 'email') = 'cliente.a@ovilloandco.example',
  'admin ve el correo real en la ficha');
select prueba.ok(
  (public.panel_pedido(:'pedido_real') ->> 'nota_admin') like 'Llamar a Cliente A%'
  and (public.panel_pedido(:'pedido_real') ->> 'numero_seguimiento') = 'PK123456789ES',
  'admin ve su nota interna y el seguimiento');
select prueba.ok((select count(*) from public.panel_pedidos(p_busqueda => 'cliente.a')) = 1, 'admin busca por correo');
select prueba.ok(
  (select cardinality(fotos) from public.panel_encargos(p_limite => 200) where id = :'encargo_real') = 2,
  'admin ve las fotos de un encargo real');
select prueba.ok((select count(*) from storage.objects where bucket_id = 'encargos') = 3, 'admin puede firmar todas las fotos de encargos');
select prueba.ok(
  prueba.filas($$update public.mensajes_contacto set estado = 'respondido' where not es_demo$$) = 1,
  'admin marca un mensaje como respondido');
select prueba.falla($$update public.mensajes_contacto set mensaje = 'otro'$$, '42501', 'admin no reescribe lo que escribió un cliente');
select prueba.falla(
  $$insert into storage.objects (bucket_id, name) values ('encargos', 'x/1.jpg')$$,
  '42501', 'las fotos de encargos solo las sube el servidor');
-- Cancelar un pedido ficticio no inventa stock.
select (select stock from public.variantes v join public.productos p on p.id = v.producto_id
        where p.slug = 'cesta-ovillos' and v.nombre = 'Zigzag') as stock_antes \gset
select prueba.ok(
  prueba.filas($$update public.pedidos set estado = 'cancelado' where stripe_sesion_id = 'cs_demo_024'$$) = 1,
  'admin cancela un pedido ficticio');
select prueba.ok(
  (select stock from public.variantes v join public.productos p on p.id = v.producto_id
   where p.slug = 'cesta-ovillos' and v.nombre = 'Zigzag') = :stock_antes,
  'y el stock no sube, porque ese pedido nunca lo descontó');

reset role;
\o
select format('%s comprobaciones del panel superadas.', aciertos) as resultado from prueba.contador \gset
\echo :resultado
