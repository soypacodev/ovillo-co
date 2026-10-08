-- ============================================================
--  Ovillo & Co. · Fotos en Supabase Storage
--
--  Bucket público «productos»: las fotos se sirven por URL pública
--  sin pasar por RLS, así que no hace falta política de lectura (y
--  sin ella nadie puede listar el bucket). Solo admin sube, cambia o
--  borra ficheros.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'productos',
  'productos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "productos: admin lee"
  on storage.objects for select to authenticated
  using (bucket_id = 'productos' and (select public.es_admin()));

create policy "productos: admin sube"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'productos' and (select public.es_admin()));

create policy "productos: admin cambia"
  on storage.objects for update to authenticated
  using (bucket_id = 'productos' and (select public.es_admin()))
  with check (bucket_id = 'productos' and (select public.es_admin()));

create policy "productos: admin borra"
  on storage.objects for delete to authenticated
  using (bucket_id = 'productos' and (select public.es_admin()));
