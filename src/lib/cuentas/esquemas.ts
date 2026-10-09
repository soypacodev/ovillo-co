// Esquemas de los formularios de la cuenta. Se validan en el servidor;
// los atributos del HTML (required, minLength…) son solo una ayuda. Cada
// esquema se crea en el idioma de la petición para que los mensajes de
// error lleguen traducidos; las reglas son las mismas en todos.

import { z } from 'zod';
import { textos, type Idioma } from '@/lib/i18n';
import { NOMBRES_PROVINCIA } from '@/lib/pagos/esquema';
import { casilla, PATRON_CORREO, texto } from '@/lib/validacion';
import { MIN_CONTRASENA, PALABRAS_BORRAR } from './tipos';

const T = textos(
  {
    faltaCorreo: 'Escribe tu correo.',
    correoLargo: 'Ese correo es demasiado largo.',
    correoMalo: 'Ese correo no parece válido. Revisa que tenga @ y un dominio.',
    contrasenaCorta: (min: number) => `Necesita al menos ${min} caracteres. Mejor larga que complicada.`,
    comoMucho: (n: number) => `Como mucho ${n} caracteres.`,
    faltaContrasena: 'Falta la contraseña.',
    faltaNombre: '¿Cómo te llamas?',
    faltaAcepta: 'Para crear la cuenta hay que aceptar la privacidad y los términos.',
    noCoinciden: 'Las dos contraseñas no coinciden.',
    telefono: 'Escribe solo números, espacios o el prefijo con +.',
    faltaDestinatario: '¿A nombre de quién?',
    faltaCalle: 'Escribe la calle y el número.',
    codigoPostal: 'El código postal tiene 5 cifras.',
    faltaLocalidad: 'Falta la localidad.',
    provincia: 'Elige una provincia de la lista.',
    confirmarBorrar: (palabra: string) => `Escribe ${palabra} para confirmar.`,
  },
  {
    en: {
      faltaCorreo: 'Please enter your email.',
      correoLargo: 'That email address is too long.',
      correoMalo: "That email address doesn't look right. Check it has an @ and a domain.",
      contrasenaCorta: (min: number) => `It needs at least ${min} characters. Long beats complicated.`,
      comoMucho: (n: number) => `${n} characters at most.`,
      faltaContrasena: 'Please enter your password.',
      faltaNombre: "What's your name?",
      faltaAcepta: 'To create an account, please accept the privacy policy and the terms.',
      noCoinciden: "The two passwords don't match.",
      telefono: 'Use only numbers, spaces or a + for the country code.',
      faltaDestinatario: 'Who is it addressed to?',
      faltaCalle: 'Please enter the street and number.',
      codigoPostal: 'The postcode has 5 digits.',
      faltaLocalidad: 'Please enter the town or city.',
      provincia: 'Choose a province from the list.',
      confirmarBorrar: (palabra: string) => `Type ${palabra} to confirm.`,
    },
    fr: {
      faltaCorreo: 'Indiquez votre adresse e-mail.',
      correoLargo: 'Cette adresse e-mail est trop longue.',
      correoMalo: 'Cette adresse e-mail ne semble pas valide. Vérifiez qu’elle contient un @ et un domaine.',
      contrasenaCorta: (min: number) => `Il faut au moins ${min} caractères. Mieux vaut long que compliqué.`,
      comoMucho: (n: number) => `${n} caractères maximum.`,
      faltaContrasena: 'Indiquez votre mot de passe.',
      faltaNombre: 'Comment vous appelez-vous ?',
      faltaAcepta: 'Pour créer un compte, vous devez accepter la politique de confidentialité et les conditions.',
      noCoinciden: 'Les deux mots de passe ne correspondent pas.',
      telefono: 'Utilisez uniquement des chiffres, des espaces ou l’indicatif avec +.',
      faltaDestinatario: 'À quel nom ?',
      faltaCalle: 'Indiquez la rue et le numéro.',
      codigoPostal: 'Le code postal comporte 5 chiffres.',
      faltaLocalidad: 'Indiquez la ville.',
      provincia: 'Choisissez une province dans la liste.',
      confirmarBorrar: (palabra: string) => `Tapez ${palabra} pour confirmer.`,
    },
    de: {
      faltaCorreo: 'Bitte geben Sie Ihre E-Mail-Adresse ein.',
      correoLargo: 'Diese E-Mail-Adresse ist zu lang.',
      correoMalo: 'Diese E-Mail-Adresse scheint nicht gültig zu sein. Prüfen Sie, ob sie ein @ und eine Domain enthält.',
      contrasenaCorta: (min: number) => `Mindestens ${min} Zeichen. Lieber lang als kompliziert.`,
      comoMucho: (n: number) => `Höchstens ${n} Zeichen.`,
      faltaContrasena: 'Bitte geben Sie Ihr Passwort ein.',
      faltaNombre: 'Wie heißen Sie?',
      faltaAcepta: 'Um ein Konto anzulegen, müssen Sie die Datenschutzerklärung und die Bedingungen akzeptieren.',
      noCoinciden: 'Die beiden Passwörter stimmen nicht überein.',
      telefono: 'Bitte nur Ziffern, Leerzeichen oder die Vorwahl mit + verwenden.',
      faltaDestinatario: 'An wen geht die Sendung?',
      faltaCalle: 'Bitte geben Sie Straße und Hausnummer ein.',
      codigoPostal: 'Die Postleitzahl hat 5 Ziffern.',
      faltaLocalidad: 'Bitte geben Sie den Ort ein.',
      provincia: 'Wählen Sie eine Provinz aus der Liste.',
      confirmarBorrar: (palabra: string) => `Geben Sie ${palabra} ein, um zu bestätigen.`,
    },
  },
);

/** Mismas reglas que `correo()` de @/lib/validacion, con los mensajes en el idioma. */
const correoCuenta = (idioma: Idioma) => {
  const t = T[idioma];
  return texto()
    .transform((v) => v.toLowerCase())
    .pipe(z.string().min(1, t.faltaCorreo).max(254, t.correoLargo).regex(PATRON_CORREO, t.correoMalo));
};

// Sin trim: un espacio al principio o al final también es parte de la contraseña.
const contrasenaNueva = (idioma: Idioma) =>
  z.preprocess(
    (v) => (typeof v === 'string' ? v : ''),
    z.string().min(MIN_CONTRASENA, T[idioma].contrasenaCorta(MIN_CONTRASENA)).max(72, T[idioma].comoMucho(72)),
  );

const nombre = (idioma: Idioma) =>
  texto().pipe(z.string().min(1, T[idioma].faltaNombre).max(120, T[idioma].comoMucho(120)));

const telefono = (idioma: Idioma) =>
  texto().pipe(z.union([z.literal(''), z.string().regex(/^[+0-9 ()-]{6,30}$/, T[idioma].telefono)]));

export const esquemaEntrar = (idioma: Idioma) =>
  z.object({
    correo: correoCuenta(idioma),
    contrasena: z.preprocess((v) => (typeof v === 'string' ? v : ''), z.string().min(1, T[idioma].faltaContrasena)),
    siguiente: texto(),
  });

export const esquemaEnlace = (idioma: Idioma) => z.object({ correo: correoCuenta(idioma), siguiente: texto() });

export const esquemaRegistro = (idioma: Idioma) =>
  z.object({
    nombre: nombre(idioma),
    correo: correoCuenta(idioma),
    contrasena: contrasenaNueva(idioma),
    acepta: z.preprocess((v) => v === 'on', z.literal(true, { error: T[idioma].faltaAcepta })),
    boletin: casilla(),
  });

export const esquemaRecuperar = (idioma: Idioma) => z.object({ correo: correoCuenta(idioma) });

export const esquemaNuevaContrasena = (idioma: Idioma) =>
  z
    .object({
      contrasena: contrasenaNueva(idioma),
      repetida: z.preprocess((v) => (typeof v === 'string' ? v : ''), z.string()),
    })
    .refine((d) => d.contrasena === d.repetida, { path: ['repetida'], message: T[idioma].noCoinciden });

export const esquemaDatos = (idioma: Idioma) =>
  z.object({
    nombre: nombre(idioma),
    telefono: telefono(idioma),
    boletin: casilla(),
  });

export const esquemaDireccion = (idioma: Idioma) => {
  const t = T[idioma];
  return z.object({
    id: texto().pipe(z.union([z.literal(''), z.uuid()])),
    etiqueta: texto().pipe(z.string().max(40, t.comoMucho(40))),
    destinatario: texto().pipe(z.string().min(1, t.faltaDestinatario).max(120, t.comoMucho(120))),
    linea1: texto().pipe(z.string().min(3, t.faltaCalle).max(160, t.comoMucho(160))),
    linea2: texto().pipe(z.string().max(120, t.comoMucho(120))),
    codigo_postal: texto().pipe(z.string().regex(/^\d{5}$/, t.codigoPostal)),
    ciudad: texto().pipe(z.string().min(1, t.faltaLocalidad).max(80, t.comoMucho(80))),
    provincia: texto().pipe(z.string().refine((p) => NOMBRES_PROVINCIA.includes(p), t.provincia)),
    telefono: telefono(idioma),
    predeterminada: casilla(),
  });
};

/** La palabra de confirmación es la del idioma de la página. */
export const esquemaBorrarCuenta = (idioma: Idioma) =>
  z.object({
    confirmacion: texto().pipe(
      z
        .string()
        .refine((v) => v.toUpperCase() === PALABRAS_BORRAR[idioma], T[idioma].confirmarBorrar(PALABRAS_BORRAR[idioma])),
    ),
  });

export const esquemaFavoritos = z.object({
  anadir: z.array(z.string().min(1).max(120)).max(100),
  quitar: z.array(z.string().min(1).max(120)).max(100),
});
