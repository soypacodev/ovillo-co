-- ============================================================
--  Ovillo & Co. · Esquema de la tienda
--
--  Convenciones:
--    · El dinero va siempre en céntimos (integer) y en euros.
--    · Los nombres de columna coinciden con los tipos de
--      src/lib/catalogo/tipos.ts para que el mapeo sea directo.
--    · Todo producto tiene al menos una variante: la cesta, el
--      stock y los pedidos apuntan siempre a una variante.
--    · La seguridad (RLS y permisos) está en la migración siguiente.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Tipos
-- ------------------------------------------------------------

create type public.rol_usuario     as enum ('cliente', 'admin');
create type public.tipo_producto   as enum ('simple', 'pack');
create type public.estado_producto as enum ('borrador', 'publicado', 'archivado');
create type public.tipo_promocion  as enum ('porcentaje', 'fijo', 'envio');
create type public.estado_pedido   as enum (
  'pagado', 'en_preparacion', 'enviado', 'entregado', 'cancelado', 'reembolsado'
);
create type public.estado_encargo  as enum ('nuevo', 'respondido', 'aceptado', 'descartado');

-- ------------------------------------------------------------
-- 2. Utilidades
-- ------------------------------------------------------------

create function public.marcar_actualizado()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- 3. Personas
-- ------------------------------------------------------------

-- Datos de tienda de cada cuenta. Correo y contraseña los guarda
-- Supabase Auth; aquí solo lo que la tienda necesita.
create table public.perfiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  rol             public.rol_usuario not null default 'cliente',
  nombre          text check (char_length(nombre) <= 120),
  telefono        text check (char_length(telefono) <= 30),
  acepta_boletin  boolean not null default false,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now()
);

create trigger perfiles_actualizado
  before update on public.perfiles
  for each row execute function public.marcar_actualizado();

-- El perfil nace con la cuenta. El rol nunca se toma de los metadatos
-- del registro, que los escribe el propio usuario.
create function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'nombre', new.raw_user_meta_data ->> 'full_name'), 120)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();

create table public.direcciones (
  id              uuid primary key default gen_random_uuid(),
  usuario_id      uuid not null references public.perfiles (id) on delete cascade,
  etiqueta        text,
  destinatario    text not null,
  linea1          text not null,
  linea2          text,
  ciudad          text not null,
  provincia       text not null,
  codigo_postal   text not null check (codigo_postal ~ '^[0-9]{5}$'),
  pais            char(2) not null default 'ES',
  telefono        text,
  predeterminada  boolean not null default false,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now()
);

create index direcciones_usuario_idx on public.direcciones (usuario_id);
create unique index direcciones_una_predeterminada_idx
  on public.direcciones (usuario_id) where predeterminada;

create trigger direcciones_actualizado
  before update on public.direcciones
  for each row execute function public.marcar_actualizado();

-- ------------------------------------------------------------
-- 4. Catálogo
-- ------------------------------------------------------------

create table public.categorias (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nombre      text not null,
  texto       text not null default '',
  -- Ruta pública («/fotos/…») o ruta dentro del bucket «productos».
  foto_ruta   text not null,
  foto_alt    text not null default '',
  posicion    integer not null default 0,
  visible     boolean not null default true,
  creado_en   timestamptz not null default now()
);

create table public.productos (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nombre          text not null,
  categoria_id    uuid not null references public.categorias (id) on delete restrict,
  tipo            public.tipo_producto   not null default 'simple',
  estado          public.estado_producto not null default 'borrador',

  precio          integer not null check (precio >= 0),
  antes           integer,

  destacado       boolean not null default false,
  novedad         boolean not null default false,
  encargo         boolean not null default false,
  dias            integer check (dias between 1 and 90),
  etiqueta        text,

  corto           text not null default '',
  largo           text not null default '',
  historia        text,
  materiales      text[] not null default '{}',
  cuidados        text not null default '',
  medidas         text not null default '',

  -- Personalización opcional (p. ej. iniciales bordadas).
  personalizacion_etiqueta text,
  personalizacion_ejemplo  text,
  personalizacion_max      integer check (personalizacion_max between 1 and 60),
  personalizacion_pista    text,

  -- Solo en packs: lo que incluye la caja.
  contenido       text[],

  posicion        integer not null default 0,
  meta_titulo      text,
  meta_descripcion text,
  publicado_en    timestamptz,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now(),

  constraint antes_mayor_que_precio check (antes is null or antes > precio),
  constraint encargo_con_plazo      check (not encargo or dias is not null),
  constraint contenido_solo_en_packs check (contenido is null or tipo = 'pack'),
  constraint personalizacion_completa check (
    (personalizacion_etiqueta is null and personalizacion_max is null)
    or (personalizacion_etiqueta is not null and personalizacion_max is not null)
  )
);

create index productos_estado_idx    on public.productos (estado);
create index productos_categoria_idx on public.productos (categoria_id);
create index productos_destacado_idx on public.productos (destacado) where destacado;

create trigger productos_actualizado
  before update on public.productos
  for each row execute function public.marcar_actualizado();

create table public.variantes (
  id              uuid primary key default gen_random_uuid(),
  producto_id     uuid not null references public.productos (id) on delete cascade,
  nombre          text not null,
  -- Color de la muestra en el selector.
  color           text not null default '#EDE6DA' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  sku             text unique,
  -- La restricción es la última barrera: aunque falle todo lo demás,
  -- el stock nunca queda en negativo.
  stock           integer not null default 0 check (stock >= 0),
  posicion        integer not null default 0,
  activa          boolean not null default true,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now(),
  unique (producto_id, nombre)
);

create index variantes_producto_idx on public.variantes (producto_id);

create trigger variantes_actualizado
  before update on public.variantes
  for each row execute function public.marcar_actualizado();

create table public.fotos_producto (
  id           uuid primary key default gen_random_uuid(),
  producto_id  uuid not null references public.productos (id) on delete cascade,
  variante_id  uuid references public.variantes (id) on delete set null,
  -- Ruta pública («/fotos/…») o ruta dentro del bucket «productos».
  ruta         text not null,
  alt          text not null default '',
  posicion     integer not null default 0,
  creado_en    timestamptz not null default now()
);

create index fotos_producto_idx on public.fotos_producto (producto_id, posicion);

create table public.favoritos (
  usuario_id   uuid not null references public.perfiles (id) on delete cascade,
  producto_id  uuid not null references public.productos (id) on delete cascade,
  creado_en    timestamptz not null default now(),
  primary key (usuario_id, producto_id)
);

-- ------------------------------------------------------------
-- 5. Promociones y envíos
-- ------------------------------------------------------------

create table public.promociones (
  id              uuid primary key default gen_random_uuid(),
  nombre          text not null,
  tipo            public.tipo_promocion not null,
  -- Porcentaje (1-100) o céntimos, según el tipo.
  valor           integer not null default 0 check (valor >= 0),
  -- Sin código: se aplica sola en la cesta.
  codigo          text,
  minimo          integer not null default 0 check (minimo >= 0),
  -- Solo las rebajas automáticas se limitan a una categoría; los cupones
  -- se aplican sobre toda la cesta.
  categoria_id    uuid references public.categorias (id) on delete cascade,
  desde           date,
  hasta           date,
  usos_maximos    integer check (usos_maximos > 0),
  usos            integer not null default 0 check (usos >= 0),
  activa          boolean not null default true,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now(),
  constraint porcentaje_valido check (tipo <> 'porcentaje' or valor between 1 and 100),
  constraint codigo_en_mayusculas check (codigo is null or codigo ~ '^[A-Z0-9]{3,30}$'),
  constraint cupon_sin_categoria check (codigo is null or categoria_id is null),
  constraint automatica_con_categoria check (codigo is not null or categoria_id is not null),
  constraint fechas_ordenadas check (desde is null or hasta is null or desde <= hasta)
);

create unique index promociones_codigo_idx on public.promociones (codigo) where codigo is not null;

create trigger promociones_actualizado
  before update on public.promociones
  for each row execute function public.marcar_actualizado();

-- Vigencia según la fecha de Málaga, que es la que ve la clientela.
create function public.promocion_vigente(p public.promociones)
returns boolean
language sql
stable
set search_path = ''
as $$
  select p.activa
    and (p.desde is null or p.desde <= (now() at time zone 'Europe/Madrid')::date)
    and (p.hasta is null or p.hasta >= (now() at time zone 'Europe/Madrid')::date)
    and (p.usos_maximos is null or p.usos < p.usos_maximos);
$$;

create table public.metodos_envio (
  id            text primary key check (id ~ '^[a-z]+(-[a-z]+)*$'),
  nombre        text not null,
  precio        integer not null check (precio >= 0),
  gratis_desde  integer check (gratis_desde > 0),
  plazo         text not null default '',
  activo        boolean not null default true,
  posicion      integer not null default 0
);

-- ------------------------------------------------------------
-- 6. Pedidos
-- ------------------------------------------------------------
-- Cada pedido guarda una copia de nombres y precios: si mañana cambia
-- el catálogo, el histórico no se altera. Solo los crea el servidor
-- con el rol de servicio, después de que Stripe confirme el pago.

create sequence public.numero_pedido_seq start 1000;

create table public.pedidos (
  id                    uuid primary key default gen_random_uuid(),
  numero                text not null unique,
  usuario_id            uuid references public.perfiles (id) on delete set null,
  email                 text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  nombre_cliente        text,
  telefono              text,
  estado                public.estado_pedido not null default 'pagado',

  subtotal              integer not null check (subtotal >= 0),
  descuento_automatico  integer not null default 0 check (descuento_automatico >= 0),
  descuento_cupon       integer not null default 0 check (descuento_cupon >= 0),
  envio                 integer not null default 0 check (envio >= 0),
  total                 integer not null check (total >= 0),
  moneda                char(3) not null default 'EUR',

  promocion_id          uuid references public.promociones (id) on delete set null,
  codigo_cupon          text,
  metodo_envio_id       text references public.metodos_envio (id) on delete set null,
  metodo_envio_nombre   text not null,
  direccion_envio       jsonb,
  -- Plazo del pedido completo si lleva piezas que se tejen al pedir.
  dias_confeccion       integer,

  nota_cliente          text check (char_length(nota_cliente) <= 1000),
  nota_admin            text,
  transportista         text,
  numero_seguimiento    text,

  stripe_sesion_id      text not null unique,
  stripe_pago_id        text unique,

  creado_en             timestamptz not null default now(),
  pagado_en             timestamptz not null default now(),
  enviado_en            timestamptz,
  entregado_en          timestamptz,
  cancelado_en          timestamptz,
  actualizado_en        timestamptz not null default now(),

  constraint total_cuadra check (
    total = subtotal - descuento_automatico - descuento_cupon + envio
  )
);

create index pedidos_usuario_idx on public.pedidos (usuario_id, creado_en desc);
create index pedidos_estado_idx  on public.pedidos (estado);
create index pedidos_email_idx   on public.pedidos (lower(email));

create trigger pedidos_actualizado
  before update on public.pedidos
  for each row execute function public.marcar_actualizado();

-- Número legible: OV-2026-1000.
create function public.asignar_numero_pedido()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.numero is null or new.numero = '' then
    new.numero := 'OV-' || to_char(now() at time zone 'Europe/Madrid', 'YYYY')
                  || '-' || nextval('public.numero_pedido_seq')::text;
  end if;
  return new;
end;
$$;

create trigger pedidos_numero
  before insert on public.pedidos
  for each row execute function public.asignar_numero_pedido();

create table public.lineas_pedido (
  id                uuid primary key default gen_random_uuid(),
  pedido_id         uuid not null references public.pedidos (id) on delete cascade,
  -- Referencias blandas: si se borra el producto, la línea sobrevive.
  producto_id       uuid references public.productos (id) on delete set null,
  variante_id       uuid references public.variantes (id) on delete set null,
  producto_slug     text not null,
  nombre_producto   text not null,
  nombre_variante   text not null,
  color             text,
  foto_ruta         text,
  precio_unitario   integer not null check (precio_unitario >= 0),
  cantidad          integer not null check (cantidad between 1 and 99),
  descuento         integer not null default 0 check (descuento >= 0),
  total             integer not null check (total >= 0),
  personalizacion   text,
  encargo           boolean not null default false,
  dias              integer,
  creado_en         timestamptz not null default now(),
  constraint total_linea_cuadra check (total = precio_unitario * cantidad - descuento)
);

create index lineas_pedido_idx on public.lineas_pedido (pedido_id);

-- Historial que ve la clientela: pagado → en preparación → enviado…
create table public.eventos_pedido (
  id         uuid primary key default gen_random_uuid(),
  pedido_id  uuid not null references public.pedidos (id) on delete cascade,
  estado     public.estado_pedido not null,
  nota       text,
  publico    boolean not null default true,
  creado_en  timestamptz not null default now()
);

create index eventos_pedido_idx on public.eventos_pedido (pedido_id, creado_en);

-- Eventos de Stripe ya procesados. Stripe reintenta los webhooks, así
-- que el identificador del evento es la clave de idempotencia.
create table public.eventos_stripe (
  id            text primary key check (id ~ '^evt_'),
  tipo          text not null,
  pedido_id     uuid references public.pedidos (id) on delete set null,
  recibido_en   timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 7. Formularios
-- ------------------------------------------------------------

create table public.encargos (
  id                 uuid primary key default gen_random_uuid(),
  usuario_id         uuid references public.perfiles (id) on delete set null,
  tipo               text not null check (char_length(tipo) between 1 and 80),
  descripcion        text not null check (char_length(descripcion) between 20 and 4000),
  fecha_deseada      text check (char_length(fecha_deseada) <= 80),
  presupuesto        text check (char_length(presupuesto) <= 40),
  colores            text check (char_length(colores) <= 200),
  nombre             text not null check (char_length(nombre) between 1 and 120),
  email              text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  instagram          text check (char_length(instagram) <= 60),
  acepta_privacidad  boolean not null check (acepta_privacidad),
  estado             public.estado_encargo not null default 'nuevo',
  nota_admin         text,
  creado_en          timestamptz not null default now(),
  actualizado_en     timestamptz not null default now()
);

create index encargos_estado_idx on public.encargos (estado, creado_en desc);

create trigger encargos_actualizado
  before update on public.encargos
  for each row execute function public.marcar_actualizado();

create table public.suscripciones_boletin (
  id         uuid primary key default gen_random_uuid(),
  email      text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  origen     text,
  creado_en  timestamptz not null default now(),
  baja_en    timestamptz
);

create unique index suscripciones_boletin_email_idx on public.suscripciones_boletin (lower(email));

-- «Avísame cuando vuelva»: formulario de las variantes agotadas.
create table public.avisos_stock (
  id          uuid primary key default gen_random_uuid(),
  variante_id uuid not null references public.variantes (id) on delete cascade,
  email       text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  avisado_en  timestamptz,
  creado_en   timestamptz not null default now()
);

create unique index avisos_stock_unico_idx on public.avisos_stock (variante_id, lower(email));
