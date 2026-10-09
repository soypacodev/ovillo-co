-- ============================================================
--  Ovillo & Co. · Pruebas de seguridad (RLS, permisos y funciones)
--
--  Se ejecutan con psql -v ON_ERROR_STOP=1 sobre una base recién
--  migrada y con la semilla cargada (ver scripts/probar-bd.sh). Cada
--  comprobación lanza un error si falla, así que el script entero
--  termina con código distinto de cero ante el primer fallo.
--
--  Para actuar como alguien se imita lo que hace PostgREST: cambiar al
--  rol de la petición y dejar las claims del JWT en request.jwt.claims.
-- ============================================================

\set QUIET on
\o /dev/null
set client_min_messages = notice;

-- ------------------------------------------------------------
-- Utilidades de prueba
-- ------------------------------------------------------------
create schema prueba;
grant usage on schema prueba to anon, authenticated, service_role;

create table prueba.contador (aciertos integer not null);
insert into prueba.contador values (0);
grant select, update on prueba.contador to anon, authenticated, service_role;

create function prueba.ok(p_condicion boolean, p_descripcion text)
returns void
language plpgsql
as $$
begin
  if p_condicion is distinct from true then
    raise exception 'FALLA: %', p_descripcion;
  end if;
  update prueba.contador set aciertos = aciertos + 1;
  raise notice 'ok · %', p_descripcion;
end;
$$;

-- Ejecuta una sentencia que debe fallar. p_esperado es un SQLSTATE
-- (p. ej. 42501) o el principio del mensaje de error (p. ej. SIN_STOCK).
create function prueba.falla(p_sql text, p_esperado text, p_descripcion text)
returns void
language plpgsql
as $$
begin
  begin
    execute p_sql;
  exception when others then
    if sqlstate = p_esperado or sqlerrm like p_esperado || '%' then
      perform prueba.ok(true, p_descripcion);
      return;
    end if;
    raise exception 'FALLA: % (se esperaba %, llegó % «%»)', p_descripcion, p_esperado, sqlstate, sqlerrm;
  end;
  raise exception 'FALLA: % (la sentencia no dio error)', p_descripcion;
end;
$$;

-- Filas afectadas por una sentencia que no debe dar error.
create function prueba.filas(p_sql text)
returns integer
language plpgsql
as $$
declare
  v_filas integer;
begin
  execute p_sql;
  get diagnostics v_filas = row_count;
  return v_filas;
end;
$$;

-- Cambia de identidad como lo haría PostgREST con un JWT.
create function prueba.como(p_rol text, p_usuario uuid default null)
returns void
language plpgsql
as $$
begin
  reset role;
  perform set_config(
    'request.jwt.claims',
    jsonb_strip_nulls(jsonb_build_object('role', p_rol, 'sub', p_usuario))::text,
    false
  );
  execute format('set role %I', p_rol);
end;
$$;

grant execute on all functions in schema prueba to anon, authenticated, service_role;

-- ------------------------------------------------------------
-- Preparación (como superusuario)
-- ------------------------------------------------------------
\set cliente_a '00000000-0000-4000-8000-00000000000a'
\set cliente_b '00000000-0000-4000-8000-00000000000b'
\set admin     '00000000-0000-4000-8000-0000000000ad'

-- Cliente A intenta darse el rol admin en los metadatos del registro.
insert into auth.users (id, email, raw_user_meta_data) values
  (:'cliente_a', 'cliente.a@ovilloandco.example', '{"nombre": "Cliente A", "rol": "admin"}'),
  (:'cliente_b', 'cliente.b@ovilloandco.example', '{"nombre": "Cliente B"}'),
  (:'admin',     'taller@ovilloandco.example',    '{"nombre": "Taller"}');

-- El ascenso a admin se hace fuera de la API, como desde el editor SQL.
update public.perfiles set rol = 'admin' where id = :'admin';

-- Un borrador que nadie de fuera debe ver.
insert into public.productos (slug, nombre, categoria_id, precio, estado)
values ('borrador-secreto', 'Borrador secreto',
        (select id from public.categorias where slug = 'hogar'), 1000, 'borrador');
insert into public.variantes (producto_id, nombre, stock)
values ((select id from public.productos where slug = 'borrador-secreto'), 'Única', 5);

-- ------------------------------------------------------------
-- 0. Semilla y esquema
-- ------------------------------------------------------------
select prueba.ok((select count(*) from public.categorias) = 5, 'la semilla trae 5 categorías');
select prueba.ok((select count(*) from public.productos where estado = 'publicado') = 11, 'la semilla trae 11 productos publicados');
select prueba.ok((select count(*) from public.variantes v join public.productos p on p.id = v.producto_id
                  where p.estado = 'publicado') = 17, 'la semilla trae 17 variantes');
select prueba.ok(
  not exists (select 1 from public.variantes v join public.productos p on p.id = v.producto_id
              where p.estado = 'publicado' and v.foto_ruta is null),
  'cada variante de la semilla tiene su foto'
);
select prueba.ok(
  not exists (select 1 from public.variantes v
              where v.foto_ruta is not null
                and not exists (select 1 from public.fotos_producto f
                                where f.producto_id = v.producto_id and f.ruta = v.foto_ruta)),
  'la foto de cada variante es una de la galería de su producto'
);
select prueba.ok(
  (select variante_etiqueta from public.productos where slug = 'set-recien-nacido') = 'Talla',
  'el set recién nacido se elige por talla'
);
select prueba.ok((select count(*) from public.fotos_producto) = 18, 'la semilla trae 18 fotos');
select prueba.ok((select count(*) from public.promociones) = 4, 'la semilla trae 4 promociones');
select prueba.ok((select count(*) from public.metodos_envio) = 3, 'la semilla trae 3 métodos de envío');
select prueba.ok(
  (select rol from public.perfiles where id = :'cliente_a') = 'cliente',
  'el registro crea el perfil como cliente aunque los metadatos digan otra cosa'
);
select prueba.ok(
  not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
  ),
  'todas las tablas de public tienen RLS activada'
);
select prueba.ok(
  (select count(*) from pg_constraint where contype = 'f' and conname in (
    'productos_categoria_id_fkey', 'variantes_producto_id_fkey',
    'fotos_producto_producto_id_fkey', 'promociones_categoria_id_fkey'
  )) = 4,
  'existen las claves ajenas que nombran las consultas de src/lib/datos'
);
select prueba.ok(
  not exists (
    select 1 from pg_proc f join pg_namespace n on n.oid = f.pronamespace
    where n.nspname = 'public' and f.prosecdef
      and (has_function_privilege('anon', f.oid, 'execute')
           or has_function_privilege('authenticated', f.oid, 'execute'))
      and f.proname not in ('es_admin', 'buscar_cupon', 'suscribir_boletin', 'pedir_aviso_stock',
                            'es_cuenta_demo', 'puede_ver_panel', 'panel_resumen', 'panel_ventas_por_dia',
                            'panel_stock_bajo', 'panel_pedidos', 'panel_pedido', 'panel_clientes',
                            'panel_encargos', 'panel_encargo', 'panel_mensajes')
  ),
  'ninguna función con privilegios de propietario queda abierta a anon o authenticated sin querer'
);
select prueba.ok(
  not exists (
    select 1 from pg_proc f join pg_namespace n on n.oid = f.pronamespace
    where n.nspname = 'public' and f.prosecdef
      and not coalesce('search_path=""' = any (f.proconfig), false)
  ),
  'toda función con privilegios de propietario fija un search_path vacío'
);
select prueba.ok(
  not has_any_column_privilege('anon', 'public.encargos', 'insert')
  and not has_any_column_privilege('authenticated', 'public.encargos', 'insert'),
  'los encargos solo entran por registrar_encargo(), con el rol de servicio'
);

-- ------------------------------------------------------------
-- 1. Rol de servicio: cálculo y registro de pedidos
-- ------------------------------------------------------------
select prueba.como('service_role');

-- Los mismos importes que calcula la cesta del navegador (src/lib/cesta/totales.ts).
select prueba.ok(
  (public.calcular_pedido('[{"producto":"bolso-red-mercado","variante":"Crudo","cantidad":1}]') ->> 'total')::int = 2265,
  'bolso 22,00 € − 3,30 € de rebaja + 3,95 € de envío = 22,65 €'
);
select prueba.ok(
  (public.calcular_pedido('[{"producto":"manta-estrella","variante":"Menta","cantidad":1},
                            {"producto":"bolso-red-mercado","variante":"Crudo","cantidad":1}]') ->> 'total')::int = 8370,
  'manta + bolso = 87,00 € − 3,30 € con envío gratis = 83,70 €'
);
select prueba.ok(
  (public.calcular_pedido('[{"producto":"manta-estrella","variante":"Menta","cantidad":1},
                            {"producto":"bolso-red-mercado","variante":"Crudo","cantidad":1}]',
                          null, 'express') ->> 'total')::int = 9065,
  'con envío urgente, 90,65 €'
);
select prueba.ok(
  (public.calcular_pedido('[{"producto":"manta-estrella","variante":"Menta","cantidad":1},
                            {"producto":"cojin-relieve","variante":"Crudo y beis","cantidad":1},
                            {"producto":"cesta-organizadora","variante":"Pareja blanca","cantidad":1}]', ' hola10 ')
   ->> 'descuento_cupon')::int = 1280,
  'cupón HOLA10 sin distinguir mayúsculas: −10 % sobre 128,00 €'
);
select prueba.ok(
  (public.calcular_pedido('[{"producto":"osita-vestido-lila","variante":"Beis y lila","cantidad":1,"precio":1}]')
   -> 'lineas' -> 0 ->> 'precio_unitario')::int = 2900,
  'un precio enviado desde fuera se ignora'
);
select prueba.ok(
  public.calcular_pedido('[{"producto":"bolso-red-mercado","variante":"Crudo","cantidad":1}]', 'PRIMERA5')
  ->> 'aviso_cupon' = 'MINIMO_NO_ALCANZADO',
  'un cupón sin el mínimo (PRIMERA5 con 18,70 € tras la rebaja) se ignora y se avisa'
);
select prueba.ok(
  (public.calcular_pedido('[{"producto":"bolso-red-mercado","variante":"Crudo","cantidad":3}]') -> 'lineas' -> 0 ->> 'total')::int
    = 3 * 1870,
  'la rebaja automática va por unidad: tres bolsos cuestan tres veces el precio de la ficha (18,70 €)'
);
select prueba.ok(
  (public.calcular_pedido('[{"producto":"bolso-red-mercado","variante":"Rosa palo","cantidad":1}]') -> 'lineas' -> 0 ->> 'foto_ruta')
    = '/fotos/productos/bolso-red-mercado-2.jpg',
  'la línea lleva la foto de su variante'
);
select prueba.ok(
  (public.calcular_pedido('[{"producto":"cojin-relieve","variante":"Crudo y beis","cantidad":1}]', 'ENVIOGRATIS')
   ->> 'envio')::int = 0,
  'ENVIOGRATIS deja el envío a cero'
);
select prueba.falla(
  $$select public.calcular_pedido('[{"producto":"borrador-secreto","variante":"Única","cantidad":1}]')$$,
  'PRODUCTO_NO_DISPONIBLE', 'no se puede comprar un borrador'
);
select prueba.falla(
  $$select public.calcular_pedido('[{"producto":"scrunchies-degradado","variante":"Degradado rojo","cantidad":1}]')$$,
  'SIN_STOCK', 'no se puede comprar una variante agotada'
);
select prueba.falla(
  $$select public.calcular_pedido('[{"producto":"osita-vestido-lila","variante":"Beis y lila","cantidad":1.5}]')$$,
  'CANTIDAD_NO_VALIDA', 'las cantidades decimales no valen'
);
select prueba.falla(
  $$select public.calcular_pedido('[{"producto":"osita-vestido-lila","variante":"Beis y lila","cantidad":1,"personalizacion":"A. M."}]')$$,
  'PERSONALIZACION_NO_ADMITIDA', 'no se personaliza lo que no lo admite'
);
select prueba.falla(
  $$select public.calcular_pedido('[{"producto":"manta-estrella","variante":"Rosa","cantidad":1,"personalizacion":"DEMASIADO"}]')$$,
  'PERSONALIZACION_DEMASIADO_LARGA', 'la personalización respeta el máximo'
);

-- Pedido de A: un bolso de red.
select prueba.falla(
  format($$select public.registrar_pedido_pagado('evt_a0', 'cs_test_a', 'pi_test_a', 1, 'cliente.a@ovilloandco.example',
           '[{"producto":"bolso-red-mercado","variante":"Crudo","cantidad":1}]', null, 'ordinario', %L)$$, :'cliente_a'),
  'IMPORTE_NO_COINCIDE', 'no se registra un pedido si lo cobrado no cuadra con el catálogo'
);
select public.registrar_pedido_pagado(
  'evt_a1', 'cs_test_a', 'pi_test_a', 2265, 'cliente.a@ovilloandco.example',
  '[{"producto":"bolso-red-mercado","variante":"Crudo","cantidad":1}]', null, 'ordinario', :'cliente_a'
) as pedido_a \gset
select prueba.ok(
  public.registrar_pedido_pagado(
    'evt_a2', 'cs_test_a', 'pi_test_a', 2265, 'cliente.a@ovilloandco.example',
    '[{"producto":"bolso-red-mercado","variante":"Crudo","cantidad":1}]', null, 'ordinario', :'cliente_a'
  ) = :'pedido_a',
  'repetir el webhook devuelve el mismo pedido'
);
select prueba.ok(
  (select stock from public.variantes v join public.productos p on p.id = v.producto_id
   where p.slug = 'bolso-red-mercado' and v.nombre = 'Crudo') = 5,
  'el stock se descuenta una sola vez (6 → 5)'
);
select prueba.ok(
  (select count(*) from public.eventos_stripe where pedido_id = :'pedido_a') = 2,
  'los dos eventos de Stripe quedan anotados'
);

-- Pedido de B: dos cervatillos y la manta rosa con iniciales, con HOLA10.
select (public.calcular_pedido(
  '[{"producto":"cervatillo-dormilon","variante":"Crudo y rosa","cantidad":2},
    {"producto":"manta-estrella","variante":"Rosa","cantidad":1,"personalizacion":"B.B."}]', 'HOLA10'
) ->> 'total')::int as total_b \gset
select public.registrar_pedido_pagado(
  'evt_b1', 'cs_test_b', 'pi_test_b', :total_b, 'cliente.b@ovilloandco.example',
  '[{"producto":"cervatillo-dormilon","variante":"Crudo y rosa","cantidad":2},
    {"producto":"manta-estrella","variante":"Rosa","cantidad":1,"personalizacion":"B.B."}]',
  'HOLA10', 'ordinario', :'cliente_b'
) as pedido_b \gset
select prueba.ok(
  (select personalizacion from public.lineas_pedido
   where pedido_id = :'pedido_b' and nombre_producto = 'Manta estrella') = 'B.B.',
  'la línea guarda la personalización'
);
select prueba.ok(
  (select usos from public.promociones where codigo = 'HOLA10') = 1,
  'el uso del cupón queda contado'
);
select prueba.ok(
  (select numero from public.pedidos where id = :'pedido_b') ~ '^OV-[0-9]{4}-[0-9]+$',
  'el pedido recibe un número legible'
);

-- La manta rosa era la última: otro pedido no puede llevársela.
select prueba.falla(
  $$select public.registrar_pedido_pagado('evt_c1', 'cs_test_c', 'pi_test_c', 6500, 'otra@ovilloandco.example',
      '[{"producto":"manta-estrella","variante":"Rosa","cantidad":1}]', null, 'ordinario')$$,
  'SIN_STOCK', 'no se vende una pieza agotada'
);
select prueba.falla(
  $$select public.descontar_stock(jsonb_build_array(jsonb_build_object(
      'variante_id', (select v.id from public.variantes v join public.productos p on p.id = v.producto_id
                      where p.slug = 'cesta-organizadora' and v.nombre = 'Zigzag'),
      'cantidad', 3)))$$,
  'SIN_STOCK', 'descontar más de lo que hay falla en vez de dejar el stock en negativo'
);
select prueba.ok(
  (select stock from public.variantes v join public.productos p on p.id = v.producto_id
   where p.slug = 'cesta-organizadora' and v.nombre = 'Zigzag') = 2,
  'y el stock sigue intacto'
);

-- ------------------------------------------------------------
-- 2. Visitante anónimo
-- ------------------------------------------------------------
select prueba.como('anon');

select prueba.ok((select count(*) from public.productos) = 11, 'anon lee el catálogo publicado');
select prueba.ok((select count(*) from public.categorias) = 5, 'anon lee las categorías');
select prueba.ok((select count(*) from public.variantes) = 17, 'anon lee las variantes y su stock');
select prueba.ok((select count(*) from public.fotos_producto) = 18, 'anon lee las fotos');
select prueba.ok((select count(*) from public.metodos_envio) = 3, 'anon lee los métodos de envío');
select prueba.ok(not exists (select 1 from public.productos where slug = 'borrador-secreto'), 'anon no ve borradores');
select prueba.ok(
  (select count(*) from public.promociones) = 1 and (select codigo from public.promociones) is null,
  'anon solo ve la promoción automática, no los cupones'
);
select prueba.ok((select count(*) from public.buscar_cupon('primera5')) = 1, 'anon comprueba un cupón concreto');
select prueba.ok((select count(*) from public.buscar_cupon('NOEXISTE')) = 0, 'un cupón inventado no devuelve nada');
select prueba.ok(
  (select traducciones -> 'en' ->> 'nombre' from public.productos where slug = 'osita-vestido-lila') is not null,
  'anon lee las traducciones del catálogo'
);
select prueba.ok(
  (select traducciones -> 'de' ->> 'nombre' from public.buscar_cupon('primera5')) is not null,
  'el cupón devuelve su nombre traducido'
);

select prueba.falla('select count(*) from public.pedidos', '42501', 'anon no puede leer pedidos');
select prueba.falla('select count(*) from public.lineas_pedido', '42501', 'anon no puede leer líneas de pedido');
select prueba.falla('select count(*) from public.perfiles', '42501', 'anon no puede leer perfiles');
select prueba.falla('select count(*) from public.encargos', '42501', 'anon no puede leer encargos');
select prueba.falla('select count(*) from public.suscripciones_boletin', '42501', 'anon no puede leer el boletín');
select prueba.falla('select count(*) from public.eventos_stripe', '42501', 'anon no puede leer eventos de Stripe');

select prueba.falla($$update public.productos set precio = 1$$, '42501', 'anon no puede cambiar precios');
select prueba.falla($$insert into public.categorias (slug, nombre, foto_ruta) values ('x', 'X', '/x.jpg')$$,
  '42501', 'anon no puede crear categorías');
select prueba.falla('truncate public.productos cascade', '42501', 'anon no puede vaciar tablas');
select prueba.falla(
  $$select public.registrar_pedido_pagado('evt_x', 'cs_x', 'pi_x', 0, 'x@x.es', '[]')$$,
  '42501', 'anon no puede registrar pedidos'
);
select prueba.falla($$select public.calcular_pedido('[]')$$, '42501', 'anon no puede usar el cálculo interno');
select prueba.falla($$select public.descontar_stock('[]')$$, '42501', 'anon no puede tocar el stock');

select public.suscribir_boletin('hola@ovilloandco.example', 'portada');
select public.suscribir_boletin('HOLA@ovilloandco.example ', 'pie');
select prueba.ok(true, 'anon se apunta al boletín y repetir no delata que ya estaba');
select prueba.falla($$select public.suscribir_boletin('no-es-un-correo')$$, 'EMAIL_NO_VALIDO', 'el boletín valida el correo');
select public.pedir_aviso_stock('scrunchies-degradado', 'Degradado rojo', 'aviso@ovilloandco.example');
select prueba.ok(true, 'anon pide aviso de reposición');

select prueba.falla(
  $$insert into public.encargos (tipo, descripcion, nombre, email, acepta_privacidad)
    values ('Amigurumi de mascota', 'Un gato siamés de unos veinte centímetros, por favor.',
            'Visitante', 'visitante@ovilloandco.example', true)$$,
  '42501', 'anon no puede saltarse el formulario insertando encargos en la tabla'
);
select prueba.falla(
  $$insert into public.encargos (tipo, descripcion, nombre, email, acepta_privacidad, estado)
    values ('Otra cosa', 'Quiero marcar mi encargo como aceptado yo mismo.', 'Pícaro', 'p@ovilloandco.example', true, 'aceptado')$$,
  '42501', 'anon no puede fijar el estado de un encargo'
);
select prueba.falla(
  format($$insert into public.encargos (usuario_id, tipo, descripcion, nombre, email, acepta_privacidad)
           values (%L, 'Otra cosa', 'Me hago pasar por otra persona registrada.', 'Pícaro', 'p@ovilloandco.example', true)$$,
         :'cliente_a'),
  '42501', 'anon no puede enviar un encargo a nombre de otra cuenta'
);
select prueba.falla(
  $$insert into storage.objects (bucket_id, name) values ('productos', 'intruso.jpg')$$,
  '42501', 'anon no puede subir fotos'
);

-- El encargo de una visita entra por el servidor, como en la web.
select prueba.como('service_role');
select public.registrar_encargo(
  gen_random_uuid(), 'Amigurumi de mascota', 'Un gato siamés de unos veinte centímetros, por favor.',
  'Visitante', 'visitante@ovilloandco.example', true
);
select prueba.como('anon');

-- ------------------------------------------------------------
-- 3. Cliente A
-- ------------------------------------------------------------
select prueba.como('authenticated', :'cliente_a');

select prueba.ok(not public.es_admin(), 'cliente A no es admin');
select prueba.ok((select count(*) from public.perfiles) = 1, 'cliente A solo ve su perfil');
select prueba.ok(
  prueba.filas($$update public.perfiles set nombre = 'Otro nombre' where id = '00000000-0000-4000-8000-00000000000b'$$) = 0,
  'cliente A no puede editar el perfil de B'
);
select prueba.ok(
  prueba.filas($$update public.perfiles set nombre = 'Ana', acepta_boletin = true$$) = 1,
  'cliente A edita su nombre'
);
select prueba.falla($$update public.perfiles set rol = 'admin'$$, '42501', 'cliente A no puede hacerse admin');

select prueba.ok((select count(*) from public.pedidos) = 1, 'cliente A solo ve su pedido');
select prueba.ok(
  (select count(*) from public.pedidos where id = :'pedido_b') = 0,
  'cliente A no ve el pedido de B ni sabiendo su id'
);
select prueba.ok(
  (select count(*) from public.lineas_pedido) = 1 and
  (select count(*) from public.lineas_pedido where pedido_id = :'pedido_b') = 0,
  'cliente A solo ve sus líneas de pedido'
);
select prueba.ok((select count(*) from public.eventos_pedido) = 1, 'cliente A ve el seguimiento de su pedido');
select prueba.falla(
  $$insert into public.pedidos (email, subtotal, total, metodo_envio_nombre, stripe_sesion_id)
    values ('cliente.a@ovilloandco.example', 0, 0, 'Envío ordinario', 'cs_falso')$$,
  '42501', 'cliente A no puede crear pedidos'
);
select prueba.falla(
  $$insert into public.lineas_pedido (pedido_id, producto_slug, nombre_producto, nombre_variante, precio_unitario, cantidad, total)
    values ('00000000-0000-0000-0000-000000000000', 'x', 'x', 'x', 0, 1, 0)$$,
  '42501', 'cliente A no puede añadir líneas a un pedido'
);
select prueba.ok(
  prueba.filas(format($$update public.pedidos set estado = 'enviado' where id = %L$$, :'pedido_a')) = 0,
  'cliente A no puede cambiar el estado de su pedido'
);
select prueba.falla(
  format($$update public.pedidos set total = 0 where id = %L$$, :'pedido_a'),
  '42501', 'cliente A no puede cambiar importes'
);
select prueba.falla(
  $$select public.registrar_pedido_pagado('evt_x', 'cs_x', 'pi_x', 0, 'x@x.es', '[]')$$,
  '42501', 'cliente A no puede registrar pedidos'
);

select prueba.ok(
  prueba.filas($$update public.productos set precio = 1 where slug = 'osita-vestido-lila'$$) = 0,
  'cliente A no puede cambiar precios'
);
select prueba.ok(
  prueba.filas($$update public.variantes set stock = 999$$) = 0,
  'cliente A no puede cambiar el stock'
);
select prueba.falla(
  $$insert into public.productos (slug, nombre, categoria_id, precio)
    values ('pirata', 'Pirata', (select id from public.categorias limit 1), 1)$$,
  '42501', 'cliente A no puede crear productos'
);
select prueba.falla(
  $$insert into public.promociones (nombre, tipo, valor, codigo) values ('Gratis', 'porcentaje', 100, 'TODOGRATIS')$$,
  '42501', 'cliente A no puede crear cupones'
);
select prueba.ok((select count(*) from public.promociones) = 1, 'cliente A tampoco ve los cupones');

select prueba.ok(
  prueba.filas(format($$insert into public.favoritos (usuario_id, producto_id)
                        values (%L, (select id from public.productos where slug = 'manta-estrella'))$$, :'cliente_a')) = 1,
  'cliente A guarda un favorito'
);
select prueba.falla(
  format($$insert into public.favoritos (usuario_id, producto_id)
           values (%L, (select id from public.productos where slug = 'manta-estrella'))$$, :'cliente_b'),
  '42501', 'cliente A no puede guardar favoritos a nombre de B'
);
select prueba.falla(
  format($$insert into public.encargos (usuario_id, tipo, descripcion, nombre, email, acepta_privacidad)
           values (%L, 'Manta o mantita', 'Una manta en verde salvia para una cuna de sesenta.',
                   'Ana', 'cliente.a@ovilloandco.example', true)$$, :'cliente_a'),
  '42501', 'cliente A tampoco inserta encargos en la tabla'
);
select prueba.como('service_role');
select public.registrar_encargo(
  gen_random_uuid(), 'Manta o mantita', 'Una manta en verde salvia para una cuna de sesenta.',
  'Ana', 'cliente.a@ovilloandco.example', true, p_usuario => :'cliente_a'
);
select prueba.como('authenticated', :'cliente_a');
select prueba.ok((select count(*) from public.encargos) = 1, 'cliente A ve solo su encargo');
select prueba.falla(
  $$insert into storage.objects (bucket_id, name) values ('productos', 'intruso.jpg')$$,
  '42501', 'cliente A no puede subir fotos'
);

-- Direcciones: cambiar la predeterminada es un solo paso, en la base de datos.
insert into public.direcciones (usuario_id, etiqueta, destinatario, linea1, ciudad, provincia, codigo_postal, predeterminada)
values (:'cliente_a', 'Casa', 'Ana', 'Calle de Ejemplo 1', 'Málaga', 'Málaga', '29001', true)
returning id as direccion_casa \gset
insert into public.direcciones (usuario_id, etiqueta, destinatario, linea1, ciudad, provincia, codigo_postal)
values (:'cliente_a', 'Trabajo', 'Ana', 'Calle de Ejemplo 2', 'Málaga', 'Málaga', '29002')
returning id as direccion_trabajo \gset
select prueba.falla(
  format($$update public.direcciones set predeterminada = true where id = %L$$, :'direccion_trabajo'),
  '23505', 'el índice único no deja dos predeterminadas a la vez'
);
select prueba.ok(public.marcar_direccion_predeterminada(:'direccion_trabajo'), 'cliente A cambia su dirección predeterminada');
select prueba.ok(
  (select array_agg(etiqueta) from public.direcciones where predeterminada) = array['Trabajo'],
  'queda una sola predeterminada, la nueva'
);
select prueba.ok(public.marcar_direccion_predeterminada(:'direccion_trabajo'), 'repetirlo no rompe nada');
select prueba.ok(
  not public.marcar_direccion_predeterminada('00000000-0000-4000-8000-000000000000'),
  'una dirección que no existe no cambia nada'
);
select prueba.ok((select count(*) from public.direcciones where predeterminada) = 1, 'y la predeterminada sigue ahí');

-- ------------------------------------------------------------
-- 4. Cliente B
-- ------------------------------------------------------------
select prueba.como('authenticated', :'cliente_b');

select prueba.ok(
  (select count(*) from public.pedidos) = 1 and (select id from public.pedidos) = :'pedido_b',
  'cliente B solo ve su pedido'
);
select prueba.ok((select count(*) from public.favoritos) = 0, 'cliente B no ve los favoritos de A');
select prueba.ok((select count(*) from public.encargos) = 0, 'cliente B no ve los encargos de A');
select prueba.ok(
  not public.marcar_direccion_predeterminada(:'direccion_casa'),
  'cliente B no puede marcar como predeterminada una dirección de A'
);
select prueba.como('authenticated', :'cliente_a');
select prueba.ok(
  (select array_agg(etiqueta) from public.direcciones where predeterminada) = array['Trabajo'],
  'la dirección predeterminada de A no ha cambiado'
);
select prueba.como('anon');
select prueba.falla(
  format($$select public.marcar_direccion_predeterminada(%L)$$, :'direccion_casa'),
  '42501', 'anon no puede marcar direcciones'
);
select prueba.como('authenticated', :'cliente_b');
select prueba.ok(
  (select nombre from public.perfiles) = 'Cliente B' and (select count(*) from public.perfiles) = 1,
  'cliente B no ve el perfil de A'
);

-- ------------------------------------------------------------
-- 5. Admin
-- ------------------------------------------------------------
select prueba.como('authenticated', :'admin');

select prueba.ok(public.es_admin(), 'admin es admin');
select prueba.ok((select count(*) from public.pedidos) = 2, 'admin ve todos los pedidos');
select prueba.ok((select count(*) from public.perfiles) = 3, 'admin ve todos los perfiles');
select prueba.ok((select count(*) from public.encargos) = 2, 'admin ve todos los encargos');
select prueba.ok((select count(*) from public.suscripciones_boletin) = 1, 'admin ve el boletín (sin duplicados)');
select prueba.ok((select count(*) from public.promociones) = 4, 'admin ve también los cupones');
select prueba.ok(exists (select 1 from public.productos where slug = 'borrador-secreto'), 'admin ve los borradores');

select prueba.ok(
  prueba.filas($$update public.productos set precio = 2700, antes = 2900 where slug = 'osita-vestido-lila'$$) = 1,
  'admin cambia un precio'
);
select prueba.ok(
  prueba.filas($$insert into public.productos (slug, nombre, categoria_id, precio, estado)
                 values ('posavasos-margarita', 'Posavasos margarita',
                         (select id from public.categorias where slug = 'hogar'), 900, 'publicado')$$) = 1,
  'admin crea un producto'
);
select prueba.ok(
  prueba.filas($$insert into public.variantes (producto_id, nombre, color, stock)
                 values ((select id from public.productos where slug = 'posavasos-margarita'), 'Amarillo', '#F2C94C', 4)$$) = 1,
  'admin crea una variante'
);
select prueba.ok(
  prueba.filas($$update public.variantes set stock = 6
                 where producto_id = (select id from public.productos where slug = 'scrunchies-degradado')$$) = 1,
  'admin repone stock'
);
select prueba.falla(
  $$update public.variantes set stock = -1
    where producto_id = (select id from public.productos where slug = 'scrunchies-degradado')$$,
  '23514', 'ni admin puede dejar el stock en negativo'
);
select prueba.ok(
  prueba.filas($$update public.productos set estado = 'archivado' where slug = 'posavasos-margarita'$$) = 1,
  'admin archiva un producto'
);
select prueba.ok(
  prueba.filas($$insert into storage.objects (bucket_id, name) values ('productos', 'manta-estrella/3.webp')$$) = 1,
  'admin sube una foto'
);

select prueba.ok(
  prueba.filas(format($$update public.pedidos set estado = 'en_preparacion' where id = %L$$, :'pedido_a')) = 1,
  'admin pasa un pedido a «en preparación»'
);
select prueba.ok(
  prueba.filas(format($$update public.pedidos set estado = 'enviado', transportista = 'Correos',
                        numero_seguimiento = 'PK000000000ES' where id = %L$$, :'pedido_a')) = 1,
  'admin lo marca como enviado con seguimiento'
);
select prueba.ok(
  (select enviado_en is not null from public.pedidos where id = :'pedido_a'),
  'la fecha de envío se sella sola'
);
select prueba.falla(
  format($$update public.pedidos set estado = 'pagado' where id = %L$$, :'pedido_a'),
  'CAMBIO_DE_ESTADO_NO_VALIDO', 'un pedido enviado no vuelve a «pagado»'
);
select prueba.falla(
  format($$update public.pedidos set total = 1 where id = %L$$, :'pedido_a'),
  '42501', 'ni admin cambia los importes cobrados'
);
select prueba.ok(
  prueba.filas(format($$update public.pedidos set estado = 'cancelado' where id = %L$$, :'pedido_b')) = 1,
  'admin cancela el pedido de B'
);
select prueba.ok(
  (select stock from public.variantes v join public.productos p on p.id = v.producto_id
   where p.slug = 'manta-estrella' and v.nombre = 'Rosa') = 1,
  'al cancelar, las piezas vuelven al stock'
);
select prueba.falla($$update public.perfiles set rol = 'cliente'$$, '42501', 'los roles no se cambian desde la API');

-- ------------------------------------------------------------
-- 6. Seguimiento visto por la clientela
-- ------------------------------------------------------------
select prueba.como('authenticated', :'cliente_a');
select prueba.ok(
  (select array_agg(estado::text order by creado_en, estado) from public.eventos_pedido)
    @> array['pagado', 'en_preparacion', 'enviado'],
  'cliente A ve cada cambio de estado de su pedido'
);
select prueba.ok(
  (select numero_seguimiento from public.pedidos) = 'PK000000000ES',
  'cliente A ve el número de seguimiento'
);

reset role;
\o
select format('%s comprobaciones de seguridad superadas.', aciertos) as resultado from prueba.contador \gset
\echo :resultado
