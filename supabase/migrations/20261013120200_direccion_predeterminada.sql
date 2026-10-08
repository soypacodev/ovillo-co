-- ============================================================
--  Ovillo & Co. · Dirección predeterminada en un solo paso
--
--  Cambiar la dirección predeterminada son dos escrituras (quitar la
--  anterior y marcar la nueva). Hechas desde la aplicación, un fallo
--  entre las dos dejaba la cuenta sin ninguna, y dos peticiones a la vez
--  podían chocar con el índice único. Aquí van en una transacción y
--  bloqueando el perfil, así que o cambian las dos o ninguna.
--
--  Es security invoker: corre con la sesión de quien llama y RLS sigue
--  limitando cada fila a su dueño. Devuelve false si la dirección no es
--  de quien llama (o ya no existe) y entonces no toca nada.
-- ============================================================

create function public.marcar_direccion_predeterminada(p_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_usuario uuid := auth.uid();
begin
  if v_usuario is null then
    raise exception 'SIN_SESION' using errcode = '42501';
  end if;

  -- Serializa los cambios de la misma cuenta.
  perform 1 from public.perfiles where id = v_usuario for update;

  if not exists (select 1 from public.direcciones where id = p_id and usuario_id = v_usuario) then
    return false;
  end if;

  -- Primero se quita la anterior: el índice único se comprueba fila a fila.
  update public.direcciones set predeterminada = false
  where usuario_id = v_usuario and predeterminada and id <> p_id;

  update public.direcciones set predeterminada = true
  where id = p_id and usuario_id = v_usuario;

  return true;
end;
$$;

revoke all on function public.marcar_direccion_predeterminada(uuid) from public, anon, authenticated;
grant execute on function public.marcar_direccion_predeterminada(uuid) to authenticated;
