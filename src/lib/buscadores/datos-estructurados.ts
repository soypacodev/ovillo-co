// Datos estructurados de schema.org comunes a toda la web: la tienda como
// comercio local de Málaga y el sitio. La tienda es ficticia: hay ciudad,
// pero no calle ni teléfono, y el correo es de un dominio de ejemplo.

import { DEMO } from '@/lib/rutas';

const DIAS_RECOGIDA = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export function datosTienda(urlSitio: string, descripcion: string) {
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
        paymentAccepted: 'Tarjeta de crédito o débito',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Málaga',
          addressRegion: 'Andalucía',
          addressCountry: 'ES',
        },
        // Recogida en mano en Málaga; envíos a la península y Baleares.
        areaServed: [
          { '@type': 'City', name: 'Málaga' },
          { '@type': 'Country', name: 'España' },
        ],
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            name: 'Recogida en el taller, con cita previa',
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
        url: urlSitio,
        inLanguage: 'es-ES',
        publisher: { '@id': `${urlSitio}/#tienda` },
        creator: { '@id': `${urlSitio}/#autor` },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${urlSitio}/tienda?q={busqueda}`,
          'query-input': 'required name=busqueda',
        },
      },
      {
        '@type': 'Person',
        '@id': `${urlSitio}/#autor`,
        name: 'Paco López',
        alternateName: DEMO.autor,
        jobTitle: 'Desarrollador web full stack',
        url: DEMO.enlace,
        sameAs: [DEMO.enlace, DEMO.instagram],
        address: { '@type': 'PostalAddress', addressLocality: 'Málaga', addressCountry: 'ES' },
      },
    ],
  };
}
