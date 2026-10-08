'use server';

import { headers } from 'next/headers';
import { usuarioActual } from '@/lib/cuentas/sesion';
import { configuracionSupabase } from '@/lib/datos/entorno';
import { clienteServicio } from '@/lib/datos/supabase/servicio';
import {
  TIPOS_ENCARGO,
  erroresPorCampo,
  esquemaEncargo,
  formularioAObjeto,
  valoresDeTexto,
  type CampoEncargo,
  type DatosEncargo,
} from './esquemas';
import { EXTENSION_IMAGEN, tipoDeImagen } from './fotos';
import { esRobot } from './formulario';
import { crearLimitador, origenPeticion } from './limite';
import type { EstadoFormulario } from './tipos';

export type EstadoEncargo = EstadoFormulario<CampoEncargo>;

const limitador = crearLimitador({ maximo: 5, ventana: 10 * 60 * 1000 });

/**
 * El servidor elige el id del encargo, sube las fotos al bucket privado
 * «encargos» en su carpeta (<id>/1.jpg…) y registra todo de una vez con
 * registrar_encargo(), que solo acepta el rol de servicio. Si el registro
 * falla, se borran las fotos recién subidas para no dejar huérfanas.
 */
async function guardar(datos: DatosEncargo): Promise<boolean> {
  const usuario = await usuarioActual();
  const bd = clienteServicio();
  const id = crypto.randomUUID();
  const subidas: { ruta: string; tipo_mime: string; bytes: number }[] = [];

  for (const [i, foto] of datos.fotos.entries()) {
    const bytes = new Uint8Array(await foto.arrayBuffer());
    // El tipo que vale es el de los primeros bytes, no el que dice el navegador.
    const tipo = tipoDeImagen(bytes);
    if (!tipo) continue;
    const ruta = `${id}/${i + 1}.${EXTENSION_IMAGEN[tipo]}`;
    const { error } = await bd.storage.from('encargos').upload(ruta, bytes, { contentType: tipo, upsert: false });
    if (error) {
      console.error('No se ha podido subir una foto de encargo:', error.message);
      await borrarFotos(subidas.map((f) => f.ruta));
      return false;
    }
    subidas.push({ ruta, tipo_mime: tipo, bytes: bytes.byteLength });
  }

  const { error } = await bd.rpc('registrar_encargo', {
    p_id: id,
    p_tipo: TIPOS_ENCARGO[datos.tipo],
    p_descripcion: datos.descripcion,
    p_nombre: datos.nombre,
    p_email: datos.correo,
    p_acepta: datos.acepta,
    p_fecha: datos.fecha || null,
    p_presupuesto: datos.presupuesto || null,
    p_colores: datos.colores || null,
    p_instagram: datos.instagram || null,
    p_usuario: usuario?.id ?? null,
    p_fotos: subidas,
  });
  if (error) {
    console.error('No se ha podido guardar un encargo:', error.code, error.message);
    await borrarFotos(subidas.map((f) => f.ruta));
    return false;
  }
  return true;
}

async function borrarFotos(rutas: string[]): Promise<void> {
  if (!rutas.length) return;
  const { error } = await clienteServicio().storage.from('encargos').remove(rutas);
  if (error) console.error('Quedan fotos de encargo sin borrar:', rutas.join(', '), error.message);
}

export async function enviarEncargo(_previo: EstadoEncargo, formulario: FormData): Promise<EstadoEncargo> {
  const crudo = formularioAObjeto(formulario, ['fotos']);

  // Si el campo trampa trae algo, respondemos como si nada para no dar
  // pistas al robot, pero no se guarda.
  if (esRobot(formulario)) return { estado: 'enviado', guardado: false };

  const valores = valoresDeTexto<CampoEncargo>(crudo);
  const resultado = await esquemaEncargo.safeParseAsync(crudo);
  if (!resultado.success) {
    const errores = erroresPorCampo<CampoEncargo>(resultado.error);
    const n = Object.keys(errores).length;
    return {
      estado: 'error',
      mensaje: n === 1 ? 'Hay un campo que revisar.' : `Hay ${n} campos que revisar.`,
      errores,
      valores,
    };
  }

  if (!limitador.permitir(origenPeticion(await headers()))) {
    return {
      estado: 'error',
      mensaje: 'Nos han llegado varios encargos seguidos desde tu conexión. Espera unos minutos y vuelve a probar.',
      errores: {},
      valores,
    };
  }

  // Sin base de datos el encargo y sus fotos se validan, pero no se guardan.
  if (!configuracionSupabase()) return { estado: 'enviado', guardado: false };

  const guardado = await guardar(resultado.data).catch((e: unknown) => {
    console.error('No se ha podido guardar un encargo:', e instanceof Error ? e.message : e);
    return false;
  });
  if (!guardado) {
    return {
      estado: 'error',
      mensaje: 'No hemos podido guardar tu encargo por un problema nuestro. Vuelve a intentarlo en un momento.',
      errores: {},
      valores,
    };
  }
  return { estado: 'enviado', guardado: true };
}
