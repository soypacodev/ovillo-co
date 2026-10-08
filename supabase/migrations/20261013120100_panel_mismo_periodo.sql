-- ============================================================
--  Ovillo & Co. · Resumen del panel comparable y stock real
--
--  El resumen compara las ventas del mes en curso con el mismo tramo del
--  mes anterior (del día 1 a la misma fecha y hora), no con el mes
--  pasado entero, que a principios de mes siempre parece una caída.
--
--  Lo que se teje por encargo no tiene «stock bajo»: su número es el
--  cupo de encargos, no piezas hechas que haya que reponer.
-- ============================================================

drop function public.panel_resumen();

create function public.panel_resumen()
returns table (
  ventas_mes               integer,
  pedidos_mes              integer,
  ticket_medio_mes         integer,
  ventas_periodo_anterior  integer,
  pedidos_pendientes       integer,
  encargos_nuevos          integer,
  mensajes_nuevos          integer,
  variantes_stock_bajo     integer,
  suscriptores             integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  -- Todo en hora de Madrid: «hoy a las 10:00» es lo mismo en los dos meses.
  v_ahora_local  timestamp   := now() at time zone 'Europe/Madrid';
  v_mes_local    timestamp   := date_trunc('month', v_ahora_local);
  v_mes          timestamptz := v_mes_local at time zone 'Europe/Madrid';
  v_anterior     timestamptz := (v_mes_local - interval '1 month') at time zone 'Europe/Madrid';
  -- El 31 de marzo se compara con febrero entero: el tramo no pasa del mes.
  v_fin_anterior timestamptz := least(
    (v_mes_local - interval '1 month' + (v_ahora_local - v_mes_local)) at time zone 'Europe/Madrid',
    v_mes
  );
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
    coalesce((select sum(total) from vendidos where creado_en >= v_anterior and creado_en < v_fin_anterior), 0)::integer,
    (select count(*) from public.pedidos where estado in ('pagado', 'en_preparacion'))::integer,
    (select count(*) from public.encargos where estado = 'nuevo')::integer,
    (select count(*) from public.mensajes_contacto where estado = 'nuevo')::integer,
    (select count(*) from public.variantes v join public.productos p on p.id = v.producto_id
      where p.estado = 'publicado' and not p.encargo and v.activa and v.stock <= 1)::integer,
    (select count(*) from public.suscripciones_boletin where baja_en is null)::integer;
end;
$$;

create or replace function public.panel_stock_bajo(p_umbral integer default 1)
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
  where p.estado = 'publicado' and not p.encargo and v.activa
    and v.stock <= greatest(coalesce(p_umbral, 1), 0)
  order by v.stock, p.nombre, v.posicion;
end;
$$;

revoke all on function public.panel_resumen() from public, anon, authenticated;
grant execute on function public.panel_resumen() to authenticated;
revoke all on function public.panel_stock_bajo(integer) from public, anon, authenticated;
grant execute on function public.panel_stock_bajo(integer) to authenticated;
