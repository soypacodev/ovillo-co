-- ============================================================
--  Ovillo & Co. · Base para el panel del taller
--
--  · Rol «demo»: ve el panel como el dueño, pero no escribe nada y no
--    ve datos personales reales. Los datos de ejemplo (es_demo) se ven
--    enteros porque son ficticios; los reales, enmascarados.
--  · Mensajes de contacto y fotos de encargos (bucket privado).
--  · Funciones panel_*: lo único que necesita la interfaz del panel.
--    Comprueban el rol dentro y enmascaran según quién pregunta.
--  · asignar_rol(): para nombrar al dueño desde el editor SQL.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Quién es quién
-- ------------------------------------------------------------
-- security definer por lo mismo que es_admin(): las políticas las
-- consultan y leer perfiles desde ellas no debe volver a pasar por RLS.

create function public.es_cuenta_demo()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfiles
    where id = auth.uid() and rol = 'demo'
  );
$$;

create function public.puede_ver_panel()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfiles
    where id = auth.uid() and rol in ('admin', 'demo')
  );
$$;

revoke all on function public.es_cuenta_demo()  from public, anon, authenticated;
revoke all on function public.puede_ver_panel() from public, anon, authenticated;
grant execute on function public.es_cuenta_demo()  to anon, authenticated, service_role;
grant execute on function public.puede_ver_panel() to anon, authenticated, service_role;

-- Corta cualquier función del panel si quien llama no es admin ni demo.
create function public.exigir_panel()
returns void
language plpgsql
stable
set search_path = ''
as $$
begin
  if not public.puede_ver_panel() then
    raise exception 'SOLO_PANEL' using errcode = '42501';
  end if;
end;
$$;

revoke all on function public.exigir_panel() from public, anon, authenticated;
grant execute on function public.exigir_panel() to authenticated;

-- ------------------------------------------------------------
-- 2. Marca de datos ficticios
-- ------------------------------------------------------------
-- Las filas de supabase/seed-demo.sql llevan es_demo = true. Nadie
-- puede marcarla desde fuera: no está entre las columnas concedidas.

alter table public.pedidos  add column es_demo boolean not null default false;
alter table public.encargos add column es_demo boolean not null default false;

create index pedidos_creado_idx on public.pedidos (creado_en desc);

-- ------------------------------------------------------------
-- 3. Mensajes de contacto
-- ------------------------------------------------------------

create type public.estado_mensaje as enum ('nuevo', 'respondido', 'archivado');

create table public.mensajes_contacto (
  id                 uuid primary key default gen_random_uuid(),
  usuario_id         uuid references public.perfiles (id) on delete set null,
  motivo             text not null check (char_length(motivo) between 1 and 80),
  numero_pedido      text check (numero_pedido ~ '^OV-[0-9]{4}-[0-9]{3,7}$'),
  nombre             text not null check (char_length(nombre) between 1 and 120),
  email              text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  mensaje            text not null check (char_length(mensaje) between 10 and 3000),
  acepta_privacidad  boolean not null check (acepta_privacidad),
  estado             public.estado_mensaje not null default 'nuevo',
  nota_admin         text,
  es_demo            boolean not null default false,
  creado_en          timestamptz not null default now(),
  actualizado_en     timestamptz not null default now()
);

create index mensajes_contacto_estado_idx on public.mensajes_contacto (estado, creado_en desc);

create trigger mensajes_contacto_actualizado
  before update on public.mensajes_contacto
  for each row execute function public.marcar_actualizado();

-- ------------------------------------------------------------
-- 4. Fotos de los encargos
-- ------------------------------------------------------------
-- El fichero vive en el bucket privado «encargos», en la carpeta del
-- propio encargo: <encargo_id>/<nombre>. Aquí queda el registro.

create table public.fotos_encargo (
  id          uuid primary key default gen_random_uuid(),
  encargo_id  uuid not null references public.encargos (id) on delete cascade,
  ruta        text not null unique check (ruta ~ '^[0-9a-f-]{36}/[A-Za-z0-9._-]{1,100}$'),
  tipo_mime   text not null check (tipo_mime in ('image/jpeg', 'image/png', 'image/webp')),
  bytes       integer not null check (bytes between 1 and 3145728),
  posicion    integer not null default 0,
  creado_en   timestamptz not null default now(),
  constraint ruta_en_carpeta_del_encargo check (split_part(ruta, '/', 1) = encargo_id::text)
);

create index fotos_encargo_idx on public.fotos_encargo (encargo_id, posicion);

-- ------------------------------------------------------------
-- 5. Permisos y RLS de lo nuevo
-- ------------------------------------------------------------

revoke all on public.mensajes_contacto, public.fotos_encargo from anon;
revoke truncate, references, trigger on public.mensajes_contacto, public.fotos_encargo from authenticated;
revoke insert, update, delete on public.mensajes_contacto, public.fotos_encargo from authenticated;
grant update (estado, nota_admin) on public.mensajes_contacto to authenticated;

alter table public.mensajes_contacto enable row level security;
alter table public.fotos_encargo     enable row level security;

create policy "mensajes: admin, o demo los ficticios"
  on public.mensajes_contacto for select to authenticated
  using ((select public.es_admin()) or ((select public.es_cuenta_demo()) and es_demo));

create policy "mensajes: admin gestiona"
  on public.mensajes_contacto for update to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

create policy "fotos de encargos: admin, o demo las ficticias"
  on public.fotos_encargo for select to authenticated
  using (
    (select public.es_admin()) or (
      (select public.es_cuenta_demo()) and exists (
        select 1 from public.encargos e where e.id = encargo_id and e.es_demo
      )
    )
  );

-- Lectura de demo. El catálogo se ve entero (no hay datos personales);
-- pedidos y encargos solo los ficticios: los reales se consultan con las
-- funciones panel_*, que los devuelven enmascarados.
create policy "categorías: demo lee"     on public.categorias     for select to authenticated using ((select public.es_cuenta_demo()));
create policy "productos: demo lee"      on public.productos      for select to authenticated using ((select public.es_cuenta_demo()));
create policy "variantes: demo lee"      on public.variantes      for select to authenticated using ((select public.es_cuenta_demo()));
create policy "fotos: demo lee"          on public.fotos_producto for select to authenticated using ((select public.es_cuenta_demo()));
create policy "promociones: demo lee"    on public.promociones    for select to authenticated using ((select public.es_cuenta_demo()));
create policy "envíos: demo lee"         on public.metodos_envio  for select to authenticated using ((select public.es_cuenta_demo()));

create policy "pedidos: demo lee los ficticios"
  on public.pedidos for select to authenticated
  using ((select public.es_cuenta_demo()) and es_demo);

create policy "líneas: demo lee las ficticias"
  on public.lineas_pedido for select to authenticated
  using ((select public.es_cuenta_demo()) and exists (
    select 1 from public.pedidos o where o.id = pedido_id and o.es_demo
  ));

create policy "eventos: demo lee los ficticios"
  on public.eventos_pedido for select to authenticated
  using ((select public.es_cuenta_demo()) and exists (
    select 1 from public.pedidos o where o.id = pedido_id and o.es_demo
  ));

create policy "encargos: demo lee los ficticios"
  on public.encargos for select to authenticated
  using ((select public.es_cuenta_demo()) and es_demo);

-- Demo no escribe en ninguna tabla. Son políticas restrictivas: se
-- suman a las permisivas y ninguna otra puede abrir la puerta. Si se
-- crea una tabla nueva hay que añadírselas (las pruebas lo comprueban).
do $$
declare
  v_tabla record;
begin
  for v_tabla in
    select c.relname
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'p')
  loop
    execute format(
      'create policy "demo: no inserta" on public.%I as restrictive for insert to authenticated
         with check (not (select public.es_cuenta_demo()))', v_tabla.relname);
    execute format(
      'create policy "demo: no cambia" on public.%I as restrictive for update to authenticated
         using (not (select public.es_cuenta_demo())) with check (not (select public.es_cuenta_demo()))', v_tabla.relname);
    execute format(
      'create policy "demo: no borra" on public.%I as restrictive for delete to authenticated
         using (not (select public.es_cuenta_demo()))', v_tabla.relname);
  end loop;
end;
$$;

-- ------------------------------------------------------------
-- 6. Storage: bucket privado de encargos
-- ------------------------------------------------------------
-- Solo el servidor sube (rol de servicio, que se salta RLS). Admin y
-- demo leen con URL firmada, que exige permiso de lectura del objeto;
-- demo, solo las fotos de los encargos ficticios.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('encargos', 'encargos', false, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "encargos: admin y demo leen"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'encargos' and (
      (select public.es_admin()) or (
        (select public.es_cuenta_demo()) and exists (
          select 1
          from public.fotos_encargo f
          join public.encargos e on e.id = f.encargo_id
          where f.ruta = objects.name and e.es_demo
        )
      )
    )
  );

create policy "encargos: admin borra"
  on storage.objects for delete to authenticated
  using (bucket_id = 'encargos' and (select public.es_admin()));

create policy "demo: no sube"
  on storage.objects as restrictive for insert to authenticated
  with check (not (select public.es_cuenta_demo()));

create policy "demo: no cambia"
  on storage.objects as restrictive for update to authenticated
  using (not (select public.es_cuenta_demo())) with check (not (select public.es_cuenta_demo()));

create policy "demo: no borra"
  on storage.objects as restrictive for delete to authenticated
  using (not (select public.es_cuenta_demo()));

-- ------------------------------------------------------------
-- 7. Ajustes a funciones existentes
-- ------------------------------------------------------------

-- Los pedidos ficticios traen su historial escrito en la semilla, y
-- cancelarlos no repone stock porque nunca lo descontaron.
create or replace function public.anotar_evento_pedido()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' and new.es_demo then
    return new;
  end if;
  if tg_op = 'INSERT' or new.estado <> old.estado then
    insert into public.eventos_pedido (pedido_id, estado) values (new.id, new.estado);
  end if;
  return new;
end;
$$;

create or replace function public.controlar_estado_pedido()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.estado = old.estado then
    return new;
  end if;

  if not (
    (old.estado = 'pagado'         and new.estado in ('en_preparacion', 'enviado', 'cancelado', 'reembolsado')) or
    (old.estado = 'en_preparacion' and new.estado in ('enviado', 'cancelado', 'reembolsado')) or
    (old.estado = 'enviado'        and new.estado in ('entregado', 'reembolsado')) or
    (old.estado = 'entregado'      and new.estado = 'reembolsado') or
    (old.estado = 'cancelado'      and new.estado = 'reembolsado')
  ) then
    raise exception 'CAMBIO_DE_ESTADO_NO_VALIDO'
      using detail = format('%s → %s', old.estado, new.estado);
  end if;

  case new.estado
    when 'enviado'   then new.enviado_en   := coalesce(new.enviado_en, now());
    when 'entregado' then new.entregado_en := coalesce(new.entregado_en, now());
    when 'cancelado' then new.cancelado_en := coalesce(new.cancelado_en, now());
    else null;
  end case;

  if new.estado = 'cancelado' and not new.es_demo then
    update public.variantes v
    set stock = v.stock + l.cantidad
    from (
      select variante_id, sum(cantidad) as cantidad
      from public.lineas_pedido
      where pedido_id = new.id and variante_id is not null
      group by variante_id
    ) l
    where v.id = l.variante_id;
  end if;

  return new;
end;
$$;

-- Las funciones públicas que escriben tampoco aceptan a demo.
create or replace function public.suscribir_boletin(p_email text, p_origen text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(btrim(p_email));
begin
  if public.es_cuenta_demo() then
    raise exception 'CUENTA_DE_SOLO_LECTURA' using errcode = '42501';
  end if;
  if v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(v_email) > 254 then
    raise exception 'EMAIL_NO_VALIDO';
  end if;

  insert into public.suscripciones_boletin (email, origen)
  values (v_email, left(p_origen, 40))
  on conflict (lower(email)) do update set baja_en = null;
end;
$$;

create or replace function public.pedir_aviso_stock(p_producto text, p_variante text, p_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email    text := lower(btrim(p_email));
  v_variante uuid;
begin
  if public.es_cuenta_demo() then
    raise exception 'CUENTA_DE_SOLO_LECTURA' using errcode = '42501';
  end if;
  if v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(v_email) > 254 then
    raise exception 'EMAIL_NO_VALIDO';
  end if;

  select v.id into v_variante
  from public.variantes v
  join public.productos p on p.id = v.producto_id
  where p.slug = p_producto and p.estado = 'publicado'
    and v.nombre = p_variante and v.activa;

  if v_variante is null then
    raise exception 'VARIANTE_NO_DISPONIBLE';
  end if;

  insert into public.avisos_stock (variante_id, email)
  values (v_variante, v_email)
  on conflict (variante_id, lower(email)) do update set avisado_en = null;
end;
$$;

-- ------------------------------------------------------------
-- 8. Altas desde el servidor
-- ------------------------------------------------------------
-- Solo con el rol de servicio: así el límite de envíos y el campo
-- trampa de las acciones de servidor no se pueden saltar llamando a la
-- API directamente.

create function public.registrar_mensaje_contacto(
  p_motivo   text,
  p_nombre   text,
  p_email    text,
  p_mensaje  text,
  p_acepta   boolean,
  p_pedido   text default null,
  p_usuario  uuid default null
)
returns uuid
language sql
set search_path = ''
as $$
  insert into public.mensajes_contacto (motivo, nombre, email, mensaje, acepta_privacidad, numero_pedido, usuario_id)
  values (btrim(p_motivo), btrim(p_nombre), lower(btrim(p_email)), btrim(p_mensaje), p_acepta,
          nullif(upper(btrim(p_pedido)), ''), p_usuario)
  returning id;
$$;

revoke all on function public.registrar_mensaje_contacto(text, text, text, text, boolean, text, uuid)
  from public, anon, authenticated;
grant execute on function public.registrar_mensaje_contacto(text, text, text, text, boolean, text, uuid)
  to service_role;

-- El servidor elige el id (crypto.randomUUID()), sube las fotos a
-- encargos/<id>/… y después registra todo de una vez. Si esto falla, no
-- queda un encargo a medias; las fotos huérfanas se pueden borrar.
-- p_fotos: [{ "ruta": "<id>/1.jpg", "tipo_mime": "image/jpeg", "bytes": 12345 }]
create function public.registrar_encargo(
  p_id           uuid,
  p_tipo         text,
  p_descripcion  text,
  p_nombre       text,
  p_email        text,
  p_acepta       boolean,
  p_fecha        text default null,
  p_presupuesto  text default null,
  p_colores      text default null,
  p_instagram    text default null,
  p_usuario      uuid default null,
  p_fotos        jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
set search_path = ''
as $$
begin
  if jsonb_typeof(p_fotos) is distinct from 'array' or jsonb_array_length(p_fotos) > 4 then
    raise exception 'FOTOS_NO_VALIDAS';
  end if;

  insert into public.encargos (
    id, usuario_id, tipo, descripcion, fecha_deseada, presupuesto, colores,
    nombre, email, instagram, acepta_privacidad
  ) values (
    p_id, p_usuario, btrim(p_tipo), btrim(p_descripcion), nullif(btrim(p_fecha), ''),
    nullif(btrim(p_presupuesto), ''), nullif(btrim(p_colores), ''),
    btrim(p_nombre), lower(btrim(p_email)), nullif(btrim(p_instagram), ''), p_acepta
  );

  insert into public.fotos_encargo (encargo_id, ruta, tipo_mime, bytes, posicion)
  select p_id, f.valor ->> 'ruta', f.valor ->> 'tipo_mime', (f.valor ->> 'bytes')::integer, (f.orden - 1)::integer
  from jsonb_array_elements(p_fotos) with ordinality as f(valor, orden);

  return p_id;
end;
$$;

revoke all on function public.registrar_encargo(
  uuid, text, text, text, text, boolean, text, text, text, text, uuid, jsonb
) from public, anon, authenticated;
grant execute on function public.registrar_encargo(
  uuid, text, text, text, text, boolean, text, text, text, text, uuid, jsonb
) to service_role;

-- ------------------------------------------------------------
-- 9. Enmascarado
-- ------------------------------------------------------------

-- «lucia.garcia@ejemplo.com» → «l•••@e•••.com»
create function public.enmascarar_email(p_email text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_email is null or position('@' in p_email) = 0 then null
    else left(split_part(p_email, '@', 1), 1) || '•••@'
         || left(split_part(p_email, '@', 2), 1) || '•••'
         || coalesce(substring(split_part(p_email, '@', 2) from '\.[^.]+$'), '')
  end;
$$;

-- «Lucía García Pérez» → «L. G. P.»
create function public.enmascarar_nombre(p_nombre text)
returns text
language sql
immutable
set search_path = ''
as $$
  select nullif(string_agg(left(palabra, 1) || '.', ' ' order by orden), '')
  from regexp_split_to_table(btrim(coalesce(p_nombre, '')), '\s+') with ordinality as t(palabra, orden)
  where palabra <> '';
$$;

-- De la dirección solo queda la zona: suficiente para ver de dónde
-- llegan los pedidos sin saber a qué puerta.
create function public.enmascarar_direccion(p_direccion jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select case when p_direccion is null then null else jsonb_strip_nulls(jsonb_build_object(
    'ciudad',    p_direccion ->> 'ciudad',
    'provincia', p_direccion ->> 'provincia',
    'pais',      p_direccion ->> 'pais'
  )) end;
$$;

-- ------------------------------------------------------------
-- 10. Funciones del panel
-- ------------------------------------------------------------
-- Todas: security definer para ver todas las filas, exigir_panel() al
-- principio y datos personales a la vista solo para admin o en filas
-- ficticias. Fechas y meses, en hora de Madrid.

create function public.panel_resumen()
returns table (
  ventas_mes            integer,
  pedidos_mes           integer,
  ticket_medio_mes      integer,
  ventas_mes_anterior   integer,
  pedidos_pendientes    integer,
  encargos_nuevos       integer,
  mensajes_nuevos       integer,
  variantes_stock_bajo  integer,
  suscriptores          integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_mes      timestamptz := date_trunc('month', now() at time zone 'Europe/Madrid') at time zone 'Europe/Madrid';
  v_anterior timestamptz := (date_trunc('month', now() at time zone 'Europe/Madrid') - interval '1 month') at time zone 'Europe/Madrid';
begin
  perform public.exigir_panel();

  return query
  with vendidos as (
    select total, creado_en from public.pedidos
    where estado not in ('cancelado', 'reembolsado')
  )
  select
    coalesce((select sum(total) from vendidos where creado_en >= v_mes), 0)::integer,
    (select count(*) from vendidos where creado_en >= v_mes)::integer,
    coalesce((select round(avg(total)) from vendidos where creado_en >= v_mes), 0)::integer,
    coalesce((select sum(total) from vendidos where creado_en >= v_anterior and creado_en < v_mes), 0)::integer,
    (select count(*) from public.pedidos where estado in ('pagado', 'en_preparacion'))::integer,
    (select count(*) from public.encargos where estado = 'nuevo')::integer,
    (select count(*) from public.mensajes_contacto where estado = 'nuevo')::integer,
    (select count(*) from public.variantes v join public.productos p on p.id = v.producto_id
      where p.estado = 'publicado' and v.activa and v.stock <= 1)::integer,
    (select count(*) from public.suscripciones_boletin where baja_en is null)::integer;
end;
$$;

create function public.panel_ventas_por_dia(p_dias integer default 30)
returns table (dia date, pedidos integer, ventas integer)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_hoy  date := (now() at time zone 'Europe/Madrid')::date;
  v_dias integer := least(greatest(coalesce(p_dias, 30), 1), 366);
begin
  perform public.exigir_panel();

  return query
  select d.dia::date,
         count(o.id)::integer,
         coalesce(sum(o.total), 0)::integer
  from generate_series(v_hoy - (v_dias - 1), v_hoy, interval '1 day') as d(dia)
  left join public.pedidos o
    on (o.creado_en at time zone 'Europe/Madrid')::date = d.dia::date
   and o.estado not in ('cancelado', 'reembolsado')
  group by d.dia
  order by d.dia;
end;
$$;

create function public.panel_stock_bajo(p_umbral integer default 1)
returns table (
  producto_slug  text,
  producto       text,
  variante       text,
  color          text,
  stock          integer,
  encargo        boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.exigir_panel();

  return query
  select p.slug, p.nombre, v.nombre, v.color, v.stock, p.encargo
  from public.variantes v
  join public.productos p on p.id = v.producto_id
  where p.estado = 'publicado' and v.activa and v.stock <= greatest(coalesce(p_umbral, 1), 0)
  order by v.stock, p.nombre, v.posicion;
end;
$$;

create function public.panel_pedidos(
  p_estado         public.estado_pedido default null,
  p_busqueda       text default null,
  p_limite         integer default 50,
  p_desplazamiento integer default 0
)
returns table (
  id                   uuid,
  numero               text,
  creado_en            timestamptz,
  estado               public.estado_pedido,
  nombre_cliente       text,
  email                text,
  total                integer,
  unidades             integer,
  metodo_envio_nombre  text,
  es_demo              boolean,
  total_filas          integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_admin    boolean := public.es_admin();
  v_busqueda text := nullif(lower(btrim(p_busqueda)), '');
begin
  perform public.exigir_panel();

  return query
  select
    o.id, o.numero, o.creado_en, o.estado,
    case when v_admin or o.es_demo then o.nombre_cliente else public.enmascarar_nombre(o.nombre_cliente) end,
    case when v_admin or o.es_demo then o.email else public.enmascarar_email(o.email) end,
    o.total,
    (select coalesce(sum(l.cantidad), 0) from public.lineas_pedido l where l.pedido_id = o.id)::integer,
    o.metodo_envio_nombre,
    o.es_demo,
    (count(*) over ())::integer
  from public.pedidos o
  where (p_estado is null or o.estado = p_estado)
    and (
      v_busqueda is null
      or lower(o.numero) like '%' || v_busqueda || '%'
      -- Demo no puede usar la búsqueda para averiguar si un correo real ha comprado.
      or ((v_admin or o.es_demo) and (
        lower(o.email) like '%' || v_busqueda || '%'
        or lower(coalesce(o.nombre_cliente, '')) like '%' || v_busqueda || '%'
      ))
    )
  order by o.creado_en desc
  limit least(greatest(coalesce(p_limite, 50), 1), 200)
  offset greatest(coalesce(p_desplazamiento, 0), 0);
end;
$$;

-- Ficha completa: pedido, líneas y seguimiento. null si no existe.
create function public.panel_pedido(p_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  o       public.pedidos;
  v_ver   boolean;
begin
  perform public.exigir_panel();

  select * into o from public.pedidos where id = p_id;
  if not found then
    return null;
  end if;
  v_ver := public.es_admin() or o.es_demo;

  return jsonb_build_object(
    'id', o.id,
    'numero', o.numero,
    'estado', o.estado,
    'es_demo', o.es_demo,
    'creado_en', o.creado_en,
    'pagado_en', o.pagado_en,
    'enviado_en', o.enviado_en,
    'entregado_en', o.entregado_en,
    'cancelado_en', o.cancelado_en,
    'email', case when v_ver then o.email else public.enmascarar_email(o.email) end,
    'nombre_cliente', case when v_ver then o.nombre_cliente else public.enmascarar_nombre(o.nombre_cliente) end,
    'telefono', case when v_ver then o.telefono end,
    'direccion_envio', case when v_ver then o.direccion_envio else public.enmascarar_direccion(o.direccion_envio) end,
    'nota_cliente', case when v_ver then o.nota_cliente end,
    'nota_admin', o.nota_admin,
    'subtotal', o.subtotal,
    'descuento_automatico', o.descuento_automatico,
    'descuento_cupon', o.descuento_cupon,
    'envio', o.envio,
    'total', o.total,
    'codigo_cupon', o.codigo_cupon,
    'metodo_envio_nombre', o.metodo_envio_nombre,
    'dias_confeccion', o.dias_confeccion,
    'transportista', o.transportista,
    'numero_seguimiento', o.numero_seguimiento,
    'tiene_cuenta', o.usuario_id is not null,
    'lineas', coalesce((
      select jsonb_agg(jsonb_build_object(
        'producto_slug', l.producto_slug,
        'nombre_producto', l.nombre_producto,
        'nombre_variante', l.nombre_variante,
        'color', l.color,
        'foto_ruta', l.foto_ruta,
        'precio_unitario', l.precio_unitario,
        'cantidad', l.cantidad,
        'descuento', l.descuento,
        'total', l.total,
        -- Una personalización suele ser un nombre: se oculta igual que el resto.
        'personalizacion', case when v_ver then l.personalizacion
                                when l.personalizacion is not null then '•••' end,
        'encargo', l.encargo,
        'dias', l.dias
      ) order by l.creado_en, l.nombre_producto)
      from public.lineas_pedido l where l.pedido_id = o.id
    ), '[]'::jsonb),
    'eventos', coalesce((
      select jsonb_agg(jsonb_build_object('estado', e.estado, 'nota', e.nota, 'creado_en', e.creado_en)
                       order by e.creado_en)
      from public.eventos_pedido e where e.pedido_id = o.id
    ), '[]'::jsonb)
  );
end;
$$;

-- Clientes deducidos de los pedidos (también los que compran sin cuenta).
create function public.panel_clientes(
  p_limite         integer default 50,
  p_desplazamiento integer default 0
)
returns table (
  email          text,
  nombre         text,
  pedidos        integer,
  gastado        integer,
  primer_pedido  timestamptz,
  ultimo_pedido  timestamptz,
  tiene_cuenta   boolean,
  es_demo        boolean,
  total_filas    integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_admin boolean := public.es_admin();
begin
  perform public.exigir_panel();

  return query
  with grupos as (
    select
      lower(o.email) as clave,
      (array_agg(o.email order by o.creado_en desc))[1] as email,
      (array_agg(o.nombre_cliente order by o.creado_en desc))[1] as nombre,
      count(*) as pedidos,
      coalesce(sum(o.total) filter (where o.estado not in ('cancelado', 'reembolsado')), 0) as gastado,
      min(o.creado_en) as primero,
      max(o.creado_en) as ultimo,
      bool_or(o.usuario_id is not null) as cuenta,
      bool_and(o.es_demo) as ficticio
    from public.pedidos o
    group by lower(o.email)
  )
  select
    case when v_admin or g.ficticio then g.email else public.enmascarar_email(g.email) end,
    case when v_admin or g.ficticio then g.nombre else public.enmascarar_nombre(g.nombre) end,
    g.pedidos::integer, g.gastado::integer, g.primero, g.ultimo, g.cuenta, g.ficticio,
    (count(*) over ())::integer
  from grupos g
  order by g.ultimo desc
  limit least(greatest(coalesce(p_limite, 50), 1), 200)
  offset greatest(coalesce(p_desplazamiento, 0), 0);
end;
$$;

create function public.panel_encargos(
  p_estado         public.estado_encargo default null,
  p_limite         integer default 50,
  p_desplazamiento integer default 0
)
returns table (
  id             uuid,
  creado_en      timestamptz,
  estado         public.estado_encargo,
  tipo           text,
  descripcion    text,
  fecha_deseada  text,
  presupuesto    text,
  colores        text,
  nombre         text,
  email          text,
  instagram      text,
  fotos          text[],
  es_demo        boolean,
  total_filas    integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_admin boolean := public.es_admin();
begin
  perform public.exigir_panel();

  return query
  select
    e.id, e.creado_en, e.estado, e.tipo,
    -- La descripción de un encargo real suele hablar de personas concretas.
    case when v_admin or e.es_demo then e.descripcion else 'Oculto en la cuenta de demostración.' end,
    e.fecha_deseada, e.presupuesto, e.colores,
    case when v_admin or e.es_demo then e.nombre else public.enmascarar_nombre(e.nombre) end,
    case when v_admin or e.es_demo then e.email else public.enmascarar_email(e.email) end,
    case when v_admin or e.es_demo then e.instagram end,
    case when v_admin or e.es_demo then coalesce((
      select array_agg(f.ruta order by f.posicion) from public.fotos_encargo f where f.encargo_id = e.id
    ), '{}') else '{}' end,
    e.es_demo,
    (count(*) over ())::integer
  from public.encargos e
  where p_estado is null or e.estado = p_estado
  order by e.creado_en desc
  limit least(greatest(coalesce(p_limite, 50), 1), 200)
  offset greatest(coalesce(p_desplazamiento, 0), 0);
end;
$$;

create function public.panel_mensajes(
  p_estado         public.estado_mensaje default null,
  p_limite         integer default 50,
  p_desplazamiento integer default 0
)
returns table (
  id             uuid,
  creado_en      timestamptz,
  estado         public.estado_mensaje,
  motivo         text,
  numero_pedido  text,
  nombre         text,
  email          text,
  mensaje        text,
  es_demo        boolean,
  total_filas    integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_admin boolean := public.es_admin();
begin
  perform public.exigir_panel();

  return query
  select
    m.id, m.creado_en, m.estado, m.motivo, m.numero_pedido,
    case when v_admin or m.es_demo then m.nombre else public.enmascarar_nombre(m.nombre) end,
    case when v_admin or m.es_demo then m.email else public.enmascarar_email(m.email) end,
    case when v_admin or m.es_demo then m.mensaje else 'Oculto en la cuenta de demostración.' end,
    m.es_demo,
    (count(*) over ())::integer
  from public.mensajes_contacto m
  where p_estado is null or m.estado = p_estado
  order by m.creado_en desc
  limit least(greatest(coalesce(p_limite, 50), 1), 200)
  offset greatest(coalesce(p_desplazamiento, 0), 0);
end;
$$;

do $$
declare
  v_funcion text;
begin
  foreach v_funcion in array array[
    'public.panel_resumen()',
    'public.panel_ventas_por_dia(integer)',
    'public.panel_stock_bajo(integer)',
    'public.panel_pedidos(public.estado_pedido, text, integer, integer)',
    'public.panel_pedido(uuid)',
    'public.panel_clientes(integer, integer)',
    'public.panel_encargos(public.estado_encargo, integer, integer)',
    'public.panel_mensajes(public.estado_mensaje, integer, integer)'
  ] loop
    execute format('revoke all on function %s from public, anon, authenticated', v_funcion);
    execute format('grant execute on function %s to authenticated', v_funcion);
  end loop;
end;
$$;

-- ------------------------------------------------------------
-- 11. Nombrar al dueño
-- ------------------------------------------------------------
-- Uso, una sola vez y desde el editor SQL de Supabase (rol postgres),
-- después de que el dueño se haya registrado en la web:
--
--   select public.asignar_rol('correo-del-dueno@ejemplo.com', 'admin');
--
-- La cuenta pública de demostración se prepara igual con 'demo', y
-- 'cliente' devuelve a alguien a su rol normal. Nadie puede llamarla
-- desde la API: no tiene permiso de ejecución ni anon, ni authenticated,
-- ni el rol de servicio. Se niega a dejar la tienda sin ningún admin.
create function public.asignar_rol(p_email text, p_rol public.rol_usuario)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario uuid;
begin
  select id into v_usuario from auth.users where lower(email) = lower(btrim(p_email));
  if v_usuario is null then
    raise exception 'USUARIO_NO_ENCONTRADO' using detail = 'Esa persona tiene que registrarse antes en la web.';
  end if;

  if p_rol <> 'admin' and exists (select 1 from public.perfiles where id = v_usuario and rol = 'admin')
     and (select count(*) from public.perfiles where rol = 'admin') = 1 then
    raise exception 'ULTIMO_ADMIN' using detail = 'Nombra antes a otra persona admin.';
  end if;

  insert into public.perfiles (id, rol) values (v_usuario, p_rol)
  on conflict (id) do update set rol = excluded.rol;
end;
$$;

revoke all on function public.asignar_rol(text, public.rol_usuario) from public, anon, authenticated, service_role;

-- Utilidades internas que no deben poder llamarse como RPC.
revoke all on function public.enmascarar_email(text)      from public, anon, authenticated;
revoke all on function public.enmascarar_nombre(text)     from public, anon, authenticated;
revoke all on function public.enmascarar_direccion(jsonb) from public, anon, authenticated;
