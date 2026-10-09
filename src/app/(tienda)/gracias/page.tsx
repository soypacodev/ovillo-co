import type { Metadata } from 'next';
import { Confirmacion } from '@/componentes/compra/confirmacion';
import { ConfirmacionDemo, SinPedido } from '@/componentes/compra/confirmacion-demo';
import { textos } from '@/lib/i18n';
import { idiomaActual } from '@/lib/i18n/servidor';
import { leerSesion, stripeConfigurado } from '@/lib/pagos/stripe';
import { parametro, type ParametrosUrl } from '@/lib/parametros';

import '@/componentes/compra/compra.css';

const T = textos(
  {
    titulo: 'Gracias por tu pedido',
    sinPago: 'No encontramos un pago completado con ese enlace. Si se te ha cobrado, escríbenos y lo miramos.',
  },
  {
    en: {
      titulo: 'Thank you for your order',
      sinPago: 'We can’t find a completed payment for that link. If you’ve been charged, write to us and we’ll look into it.',
    },
    fr: {
      titulo: 'Merci pour votre commande',
      sinPago:
        'Nous ne trouvons aucun paiement finalisé pour ce lien. Si vous avez été débité, écrivez-nous et nous vérifierons.',
    },
    de: {
      titulo: 'Danke für Ihre Bestellung',
      sinPago:
        'Zu diesem Link finden wir keine abgeschlossene Zahlung. Falls Ihnen etwas abgebucht wurde, schreiben Sie uns und wir sehen nach.',
    },
  },
);

export async function generateMetadata(): Promise<Metadata> {
  const idioma = await idiomaActual();
  return {
    title: T[idioma].titulo,
    robots: { index: false, follow: false },
  };
}

interface PropsGracias {
  searchParams: ParametrosUrl;
}

export default async function PaginaGracias({ searchParams }: PropsGracias) {
  const [parametros, idioma] = await Promise.all([searchParams, idiomaActual()]);
  const sesion = parametro(parametros.session_id);
  const numeroDemo = parametro(parametros.pedido);

  let contenido;
  if (sesion && stripeConfigurado()) {
    // El resumen sale de Stripe, nunca de lo que diga la URL o el navegador.
    const pedido = await leerSesion(sesion, idioma);
    contenido = pedido ? <Confirmacion pedido={pedido} idioma={idioma} /> : <SinPedido texto={T[idioma].sinPago} />;
  } else if (/^DEMO-\d{4}-[A-Z0-9]{6}$/.test(numeroDemo)) {
    contenido = <ConfirmacionDemo numero={numeroDemo} />;
  } else {
    contenido = <SinPedido />;
  }

  return <div className="wrap">{contenido}</div>;
}
