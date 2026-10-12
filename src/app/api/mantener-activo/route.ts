import { configuracionSupabase } from '@/lib/datos/entorno';
import { mantenerActivo } from '@/lib/datos/mantener-activo';
import { clientePublico } from '@/lib/datos/supabase/publico';

// Siempre se ejecuta: una respuesta cacheada no tocaría la base de datos.
export const dynamic = 'force-dynamic';

// Lo llama el cron de vercel.json. Vercel envía CRON_SECRET en la cabecera
// Authorization; sin él la ruta no hace nada.
export async function GET(peticion: Request): Promise<Response> {
  const respuesta = await mantenerActivo(peticion.headers.get('authorization'), {
    secreto: process.env.CRON_SECRET,
    hayBaseDeDatos: configuracionSupabase() !== null,
    // Cliente anónimo y política pública de «categorias»: es la misma
    // lectura que hace la portada, sin saltarse RLS.
    consultar: async () => clientePublico().from('categorias').select('id').limit(1),
  });

  // Un fallo no se traga: queda en los registros de la función en Vercel.
  if (!respuesta.cuerpo.ok) console.error('[mantener-activo]', respuesta.estado, respuesta.cuerpo.error);

  return Response.json(respuesta.cuerpo, { status: respuesta.estado, headers: { 'Cache-Control': 'no-store' } });
}
