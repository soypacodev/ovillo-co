// Reglas de los datos de entrega sin dependencias, para que el formulario
// de pago las compruebe en el navegador sin cargar zod (su compilación con
// new Function choca con la CSP). El servidor aplica estas mismas reglas
// dentro de su esquema, así que los mensajes coinciden en los dos lados.

import { textos, type Idioma } from '@/lib/i18n';

/** Provincias con su nombre oficial y el prefijo de sus códigos postales. */
const PROVINCIAS = [
  ['A Coruña', '15'], ['Albacete', '02'], ['Alicante/Alacant', '03'], ['Almería', '04'], ['Araba/Álava', '01'],
  ['Asturias', '33'], ['Ávila', '05'], ['Badajoz', '06'], ['Barcelona', '08'], ['Bizkaia', '48'],
  ['Burgos', '09'], ['Cáceres', '10'], ['Cádiz', '11'], ['Cantabria', '39'], ['Castellón/Castelló', '12'],
  ['Ceuta', '51'], ['Ciudad Real', '13'], ['Córdoba', '14'], ['Cuenca', '16'], ['Gipuzkoa', '20'],
  ['Girona', '17'], ['Granada', '18'], ['Guadalajara', '19'], ['Huelva', '21'], ['Huesca', '22'],
  ['Illes Balears', '07'], ['Jaén', '23'], ['La Rioja', '26'], ['Las Palmas', '35'], ['León', '24'],
  ['Lleida', '25'], ['Lugo', '27'], ['Madrid', '28'], ['Málaga', '29'], ['Melilla', '52'],
  ['Murcia', '30'], ['Navarra', '31'], ['Ourense', '32'], ['Palencia', '34'], ['Pontevedra', '36'],
  ['Salamanca', '37'], ['Santa Cruz de Tenerife', '38'], ['Segovia', '40'], ['Sevilla', '41'], ['Soria', '42'],
  ['Tarragona', '43'], ['Teruel', '44'], ['Toledo', '45'], ['Valencia/València', '46'], ['Valladolid', '47'],
  ['Zamora', '49'], ['Zaragoza', '50'],
] as const;

export const NOMBRES_PROVINCIA: readonly string[] = PROVINCIAS.map(([nombre]) => nombre);

/** Provincia que corresponde a un código postal, o null si no encaja. */
export function provinciaDeCodigo(cp: string): string | null {
  if (!/^\d{5}$/.test(cp)) return null;
  return PROVINCIAS.find(([, prefijo]) => cp.startsWith(prefijo))?.[0] ?? null;
}

export const METODOS_ENVIO = ['ordinario', 'express', 'recogida'] as const;
export type IdEnvio = (typeof METODOS_ENVIO)[number];

export const MAX_DEDICATORIA = 200;
export const MAX_NOTA = 500;

/** Lo que escribe la clienta en el formulario de pago. */
export interface DatosPedido {
  email: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  envio: IdEnvio;
  calle?: string;
  piso?: string;
  cp?: string;
  ciudad?: string;
  provincia?: string;
  regalo?: boolean;
  dedicatoria?: string;
  nota?: string;
  acepta?: boolean;
}

export type ErroresCampos = Partial<Record<keyof DatosPedido, string>>;

// El mismo patrón que usa zod para z.email().
const PATRON_CORREO = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/;
const PATRON_TELEFONO = /^\+?[\d\s()-]{9,20}$/;

/** Máximo de caracteres de cada campo de texto. */
const MAXIMOS = {
  nombre: 60,
  apellidos: 80,
  calle: 120,
  piso: 60,
  cp: 5,
  ciudad: 80,
  provincia: 40,
  dedicatoria: MAX_DEDICATORIA,
  nota: MAX_NOTA,
} as const;

const T = textos(
  {
    correoLargo: 'Ese correo es demasiado largo.',
    correo: 'Escribe un correo válido: es donde te avisaremos.',
    nombre: 'Nos hace falta tu nombre.',
    apellidos: 'Y los apellidos.',
    maximo: (max: number) => `Como mucho ${max} caracteres.`,
    telefonoLargo: 'Ese teléfono es demasiado largo.',
    telefono: 'Revisa el teléfono: solo cifras y, si quieres, el prefijo.',
    envio: 'Elige cómo quieres recibirlo.',
    acepta: 'Tienes que aceptar los términos para poder pedir.',
    calle: 'Falta la dirección.',
    ciudad: 'Falta la ciudad.',
    cp: 'El código postal tiene cinco cifras.',
    provincia: 'Elige una provincia.',
    cpDe: (provincia: string) => `Ese código postal es de ${provincia}.`,
    cpNoExiste: 'Ese código postal no existe.',
  },
  {
    en: {
      correoLargo: 'That email address is too long.',
      correo: 'Enter a valid email address: it’s where we’ll keep you posted.',
      nombre: 'We need your first name.',
      apellidos: 'And your surname.',
      maximo: (max: number) => `${max} characters at most.`,
      telefonoLargo: 'That phone number is too long.',
      telefono: 'Check the phone number: digits only and, if you like, the country code.',
      envio: 'Choose how you’d like to receive it.',
      acepta: 'You need to accept the terms to place your order.',
      calle: 'The address is missing.',
      ciudad: 'The town or city is missing.',
      cp: 'The postcode has five digits.',
      provincia: 'Choose a province.',
      cpDe: (provincia: string) => `That postcode belongs to ${provincia}.`,
      cpNoExiste: 'That postcode doesn’t exist.',
    },
    fr: {
      correoLargo: 'Cette adresse e-mail est trop longue.',
      correo: 'Saisissez une adresse e-mail valide\u00a0: c’est là que nous vous écrirons.',
      nombre: 'Il nous faut votre prénom.',
      apellidos: 'Et votre nom.',
      maximo: (max: number) => `${max} caractères maximum.`,
      telefonoLargo: 'Ce numéro de téléphone est trop long.',
      telefono: 'Vérifiez le téléphone\u00a0: uniquement des chiffres et, si vous le souhaitez, l’indicatif.',
      envio: 'Choisissez comment vous souhaitez le recevoir.',
      acepta: 'Vous devez accepter les conditions pour pouvoir commander.',
      calle: 'L’adresse est manquante.',
      ciudad: 'La ville est manquante.',
      cp: 'Le code postal comporte cinq chiffres.',
      provincia: 'Choisissez une province.',
      cpDe: (provincia: string) => `Ce code postal correspond à ${provincia}.`,
      cpNoExiste: 'Ce code postal n’existe pas.',
    },
    de: {
      correoLargo: 'Diese E-Mail-Adresse ist zu lang.',
      correo: 'Geben Sie eine gültige E-Mail-Adresse ein: Dorthin schicken wir Ihnen alle Infos.',
      nombre: 'Wir brauchen Ihren Vornamen.',
      apellidos: 'Und Ihren Nachnamen.',
      maximo: (max: number) => `Höchstens ${max} Zeichen.`,
      telefonoLargo: 'Diese Telefonnummer ist zu lang.',
      telefono: 'Prüfen Sie die Telefonnummer: nur Ziffern und, wenn Sie möchten, die Vorwahl.',
      envio: 'Wählen Sie, wie Sie Ihre Bestellung erhalten möchten.',
      acepta: 'Sie müssen die Bedingungen akzeptieren, um bestellen zu können.',
      calle: 'Die Adresse fehlt.',
      ciudad: 'Der Ort fehlt.',
      cp: 'Die Postleitzahl hat fünf Ziffern.',
      provincia: 'Wählen Sie eine Provinz.',
      cpDe: (provincia: string) => `Diese Postleitzahl gehört zu ${provincia}.`,
      cpNoExiste: 'Diese Postleitzahl gibt es nicht.',
    },
  },
);

/** Mensaje de error cuando falta el método de envío (también lo usa zod). */
export const mensajeEnvio = (idioma: Idioma = 'es') => T[idioma].envio;

/** Primer error de cada campo; vacío si todo está bien. */
export function erroresDatos(entrada: DatosPedido, idioma: Idioma = 'es'): ErroresCampos {
  const m = T[idioma];
  const t = (v: string | undefined) => (v ?? '').trim();
  const d = {
    email: t(entrada.email),
    nombre: t(entrada.nombre),
    apellidos: t(entrada.apellidos),
    telefono: t(entrada.telefono),
    calle: t(entrada.calle),
    piso: t(entrada.piso),
    cp: t(entrada.cp),
    ciudad: t(entrada.ciudad),
    provincia: t(entrada.provincia),
    dedicatoria: t(entrada.dedicatoria),
    nota: t(entrada.nota),
  };
  const errores: ErroresCampos = {};
  const falta = (campo: keyof DatosPedido, mensaje: string) => {
    errores[campo] ??= mensaje;
  };

  if (d.email.length > 254) falta('email', m.correoLargo);
  else if (!PATRON_CORREO.test(d.email)) falta('email', m.correo);
  if (!d.nombre) falta('nombre', m.nombre);
  if (!d.apellidos) falta('apellidos', m.apellidos);
  for (const [campo, max] of Object.entries(MAXIMOS) as [keyof typeof MAXIMOS, number][]) {
    if (d[campo].length > max) falta(campo, m.maximo(max));
  }
  if (d.telefono.length > 20) falta('telefono', m.telefonoLargo);
  else if (d.telefono && !PATRON_TELEFONO.test(d.telefono)) {
    falta('telefono', m.telefono);
  }
  if (!(METODOS_ENVIO as readonly string[]).includes(entrada.envio)) falta('envio', m.envio);
  if (entrada.acepta !== true) falta('acepta', m.acepta);

  // La dirección solo hace falta si hay que mandar el paquete.
  if (entrada.envio !== 'recogida') {
    if (!d.calle) falta('calle', m.calle);
    if (!d.ciudad) falta('ciudad', m.ciudad);
    if (!/^\d{5}$/.test(d.cp)) falta('cp', m.cp);
    if (!NOMBRES_PROVINCIA.includes(d.provincia)) {
      falta('provincia', m.provincia);
    } else if (/^\d{5}$/.test(d.cp)) {
      const deCodigo = provinciaDeCodigo(d.cp);
      if (deCodigo !== d.provincia) falta('cp', deCodigo ? m.cpDe(deCodigo) : m.cpNoExiste);
    }
  }
  return errores;
}
