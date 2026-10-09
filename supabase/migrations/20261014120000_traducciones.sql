-- ============================================================
-- Ovillo & Co. · Catálogo en varios idiomas
-- ============================================================
-- Los textos del catálogo siguen en español en sus columnas de siempre.
-- Las traducciones van al lado, en un jsonb por idioma:
--
--   { "en": { "nombre": "Crochet teddy bear", "corto": "…" }, "fr": {…} }
--
-- Lo que falte en un idioma sale en español. Los slugs, los nombres de
-- variante y los importes no se traducen: son los que usan la cesta,
-- Stripe y los pedidos. Los pedidos guardan los nombres en español.

alter table public.categorias    add column traducciones jsonb not null default '{}'::jsonb;
alter table public.productos     add column traducciones jsonb not null default '{}'::jsonb;
alter table public.promociones   add column traducciones jsonb not null default '{}'::jsonb;
alter table public.metodos_envio add column traducciones jsonb not null default '{}'::jsonb;

alter table public.categorias    add constraint categorias_traducciones_objeto    check (jsonb_typeof(traducciones) = 'object');
alter table public.productos     add constraint productos_traducciones_objeto     check (jsonb_typeof(traducciones) = 'object');
alter table public.promociones   add constraint promociones_traducciones_objeto   check (jsonb_typeof(traducciones) = 'object');
alter table public.metodos_envio add constraint metodos_envio_traducciones_objeto check (jsonb_typeof(traducciones) = 'object');

-- El cupón también enseña su nombre traducido en la cesta. Cambia lo que
-- devuelve la función, así que hay que borrarla y crearla de nuevo.
drop function public.buscar_cupon(text);

create function public.buscar_cupon(p_codigo text)
returns table (
  nombre       text,
  tipo         public.tipo_promocion,
  valor        integer,
  codigo       text,
  minimo       integer,
  categoria    text,
  hasta        date,
  traducciones jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select pr.nombre, pr.tipo, pr.valor, pr.codigo, pr.minimo, c.slug, pr.hasta, pr.traducciones
  from public.promociones pr
  left join public.categorias c on c.id = pr.categoria_id
  where pr.codigo = upper(btrim(p_codigo))
    and public.promocion_vigente(pr)
  limit 1;
$$;

revoke all on function public.buscar_cupon(text) from public;
grant execute on function public.buscar_cupon(text) to anon, authenticated, service_role;
