// Opciones y límites de los formularios. Van aparte de los esquemas para
// que los componentes de cliente puedan usarlos sin cargar zod. Los
// valores en español son los que se guardan para el panel; los rótulos
// traducidos solo se enseñan.

import { textos, type Idioma } from '@/lib/i18n';

/** Campo trampa: las personas no lo ven; los robots lo rellenan. */
export const CAMPO_TRAMPA = 'sitio_web';

export const TIPOS_ENCARGO = {
  'amigurumi-mascota': 'Amigurumi de mascota',
  'amigurumi-persona': 'Amigurumi de persona',
  manta: 'Manta o mantita',
  bebe: 'Pieza de bebé (gorrito, patucos, guirnalda…)',
  accesorio: 'Accesorio (bolso, gorro, bufanda…)',
  hogar: 'Algo para la casa (cojín, cesta, alfombra)',
  pack: 'Pack de regalo a medida',
  otro: 'Otra cosa / aún no lo sabemos',
} as const;

export type TipoEncargo = keyof typeof TIPOS_ENCARGO;

/** Rótulos de los tipos de encargo en cada idioma. */
export const ROTULOS_TIPOS_ENCARGO = textos(TIPOS_ENCARGO, {
  en: {
    'amigurumi-mascota': 'Amigurumi of your pet',
    'amigurumi-persona': 'Amigurumi of a person',
    manta: 'Blanket or baby blanket',
    bebe: 'Something for a baby (hat, booties, garland…)',
    accesorio: 'Accessory (bag, hat, scarf…)',
    hogar: 'Something for the home (cushion, basket, rug)',
    pack: 'Made-to-order gift set',
    otro: 'Something else / not sure yet',
  },
  fr: {
    'amigurumi-mascota': 'Amigurumi de votre animal',
    'amigurumi-persona': 'Amigurumi d’une personne',
    manta: 'Couverture ou plaid pour bébé',
    bebe: 'Pièce pour bébé (bonnet, chaussons, guirlande…)',
    accesorio: 'Accessoire (sac, bonnet, écharpe…)',
    hogar: 'Quelque chose pour la maison (coussin, panier, tapis)',
    pack: 'Coffret cadeau sur mesure',
    otro: 'Autre chose / on ne sait pas encore',
  },
  de: {
    'amigurumi-mascota': 'Amigurumi von Ihrem Haustier',
    'amigurumi-persona': 'Amigurumi von einer Person',
    manta: 'Decke oder Babydecke',
    bebe: 'Etwas fürs Baby (Mützchen, Babyschuhe, Girlande …)',
    accesorio: 'Accessoire (Tasche, Mütze, Schal …)',
    hogar: 'Etwas für Zuhause (Kissen, Korb, Teppich)',
    pack: 'Individuelles Geschenkset',
    otro: 'Etwas anderes / noch unklar',
  },
});

export const PRESUPUESTOS = ['Hasta 25 €', '25–50 €', '50–100 €', 'Más de 100 €'] as const;

/** Rótulos de los presupuestos, en el mismo orden que PRESUPUESTOS. */
export const ROTULOS_PRESUPUESTOS = textos(PRESUPUESTOS, {
  en: ['Up to €25', '€25–50', '€50–100', 'Over €100'],
  fr: ['Jusqu’à 25 €', '25–50 €', '50–100 €', 'Plus de 100 €'],
  de: ['Bis 25 €', '25–50 €', '50–100 €', 'Über 100 €'],
});

export const LIMITES_FOTOS = {
  cantidad: 4,
  /** Por foto. */
  bytes: 3 * 1024 * 1024,
  /** Entre todas: debe caber en serverActions.bodySizeLimit (next.config.ts). */
  bytesTotales: 8 * 1024 * 1024,
  tipos: ['image/jpeg', 'image/png', 'image/webp'] as const,
} as const;

/** 3145728 → «3 MB» (en francés, «3 Mo»). */
export const megas = (bytes: number, idioma: Idioma = 'es') =>
  `${Math.round(bytes / 1024 / 1024)} ${idioma === 'fr' ? 'Mo' : 'MB'}`;

export const MOTIVOS_CONTACTO = {
  producto: 'Duda sobre un producto',
  'estado-pedido': 'Estado de un pedido que ya hice',
  problema: 'Problema con algo que me llegó',
  devolucion: 'Devolución o cambio',
  arreglo: 'Arreglar una pieza vuestra',
  encargo: 'Encargo a medida',
  foto: 'Mandaros una foto de mi pieza',
  colaboracion: 'Colaboración o prensa',
  otro: 'Otra cosa',
} as const;

export type MotivoContacto = keyof typeof MOTIVOS_CONTACTO;

/** Rótulos de los motivos de contacto en cada idioma. */
export const ROTULOS_MOTIVOS_CONTACTO = textos(MOTIVOS_CONTACTO, {
  en: {
    producto: 'A question about a product',
    'estado-pedido': 'The status of an order I’ve placed',
    problema: 'A problem with something I received',
    devolucion: 'A return or exchange',
    arreglo: 'Repairing one of your pieces',
    encargo: 'A custom order',
    foto: 'Sending you a photo of my piece',
    colaboracion: 'Collaborations or press',
    otro: 'Something else',
  },
  fr: {
    producto: 'Une question sur un produit',
    'estado-pedido': 'Le suivi d’une commande déjà passée',
    problema: 'Un problème avec un article reçu',
    devolucion: 'Un retour ou un échange',
    arreglo: 'Faire réparer une de vos pièces',
    encargo: 'Une commande sur mesure',
    foto: 'Vous envoyer une photo de ma pièce',
    colaboracion: 'Collaboration ou presse',
    otro: 'Autre chose',
  },
  de: {
    producto: 'Frage zu einem Produkt',
    'estado-pedido': 'Status einer aufgegebenen Bestellung',
    problema: 'Problem mit einer Lieferung',
    devolucion: 'Rücksendung oder Umtausch',
    arreglo: 'Reparatur eines Ihrer Stücke',
    encargo: 'Auftragsarbeit',
    foto: 'Ein Foto meines Stücks schicken',
    colaboracion: 'Kooperation oder Presse',
    otro: 'Etwas anderes',
  },
});

/** Motivos en los que tiene sentido pedir el número de pedido. */
export const MOTIVOS_CON_PEDIDO: readonly MotivoContacto[] = ['estado-pedido', 'problema', 'devolucion'];
