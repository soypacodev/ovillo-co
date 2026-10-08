-- ============================================================
--  Ovillo & Co. · Pruebas de panel_encargo() y
--  panel_guardar_producto(). Se ejecuta después de panel.sql y
--  reutiliza sus cuentas y su encargo real.
-- ============================================================

\set QUIET on
\o /dev/null
set client_min_messages = notice;

\set cliente_a '00000000-0000-4000-8000-00000000000a'
\set admin     '00000000-0000-4000-8000-0000000000ad'
\set demo      '00000000-0000-4000-8000-0000000000de'
\set encargo_real '00000000-0000-4000-8000-0000000000e1'

reset role;
update prueba.contador set aciertos = 0;

select id as encargo_demo from public.encargos where es_demo and estado = 'respondido' order by creado_en limit 1 \gset

-- Un producto mínimo que vale para crear y para editar.
\set producto '{"slug": "llavero-ballena", "nombre": "Llavero ballena", "categoria": "accesorios", "tipo": "simple", "estado": "borrador", "precio": 900, "antes": null, "encargo": false, "dias": null, "materiales": ["Algodón 100 %"], "contenido": null}'
\set variantes '[{"id": null, "nombre": "Azul", "color": "#4A63A8", "sku": "LLB-AZ", "stock": 3, "activa": true}, {"id": null, "nombre": "Gris", "color": "#B9BEC4", "sku": "", "stock": 0, "activa": true}]'

-- ------------------------------------------------------------
-- panel_encargo()
-- ------------------------------------------------------------
select prueba.como('anon');
select prueba.falla(format('select public.panel_encargo(%L)', :'encargo_real'), '42501', 'anon no puede abrir la ficha de un encargo');

select prueba.como('authenticated', :'cliente_a');
select prueba.falla(format('select public.panel_encargo(%L)', :'encargo_real'), '42501', 'un cliente no puede abrir la ficha de un encargo');

select prueba.como('authenticated', :'demo');
select prueba.ok(
  (public.panel_encargo(:'encargo_real') ->> 'descripcion') = 'Oculto en la cuenta de demostración.'
  and public.panel_encargo(:'encargo_real') -> 'fotos' = '[]'::jsonb
  and public.panel_encargo(:'encargo_real') ->> 'nota_admin' is null
  and (public.panel_encargo(:'encargo_real') ->> 'email') like '%•••%',
  'demo ve la ficha de un encargo real enmascarada, sin fotos ni nota');
select prueba.ok(
  (public.panel_encargo(:'encargo_demo') ->> 'nota_admin') is not null
  and (public.panel_encargo(:'encargo_demo') ->> 'email') like '%@ejemplo.com',
  'demo ve entera la ficha de un encargo ficticio');
select prueba.ok(public.panel_encargo('00000000-0000-4000-8000-000000000999') is null, 'un encargo que no existe da null');

select prueba.como('authenticated', :'admin');
select prueba.ok(
  jsonb_array_length(public.panel_encargo(:'encargo_real') -> 'fotos') = 2
  and (public.panel_encargo(:'encargo_real') ->> 'descripcion') like 'Una gata%',
  'admin ve la ficha de un encargo real con sus fotos');

-- ------------------------------------------------------------
-- panel_guardar_producto()
-- ------------------------------------------------------------
select prueba.como('anon');
select prueba.falla(format('select public.panel_guardar_producto(null, %L, %L)', :'producto', :'variantes'),
  '42501', 'anon no puede guardar productos');

select prueba.como('authenticated', :'cliente_a');
select prueba.falla(format('select public.panel_guardar_producto(null, %L, %L)', :'producto', :'variantes'),
  '42501', 'un cliente no puede guardar productos');

select prueba.como('authenticated', :'demo');
select prueba.falla(format('select public.panel_guardar_producto(null, %L, %L)', :'producto', :'variantes'),
  '42501', 'demo no puede guardar productos');

select prueba.como('authenticated', :'admin');
select public.panel_guardar_producto(null, :'producto', :'variantes') as nuevo \gset
select prueba.ok(
  (select count(*) from public.variantes where producto_id = :'nuevo') = 2
  and (select string_agg(nombre, ',' order by posicion) from public.variantes where producto_id = :'nuevo') = 'Azul,Gris'
  and (select sku from public.variantes where producto_id = :'nuevo' and nombre = 'Gris') is null,
  'admin crea un producto con sus variantes en orden');
select prueba.ok(
  (select estado = 'borrador' and publicado_en is null and materiales = '{"Algodón 100 %"}' from public.productos where id = :'nuevo'),
  'el producto nace oculto, sin fecha de publicación');

select id as azul from public.variantes where producto_id = :'nuevo' and nombre = 'Azul' \gset
select public.panel_guardar_producto(
  :'nuevo',
  (:'producto'::jsonb || '{"estado": "publicado", "precio": 800, "antes": 900}')::jsonb,
  format('[{"id": null, "nombre": "Rosa", "color": "#EFA3B4", "sku": "", "stock": 2, "activa": true},
           {"id": "%s", "nombre": "Azul marino", "color": "#1C4869", "sku": "LLB-AZ", "stock": 5, "activa": true}]', :'azul')::jsonb
) \gset
select prueba.ok(
  (select stock = 5 and nombre = 'Azul marino' and posicion = 1 from public.variantes where id = :'azul')
  and (select count(*) from public.variantes where producto_id = :'nuevo') = 3,
  'editar cambia las variantes que vienen, añade las nuevas y no borra las que faltan');
select prueba.ok(
  (select estado = 'publicado' and publicado_en is not null and antes = 900 from public.productos where id = :'nuevo'),
  'publicar sella la fecha de publicación');
select prueba.falla(
  format('select public.panel_guardar_producto(%L, %L, %L)', :'nuevo', (:'producto'::jsonb || '{"antes": 500}')::text, :'variantes'),
  '23514', 'el precio anterior tiene que ser mayor que el actual');
select prueba.falla(
  format('select public.panel_guardar_producto(null, %L, %L)', (:'producto'::jsonb || '{"categoria": "zapatos", "slug": "otro"}')::text, :'variantes'),
  'CATEGORIA_NO_VALIDA', 'una categoría que no existe se rechaza');
select prueba.falla(
  format('select public.panel_guardar_producto(null, %L, %L)', (:'producto'::jsonb || '{"slug": "otro-mas"}')::text, '[]'),
  'SIN_VARIANTES', 'un producto sin variantes se rechaza');
select prueba.falla(
  format('select public.panel_guardar_producto(%L, %L, %L)', :'nuevo', :'producto',
    '[{"id": "00000000-0000-4000-8000-000000000999", "nombre": "X", "color": "#000000", "stock": 1}]'),
  'VARIANTE_NO_ENCONTRADA', 'no se puede editar una variante de otro producto');

reset role;
delete from public.productos where id = :'nuevo';

\o
select format('%s comprobaciones de escritura del panel superadas.', aciertos) as resultado from prueba.contador \gset
\echo :resultado
