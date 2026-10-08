-- ============================================================
--  Ovillo & Co. · Encargos: solo los registra el servidor
--
--  Los encargos entran por registrar_encargo(), que solo puede llamar
--  el rol de servicio después de pasar el límite de envíos, el campo
--  trampa y la comprobación de las fotos. Si anon y authenticated
--  pudieran insertar en la tabla, cualquiera se saltaría todo eso
--  llamando directamente a la API con la clave pública.
-- ============================================================

drop policy "encargos: cualquiera envía" on public.encargos;

revoke insert on public.encargos from anon, authenticated;
