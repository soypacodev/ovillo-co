// Datos estructurados de schema.org comunes a toda la web: la tienda como
// comercio local de Málaga y el sitio. La tienda es ficticia: hay ciudad,
// pero no calle ni teléfono, y el correo es de un dominio de ejemplo.
// Los textos van en el idioma de la página; los @id no cambian entre
// idiomas porque la tienda y el sitio son los mismos.

import { conIdioma, DATOS_IDIOMA, textos, type Idioma } from '@/lib/i18n';
import { DEMO, rutas } from '@/lib/rutas';

const DIAS_RECOGIDA = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const T = textos(
  {
    pago: 'Tarjeta de crédito o débito',
    pais: 'España',
    recogida: 'Recogida en el taller, con cita previa',
    oficio: 'Desarrollador web full stack',
  },
  {
    en: {
      pago: 'Credit or debit card',
      pais: 'Spain',
      recogida: 'Collection from the workshop, by appointment',
      oficio: 'Full-stack web developer',
    },
    fr: {
      pago: 'Carte de crédit ou de débit',
      pais: 'Espagne',
      recogida: 'Retrait à l’atelier, sur rendez-vous',
      oficio: 'Développeur web full stack',
    },
    de: {
      pago: 'Kredit- oder Debitkarte',
      pais: 'Spanien',
      recogida: 'Abholung in der Werkstatt, nach Terminvereinbarung',
      oficio: 'Full-Stack-Webentwickler',
    },
  },
);

/** Comercio, sitio y autor como un solo grafo, en el idioma de la página. */
export function datosTienda(urlSitio: string, descripcion: string, idioma: Idioma = 'es') {
  const t = T[idioma];
  const inicio = idioma === 'es' ? urlSitio : `${urlSitio}${conIdioma(rutas.inicio, idioma)}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Store',
        '@id': `${urlSitio}/#tienda`,
        name: 'Ovillo & Co.',
        description: descripcion,
        url: urlSitio,
        logo: `${urlSitio}/icon.svg`,
        image: `${urlSitio}/fotos/portada.jpg`,
        email: DEMO.correo,
        priceRange: '€€',
        currenciesAccepted: 'EUR',
        paymentAccepted: t.pago,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Málaga',
          addressRegion: 'Andalucía',
          addressCountry: 'ES',
        },
        // Recogida en mano en Málaga; envíos a la península y Baleares.
        areaServed: [
          { '@type': 'City', name: 'Málaga' },
          { '@type': 'Country', name: t.pais },
        ],
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            name: t.recogida,
            dayOfWeek: DIAS_RECOGIDA.map((dia) => `https://schema.org/${dia}`),
            opens: '10:00',
            closes: '14:00',
          },
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${urlSitio}/#web`,
        name: 'Ovillo & Co.',
        url: inicio,
        inLanguage: DATOS_IDIOMA[idioma].formato,
        publisher: { '@id': `${urlSitio}/#tienda` },
        creator: { '@id': `${urlSitio}/#autor` },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${urlSitio}${conIdioma(rutas.tienda, idioma)}?q={busqueda}`,
          'query-input': 'required name=busqueda',
        },
      },
      {
        '@type': 'Person',
        '@id': `${urlSitio}/#autor`,
        name: 'Paco López',
        alternateName: DEMO.autor,
        jobTitle: t.oficio,
        url: DEMO.enlace,
        sameAs: [DEMO.enlace, DEMO.instagram],
        address: { '@type': 'PostalAddress', addressLocality: 'Málaga', addressCountry: 'ES' },
      },
    ],
  };
}
