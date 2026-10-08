import type { MetodoEnvio } from '@/lib/catalogo/tipos';
import { tipografia } from '@/lib/tipografia';
import type { Datos, ModoPago, Paso } from './datos-pago';

/** Cómo se paga: Stripe en modo prueba o la demostración sin pasarela. */
export function CajaPago({ modo }: { modo: ModoPago }) {
  if (modo === 'stripe') {
    return (
      <div className="caja-pago">
        <p>
          Al confirmar te llevamos a la pantalla segura de <b>Stripe</b> para pagar con tarjeta. Nosotros no vemos ni
          guardamos tus datos de pago.
        </p>
        <p>
          Es una tienda de demostración y Stripe está en <b>modo prueba</b>: no se cobra nada real. Usa la tarjeta{' '}
          <span className="tarjeta-prueba">4242 4242 4242 4242</span>, cualquier fecha futura y cualquier CVC.
        </p>
      </div>
    );
  }
  return (
    <div className="caja-pago">
      <p>
        Es una tienda de demostración sin pasarela de pago conectada: al confirmar <b>no se cobra nada</b> ni se pide
        ninguna tarjeta. Verás tu pedido de prueba en la siguiente pantalla.
      </p>
    </div>
  );
}

/** Resumen de lo escrito en los pasos anteriores, con enlace para cambiarlo. */
export function Revision({ datos, metodos, irA }: { datos: Datos; metodos: readonly MetodoEnvio[]; irA: (p: Paso) => void }) {
  const metodo = metodos.find((m) => m.id === datos.envio);
  const direccion =
    datos.envio === 'recogida'
      ? 'Recogida en el taller, en Málaga. Te escribimos para darte cita.'
      : [datos.calle, datos.piso, `${datos.cp} ${datos.ciudad}`, datos.provincia].filter((p) => p.trim()).join(', ');

  return (
    <dl className="revision">
      <div>
        <dt>Contacto</dt>
        <dd>
          {datos.nombre} {datos.apellidos}
          <br />
          {datos.email}
          {datos.telefono && (
            <>
              <br />
              {datos.telefono}
            </>
          )}
        </dd>
        <button type="button" className="boton-texto" onClick={() => irA(1)}>
          cambiar<span className="oculto-vis"> los datos de contacto</span>
        </button>
      </div>
      <div>
        <dt>Entrega</dt>
        <dd>
          {metodo?.nombre} · {metodo && tipografia(metodo.plazo.toLowerCase())}
          <br />
          {direccion}
          {datos.regalo && (
            <>
              <br />
              Envuelto para regalo{datos.dedicatoria && `, con la dedicatoria «${datos.dedicatoria}»`}
            </>
          )}
          {datos.nota && (
            <>
              <br />
              Nota: «{datos.nota}»
            </>
          )}
        </dd>
        <button type="button" className="boton-texto" onClick={() => irA(2)}>
          cambiar<span className="oculto-vis"> la entrega</span>
        </button>
      </div>
    </dl>
  );
}

