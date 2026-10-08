-- ============================================================
--  Ovillo & Co. · Lo que le faltaba al panel para escribir
--
--  · panel_encargo(): ficha de un encargo, con la nota interna y la
--    misma máscara que panel_encargos().
--  · panel_guardar_producto(): alta o edición de un producto con sus
--    variantes en una sola transacción. Es security invoker: corre con
--    los permisos de quien llama, así que RLS (admin gestiona, demo no
--    escribe) sigue decidiendo; la comprobación de admin del principio
--    solo da un error más claro.
-- ============================================================

create function public.panel_encargo(p_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  e      public.encargos;
  v_ver  boolean;
begin
  perform public.exigir_panel();

  select * into e from public.encargos where id = p_id;
  if not found then
    return null;
  end if;
  v_ver := public.es_admin() or e.es_demo;

  return jsonb_build_object(
    'id', e.id,
    'creado_en', e.creado_en,
    'estado', e.estado,
    'tipo', e.tipo,
    'descripcion', case when v_ver then e.descripcion else 'Oculto en la cuenta de demostración.' end,
    'fecha_deseada', e.fecha_deseada,
    'presupuesto', e.presupuesto,
    'colores', e.colores,
    'nombre', case when v_ver then e.nombre else public.enmascarar_nombre(e.nombre) end,
    'email', case when v_ver then e.email else public.enmascarar_email(e.email) end,
    'instagram', case when v_ver then e.instagram end,
    'fotos', case when v_ver then coalesce((
      select jsonb_agg(f.ruta order by f.posicion) from public.fotos_encargo f where f.encargo_id = e.id
    ), '[]'::jsonb) else '[]'::jsonb end,
    'es_demo', e.es_demo,
    'nota_admin', case when v_ver then e.nota_admin end
  );
end;
$$;

revoke all on function public.panel_encargo(uuid) from public, anon, authenticated;
grant execute on function public.panel_encargo(uuid) to authenticated;

-- p_producto: { slug, nombre, categoria (slug), tipo, estado, precio, antes,
--   destacado, novedad, encargo, dias, etiqueta, corto, largo, historia,
--   materiales[], cuidados, medidas, contenido[] | null,
--   personalizacion_etiqueta, personalizacion_ejemplo,
--   personalizacion_max, personalizacion_pista }
-- p_variantes: [{ id | null, nombre, color, sku, stock, activa }] en orden.
-- Las variantes que no vienen no se borran (hay pedidos y cestas que las
-- nombran): para retirarlas se marcan como inactivas.
create function public.panel_guardar_producto(p_id uuid, p_producto jsonb, p_variantes jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id         uuid := p_id;
  v_categoria  uuid;
  v_estado     public.estado_producto := (p_producto ->> 'estado')::public.estado_producto;
  v_variante   record;
  v_materiales text[] := coalesce(array(select jsonb_array_elements_text(p_producto -> 'materiales')), '{}');
  v_contenido  text[] := case when jsonb_typeof(p_producto -> 'contenido') = 'array'
                              then array(select jsonb_array_elements_text(p_producto -> 'contenido')) end;
begin
  if not public.es_admin() then
    raise exception 'SOLO_ADMIN' using errcode = '42501';
  end if;
  if jsonb_typeof(p_variantes) is distinct from 'array' or jsonb_array_length(p_variantes) = 0 then
    raise exception 'SIN_VARIANTES';
  end if;

  select id into v_categoria from public.categorias where slug = p_producto ->> 'categoria';
  if v_categoria is null then
    raise exception 'CATEGORIA_NO_VALIDA';
  end if;

  if v_id is null then
    insert into public.productos (
      slug, nombre, categoria_id, tipo, estado, precio, antes, destacado, novedad, encargo, dias,
      etiqueta, corto, largo, historia, materiales, cuidados, medidas, contenido,
      personalizacion_etiqueta, personalizacion_ejemplo, personalizacion_max, personalizacion_pista,
      posicion, publicado_en
    ) values (
      p_producto ->> 'slug', p_producto ->> 'nombre', v_categoria,
      (p_producto ->> 'tipo')::public.tipo_producto, v_estado,
      (p_producto ->> 'precio')::integer, (p_producto ->> 'antes')::integer,
      coalesce((p_producto ->> 'destacado')::boolean, false), coalesce((p_producto ->> 'novedad')::boolean, false),
      coalesce((p_producto ->> 'encargo')::boolean, false), (p_producto ->> 'dias')::integer,
      p_producto ->> 'etiqueta', coalesce(p_producto ->> 'corto', ''), coalesce(p_producto ->> 'largo', ''),
      p_producto ->> 'historia', v_materiales, coalesce(p_producto ->> 'cuidados', ''),
      coalesce(p_producto ->> 'medidas', ''), v_contenido,
      p_producto ->> 'personalizacion_etiqueta', p_producto ->> 'personalizacion_ejemplo',
      (p_producto ->> 'personalizacion_max')::integer, p_producto ->> 'personalizacion_pista',
      coalesce((select max(posicion) + 1 from public.productos), 0),
      case when v_estado = 'publicado' then now() end
    )
    returning id into v_id;
  else
    update public.productos set
      slug = p_producto ->> 'slug',
      nombre = p_producto ->> 'nombre',
      categoria_id = v_categoria,
      tipo = (p_producto ->> 'tipo')::public.tipo_producto,
      estado = v_estado,
      precio = (p_producto ->> 'precio')::integer,
      antes = (p_producto ->> 'antes')::integer,
      destacado = coalesce((p_producto ->> 'destacado')::boolean, false),
      novedad = coalesce((p_producto ->> 'novedad')::boolean, false),
      encargo = coalesce((p_producto ->> 'encargo')::boolean, false),
      dias = (p_producto ->> 'dias')::integer,
      etiqueta = p_producto ->> 'etiqueta',
      corto = coalesce(p_producto ->> 'corto', ''),
      largo = coalesce(p_producto ->> 'largo', ''),
      historia = p_producto ->> 'historia',
      materiales = v_materiales,
      cuidados = coalesce(p_producto ->> 'cuidados', ''),
      medidas = coalesce(p_producto ->> 'medidas', ''),
      contenido = v_contenido,
      personalizacion_etiqueta = p_producto ->> 'personalizacion_etiqueta',
      personalizacion_ejemplo = p_producto ->> 'personalizacion_ejemplo',
      personalizacion_max = (p_producto ->> 'personalizacion_max')::integer,
      personalizacion_pista = p_producto ->> 'personalizacion_pista',
      publicado_en = case when v_estado = 'publicado' then coalesce(publicado_en, now()) else publicado_en end
    where id = v_id;
    if not found then
      raise exception 'PRODUCTO_NO_ENCONTRADO';
    end if;
  end if;

  for v_variante in
    select e.valor, (e.orden - 1)::integer as posicion
    from jsonb_array_elements(p_variantes) with ordinality as e(valor, orden)
  loop
    if v_variante.valor ->> 'id' is null then
      insert into public.variantes (producto_id, nombre, color, sku, stock, activa, posicion)
      values (
        v_id, v_variante.valor ->> 'nombre', v_variante.valor ->> 'color',
        nullif(v_variante.valor ->> 'sku', ''), (v_variante.valor ->> 'stock')::integer,
        coalesce((v_variante.valor ->> 'activa')::boolean, true), v_variante.posicion
      );
    else
      update public.variantes set
        nombre = v_variante.valor ->> 'nombre',
        color = v_variante.valor ->> 'color',
        sku = nullif(v_variante.valor ->> 'sku', ''),
        stock = (v_variante.valor ->> 'stock')::integer,
        activa = coalesce((v_variante.valor ->> 'activa')::boolean, true),
        posicion = v_variante.posicion
      where id = (v_variante.valor ->> 'id')::uuid and producto_id = v_id;
      if not found then
        raise exception 'VARIANTE_NO_ENCONTRADA';
      end if;
    end if;
  end loop;

  return v_id;
end;
$$;

revoke all on function public.panel_guardar_producto(uuid, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.panel_guardar_producto(uuid, jsonb, jsonb) to authenticated;
