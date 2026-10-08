-- Una compra de la última guirnalda rosa. scripts/probar-bd.sh lanza
-- varias a la vez para comprobar que solo una se la lleva.
-- Variables de psql: sesion (identificador único de cada intento).

set role service_role;
select public.registrar_pedido_pagado(
  'evt_' || :'sesion', 'cs_test_' || :'sesion', 'pi_test_' || :'sesion', 2795,
  'carrera@ovilloandco.example',
  '[{"producto":"guirnalda-corazones","variante":"Rosa","cantidad":1}]'
);
