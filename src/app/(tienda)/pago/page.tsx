import type { Metadata } from 'next';
import { connection } from 'next/server';
import { FormularioPago } from '@/componentes/compra/formulario-pago';
import { IcoInfo } from '@/componentes/iconos';
import { paraCesta } from '@/componentes/producto/tarjeta-producto';
import { catalogo } from '@/lib/datos';
import { stripeConfigurado } from '@/lib/pagos/stripe';
import type { ParametrosUrl } from '@/lib/parametros';

import '@/componentes/compra/compra.css';

export const metadata: Metadata = {
  title: 'Terminar el pedido',
  robots: { index: false, follow: false },
};

interface PropsPago {
  searchParams: ParametrosUrl;
}

export default async function PaginaPago({ searchParams }: PropsPago) {
  await connection();
  const fuente = catalogo();
  const [productos, metodos, parametros] = await Promise.all([fuente.productos(), fuente.metodosEnvio(), searchParams]);
  const modo = stripeConfigurado() ? 'stripe' : 'demo';

  return (
    <div className="wrap">
      <header className="compra-cab-centro">
        <h1 className="ent ent-1">Terminar el pedido</h1>
        <p className="aviso-demo ent ent-2">
          <IcoInfo />
          {modo === 'stripe' ? (
            <span>
              Tienda de demostración · Stripe en modo prueba: paga con la tarjeta <b>4242 4242 4242 4242</b>
            </span>
          ) : (
            <span>Tienda de demostración · no se cobra nada ni se pide ninguna tarjeta</span>
          )}
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
