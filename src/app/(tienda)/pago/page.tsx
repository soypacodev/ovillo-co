import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { connection } from 'next/server';
import { FormularioPago } from '@/componentes/compra/formulario-pago';
import { IcoInfo } from '@/componentes/iconos';
import { paraCesta } from '@/componentes/producto/tarjeta-producto';
import { catalogo } from '@/lib/datos';
import { textos } from '@/lib/i18n';
import { idiomaActual } from '@/lib/i18n/servidor';
import { stripeConfigurado } from '@/lib/pagos/stripe';
import type { ParametrosUrl } from '@/lib/parametros';

import '@/componentes/compra/compra.css';

const T = textos(
  {
    titulo: 'Terminar el pedido',
    stripe: (tarjeta: ReactNode) => (
      <>Tienda de demostración · Stripe en modo prueba: paga con la tarjeta {tarjeta}</>
    ),
    demo: 'Tienda de demostración · no se cobra nada ni se pide ninguna tarjeta',
  },
  {
    en: {
      titulo: 'Complete your order',
      stripe: (tarjeta: ReactNode) => <>Demo shop · Stripe in test mode: pay with the card {tarjeta}</>,
      demo: 'Demo shop · nothing is charged and no card is requested',
    },
    fr: {
      titulo: 'Finaliser la commande',
      stripe: (tarjeta: ReactNode) => (
        <>Boutique de démonstration · Stripe en mode test{'\u00a0'}: payez avec la carte {tarjeta}</>
      ),
      demo: 'Boutique de démonstration · rien n’est débité et aucune carte n’est demandée',
    },
    de: {
      titulo: 'Bestellung abschließen',
      stripe: (tarjeta: ReactNode) => <>Demo-Shop · Stripe im Testmodus: Bezahlen Sie mit der Karte {tarjeta}</>,
      demo: 'Demo-Shop · Es wird nichts abgebucht und keine Karte abgefragt',
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

interface PropsPago {
  searchParams: ParametrosUrl;
}

export default async function PaginaPago({ searchParams }: PropsPago) {
  await connection();
  const idioma = await idiomaActual();
  const t = T[idioma];
  // Nombres y envíos en el idioma de la página; el pedido se recalcula en el servidor.
  const fuente = catalogo(idioma);
  const [productos, metodos, parametros] = await Promise.all([fuente.productos(), fuente.metodosEnvio(), searchParams]);
  const modo = stripeConfigurado() ? 'stripe' : 'demo';

  return (
    <div className="wrap">
      <header className="compra-cab-centro">
        <h1 className="ent ent-1">{t.titulo}</h1>
        <p className="aviso-demo ent ent-2">
          <IcoInfo />
          <span>{modo === 'stripe' ? t.stripe(<b>4242 4242 4242 4242</b>) : t.demo}</span>
        </p>
      </header>
      <FormularioPago
        productos={productos.map(paraCesta)}
        metodos={metodos}
        modo={modo}
        cancelado={parametros.cancelado === '1'}
      />
    </div>
  );
}
