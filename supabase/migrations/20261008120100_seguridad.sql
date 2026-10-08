-- ============================================================
--  Ovillo & Co. · Seguridad: permisos y RLS
--
--  La clave anónima viaja en el navegador y cualquiera puede leerla,
--  así que toda la protección vive aquí y no en el front:
--    · catálogo publicado → lo lee todo el mundo
--    · perfil, direcciones, favoritos y pedidos → solo su dueño
--    · escribir catálogo y cambiar estados de pedido → solo admin
--    · pedidos, stock y precios cobrados → solo el servidor
--      (rol de servicio) mediante las funciones de la migración 3
-- ============================================================

-- ------------------------------------------------------------
-- 1. ¿Quién es admin?
-- ------------------------------------------------------------
-- security definer evita la recursión de RLS al consultar perfiles
-- desde una política de perfiles.
create function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfiles
    where id = auth.uid() and rol = 'admin'
  );
$$;

revoke all on function public.es_admin() from public;
grant execute on function public.es_admin() to anon, authenticated, service_role;

-- ------------------------------------------------------------
-- 2. Permisos de tabla
-- ------------------------------------------------------------
-- Supabase concede por defecto todos los privilegios a anon y
-- authenticated y deja el filtrado a RLS. Recortamos además lo que
-- RLS no cubre (TRUNCATE) y lo que nunca debe hacerse desde fuera.

revoke truncate, references, trigger on all tables in schema public from anon, authenticated;

-- El catálogo solo lo escribe admin, que siempre es authenticated.
revoke insert, update, delete on
  public.categorias, public.productos, public.variantes, public.fotos_producto,
  public.promociones, public.metodos_envio
from anon;

-- Anon no tiene nada propio que guardar.
revoke all on public.perfiles, public.direcciones, public.favoritos from anon;

-- Perfiles: nacen con la cuenta y nadie se cambia el rol desde la API.
-- El ascenso a admin se hace a mano desde el panel de Supabase.
revoke insert, update, delete on public.perfiles from authenticated;
grant update (nombre, telefono, acepta_boletin) on public.perfiles to authenticated;

-- Pedidos: nadie los crea ni los borra desde fuera. Admin solo toca
-- el estado y los datos de envío, nunca los importes.
revoke all on public.pedidos, public.lineas_pedido, public.eventos_pedido from anon;
revoke insert, update, delete on public.pedidos, public.lineas_pedido, public.eventos_pedido
  from authenticated;
grant update (estado, transportista, numero_seguimiento, nota_admin)
  on public.pedidos to authenticated;

revoke all on public.eventos_stripe from anon, authenticated;
revoke all on sequence public.numero_pedido_seq from anon, authenticated;

-- Encargos: cualquiera envía el formulario, pero solo con estos campos.
revoke insert, update, delete on public.encargos from anon, authenticated;
grant insert (usuario_id, tipo, descripcion, fecha_deseada, presupuesto, colores,
              nombre, email, instagram, acepta_privacidad)
  on public.encargos to anon, authenticated;
grant update (estado, nota_admin) on public.encargos to authenticated;
revoke select on public.encargos from anon;

-- Boletín y avisos de stock solo por función, para no revelar si un
-- correo ya estaba apuntado.
revoke all on public.suscripciones_boletin, public.avisos_stock from anon;
revoke insert, update on public.suscripciones_boletin, public.avisos_stock from authenticated;
grant update (baja_en) on public.suscripciones_boletin to authenticated;
grant update (avisado_en) on public.avisos_stock to authenticated;

-- ------------------------------------------------------------
-- 3. RLS en todas las tablas
-- ------------------------------------------------------------
alter table public.perfiles              enable row level security;
alter table public.direcciones           enable row level security;
alter table public.categorias            enable row level security;
alter table public.productos             enable row level security;
alter table public.variantes             enable row level security;
alter table public.fotos_producto        enable row level security;
alter table public.favoritos             enable row level security;
alter table public.promociones           enable row level security;
alter table public.metodos_envio         enable row level security;
alter table public.pedidos               enable row level security;
alter table public.lineas_pedido         enable row level security;
alter table public.eventos_pedido        enable row level security;
alter table public.eventos_stripe        enable row level security;
alter table public.encargos              enable row level security;
alter table public.suscripciones_boletin enable row level security;
alter table public.avisos_stock          enable row level security;

-- ------------------------------------------------------------
-- 4. Perfiles y direcciones
-- ------------------------------------------------------------

create policy "perfiles: el propio o admin"
  on public.perfiles for select to authenticated
  using (id = (select auth.uid()) or (select public.es_admin()));

create policy "perfiles: editar el propio"
  on public.perfiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "perfiles: admin edita"
  on public.perfiles for update to authenticated
  using ((select public.es_admin()))
  with check ((select public.es_admin()));

create policy "direcciones: las propias"
  on public.direcciones for all to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

create policy "direcciones: admin lee"
  on public.direcciones for select to authenticated
  using ((select public.es_admin()));

-- ------------------------------------------------------------
-- 5. Catálogo: lectura pública, escritura de admin
-- ------------------------------------------------------------

create policy "categorías: visibles"
  on public.categorias for select to anon, authenticated
  using (visible or (select public.es_admin()));

create policy "categorías: admin gestiona"
  on public.categorias for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

create policy "productos: publicados"
  on public.productos for select to anon, authenticated
  using (estado = 'publicado' or (select public.es_admin()));

create policy "productos: admin gestiona"
  on public.productos for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

create policy "variantes: de productos publicados"
  on public.variantes for select to anon, authenticated
  using (
    (select public.es_admin()) or (
      activa and exists (
        select 1 from public.productos p
        where p.id = producto_id and p.estado = 'publicado'
      )
    )
  );

create policy "variantes: admin gestiona"
  on public.variantes for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

create policy "fotos: de productos publicados"
  on public.fotos_producto for select to anon, authenticated
  using (
    (select public.es_admin()) or exists (
      select 1 from public.productos p
      where p.id = producto_id and p.estado = 'publicado'
    )
  );

create policy "fotos: admin gestiona"
  on public.fotos_producto for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

create policy "envíos: activos"
  on public.metodos_envio for select to anon, authenticated
  using (activo or (select public.es_admin()));

create policy "envíos: admin gestiona"
  on public.metodos_envio for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

create policy "favoritos: los propios"
  on public.favoritos for all to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

-- ------------------------------------------------------------
-- 6. Promociones
-- ------------------------------------------------------------
-- Solo se listan las automáticas. Los cupones se comprueban de uno en
-- uno con buscar_cupon(): así nadie puede leer la tabla y sacarlos todos.

create policy "promociones: automáticas vigentes"
  on public.promociones for select to anon, authenticated
  using (
    (select public.es_admin())
    or (codigo is null and public.promocion_vigente(promociones))
  );

create policy "promociones: admin gestiona"
  on public.promociones for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

-- ------------------------------------------------------------
-- 7. Pedidos: se leen, no se escriben desde el navegador
-- ------------------------------------------------------------

create policy "pedidos: los propios o admin"
  on public.pedidos for select to authenticated
  using (usuario_id = (select auth.uid()) or (select public.es_admin()));

create policy "pedidos: admin cambia el estado"
  on public.pedidos for update to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

create policy "líneas: de pedidos propios o admin"
  on public.lineas_pedido for select to authenticated
  using (exists (
    select 1 from public.pedidos o
    where o.id = pedido_id
      and (o.usuario_id = (select auth.uid()) or (select public.es_admin()))
  ));

create policy "eventos: de pedidos propios o admin"
  on public.eventos_pedido for select to authenticated
  using (
    (select public.es_admin()) or (
      publico and exists (
        select 1 from public.pedidos o
        where o.id = pedido_id and o.usuario_id = (select auth.uid())
      )
    )
  );

-- eventos_stripe no tiene políticas: solo lo usa el rol de servicio.

-- ------------------------------------------------------------
-- 8. Formularios
-- ------------------------------------------------------------

create policy "encargos: cualquiera envía"
  on public.encargos for insert to anon, authenticated
  with check (usuario_id is null or usuario_id = (select auth.uid()));

create policy "encargos: los propios o admin"
  on public.encargos for select to authenticated
  using (usuario_id = (select auth.uid()) or (select public.es_admin()));

create policy "encargos: admin gestiona"
  on public.encargos for update to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

create policy "boletín: admin"
  on public.suscripciones_boletin for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

create policy "avisos de stock: admin"
  on public.avisos_stock for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));
