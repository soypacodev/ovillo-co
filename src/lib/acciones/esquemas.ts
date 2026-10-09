// Esquemas de los formularios públicos. Se usan en el servidor, que es
// donde se decide si un envío vale: lo que valide el navegador es solo
// una ayuda para no hacer esperar a nadie.

import { z } from 'zod';
import { textos, type Idioma } from '@/lib/i18n';
import { correo, texto } from '@/lib/validacion';
import { tipoDeImagen, type TipoImagen } from './fotos';
import {
  CAMPO_TRAMPA,
  LIMITES_FOTOS,
  MOTIVOS_CONTACTO,
  PRESUPUESTOS,
  TIPOS_ENCARGO,
  megas,
  type MotivoContacto,
  type TipoEncargo,
} from './opciones';

export { LIMITES_FOTOS, MOTIVOS_CONTACTO, TIPOS_ENCARGO };

/* ------------------------------------------------------------------
   Mensajes
   ------------------------------------------------------------------ */

const T = textos(
  {
    nombreFalta: '¿Cómo te llamas?',
    nombreLargo: 'El nombre es demasiado largo (máximo 120 caracteres).',
    correoFalta: 'Necesitamos tu correo para contestarte.',
    consentimiento: 'Sin tu permiso no podemos guardar tus datos para contestarte.',
    fotoPesada: (tope: string) => `Cada foto puede pesar como mucho ${tope}.`,
    fotoTipo: 'Solo admitimos fotos JPG, PNG o WebP.',
    fotoFalsa: 'Una de las fotos no es una imagen válida.',
    fotosMinimo: 'Elige al menos una foto.',
    fotosMaximo: (n: number) => `Puedes mandar hasta ${n} fotos.`,
    fotosTotal: (tope: string) => `Entre todas, las fotos no pueden pasar de ${tope}.`,
    tipo: 'Dinos al menos de qué tipo es.',
    descripcionCorta: 'Cuéntanos un poco más: con menos de 20 caracteres no podemos calcular nada.',
    descripcionLarga: 'Es muy largo: resúmelo en 4000 caracteres como mucho.',
    fecha: 'Escribe la fecha en menos de 80 caracteres.',
    presupuesto: 'Elige uno de los presupuestos de la lista.',
    colores: 'Los colores, en menos de 200 caracteres.',
    instagram: 'Escribe solo el usuario de Instagram, por ejemplo @tuusuario.',
    motivo: 'Dinos de qué va, aunque sea por encima.',
    pedido: 'El número de pedido tiene esta forma: OV-2026-1042.',
    mensajeCorto: 'Escríbenos algo más, aunque sea corto (10 caracteres como mínimo).',
    mensajeLargo: 'Es muy largo: resúmelo en 3000 caracteres como mucho.',
    revisar: (n: number) => (n === 1 ? 'Hay un campo que revisar.' : `Hay ${n} campos que revisar.`),
  },
  {
    en: {
      nombreFalta: 'What’s your name?',
      nombreLargo: 'That name is too long (120 characters at most).',
      correoFalta: 'We need your email address to reply.',
      consentimiento: 'Without your permission we can’t keep your details to reply to you.',
      fotoPesada: (tope: string) => `Each photo can be ${tope} at most.`,
      fotoTipo: 'We only accept JPG, PNG or WebP photos.',
      fotoFalsa: 'One of the photos isn’t a valid image.',
      fotosMinimo: 'Choose at least one photo.',
      fotosMaximo: (n: number) => `You can send up to ${n} photos.`,
      fotosTotal: (tope: string) => `Together, the photos can’t be more than ${tope}.`,
      tipo: 'At least tell us what kind of piece it is.',
      descripcionCorta: 'Tell us a little more: with fewer than 20 characters we can’t work anything out.',
      descripcionLarga: 'That’s very long: please keep it to 4000 characters at most.',
      fecha: 'Please write the date in fewer than 80 characters.',
      presupuesto: 'Choose one of the budgets from the list.',
      colores: 'Colours, in fewer than 200 characters.',
      instagram: 'Just write your Instagram username, for example @yourusername.',
      motivo: 'Tell us what it’s about, even roughly.',
      pedido: 'Order numbers look like this: OV-2026-1042.',
      mensajeCorto: 'Write us a little more, even if it’s short (10 characters minimum).',
      mensajeLargo: 'That’s very long: please keep it to 3000 characters at most.',
      revisar: (n: number) => (n === 1 ? 'There’s one field to check.' : `There are ${n} fields to check.`),
    },
    fr: {
      nombreFalta: 'Comment vous appelez-vous ?',
      nombreLargo: 'Le nom est trop long (120 caractères maximum).',
      correoFalta: 'Il nous faut votre adresse e-mail pour vous répondre.',
      consentimiento: 'Sans votre accord, nous ne pouvons pas conserver vos données pour vous répondre.',
      fotoPesada: (tope: string) => `Chaque photo peut peser ${tope} au maximum.`,
      fotoTipo: 'Nous n’acceptons que les photos JPG, PNG ou WebP.',
      fotoFalsa: 'L’une des photos n’est pas une image valide.',
      fotosMinimo: 'Choisissez au moins une photo.',
      fotosMaximo: (n: number) => `Vous pouvez envoyer jusqu’à ${n} photos.`,
      fotosTotal: (tope: string) => `Au total, les photos ne peuvent pas dépasser ${tope}.`,
      tipo: 'Dites-nous au moins de quel type de pièce il s’agit.',
      descripcionCorta: 'Dites-nous-en un peu plus : avec moins de 20 caractères, nous ne pouvons rien estimer.',
      descripcionLarga: 'C’est très long : résumez-le en 4000 caractères maximum.',
      fecha: 'Indiquez la date en moins de 80 caractères.',
      presupuesto: 'Choisissez l’un des budgets de la liste.',
      colores: 'Les couleurs, en moins de 200 caractères.',
      instagram: 'Indiquez seulement votre nom d’utilisateur Instagram, par exemple @votrenom.',
      motivo: 'Dites-nous de quoi il s’agit, même dans les grandes lignes.',
      pedido: 'Le numéro de commande a cette forme : OV-2026-1042.',
      mensajeCorto: 'Écrivez-nous un peu plus, même court (10 caractères minimum).',
      mensajeLargo: 'C’est très long : résumez-le en 3000 caractères maximum.',
      revisar: (n: number) => (n === 1 ? 'Un champ est à vérifier.' : `${n} champs sont à vérifier.`),
    },
    de: {
      nombreFalta: 'Wie heißen Sie?',
      nombreLargo: 'Der Name ist zu lang (höchstens 120 Zeichen).',
      correoFalta: 'Wir brauchen Ihre E-Mail-Adresse, um Ihnen zu antworten.',
      consentimiento: 'Ohne Ihre Einwilligung können wir Ihre Daten nicht speichern, um Ihnen zu antworten.',
      fotoPesada: (tope: string) => `Jedes Foto darf höchstens ${tope} groß sein.`,
      fotoTipo: 'Wir nehmen nur Fotos im Format JPG, PNG oder WebP an.',
      fotoFalsa: 'Eines der Fotos ist kein gültiges Bild.',
      fotosMinimo: 'Wählen Sie mindestens ein Foto aus.',
      fotosMaximo: (n: number) => `Sie können bis zu ${n} Fotos senden.`,
      fotosTotal: (tope: string) => `Zusammen dürfen die Fotos nicht größer als ${tope} sein.`,
      tipo: 'Sagen Sie uns wenigstens, um welche Art von Stück es geht.',
      descripcionCorta: 'Erzählen Sie uns etwas mehr: Mit weniger als 20 Zeichen können wir nichts kalkulieren.',
      descripcionLarga: 'Das ist sehr lang: Bitte fassen Sie es in höchstens 4000 Zeichen zusammen.',
      fecha: 'Geben Sie das Datum in weniger als 80 Zeichen an.',
      presupuesto: 'Wählen Sie eines der Budgets aus der Liste.',
      colores: 'Die Farben bitte in weniger als 200 Zeichen.',
      instagram: 'Geben Sie nur Ihren Instagram-Nutzernamen an, zum Beispiel @ihrname.',
      motivo: 'Sagen Sie uns, worum es geht, auch nur grob.',
      pedido: 'Die Bestellnummer sieht so aus: OV-2026-1042.',
      mensajeCorto: 'Schreiben Sie uns etwas mehr, auch wenn es kurz ist (mindestens 10 Zeichen).',
      mensajeLargo: 'Das ist sehr lang: Bitte fassen Sie es in höchstens 3000 Zeichen zusammen.',
      revisar: (n: number) => (n === 1 ? 'Ein Feld muss noch geprüft werden.' : `${n} Felder müssen noch geprüft werden.`),
    },
  },
);

type TextosEsquemas = (typeof T)[Idioma];

/** Aviso general cuando hay errores: «Hay 3 campos que revisar». */
export const avisoRevisar = (n: number, idioma: Idioma = 'es') => T[idioma].revisar(n);

/** Un esquema por idioma, creado la primera vez que se pide. */
function porIdioma<E>(crear: (t: TextosEsquemas, idioma: Idioma) => E): (idioma?: Idioma) => E {
  const hechos = new Map<Idioma, E>();
  return (idioma = 'es') => {
    let esquema = hechos.get(idioma);
    if (!esquema) {
      esquema = crear(T[idioma], idioma);
      hechos.set(idioma, esquema);
    }
    return esquema;
  };
}

/* ------------------------------------------------------------------
   Piezas comunes
   ------------------------------------------------------------------ */

const textoOpcional = (max: number, mensaje: string) =>
  texto().pipe(z.string().max(max, mensaje));

const nombre = (t: TextosEsquemas) =>
  texto().pipe(z.string().min(1, t.nombreFalta).max(120, t.nombreLargo));

const correoContacto = (t: TextosEsquemas, idioma: Idioma) => correo(t.correoFalta, idioma);

/** Una casilla marcada llega como «on»; sin marcar, no llega. */
const consentimiento = (t: TextosEsquemas) =>
  z.preprocess((v) => v === 'on' || v === 'true', z.literal(true, { error: t.consentimiento }));

/* ------------------------------------------------------------------
   Encargo a medida
   ------------------------------------------------------------------ */

export interface LimitesImagenes {
  cantidad: number;
  /** Por foto. */
  bytes: number;
  /** Entre todas: debe caber en serverActions.bodySizeLimit (next.config.ts). */
  bytesTotales: number;
  tipos: readonly TipoImagen[];
}

/** Lista de fotos subidas con un formulario, común a encargos y panel. */
export function listaImagenes(limites: LimitesImagenes, minimo = 0, idioma: Idioma = 'es') {
  const t = T[idioma];
  const imagen = z
    .file()
    .max(limites.bytes, t.fotoPesada(megas(limites.bytes, idioma)))
    .mime([...limites.tipos], t.fotoTipo)
    // El tipo lo declara el navegador y se puede falsear: miramos los
    // primeros bytes del archivo para saber qué es de verdad.
    .refine(
      async (f) => tipoDeImagen(new Uint8Array(await f.slice(0, 16).arrayBuffer())) !== null,
      t.fotoFalsa,
    );
  // Un input de archivo vacío envía un File sin contenido.
  return z.preprocess(
    (v) => (Array.isArray(v) ? v.filter((f) => !(f instanceof File && f.size === 0)) : []),
    z
      .array(imagen)
      .min(minimo, t.fotosMinimo)
      .max(limites.cantidad, t.fotosMaximo(limites.cantidad))
      .refine(
        (fs) => fs.reduce((total, f) => total + f.size, 0) <= limites.bytesTotales,
        t.fotosTotal(megas(limites.bytesTotales, idioma)),
      ),
  );
}

const crearEsquemaEncargo = (t: TextosEsquemas, idioma: Idioma) =>
  z.object({
    tipo: texto().pipe(
      z.enum(Object.keys(TIPOS_ENCARGO) as [TipoEncargo, ...TipoEncargo[]], {
        error: t.tipo,
      }),
    ),
    descripcion: texto().pipe(z.string().min(20, t.descripcionCorta).max(4000, t.descripcionLarga)),
    fecha: textoOpcional(80, t.fecha),
    presupuesto: texto().pipe(z.union([z.literal(''), z.enum(PRESUPUESTOS)], { error: t.presupuesto })),
    colores: textoOpcional(200, t.colores),
    nombre: nombre(t),
    correo: correoContacto(t, idioma),
    instagram: texto().pipe(z.union([z.literal(''), z.string().regex(/^@?[A-Za-z0-9._]{1,30}$/, t.instagram)])),
    acepta: consentimiento(t),
    fotos: listaImagenes(LIMITES_FOTOS, 0, idioma),
  });

/** Esquema del encargo, con los mensajes en ese idioma (español si no se dice). */
export const esquemaEncargo = porIdioma(crearEsquemaEncargo);

export type DatosEncargo = z.output<ReturnType<typeof crearEsquemaEncargo>>;
export type CampoEncargo = keyof DatosEncargo;

/* ------------------------------------------------------------------
   Contacto
   ------------------------------------------------------------------ */

const crearEsquemaContacto = (t: TextosEsquemas, idioma: Idioma) =>
  z.object({
    motivo: texto().pipe(
      z.enum(Object.keys(MOTIVOS_CONTACTO) as [MotivoContacto, ...MotivoContacto[]], {
        error: t.motivo,
      }),
    ),
    pedido: texto()
      .transform((v) => v.toUpperCase())
      .pipe(z.union([z.literal(''), z.string().regex(/^OV-\d{4}-\d{3,7}$/, t.pedido)])),
    nombre: nombre(t),
    correo: correoContacto(t, idioma),
    mensaje: texto().pipe(z.string().min(10, t.mensajeCorto).max(3000, t.mensajeLargo)),
    acepta: consentimiento(t),
  });

/** Esquema del mensaje de contacto, con los mensajes en ese idioma. */
export const esquemaContacto = porIdioma(crearEsquemaContacto);

export type DatosContacto = z.output<ReturnType<typeof crearEsquemaContacto>>;
export type CampoContacto = keyof DatosContacto;

/* ------------------------------------------------------------------
   Utilidades
   ------------------------------------------------------------------ */

/** FormData → objeto plano. Los campos repetidos (las fotos) llegan como lista. */
export function formularioAObjeto(datos: FormData, listas: readonly string[] = []): Record<string, unknown> {
  const salida: Record<string, unknown> = {};
  for (const clave of new Set(datos.keys())) {
    if (clave.startsWith('$ACTION')) continue;
    salida[clave] = listas.includes(clave) ? datos.getAll(clave) : datos.get(clave);
  }
  return salida;
}

/** Primer mensaje de error de cada campo, listo para pintar junto al campo. */
export function erroresPorCampo<C extends string>(error: z.ZodError): Partial<Record<C, string>> {
  const errores: Partial<Record<C, string>> = {};
  for (const fallo of error.issues) {
    const campo = fallo.path[0];
    if (typeof campo !== 'string') continue;
    const clave = campo as C;
    if (!errores[clave]) errores[clave] = fallo.message;
  }
  return errores;
}

/** Los campos de texto tal como llegaron, para devolverlos al formulario. */
export function valoresDeTexto<C extends string>(crudo: Record<string, unknown>): Partial<Record<C, string>> {
  const valores: Partial<Record<C, string>> = {};
  for (const [clave, valor] of Object.entries(crudo)) {
    if (typeof valor === 'string' && clave !== CAMPO_TRAMPA) valores[clave as C] = valor.slice(0, 4000);
  }
  return valores;
}
