-- ============================================================
--  Ovillo & Co. · Lógica de negocio en la base de datos
--
--  Los importes se calculan siempre aquí, con los precios del
--  catálogo: el navegador solo dice qué quiere y cuántas unidades.
--  El orden de aplicación es el mismo que el de la cesta:
--  subtotal → rebaja automática → cupón → envío.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Cupones
-- ------------------------------------------------------------
-- Comprueba un código sin exponer la tabla. Devuelve la promoción si
-- existe y está vigente; el mínimo lo valora la cesta con su subtotal.
create function public.buscar_cupon(p_codigo text)
returns table (
  nombre    text,
  tipo      public.tipo_promocion,
  valor     integer,
  codigo    text,
  minimo    integer,
  categoria text,
  hasta     date
)
language sql
stable
security definer
set search_path = ''
as $$
  select pr.nombre, pr.tipo, pr.valor, pr.codigo, pr.minimo, c.slug, pr.hasta
  from public.promociones pr
  left join public.categorias c on c.id = pr.categoria_id
  where pr.codigo = upper(btrim(p_codigo))
    and public.promocion_vigente(pr)
  limit 1;
$$;

revoke all on function public.buscar_cupon(text) from public;
grant execute on function public.buscar_cupon(text) to anon, authenticated, service_role;

-- ------------------------------------------------------------
-- 2. Cálculo del pedido
-- ------------------------------------------------------------
-- p_lineas: [{ "producto": slug, "variante": nombre, "cantidad": n,
--              "personalizacion": texto | null }]
-- Cualquier otro campo (un precio, por ejemplo) se ignora.
-- Un cupón inexistente o sin el mínimo no rompe el cálculo: se ignora
-- y se indica en «aviso_cupon», igual que hace la cesta.
create function public.calcular_pedido(
  p_lineas jsonb,
  p_cupon  text default null,
  p_envio  text default 'ordinario'
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_entrada       record;
  v_producto      public.productos;
  v_variante      public.variantes;
  v_cantidad      integer;
  v_personal      text;
  v_lineas        jsonb := '[]'::jsonb;
  v_linea         jsonb;
  v_subtotal      integer := 0;
  v_pct           integer;
  v_desc_linea    integer;
  v_desc_auto     integer := 0;
  v_cupon         public.promociones;
  v_aviso_cupon   text;
  v_base_cupon    integer := 0;
  v_desc_cupon    integer := 0;
  v_envio_gratis  boolean := false;
  v_metodo        public.metodos_envio;
  v_tras_desc     integer;
  v_envio         integer;
  v_dias          integer;
  v_resultado     jsonb := '[]'::jsonb;
begin
  if p_lineas is null or jsonb_typeof(p_lineas) <> 'array' or jsonb_array_length(p_lineas) = 0 then
    raise exception 'CESTA_VACIA';
  end if;
  if jsonb_array_length(p_lineas) > 50 then
    raise exception 'CESTA_DEMASIADO_GRANDE';
  end if;

  -- Primera pasada: validar y sumar el subtotal con precios del catálogo.
  for v_entrada in select e.valor from jsonb_array_elements(p_lineas) as e(valor)
  loop
    select * into v_producto from public.productos
    where slug = v_entrada.valor ->> 'producto' and estado = 'publicado';
    if not found then
      raise exception 'PRODUCTO_NO_DISPONIBLE' using detail = coalesce(v_entrada.valor ->> 'producto', '');
    end if;

    select * into v_variante from public.variantes
    where producto_id = v_producto.id and nombre = v_entrada.valor ->> 'variante' and activa;
    if not found then
      raise exception 'VARIANTE_NO_DISPONIBLE' using detail = v_producto.slug;
    end if;

    if jsonb_typeof(v_entrada.valor -> 'cantidad') is distinct from 'number' then
      raise exception 'CANTIDAD_NO_VALIDA' using detail = v_producto.slug;
    end if;
    v_cantidad := (v_entrada.valor ->> 'cantidad')::numeric;
    if v_cantidad::numeric <> (v_entrada.valor ->> 'cantidad')::numeric or v_cantidad not between 1 and 9 then
      raise exception 'CANTIDAD_NO_VALIDA' using detail = v_producto.slug;
    end if;

    v_personal := nullif(btrim(v_entrada.valor ->> 'personalizacion'), '');
    if v_personal is not null then
      if v_producto.personalizacion_max is null then
        raise exception 'PERSONALIZACION_NO_ADMITIDA' using detail = v_producto.slug;
      end if;
      if char_length(v_personal) > v_producto.personalizacion_max then
        raise exception 'PERSONALIZACION_DEMASIADO_LARGA' using detail = v_producto.slug;
      end if;
    end if;

    v_subtotal := v_subtotal + v_producto.precio * v_cantidad;
    v_lineas := v_lineas || jsonb_build_object(
      'producto_id',     v_producto.id,
      'variante_id',     v_variante.id,
      'categoria_id',    v_producto.categoria_id,
      'producto_slug',   v_producto.slug,
      'nombre_producto', v_producto.nombre,
      'nombre_variante', v_variante.nombre,
      'color',           v_variante.color,
      'foto_ruta',       (select f.ruta from public.fotos_producto f
                          where f.producto_id = v_producto.id
                          order by f.posicion limit 1),
      'precio_unitario', v_producto.precio,
      'cantidad',        v_cantidad,
      'personalizacion', v_personal,
      'encargo',         v_producto.encargo,
      'dias',            v_producto.dias,
      'stock',           v_variante.stock
    );
  end loop;

  -- Stock suficiente sumando las líneas de la misma variante (una pieza
  -- con distinta personalización va en otra línea).
  if exists (
    select 1
    from jsonb_array_elements(v_lineas) l
    group by l ->> 'variante_id'
    having sum((l ->> 'cantidad')::integer) > min((l ->> 'stock')::integer)
  ) then
    raise exception 'SIN_STOCK';
  end if;

  -- Segunda pasada: rebaja automática de la categoría de cada línea; si
  -- coinciden dos, gana la mayor y no se acumulan.
  for v_linea in select l from jsonb_array_elements(v_lineas) l
  loop
    select max(pr.valor) into v_pct
    from public.promociones pr
    where pr.codigo is null
      and pr.tipo = 'porcentaje'
      and pr.categoria_id = (v_linea ->> 'categoria_id')::uuid
      and pr.minimo <= v_subtotal
      and public.promocion_vigente(pr);

    v_desc_linea := coalesce(round(
      (v_linea ->> 'precio_unitario')::integer * (v_linea ->> 'cantidad')::integer * v_pct / 100.0
    ), 0);
    v_desc_auto := v_desc_auto + v_desc_linea;

    v_resultado := v_resultado || (
      (v_linea - 'categoria_id' - 'stock') || jsonb_build_object(
        'descuento', v_desc_linea,
        'total', (v_linea ->> 'precio_unitario')::integer * (v_linea ->> 'cantidad')::integer - v_desc_linea
      )
    );
  end loop;

  -- Cupón sobre lo que queda tras la rebaja automática.
  if nullif(btrim(p_cupon), '') is not null then
    select * into v_cupon from public.promociones pr
    where pr.codigo = upper(btrim(p_cupon)) and public.promocion_vigente(pr);

    if not found then
      v_aviso_cupon := 'NO_VALIDO';
    else
      v_base_cupon := v_subtotal - v_desc_auto;

      if v_base_cupon < v_cupon.minimo then
        v_aviso_cupon := 'MINIMO_NO_ALCANZADO';
        v_cupon := null;
      elsif v_cupon.tipo = 'porcentaje' then
        v_desc_cupon := round(v_base_cupon * v_cupon.valor / 100.0);
      elsif v_cupon.tipo = 'fijo' then
        v_desc_cupon := least(v_cupon.valor, v_base_cupon);
      else
        v_envio_gratis := true;
      end if;
    end if;
  end if;

  select * into v_metodo from public.metodos_envio where id = p_envio and activo;
  if not found then
    raise exception 'ENVIO_NO_VALIDO' using detail = coalesce(p_envio, '');
  end if;

  v_tras_desc := v_subtotal - v_desc_auto - v_desc_cupon;
  v_envio := v_metodo.precio;
  if v_envio_gratis or (v_metodo.gratis_desde is not null and v_tras_desc >= v_metodo.gratis_desde) then
    v_envio := 0;
  end if;

  select max((l ->> 'dias')::integer) into v_dias
  from jsonb_array_elements(v_resultado) l
  where (l ->> 'encargo')::boolean;

  return jsonb_build_object(
    'lineas',               v_resultado,
    'subtotal',             v_subtotal,
    'descuento_automatico', v_desc_auto,
    'descuento_cupon',      v_desc_cupon,
    'envio',                v_envio,
    'total',                v_tras_desc + v_envio,
    'promocion_id',         v_cupon.id,
    'codigo_cupon',         v_cupon.codigo,
    'aviso_cupon',          v_aviso_cupon,
    'metodo_envio_id',      v_metodo.id,
    'metodo_envio_nombre',  v_metodo.nombre,
    'dias_confeccion',      v_dias
  );
end;
$$;

revoke all on function public.calcular_pedido(jsonb, text, text) from public, anon, authenticated;
grant execute on function public.calcular_pedido(jsonb, text, text) to service_role;

-- ------------------------------------------------------------
-- 3. Stock
-- ------------------------------------------------------------
-- Descuenta de forma atómica. La actualización condicionada bloquea la
-- fila y solo resta si queda bastante, así que dos compras simultáneas
-- de la última pieza no pueden salir las dos. Recorrer las variantes
-- por id evita interbloqueos entre pedidos que comparten piezas.
create function public.descontar_stock(p_lineas jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_fila record;
begin
  for v_fila in
    select (l ->> 'variante_id')::uuid as variante_id,
           sum((l ->> 'cantidad')::integer) as cantidad
    from jsonb_array_elements(p_lineas) l
    group by 1
    order by 1
  loop
    if v_fila.cantidad <= 0 then
      raise exception 'CANTIDAD_NO_VALIDA';
    end if;

    update public.variantes
    set stock = stock - v_fila.cantidad
    where id = v_fila.variante_id and stock >= v_fila.cantidad;

    if not found then
      raise exception 'SIN_STOCK' using detail = v_fila.variante_id::text;
    end if;
  end loop;
end;
$$;

revoke all on function public.descontar_stock(jsonb) from public, anon, authenticated;
grant execute on function public.descontar_stock(jsonb) to service_role;

-- ------------------------------------------------------------
-- 4. Registrar un pedido pagado
-- ------------------------------------------------------------
-- La llama el webhook de Stripe con el rol de servicio. Todo ocurre en
-- una transacción: si algo falla, ni se crea el pedido, ni se toca el
-- stock, ni se marca el evento como procesado, y Stripe lo reintentará.
-- Es idempotente por evento y por sesión de pago.
create function public.registrar_pedido_pagado(
  p_evento_stripe   text,
  p_sesion_stripe   text,
  p_pago_stripe     text,
  p_importe_cobrado integer,
  p_email           text,
  p_lineas          jsonb,
  p_cupon           text default null,
  p_envio           text default 'ordinario',
  p_usuario         uuid default null,
  p_nombre          text default null,
  p_telefono        text default null,
  p_direccion       jsonb default null,
  p_nota            text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pedido_id uuid;
  v_calculo   jsonb;
begin
  -- Serializa los reintentos de la misma sesión.
  perform pg_advisory_xact_lock(hashtextextended(p_sesion_stripe, 0));

  select id into v_pedido_id from public.pedidos where stripe_sesion_id = p_sesion_stripe;
  if found then
    insert into public.eventos_stripe (id, tipo, pedido_id)
    values (p_evento_stripe, 'checkout.session.completed', v_pedido_id)
    on conflict (id) do nothing;
    return v_pedido_id;
  end if;

  v_calculo := public.calcular_pedido(p_lineas, p_cupon, p_envio);

  -- Lo cobrado tiene que coincidir con lo que dice el catálogo.
  if (v_calculo ->> 'total')::integer <> p_importe_cobrado then
    raise exception 'IMPORTE_NO_COINCIDE'
      using detail = format('cobrado %s, calculado %s', p_importe_cobrado, v_calculo ->> 'total');
  end if;

  perform public.descontar_stock(v_calculo -> 'lineas');

  insert into public.pedidos (
    usuario_id, email, nombre_cliente, telefono,
    subtotal, descuento_automatico, descuento_cupon, envio, total,
    promocion_id, codigo_cupon, metodo_envio_id, metodo_envio_nombre,
    direccion_envio, dias_confeccion, nota_cliente,
    stripe_sesion_id, stripe_pago_id
  ) values (
    p_usuario, btrim(p_email), p_nombre, p_telefono,
    (v_calculo ->> 'subtotal')::integer,
    (v_calculo ->> 'descuento_automatico')::integer,
    (v_calculo ->> 'descuento_cupon')::integer,
    (v_calculo ->> 'envio')::integer,
    (v_calculo ->> 'total')::integer,
    (v_calculo ->> 'promocion_id')::uuid,
    v_calculo ->> 'codigo_cupon',
    v_calculo ->> 'metodo_envio_id',
    v_calculo ->> 'metodo_envio_nombre',
    p_direccion,
    (v_calculo ->> 'dias_confeccion')::integer,
    nullif(btrim(p_nota), ''),
    p_sesion_stripe, p_pago_stripe
  )
  returning id into v_pedido_id;

  insert into public.lineas_pedido (
    pedido_id, producto_id, variante_id, producto_slug, nombre_producto,
    nombre_variante, color, foto_ruta, precio_unitario, cantidad,
    descuento, total, personalizacion, encargo, dias
  )
  select
    v_pedido_id,
    (l ->> 'producto_id')::uuid,
    (l ->> 'variante_id')::uuid,
    l ->> 'producto_slug',
    l ->> 'nombre_producto',
    l ->> 'nombre_variante',
    l ->> 'color',
    l ->> 'foto_ruta',
    (l ->> 'precio_unitario')::integer,
    (l ->> 'cantidad')::integer,
    (l ->> 'descuento')::integer,
    (l ->> 'total')::integer,
    l ->> 'personalizacion',
    (l ->> 'encargo')::boolean,
    (l ->> 'dias')::integer
  from jsonb_array_elements(v_calculo -> 'lineas') l;

  if v_calculo ->> 'promocion_id' is not null then
    update public.promociones set usos = usos + 1
    where id = (v_calculo ->> 'promocion_id')::uuid;
  end if;

  insert into public.eventos_stripe (id, tipo, pedido_id)
  values (p_evento_stripe, 'checkout.session.completed', v_pedido_id)
  on conflict (id) do nothing;

  return v_pedido_id;
end;
$$;

revoke all on function public.registrar_pedido_pagado(
  text, text, text, integer, text, jsonb, text, text, uuid, text, text, jsonb, text
) from public, anon, authenticated;
grant execute on function public.registrar_pedido_pagado(
  text, text, text, integer, text, jsonb, text, text, uuid, text, text, jsonb, text
) to service_role;

-- ------------------------------------------------------------
-- 5. Estados del pedido
-- ------------------------------------------------------------
-- Solo se avanza por caminos con sentido, se sellan las fechas y, si se
-- cancela antes de enviarse, las piezas vuelven al stock.
create function public.controlar_estado_pedido()
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

  if new.estado = 'cancelado' then
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

create trigger pedidos_controlar_estado
  before update of estado on public.pedidos
  for each row execute function public.controlar_estado_pedido();

-- security definer: el evento se escribe aunque quien cambia el estado
-- (admin) no tenga permiso de inserción en eventos_pedido.
create function public.anotar_evento_pedido()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.estado <> old.estado then
    insert into public.eventos_pedido (pedido_id, estado) values (new.id, new.estado);
  end if;
  return new;
end;
$$;

create trigger pedidos_anotar_evento
  after insert or update of estado on public.pedidos
  for each row execute function public.anotar_evento_pedido();

-- Las funciones de los disparadores no se invocan directamente.
revoke all on function public.crear_perfil()             from public, anon, authenticated;
revoke all on function public.controlar_estado_pedido()  from public, anon, authenticated;
revoke all on function public.anotar_evento_pedido()     from public, anon, authenticated;

-- ------------------------------------------------------------
-- 6. Formularios públicos
-- ------------------------------------------------------------
-- Responden igual tanto si el correo ya estaba como si no, para que
-- nadie pueda averiguar quién está apuntado.

create function public.suscribir_boletin(p_email text, p_origen text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(btrim(p_email));
begin
  if v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(v_email) > 254 then
    raise exception 'EMAIL_NO_VALIDO';
  end if;

  insert into public.suscripciones_boletin (email, origen)
  values (v_email, left(p_origen, 40))
  on conflict (lower(email)) do update set baja_en = null;
end;
$$;

revoke all on function public.suscribir_boletin(text, text) from public;
grant execute on function public.suscribir_boletin(text, text) to anon, authenticated, service_role;

create function public.pedir_aviso_stock(p_producto text, p_variante text, p_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email    text := lower(btrim(p_email));
  v_variante uuid;
begin
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

revoke all on function public.pedir_aviso_stock(text, text, text) from public;
grant execute on function public.pedir_aviso_stock(text, text, text) to anon, authenticated, service_role;

-- Utilidades internas que no deben poder llamarse como RPC.
revoke all on function public.marcar_actualizado()     from public, anon, authenticated;
revoke all on function public.asignar_numero_pedido()  from public, anon, authenticated;
