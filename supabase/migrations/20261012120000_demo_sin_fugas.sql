-- ============================================================
--  Ovillo & Co. · Lo que la cuenta de demostración no debe ver ni tocar
--
--  · panel_pedido(): en los pedidos reales, demo tampoco ve la nota
--    interna del taller ni el número de seguimiento.
--  · La cuenta demo la comparte todo el que pulsa el botón público:
--    nadie le cambia la contraseña ni el correo desde Supabase Auth,
--    que escribe en auth.users sin pasar por RLS.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Ficha del pedido
-- ------------------------------------------------------------
-- Ficha completa: pedido, líneas y seguimiento. null si no existe. Misma
-- firma y mismo tipo de retorno que antes, así que conserva los permisos.
create or replace function public.panel_pedido(p_id uuid)
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
    -- La nota interna suele llevar datos de contacto de la clienta.
    'nota_admin', case when v_ver then o.nota_admin end,
    'subtotal', o.subtotal,
    'descuento_automatico', o.descuento_automatico,
    'descuento_cupon', o.descuento_cupon,
    'envio', o.envio,
    'total', o.total,
    'codigo_cupon', o.codigo_cupon,
    'metodo_envio_nombre', o.metodo_envio_nombre,
    'dias_confeccion', o.dias_confeccion,
    'transportista', o.transportista,
    -- Con el número, la web de Correos dice dónde y cuándo se entregó.
    'numero_seguimiento', case when v_ver then o.numero_seguimiento end,
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

-- ------------------------------------------------------------
-- 2. Credenciales fijas para demo
-- ------------------------------------------------------------
-- El cambio se deshace en silencio en lugar de dar error: así Auth no
-- deja la fila a medias y quien lo intenta no saca nada en claro. Para
-- renovar la contraseña, el dueño pasa antes la cuenta a «cliente» con
-- asignar_rol(), la cambia y la vuelve a nombrar «demo».
create function public.fijar_credenciales_demo()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.perfiles where id = old.id and rol = 'demo') then
    new.encrypted_password := old.encrypted_password;
    new.email := old.email;
    new.email_change := old.email_change;
  end if;
  return new;
end;
$$;

revoke all on function public.fijar_credenciales_demo() from public, anon, authenticated;

create trigger fijar_credenciales_demo
  before update on auth.users
  for each row
  when (
    old.encrypted_password is distinct from new.encrypted_password
    or old.email is distinct from new.email
    or old.email_change is distinct from new.email_change
  )
  execute function public.fijar_credenciales_demo();
