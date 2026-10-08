-- ============================================================
--  Ovillo & Co. · Rol de solo lectura para la demostración
--
--  Va en su propia migración porque un valor nuevo de un enum no se
--  puede usar en la misma transacción que lo crea.
-- ============================================================

alter type public.rol_usuario add value if not exists 'demo';
