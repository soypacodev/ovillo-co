// Nombres de promociones y métodos de envío en inglés, francés y alemán.
// Aparte del resto del catálogo porque la cesta los necesita en el
// navegador y así no arrastra las fichas de producto.

import type { Traducciones, TraduccionEnvio, TraduccionTexto } from '@/lib/catalogo/tipos';

/** Por nombre de la promoción en español. */
export const TRADUCCIONES_PROMOCIONES: Record<string, Traducciones<TraduccionTexto>> = {
  'Rebajas de accesorios': {
    en: { nombre: 'Accessories sale' },
    fr: { nombre: 'Soldes accessoires' },
    de: { nombre: 'Accessoires-Sale' },
  },
  'Bienvenida 10 %': {
    en: { nombre: 'Welcome 10% off' },
    fr: { nombre: 'Bienvenue -10 %' },
    de: { nombre: 'Willkommen: 10 % Rabatt' },
  },
  'Envío gratis': {
    en: { nombre: 'Free delivery' },
    fr: { nombre: 'Livraison offerte' },
    de: { nombre: 'Kostenloser Versand' },
  },
  '5 € de regalo': {
    en: { nombre: '€5 off' },
    fr: { nombre: '5 € offerts' },
    de: { nombre: '5 € geschenkt' },
  },
};

/** Por id del método de envío. */
export const TRADUCCIONES_ENVIOS: Record<string, Traducciones<TraduccionEnvio>> = {
  ordinario: {
    en: { nombre: 'Standard delivery', plazo: '3–5 working days' },
    fr: { nombre: 'Livraison standard', plazo: '3–5 jours ouvrés' },
    de: { nombre: 'Standardversand', plazo: '3–5 Werktage' },
  },
  express: {
    en: { nombre: 'Express delivery', plazo: '24–48 hours' },
    fr: { nombre: 'Livraison express', plazo: '24–48 heures' },
    de: { nombre: 'Expressversand', plazo: '24–48 Stunden' },
  },
  recogida: {
    en: { nombre: 'Collection from the workshop', plazo: 'In Málaga, by appointment' },
    fr: { nombre: 'Retrait à l’atelier', plazo: 'À Málaga, sur rendez-vous' },
    de: { nombre: 'Abholung in der Werkstatt', plazo: 'In Málaga, nach Terminvereinbarung' },
  },
};
