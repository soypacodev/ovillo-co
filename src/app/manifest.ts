import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ovillo & Co. · Crochet hecho a mano en Málaga',
    short_name: 'Ovillo & Co.',
    description: 'Amigurumis, mantas y accesorios de crochet tejidos a mano en Málaga. Tienda de demostración.',
    lang: 'es-ES',
    start_url: '/',
    display: 'browser',
    background_color: '#F8F6F2',
    theme_color: '#F8F6F2',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
