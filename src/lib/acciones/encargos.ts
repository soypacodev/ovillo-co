'use server';

import { headers } from 'next/headers';
import { textos } from '@/lib/i18n';
import { idiomaActual } from '@/lib/i18n/servidor';
import { usuarioActual } from '@/lib/cuentas/sesion';
import { configuracionSupabase } from '@/lib/datos/entorno';
import { clienteServicio } from '@/lib/datos/supabase/servicio';
import {
  TIPOS_ENCARGO,
  avisoRevisar,
  erroresPorCampo,
  esquemaEncargo,
  formularioAObjeto,
  valoresDeTexto,
  type CampoEncargo,
  type DatosEncargo,
} from './esquemas';
import { EXTENSION_IMAGEN, tipoDeImagen } from './fotos';
import { sinMetadatos } from './metadatos-imagen';
import { esRobot } from './formulario';
import { crearLimitador, origenPeticion } from './limite';
import type { EstadoFormulario } from './tipos';

export type EstadoEncargo = EstadoFormulario<CampoEncargo>;

const T = textos(
  {
    muchos: 'Nos han llegado varios encargos seguidos desde tu conexión. Espera unos minutos y vuelve a probar.',
    fallo: 'No hemos podido guardar tu encargo por un problema nuestro. Vuelve a intentarlo en un momento.',
  },
  {
    en: {
      muchos: 'We’ve had several custom orders in a row from your connection. Please wait a few minutes and try again.',
      fallo: 'We couldn’t save your custom order because of a problem on our side. Please try again in a moment.',
    },
    fr: {
      muchos: 'Nous avons reçu plusieurs commandes sur mesure d’affilée depuis votre connexion. Patientez quelques minutes et réessayez.',
      fallo: 'Nous n’avons pas pu enregistrer votre commande sur mesure à cause d’un problème de notre côté. Réessayez dans un instant.',
    },
    de: {
      muchos: 'Von Ihrer Verbindung kamen mehrere Anfragen für Auftragsarbeiten kurz hintereinander. Bitte warten Sie ein paar Minuten und versuchen Sie es erneut.',
      fallo: 'Ihre Anfrage für eine Auftragsarbeit konnte wegen eines Problems bei uns nicht gespeichert werden. Bitte versuchen Sie es gleich noch einmal.',
    },
  },
);

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
    // Al taller le basta la foto: no necesita saber dónde ni con qué móvil se hizo.
    const limpia = tipo && sinMetadatos(bytes, tipo);
    if (!tipo || !limpia) continue;
    const ruta = `${id}/${i + 1}.${EXTENSION_IMAGEN[tipo]}`;
    const { error } = await bd.storage.from('encargos').upload(ruta, limpia, { contentType: tipo, upsert: false });
    if (error) {
      console.error('No se ha podido subir una foto de encargo:', error.message);
      await borrarFotos(subidas.map((f) => f.ruta));
      return false;
    }
    subidas.push({ ruta, tipo_mime: tipo, bytes: limpia.byteLength });
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

/**
 * Acción del formulario de encargos: descarta robots, valida datos y
 * fotos, aplica el límite de envíos y registra el encargo. Sin base de
 * datos responde como enviado, con `guardado: false`.
 */
export async function enviarEncargo(_previo: EstadoEncargo, formulario: FormData): Promise<EstadoEncargo> {
  const crudo = formularioAObjeto(formulario, ['fotos']);

  // Si el campo trampa trae algo, respondemos como si nada para no dar
  // pistas al robot, pero no se guarda.
  if (esRobot(formulario)) return { estado: 'enviado', guardado: false };

  const idioma = await idiomaActual();
  const t = T[idioma];
  const valores = valoresDeTexto<CampoEncargo>(crudo);
  const resultado = await esquemaEncargo(idioma).safeParseAsync(crudo);
  if (!resultado.success) {
    const errores = erroresPorCampo<CampoEncargo>(resultado.error);
    return {
      estado: 'error',
      mensaje: avisoRevisar(Object.keys(errores).length, idioma),
      errores,
      valores,
    };
  }

  if (!limitador.permitir(origenPeticion(await headers()))) {
    return {
      estado: 'error',
      mensaje: t.muchos,
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
      mensaje: t.fallo,
      errores: {},
      valores,
    };
  }
  return { estado: 'enviado', guardado: true };
}
