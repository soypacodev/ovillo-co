-- ============================================================
--  Ovillo & Co. · Fotos por variante y precio final
--
--  Cada variante puede tener su propia foto (dos tallas pueden
--  compartirla) y el producto dice qué distingue a sus variantes
--  («Color», «Talla», «Modelo»).
--
--  La tienda enseña el precio con la rebaja automática ya aplicada, así
--  que calcular_pedido redondea la rebaja por unidad, igual que la cesta:
--  dos piezas cuestan siempre el doble que una. La línea del pedido
--  guarda la foto de su variante.
-- ============================================================

alter table public.productos
  add column variante_etiqueta text not null default 'Color'
    check (char_length(btrim(variante_etiqueta)) between 1 and 30);

-- Ruta pública («/fotos/…») o dentro del bucket «productos», como en fotos_producto.
alter table public.variantes add column foto_ruta text;

create or replace function public.calcular_pedido(
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
      'foto_ruta',       coalesce(v_variante.foto_ruta,
                                  (select f.ruta from public.fotos_producto f
                                   where f.producto_id = v_producto.id
                                   order by f.posicion limit 1)),
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

    -- Por unidad y después por cantidad: es el precio que enseña la tienda.
    v_desc_linea := coalesce(
      round((v_linea ->> 'precio_unitario')::integer * v_pct / 100.0)::integer * (v_linea ->> 'cantidad')::integer,
      0
    );
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
