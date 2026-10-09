import type { ReactNode } from 'react';
import type { MetodoEnvio } from '@/lib/catalogo/tipos';
import { textos } from '@/lib/i18n';
import { useIdioma, useTextos } from '@/lib/i18n/cliente';
import { tipografia } from '@/lib/tipografia';
import type { Datos, ModoPago, Paso } from './datos-pago';

const T = textos(
  {
    stripe1: (
      <>
        Al confirmar te llevamos a la pantalla segura de <b>Stripe</b> para pagar con tarjeta. Nosotros no vemos ni
        guardamos tus datos de pago.
      </>
    ),
    stripe2: (tarjeta: ReactNode) => (
      <>
        Es una tienda de demostración y Stripe está en <b>modo prueba</b>: no se cobra nada real. Usa la tarjeta{' '}
        {tarjeta}, cualquier fecha futura y cualquier CVC.
      </>
    ),
    demo: (
      <>
        Es una tienda de demostración sin pasarela de pago conectada: al confirmar <b>no se cobra nada</b> ni se pide
        ninguna tarjeta. Verás tu pedido de prueba en la siguiente pantalla.
      </>
    ),
    recogida: 'Recogida en el taller, en Málaga. Te escribimos para darte cita.',
    contacto: 'Contacto',
    cambiar: 'cambiar',
    cambiarContacto: ' los datos de contacto',
    entrega: 'Entrega',
    regalo: 'Envuelto para regalo',
    conDedicatoria: (texto: string) => `, con la dedicatoria «${texto}»`,
    nota: (texto: string) => `Nota: «${texto}»`,
    cambiarEntrega: ' la entrega',
  },
  {
    en: {
      stripe1: (
        <>
          When you confirm, we’ll take you to <b>Stripe</b>’s secure page to pay by card. We never see or store your
          payment details.
        </>
      ),
      stripe2: (tarjeta: ReactNode) => (
        <>
          This is a demo shop and Stripe is in <b>test mode</b>: nothing real is charged. Use the card {tarjeta}, any
          future date and any CVC.
        </>
      ),
      demo: (
        <>
          This is a demo shop with no payment gateway connected: when you confirm, <b>nothing is charged</b> and no card
          is requested. You’ll see your test order on the next screen.
        </>
      ),
      recogida: 'Collection from the workshop in Málaga. We’ll write to arrange a time.',
      contacto: 'Contact',
      cambiar: 'change',
      cambiarContacto: ' your contact details',
      entrega: 'Delivery',
      regalo: 'Gift-wrapped',
      conDedicatoria: (texto: string) => `, with the message “${texto}”`,
      nota: (texto: string) => `Note: “${texto}”`,
      cambiarEntrega: ' delivery',
    },
    fr: {
      stripe1: (
        <>
          En confirmant, nous vous emmenons sur la page sécurisée de <b>Stripe</b> pour payer par carte. Nous ne
          voyons ni ne conservons vos données de paiement.
        </>
      ),
      stripe2: (tarjeta: ReactNode) => (
        <>
          C’est une boutique de démonstration et Stripe est en <b>mode test</b>
          {'\u00a0'}: rien n’est réellement débité. Utilisez la carte {tarjeta}, n’importe quelle date future et
          n’importe quel CVC.
        </>
      ),
      demo: (
        <>
          C’est une boutique de démonstration sans passerelle de paiement connectée{'\u00a0'}: en confirmant,{' '}
          <b>rien n’est débité</b> et aucune carte n’est demandée. Vous verrez votre commande test à l’écran suivant.
        </>
      ),
      recogida: 'Retrait à l’atelier, à Málaga. Nous vous écrirons pour fixer un rendez-vous.',
      contacto: 'Contact',
      cambiar: 'modifier',
      cambiarContacto: ' les coordonnées',
      entrega: 'Livraison',
      regalo: 'Emballé pour offrir',
      conDedicatoria: (texto: string) => `, avec la dédicace «\u00a0${texto}\u00a0»`,
      nota: (texto: string) => `Note\u00a0: «\u00a0${texto}\u00a0»`,
      cambiarEntrega: ' la livraison',
    },
    de: {
      stripe1: (
        <>
          Nach dem Bestätigen leiten wir Sie zur sicheren Seite von <b>Stripe</b> weiter, wo Sie mit Karte bezahlen. Wir
          sehen und speichern Ihre Zahlungsdaten nicht.
        </>
      ),
      stripe2: (tarjeta: ReactNode) => (
        <>
          Dies ist ein Demo-Shop und Stripe läuft im <b>Testmodus</b>: Es wird nichts wirklich abgebucht. Verwenden Sie
          die Karte {tarjeta}, ein beliebiges Datum in der Zukunft und eine beliebige Prüfnummer.
        </>
      ),
      demo: (
        <>
          Dies ist ein Demo-Shop ohne angeschlossenen Zahlungsdienst: Beim Bestätigen <b>wird nichts abgebucht</b> und
          keine Karte abgefragt. Ihre Testbestellung sehen Sie auf der nächsten Seite.
        </>
      ),
      recogida: 'Abholung in der Werkstatt in Málaga. Wir schreiben Ihnen für einen Termin.',
      contacto: 'Kontakt',
      cambiar: 'ändern',
      cambiarContacto: ' (Kontaktdaten)',
      entrega: 'Lieferung',
      regalo: 'Als Geschenk verpackt',
      conDedicatoria: (texto: string) => `, mit der Widmung „${texto}“`,
      nota: (texto: string) => `Notiz: „${texto}“`,
      cambiarEntrega: ' (Lieferung)',
    },
  },
);

/** Cómo se paga: Stripe en modo prueba o la demostración sin pasarela. */
export function CajaPago({ modo }: { modo: ModoPago }) {
  const t = useTextos(T);
  if (modo === 'stripe') {
    return (
      <div className="caja-pago">
        <p>{t.stripe1}</p>
        <p>{t.stripe2(<span className="tarjeta-prueba">4242 4242 4242 4242</span>)}</p>
      </div>
    );
  }
  return (
    <div className="caja-pago">
      <p>{t.demo}</p>
    </div>
  );
}

/** Resumen de lo escrito en los pasos anteriores, con enlace para cambiarlo. */
export function Revision({ datos, metodos, irA }: { datos: Datos; metodos: readonly MetodoEnvio[]; irA: (p: Paso) => void }) {
  const t = useTextos(T);
  const idioma = useIdioma();
  const metodo = metodos.find((m) => m.id === datos.envio);
  // En alemán los sustantivos van con mayúscula: el plazo no se pasa a minúsculas.
  const plazo = metodo && tipografia(idioma === 'de' ? metodo.plazo : metodo.plazo.toLowerCase());
  const direccion =
    datos.envio === 'recogida'
      ? t.recogida
      : [datos.calle, datos.piso, `${datos.cp} ${datos.ciudad}`, datos.provincia].filter((p) => p.trim()).join(', ');

  return (
    <dl className="revision">
      <div>
        <dt>{t.contacto}</dt>
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
          {t.cambiar}
          <span className="oculto-vis">{t.cambiarContacto}</span>
        </button>
      </div>
      <div>
        <dt>{t.entrega}</dt>
        <dd>
          {metodo?.nombre} · {plazo}
          <br />
          {direccion}
          {datos.regalo && (
            <>
              <br />
              {t.regalo}
              {datos.dedicatoria && t.conDedicatoria(datos.dedicatoria)}
            </>
          )}
          {datos.nota && (
            <>
              <br />
              {t.nota(datos.nota)}
            </>
          )}
        </dd>
        <button type="button" className="boton-texto" onClick={() => irA(2)}>
          {t.cambiar}
          <span className="oculto-vis">{t.cambiarEntrega}</span>
        </button>
      </div>
    </dl>
  );
}

