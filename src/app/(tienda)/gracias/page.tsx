import type { Metadata } from 'next';
import { Confirmacion } from '@/componentes/compra/confirmacion';
import { ConfirmacionDemo, SinPedido } from '@/componentes/compra/confirmacion-demo';
import { leerSesion, stripeConfigurado } from '@/lib/pagos/stripe';
import { parametro, type ParametrosUrl } from '@/lib/parametros';

import '@/componentes/compra/compra.css';

export const metadata: Metadata = {
  title: 'Gracias por tu pedido',
  robots: { index: false, follow: false },
};

interface PropsGracias {
  searchParams: ParametrosUrl;
}

export default async function PaginaGracias({ searchParams }: PropsGracias) {
  const parametros = await searchParams;
  const sesion = parametro(parametros.session_id);
  const numeroDemo = parametro(parametros.pedido);

  let contenido;
  if (sesion && stripeConfigurado()) {
    // El resumen sale de Stripe, nunca de lo que diga la URL o el navegador.
    const pedido = await leerSesion(sesion);
    contenido = pedido ? (
      <Confirmacion pedido={pedido} />
    ) : (
      <SinPedido texto="No encontramos un pago completado con ese enlace. Si se te ha cobrado, escríbenos y lo miramos." />
    );
  } else if (/^DEMO-\d{4}-[A-Z0-9]{6}$/.test(numeroDemo)) {
    contenido = <ConfirmacionDemo numero={numeroDemo} />;
  } else {
    contenido = <SinPedido />;
  }

  return <div className="wrap">{contenido}</div>;
}
