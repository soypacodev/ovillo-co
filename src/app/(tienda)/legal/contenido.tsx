// Textos de la página legal. La tienda es ficticia: los datos del titular
// van marcados y los textos son de ejemplo.

import type { ReactNode } from 'react';
import { textos } from '@/lib/i18n';
import { Enlace } from '@/lib/i18n/enlace';
import { DEMO, rutas } from '@/lib/rutas';

/** Dato del titular que en una tienda real habría que sustituir. */
const ficticio = (oculto: string) =>
  function Ficticio({ children }: { children: ReactNode }) {
    return (
      <span className="ficticio">
        {children}
        <span className="oculto-vis"> {oculto}</span>
      </span>
    );
  };

const FicticioEs = ficticio('(dato ficticio)');
const FicticioEn = ficticio('(fictitious detail)');
const FicticioFr = ficticio('(donnée fictive)');
const FicticioDe = ficticio('(fiktive Angabe)');

const correo = <a href={`mailto:${DEMO.correo}`}>{DEMO.correo}</a>;

const autor = (oculto: string) => (
  <a className="enlace" href={DEMO.enlace} target="_blank" rel="noopener noreferrer">
    {DEMO.autor}
    <span className="oculto-vis"> {oculto}</span>
  </a>
);

export const T = textos(
  {
    titulo: 'Información legal',
    descripcion:
      'Aviso legal, política de privacidad, cookies y condiciones de venta de Ovillo & Co., una tienda de demostración: los pedidos no son reales y el pago funciona en modo de prueba.',
    miga: 'Información legal',
    etiqueta: 'Lo obligatorio, en claro',
    cabecera: 'Información legal',
    entradilla: 'Lo hemos escrito tan corto y claro como hemos podido. Si algo no se entiende, pregúntanos.',
    demo: () => (
      <>
        <b>Esto es una tienda de demostración.</b> Ovillo &amp; Co. es una marca ficticia creada por{' '}
        {autor('(se abre en otra pestaña)')} para enseñar cómo se construye una tienda online. No se vende nada, los
        pedidos no son reales y el pago funciona siempre en modo de prueba. Los datos{' '}
        <span className="ficticio">resaltados</span> son inventados y los textos sirven de ejemplo: una tienda real debe
        adaptarlos a su caso con asesoramiento profesional.
      </>
    ),
    secciones: 'Secciones',
    indice: { aviso: 'Aviso legal', privacidad: 'Privacidad', cookies: 'Cookies', venta: 'Condiciones de venta' },

    avisoTitulo: 'Aviso legal',
    aviso: () => (
      <>
        <p>
          En cumplimiento de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico
          (LSSI), estos son los datos del titular de la web:
        </p>
        <ul>
          <li>
            Titular: <FicticioEs>Ovillo &amp; Co. Taller Textil, S. L.</FicticioEs>
          </li>
          <li>
            NIF: <FicticioEs>B00000000</FicticioEs>
          </li>
          <li>
            Domicilio: <FicticioEs>Calle Ejemplo, 0 · 29000 Málaga</FicticioEs>
          </li>
          <li>
            Registro: <FicticioEs>Registro Mercantil de Málaga, tomo 0000, folio 0, hoja MA-00000</FicticioEs>
          </li>
          <li>Correo: {correo} (dominio reservado para ejemplos, no recibe correo)</li>
        </ul>
        <p>La actividad de la web es la venta de piezas de crochet hechas a mano, de catálogo y por encargo.</p>
        <h3>Propiedad intelectual</h3>
        <p>
          Los textos y el diseño de la web son del titular. Las fotografías son de sus autores y se usan con su licencia.
          Puedes compartir el contenido citando la fuente, pero no copiarlo para vender lo mismo. Si ves aquí algo tuyo
          que no debería estar, escríbenos y lo retiramos.
        </p>
        <h3>Responsabilidad</h3>
        <p>
          Cuidamos que la información sea correcta, pero puede haber errores de precio o de disponibilidad. Si detectamos
          un error importante en un pedido, te avisamos antes de cobrar y puedes cancelarlo sin coste.
        </p>
      </>
    ),

    privacidadTitulo: 'Política de privacidad',
    privacidad:
      'El responsable del tratamiento es el titular indicado en el aviso legal. Tratamos tus datos según el Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD). Solo pedimos lo que hace falta para mandarte el pedido y contestarte, y no vendemos ni cedemos datos a nadie para publicidad.',
    datosTitulo: 'Qué datos tratamos, para qué y durante cuánto tiempo',
    datosTabla: 'Datos personales: finalidad y conservación',
    datosColumnas: ['Dato', 'Para qué', 'Cuánto tiempo'],
    datos: [
      ['Nombre y dirección', 'Enviarte el pedido y emitir la factura', 'Lo que exija la normativa fiscal (en general, 6 años)'],
      ['Correo electrónico', 'Confirmar el pedido, avisarte del envío y contestarte', 'Mientras tengas cuenta o mientras dure la relación'],
      ['Teléfono', 'Que la empresa de transporte pueda localizarte', 'Lo mismo que el pedido'],
      ['Historial de pedidos', 'Que puedas consultarlo y llevar la contabilidad', 'Lo que exija la normativa fiscal'],
      ['Mensajes y encargos', 'Contestarte y preparar el presupuesto', 'Un año desde el último contacto'],
      ['Correo del boletín', 'Mandarte novedades, si te apuntas', 'Hasta que te des de baja'],
    ],
    privacidadResto: () => (
      <>
        <h3>Base legal</h3>
        <p>
          La ejecución del contrato para los pedidos; tu consentimiento para los mensajes, los encargos y el boletín (lo
          puedes retirar cuando quieras); y el cumplimiento de obligaciones legales para la facturación.
        </p>
        <h3>Quién más los ve</h3>
        <ul>
          <li>
            <b>Stripe</b>, que procesa los pagos. Los datos de la tarjeta van directamente a Stripe; nosotros no los vemos
            ni los guardamos. En esta demostración funciona en modo de prueba y no se cobra nada.
          </li>
          <li>
            <b>Supabase</b>, que aloja la base de datos de la tienda.
          </li>
          <li>
            <b>La empresa de transporte</b>, que recibe tu nombre, dirección y teléfono para entregarte el paquete.
          </li>
        </ul>
        <h3>Tus derechos</h3>
        <p>
          Puedes pedirnos acceso a tus datos, su rectificación o supresión, limitar u oponerte a su uso y llevártelos a
          otro servicio. Escríbenos a {correo} y te contestamos en menos de un mes. Si crees que no lo hemos hecho bien,
          puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).
        </p>
      </>
    ),

    cookiesTitulo: 'Cookies y almacenamiento local',
    cookies:
      'Usamos lo mínimo para que la tienda funcione. No hay cookies de publicidad ni de analítica, y nada sirve para seguirte por otras webs; por eso no te mostramos un aviso para aceptarlas.',
    cookiesTabla: 'Cookies y almacenamiento local que usa la web',
    cookiesColumnas: ['Nombre', 'Para qué', 'Tipo'],
    almacenamiento: [
      ['Recordar lo que has metido en la cesta', 'Técnico · almacenamiento local'],
      ['Recordar tus favoritos', 'Técnico · almacenamiento local'],
      ['Que la cinta de avisos no salte al cambiar de página', 'Técnico · almacenamiento local'],
      ['Mantener la sesión si entras en tu cuenta', 'Técnica · cookie propia'],
      ['Prevenir el fraude en la página de pago', 'Técnica · cookie de terceros'],
    ],
    cookiesBorrar:
      'Puedes borrarlas o bloquearlas desde los ajustes de tu navegador. Si bloqueas el almacenamiento local, la cesta y los favoritos se olvidarán al cerrar la pestaña.',

    ventaTitulo: 'Condiciones de venta',
    venta: () => (
      <>
        <p>
          Recuerda que esta tienda es una demostración: ningún pedido genera un contrato real. Las condiciones de abajo son
          las que aplicaría una tienda como esta.
        </p>
        <h3>Precios</h3>
        <p>
          Todos los precios están en euros e incluyen el IVA. El envío se suma aparte y lo ves antes de pagar. Si cambiamos
          un precio, no afecta a los pedidos ya hechos.
        </p>
        <h3>Pago</h3>
        <p>
          Con tarjeta a través de Stripe. En esta demostración el pago está siempre en modo de prueba: solo funcionan las
          tarjetas de prueba de Stripe y nunca se cobra nada. No introduzcas los datos de una tarjeta real.
        </p>
        <h3>Cuándo existe el contrato</h3>
        <p>
          Cuando recibes el correo de confirmación del pedido. Si una pieza se agota justo en ese momento, te avisamos y
          te devolvemos su importe en 48 horas.
        </p>
        <h3>Plazos de entrega</h3>
        <p>
          Los que indica la ficha de cada pieza y la página de <Enlace href={rutas.envios}>envíos</Enlace>. Si vamos a
          tardar más de lo previsto, te avisamos antes de que tengas que preguntar.
        </p>
        <h3>Derecho de desistimiento</h3>
        <p>
          Tienes 14 días naturales desde que recibes el pedido para devolverlo sin dar motivos. Quedan excluidas las
          piezas personalizadas o hechas a medida, como prevé la ley. Te lo explicamos paso a paso en{' '}
          <Enlace href={rutas.devoluciones}>devoluciones</Enlace>.
        </p>
        <h3>Garantía</h3>
        <p>
          Tres años de garantía legal por falta de conformidad. Además, cualquier pieza nuestra que se suelte la
          arreglamos gratis, sin fecha de caducidad; solo pagas el envío de vuelta.
        </p>
        <h3>Reclamaciones</h3>
        <p>
          Escríbenos primero: casi todo se arregla hablando. Si no llegamos a un acuerdo, puedes acudir a la Junta Arbitral
          de Consumo o a los juzgados de tu domicilio.
        </p>
      </>
    ),
    revision: 'Última revisión: 8 de octubre de 2026.',
  },
  {
    en: {
      titulo: 'Legal information',
      descripcion:
        'Legal notice, privacy policy, cookies and terms of sale for Ovillo & Co., a demo shop: orders aren’t real and payments run in test mode.',
      miga: 'Legal information',
      etiqueta: 'The required bits, in plain words',
      cabecera: 'Legal information',
      entradilla: 'We’ve written it as short and clear as we could. If anything isn’t clear, just ask.',
      demo: () => (
        <>
          <b>This is a demo shop.</b> Ovillo &amp; Co. is a fictitious brand created by {autor('(opens in a new tab)')} to
          show how an online shop is built. Nothing is for sale, orders aren’t real and payments always run in test mode.
          The <span className="ficticio">highlighted</span> details are made up and the texts are examples: a real shop
          must adapt them to its own case with professional advice.
        </>
      ),
      secciones: 'Sections',
      indice: { aviso: 'Legal notice', privacidad: 'Privacy', cookies: 'Cookies', venta: 'Terms of sale' },

      avisoTitulo: 'Legal notice',
      aviso: () => (
        <>
          <p>
            In compliance with Spanish Law 34/2002 on Information Society Services and Electronic Commerce (LSSI), these
            are the details of the website owner:
          </p>
          <ul>
            <li>
              Owner: <FicticioEn>Ovillo &amp; Co. Taller Textil, S. L.</FicticioEn>
            </li>
            <li>
              Tax ID (NIF): <FicticioEn>B00000000</FicticioEn>
            </li>
            <li>
              Registered address: <FicticioEn>Calle Ejemplo, 0 · 29000 Málaga</FicticioEn>
            </li>
            <li>
              Registration: <FicticioEn>Registro Mercantil de Málaga, tomo 0000, folio 0, hoja MA-00000</FicticioEn>
            </li>
            <li>Email: {correo} (a domain reserved for examples; it doesn’t receive email)</li>
          </ul>
          <p>The website’s business is the sale of handmade crochet pieces, from the catalogue and made to order.</p>
          <h3>Intellectual property</h3>
          <p>
            The website’s texts and design belong to the owner. The photographs belong to their authors and are used under
            licence. You may share the content as long as you credit the source, but you may not copy it to sell the same
            thing. If you see something of yours here that shouldn’t be, write to us and we’ll take it down.
          </p>
          <h3>Liability</h3>
          <p>
            We take care to keep the information accurate, but there may be errors in prices or availability. If we spot a
            significant error in an order, we’ll let you know before taking payment and you can cancel it at no cost.
          </p>
        </>
      ),

      privacidadTitulo: 'Privacy policy',
      privacidad:
        'The data controller is the owner named in the legal notice. We process your data in accordance with the General Data Protection Regulation (GDPR) and Spanish Organic Law 3/2018 (LOPDGDD). We only ask for what we need to send your order and reply to you, and we never sell or share data with anyone for advertising.',
      datosTitulo: 'What data we process, why and for how long',
      datosTabla: 'Personal data: purpose and retention',
      datosColumnas: ['Data', 'What for', 'How long'],
      datos: [
        ['Name and address', 'Sending your order and issuing the invoice', 'As long as tax law requires (generally 6 years)'],
        ['Email address', 'Confirming your order, notifying you of dispatch and replying to you', 'While you have an account or for as long as our relationship lasts'],
        ['Phone number', 'So the courier can reach you', 'Same as the order'],
        ['Order history', 'So you can look it up and so we can keep our accounts', 'As long as tax law requires'],
        ['Messages and custom orders', 'Replying to you and preparing a quote', 'One year from our last contact'],
        ['Newsletter email', 'Sending you news, if you sign up', 'Until you unsubscribe'],
      ],
      privacidadResto: () => (
        <>
          <h3>Legal basis</h3>
          <p>
            Performance of the contract for orders; your consent for messages, custom orders and the newsletter (which you
            can withdraw whenever you like); and compliance with legal obligations for invoicing.
          </p>
          <h3>Who else sees it</h3>
          <ul>
            <li>
              <b>Stripe</b>, which processes payments. Card details go straight to Stripe; we never see or store them. In
              this demo it runs in test mode and nothing is charged.
            </li>
            <li>
              <b>Supabase</b>, which hosts the shop’s database.
            </li>
            <li>
              <b>The courier</b>, which receives your name, address and phone number to deliver your parcel.
            </li>
          </ul>
          <h3>Your rights</h3>
          <p>
            You can ask us for access to your data, to correct or erase it, to restrict or object to its use, and to take
            it to another service. Write to us at {correo} and we’ll reply within a month. If you think we haven’t handled
            it properly, you can complain to the Spanish Data Protection Agency (aepd.es).
          </p>
        </>
      ),

      cookiesTitulo: 'Cookies and local storage',
      cookies:
        'We use the bare minimum for the shop to work. There are no advertising or analytics cookies, and nothing is used to follow you around other websites; that’s why we don’t show you a banner asking you to accept them.',
      cookiesTabla: 'Cookies and local storage used by the website',
      cookiesColumnas: ['Name', 'What for', 'Type'],
      almacenamiento: [
        ['Remembering what you’ve put in your basket', 'Essential · local storage'],
        ['Remembering your favourites', 'Essential · local storage'],
        ['Stopping the announcement bar from jumping when you change page', 'Essential · local storage'],
        ['Keeping you signed in to your account', 'Essential · first-party cookie'],
        ['Preventing fraud on the payment page', 'Essential · third-party cookie'],
      ],
      cookiesBorrar:
        'You can delete or block them in your browser settings. If you block local storage, your basket and favourites will be forgotten when you close the tab.',

      ventaTitulo: 'Terms of sale',
      venta: () => (
        <>
          <p>
            Remember that this shop is a demo: no order creates a real contract. The terms below are the ones a shop like
            this would apply.
          </p>
          <h3>Prices</h3>
          <p>
            All prices are in euros and include VAT. Delivery is added separately and you’ll see it before you pay. If we
            change a price, it doesn’t affect orders already placed.
          </p>
          <h3>Payment</h3>
          <p>
            By card through Stripe. In this demo, payments are always in test mode: only Stripe test cards work and nothing
            is ever charged. Don’t enter the details of a real card.
          </p>
          <h3>When the contract exists</h3>
          <p>
            When you receive the order confirmation email. If a piece sells out at that very moment, we’ll let you know and
            refund it within 48 hours.
          </p>
          <h3>Delivery times</h3>
          <p>
            Those shown on each product page and on the <Enlace href={rutas.envios}>shipping</Enlace> page. If we’re going to
            take longer than expected, we’ll tell you before you have to ask.
          </p>
          <h3>Right of withdrawal</h3>
          <p>
            You have 14 calendar days from receiving your order to return it without giving a reason. Personalised or
            made-to-measure pieces are excluded, as the law provides. We explain it step by step under{' '}
            <Enlace href={rutas.devoluciones}>returns</Enlace>.
          </p>
          <h3>Guarantee</h3>
          <p>
            A three-year legal guarantee against lack of conformity. On top of that, we’ll repair any of our pieces that
            comes loose for free, with no expiry date; you only pay for the return postage.
          </p>
          <h3>Complaints</h3>
          <p>
            Write to us first: almost everything can be sorted out by talking. If we can’t reach an agreement, you can turn
            to the Consumer Arbitration Board (Junta Arbitral de Consumo) or the courts where you live.
          </p>
        </>
      ),
      revision: 'Last updated: 8 October 2026.',
    },
    fr: {
      titulo: 'Informations légales',
      descripcion:
        'Mentions légales, politique de confidentialité, cookies et conditions de vente d’Ovillo & Co., une boutique de démonstration : les commandes ne sont pas réelles et le paiement fonctionne en mode test.',
      miga: 'Informations légales',
      etiqueta: 'L’obligatoire, en clair',
      cabecera: 'Informations légales',
      entradilla: 'Nous l’avons écrit aussi court et clair que possible. Si quelque chose n’est pas compréhensible, demandez-nous.',
      demo: () => (
        <>
          <b>Ceci est une boutique de démonstration.</b> Ovillo &amp; Co. est une marque fictive créée par{' '}
          {autor('(s’ouvre dans un nouvel onglet)')} pour montrer comment se construit une boutique en ligne. Rien n’est
          vendu, les commandes ne sont pas réelles et le paiement fonctionne toujours en mode test. Les données{' '}
          <span className="ficticio">surlignées</span> sont inventées et les textes servent d’exemple{' '}: une vraie
          boutique doit les adapter à sa situation avec l’aide d’un professionnel.
        </>
      ),
      secciones: 'Sections',
      indice: {
        aviso: 'Mentions légales',
        privacidad: 'Confidentialité',
        cookies: 'Cookies',
        venta: 'Conditions de vente',
      },

      avisoTitulo: 'Mentions légales',
      aviso: () => (
        <>
          <p>
            Conformément à la loi espagnole 34/2002 sur les services de la société de l’information et le commerce
            électronique (LSSI), voici les informations relatives au titulaire du site{' '}:
          </p>
          <ul>
            <li>
              Titulaire{' '}: <FicticioFr>Ovillo &amp; Co. Taller Textil, S. L.</FicticioFr>
            </li>
            <li>
              NIF (numéro fiscal){' '}: <FicticioFr>B00000000</FicticioFr>
            </li>
            <li>
              Siège{' '}: <FicticioFr>Calle Ejemplo, 0 · 29000 Málaga</FicticioFr>
            </li>
            <li>
              Immatriculation{' '}:{' '}
              <FicticioFr>Registro Mercantil de Málaga, tomo 0000, folio 0, hoja MA-00000</FicticioFr>
            </li>
            <li>
              E-mail{' '}: {correo} (domaine réservé aux exemples, il ne reçoit pas de courrier)
            </li>
          </ul>
          <p>L’activité du site est la vente de pièces au crochet faites main, du catalogue et sur commande.</p>
          <h3>Propriété intellectuelle</h3>
          <p>
            Les textes et le design du site appartiennent au titulaire. Les photographies appartiennent à leurs auteurs et
            sont utilisées sous licence. Vous pouvez partager le contenu en citant la source, mais pas le copier pour vendre
            la même chose. Si vous voyez ici quelque chose qui vous appartient et qui ne devrait pas y être, écrivez-nous et
            nous le retirerons.
          </p>
          <h3>Responsabilité</h3>
          <p>
            Nous veillons à ce que les informations soient exactes, mais il peut y avoir des erreurs de prix ou de
            disponibilité. Si nous détectons une erreur importante dans une commande, nous vous prévenons avant de débiter
            et vous pouvez l’annuler sans frais.
          </p>
        </>
      ),

      privacidadTitulo: 'Politique de confidentialité',
      privacidad:
        'Le responsable du traitement est le titulaire indiqué dans les mentions légales. Nous traitons vos données conformément au Règlement général sur la protection des données (RGPD) et à la loi organique espagnole 3/2018 (LOPDGDD). Nous ne demandons que ce qui est nécessaire pour vous envoyer votre commande et vous répondre, et nous ne vendons ni ne cédons de données à qui que ce soit à des fins publicitaires.',
      datosTitulo: 'Quelles données nous traitons, pourquoi et pendant combien de temps',
      datosTabla: 'Données personnelles : finalité et conservation',
      datosColumnas: ['Donnée', 'Pour quoi faire', 'Combien de temps'],
      datos: [
        ['Nom et adresse', 'Vous envoyer la commande et émettre la facture', 'Ce qu’exige la réglementation fiscale (en général, 6 ans)'],
        ['Adresse e-mail', 'Confirmer la commande, vous prévenir de l’envoi et vous répondre', 'Tant que vous avez un compte ou que dure la relation'],
        ['Téléphone', 'Permettre au transporteur de vous joindre', 'Comme la commande'],
        ['Historique des commandes', 'Vous permettre de le consulter et tenir la comptabilité', 'Ce qu’exige la réglementation fiscale'],
        ['Messages et commandes sur mesure', 'Vous répondre et préparer le devis', 'Un an après le dernier contact'],
        ['E-mail de la newsletter', 'Vous envoyer nos nouveautés, si vous vous inscrivez', 'Jusqu’à votre désinscription'],
      ],
      privacidadResto: () => (
        <>
          <h3>Base légale</h3>
          <p>
            L’exécution du contrat pour les commandes{' '}; votre consentement pour les messages, les commandes sur
            mesure et la newsletter (que vous pouvez retirer quand vous le souhaitez){' '}; et le respect des
            obligations légales pour la facturation.
          </p>
          <h3>Qui d’autre y a accès</h3>
          <ul>
            <li>
              <b>Stripe</b>, qui traite les paiements. Les données de carte vont directement à Stripe{' '}; nous ne les
              voyons pas et ne les conservons pas. Dans cette démonstration, il fonctionne en mode test et rien n’est débité.
            </li>
            <li>
              <b>Supabase</b>, qui héberge la base de données de la boutique.
            </li>
            <li>
              <b>Le transporteur</b>, qui reçoit votre nom, votre adresse et votre téléphone pour vous livrer le colis.
            </li>
          </ul>
          <h3>Vos droits</h3>
          <p>
            Vous pouvez nous demander l’accès à vos données, leur rectification ou leur effacement, limiter leur utilisation
            ou vous y opposer, et les transférer vers un autre service. Écrivez-nous à {correo} et nous vous répondrons en
            moins d’un mois. Si vous estimez que nous n’avons pas bien fait les choses, vous pouvez saisir l’Agence espagnole
            de protection des données (aepd.es).
          </p>
        </>
      ),

      cookiesTitulo: 'Cookies et stockage local',
      cookies:
        'Nous utilisons le strict minimum pour que la boutique fonctionne. Il n’y a pas de cookies publicitaires ni de mesure d’audience, et rien ne sert à vous suivre sur d’autres sites ; c’est pourquoi nous ne vous affichons pas de bandeau pour les accepter.',
      cookiesTabla: 'Cookies et stockage local utilisés par le site',
      cookiesColumnas: ['Nom', 'Pour quoi faire', 'Type'],
      almacenamiento: [
        ['Se souvenir de ce que vous avez mis dans votre panier', 'Technique · stockage local'],
        ['Se souvenir de vos favoris', 'Technique · stockage local'],
        ['Éviter que le bandeau d’annonces ne saute quand vous changez de page', 'Technique · stockage local'],
        ['Maintenir votre session si vous vous connectez à votre compte', 'Technique · cookie propriétaire'],
        ['Prévenir la fraude sur la page de paiement', 'Technique · cookie tiers'],
      ],
      cookiesBorrar:
        'Vous pouvez les supprimer ou les bloquer dans les réglages de votre navigateur. Si vous bloquez le stockage local, le panier et les favoris seront oubliés à la fermeture de l’onglet.',

      ventaTitulo: 'Conditions de vente',
      venta: () => (
        <>
          <p>
            Rappelez-vous que cette boutique est une démonstration{' '}: aucune commande ne crée de contrat réel. Les
            conditions ci-dessous sont celles qu’appliquerait une boutique comme celle-ci.
          </p>
          <h3>Prix</h3>
          <p>
            Tous les prix sont en euros, TVA comprise. La livraison s’ajoute à part et vous la voyez avant de payer. Si nous
            modifions un prix, cela n’affecte pas les commandes déjà passées.
          </p>
          <h3>Paiement</h3>
          <p>
            Par carte via Stripe. Dans cette démonstration, le paiement est toujours en mode test{' '}: seules les
            cartes de test de Stripe fonctionnent et rien n’est jamais débité. Ne saisissez pas les données d’une vraie
            carte.
          </p>
          <h3>Formation du contrat</h3>
          <p>
            À la réception de l’e-mail de confirmation de commande. Si une pièce est épuisée à ce moment précis, nous vous
            prévenons et vous remboursons son montant sous 48{' '}heures.
          </p>
          <h3>Délais de livraison</h3>
          <p>
            Ceux indiqués sur la fiche de chaque pièce et sur la page <Enlace href={rutas.envios}>livraison</Enlace>. Si
            nous devons mettre plus de temps que prévu, nous vous prévenons avant que vous n’ayez à le demander.
          </p>
          <h3>Droit de rétractation</h3>
          <p>
            Vous disposez de 14{' '}jours calendaires à compter de la réception de votre commande pour la retourner
            sans donner de motif. Les pièces personnalisées ou réalisées sur mesure en sont exclues, comme le prévoit la
            loi. Nous vous l’expliquons étape par étape dans <Enlace href={rutas.devoluciones}>retours</Enlace>.
          </p>
          <h3>Garantie</h3>
          <p>
            Trois ans de garantie légale de conformité. En plus, nous réparons gratuitement toute pièce de chez nous qui se
            défait, sans date limite{' '}; vous ne payez que le renvoi.
          </p>
          <h3>Réclamations</h3>
          <p>
            Écrivez-nous d’abord{' '}: presque tout s’arrange en discutant. Si nous ne parvenons pas à un accord, vous
            pouvez vous adresser à la commission d’arbitrage de la consommation (Junta Arbitral de Consumo) ou aux tribunaux
            de votre domicile.
          </p>
        </>
      ),
      revision: 'Dernière mise à jour : 8 octobre 2026.',
    },
    de: {
      titulo: 'Rechtliche Hinweise',
      descripcion:
        'Impressum, Datenschutzerklärung, Cookies und Verkaufsbedingungen von Ovillo & Co., einem Demo-Shop: Die Bestellungen sind nicht echt, und die Zahlung läuft im Testmodus.',
      miga: 'Rechtliche Hinweise',
      etiqueta: 'Das Pflichtprogramm, verständlich',
      cabecera: 'Rechtliche Hinweise',
      entradilla: 'Wir haben es so kurz und klar geschrieben, wie wir konnten. Wenn etwas unverständlich ist, fragen Sie uns.',
      demo: () => (
        <>
          <b>Dies ist ein Demo-Shop.</b> Ovillo &amp; Co. ist eine fiktive Marke, erstellt von{' '}
          {autor('(öffnet in neuem Tab)')}, um zu zeigen, wie ein Onlineshop gebaut wird. Es wird nichts verkauft, die
          Bestellungen sind nicht echt, und die Zahlung läuft immer im Testmodus. Die{' '}
          <span className="ficticio">hervorgehobenen</span> Angaben sind erfunden, und die Texte dienen als Beispiel: Ein
          echter Shop muss sie mit fachlicher Beratung an den eigenen Fall anpassen.
        </>
      ),
      secciones: 'Abschnitte',
      indice: { aviso: 'Impressum', privacidad: 'Datenschutz', cookies: 'Cookies', venta: 'Verkaufsbedingungen' },

      avisoTitulo: 'Impressum',
      aviso: () => (
        <>
          <p>
            Gemäß dem spanischen Gesetz 34/2002 über Dienste der Informationsgesellschaft und den elektronischen
            Geschäftsverkehr (LSSI) sind dies die Angaben zum Betreiber der Website:
          </p>
          <ul>
            <li>
              Betreiber: <FicticioDe>Ovillo &amp; Co. Taller Textil, S. L.</FicticioDe>
            </li>
            <li>
              Steuernummer (NIF): <FicticioDe>B00000000</FicticioDe>
            </li>
            <li>
              Anschrift: <FicticioDe>Calle Ejemplo, 0 · 29000 Málaga</FicticioDe>
            </li>
            <li>
              Registereintrag: <FicticioDe>Registro Mercantil de Málaga, tomo 0000, folio 0, hoja MA-00000</FicticioDe>
            </li>
            <li>E-Mail: {correo} (für Beispiele reservierte Domain, empfängt keine E-Mails)</li>
          </ul>
          <p>Gegenstand der Website ist der Verkauf handgehäkelter Stücke, aus dem Katalog und als Auftragsarbeit.</p>
          <h3>Urheberrecht</h3>
          <p>
            Texte und Gestaltung der Website gehören dem Betreiber. Die Fotos gehören ihren Urhebern und werden mit deren
            Lizenz verwendet. Sie dürfen die Inhalte mit Quellenangabe teilen, aber nicht kopieren, um dasselbe zu
            verkaufen. Wenn Sie hier etwas von sich sehen, das nicht hier sein sollte, schreiben Sie uns, und wir entfernen
            es.
          </p>
          <h3>Haftung</h3>
          <p>
            Wir achten darauf, dass die Angaben stimmen, es kann aber Fehler bei Preisen oder Verfügbarkeit geben. Wenn wir
            einen wesentlichen Fehler in einer Bestellung bemerken, informieren wir Sie vor der Abbuchung, und Sie können
            sie kostenlos stornieren.
          </p>
        </>
      ),

      privacidadTitulo: 'Datenschutzerklärung',
      privacidad:
        'Verantwortlicher für die Verarbeitung ist der im Impressum genannte Betreiber. Wir verarbeiten Ihre Daten gemäß der Datenschutz-Grundverordnung (DSGVO) und dem spanischen Organgesetz 3/2018 (LOPDGDD). Wir fragen nur, was wir brauchen, um Ihnen die Bestellung zu schicken und Ihnen zu antworten, und wir verkaufen oder übermitteln keine Daten an Dritte zu Werbezwecken.',
      datosTitulo: 'Welche Daten wir verarbeiten, wozu und wie lange',
      datosTabla: 'Personenbezogene Daten: Zweck und Speicherdauer',
      datosColumnas: ['Daten', 'Wozu', 'Wie lange'],
      datos: [
        ['Name und Anschrift', 'Versand der Bestellung und Ausstellung der Rechnung', 'Solange das Steuerrecht es verlangt (in der Regel 6 Jahre)'],
        ['E-Mail-Adresse', 'Bestellbestätigung, Versandbenachrichtigung und Antworten', 'Solange Sie ein Konto haben oder die Geschäftsbeziehung besteht'],
        ['Telefonnummer', 'Damit der Versanddienstleister Sie erreichen kann', 'Wie die Bestellung'],
        ['Bestellverlauf', 'Damit Sie ihn einsehen können und für die Buchhaltung', 'Solange das Steuerrecht es verlangt'],
        ['Nachrichten und Auftragsarbeiten', 'Ihnen antworten und ein Angebot erstellen', 'Ein Jahr ab dem letzten Kontakt'],
        ['E-Mail für den Newsletter', 'Ihnen Neuigkeiten schicken, wenn Sie sich anmelden', 'Bis Sie sich abmelden'],
      ],
      privacidadResto: () => (
        <>
          <h3>Rechtsgrundlage</h3>
          <p>
            Die Vertragserfüllung bei Bestellungen; Ihre Einwilligung bei Nachrichten, Auftragsarbeiten und dem Newsletter
            (die Sie jederzeit widerrufen können); und die Erfüllung gesetzlicher Pflichten bei der Rechnungsstellung.
          </p>
          <h3>Wer die Daten noch sieht</h3>
          <ul>
            <li>
              <b>Stripe</b>, das die Zahlungen abwickelt. Kartendaten gehen direkt an Stripe; wir sehen und speichern sie
              nicht. In dieser Demo läuft es im Testmodus, und es wird nichts abgebucht.
            </li>
            <li>
              <b>Supabase</b>, das die Datenbank des Shops hostet.
            </li>
            <li>
              <b>Der Versanddienstleister</b>, der Ihren Namen, Ihre Anschrift und Telefonnummer erhält, um Ihnen das Paket
              zuzustellen.
            </li>
          </ul>
          <h3>Ihre Rechte</h3>
          <p>
            Sie können Auskunft über Ihre Daten, deren Berichtigung oder Löschung verlangen, ihre Verarbeitung einschränken
            oder ihr widersprechen und sie zu einem anderen Dienst mitnehmen. Schreiben Sie uns an {correo}, und wir
            antworten innerhalb eines Monats. Wenn Sie meinen, dass wir etwas nicht richtig gemacht haben, können Sie sich bei
            der spanischen Datenschutzbehörde (aepd.es) beschweren.
          </p>
        </>
      ),

      cookiesTitulo: 'Cookies und lokaler Speicher',
      cookies:
        'Wir verwenden nur das Nötigste, damit der Shop funktioniert. Es gibt keine Werbe- oder Analyse-Cookies, und nichts dient dazu, Sie auf anderen Websites zu verfolgen; deshalb zeigen wir Ihnen auch kein Banner zum Zustimmen.',
      cookiesTabla: 'Cookies und lokaler Speicher dieser Website',
      cookiesColumnas: ['Name', 'Wozu', 'Art'],
      almacenamiento: [
        ['Merkt sich, was Sie in den Warenkorb gelegt haben', 'Technisch notwendig · lokaler Speicher'],
        ['Merkt sich Ihre Favoriten', 'Technisch notwendig · lokaler Speicher'],
        ['Verhindert, dass die Hinweisleiste beim Seitenwechsel springt', 'Technisch notwendig · lokaler Speicher'],
        ['Hält Sie angemeldet, wenn Sie Ihr Konto nutzen', 'Technisch notwendig · eigenes Cookie'],
        ['Beugt Betrug auf der Zahlungsseite vor', 'Technisch notwendig · Drittanbieter-Cookie'],
      ],
      cookiesBorrar:
        'Sie können sie in den Einstellungen Ihres Browsers löschen oder blockieren. Wenn Sie den lokalen Speicher blockieren, werden Warenkorb und Favoriten beim Schließen des Tabs vergessen.',

      ventaTitulo: 'Verkaufsbedingungen',
      venta: () => (
        <>
          <p>
            Denken Sie daran, dass dieser Shop eine Demo ist: Keine Bestellung begründet einen echten Vertrag. Die folgenden
            Bedingungen sind die, die ein Shop wie dieser anwenden würde.
          </p>
          <h3>Preise</h3>
          <p>
            Alle Preise verstehen sich in Euro inklusive Mehrwertsteuer. Der Versand kommt gesondert hinzu und wird Ihnen vor
            dem Bezahlen angezeigt. Wenn wir einen Preis ändern, betrifft das bereits aufgegebene Bestellungen nicht.
          </p>
          <h3>Zahlung</h3>
          <p>
            Per Karte über Stripe. In dieser Demo läuft die Zahlung immer im Testmodus: Es funktionieren nur die Testkarten
            von Stripe, und es wird nie etwas abgebucht. Geben Sie keine echten Kartendaten ein.
          </p>
          <h3>Wann der Vertrag zustande kommt</h3>
          <p>
            Wenn Sie die Bestellbestätigung per E-Mail erhalten. Ist ein Stück genau in diesem Moment ausverkauft, sagen wir
            Ihnen Bescheid und erstatten den Betrag innerhalb von 48 Stunden.
          </p>
          <h3>Lieferzeiten</h3>
          <p>
            Die auf der Produktseite jedes Stücks und auf der Seite <Enlace href={rutas.envios}>Versand</Enlace> angegebenen.
            Wenn es länger dauert als geplant, melden wir uns, bevor Sie nachfragen müssen.
          </p>
          <h3>Widerrufsrecht</h3>
          <p>
            Sie haben ab Erhalt der Bestellung 14 Kalendertage Zeit, sie ohne Angabe von Gründen zurückzuschicken.
            Ausgenommen sind personalisierte oder maßgefertigte Stücke, wie es das Gesetz vorsieht. Wie es Schritt für
            Schritt geht, erklären wir unter <Enlace href={rutas.devoluciones}>Rücksendungen</Enlace>.
          </p>
          <h3>Gewährleistung</h3>
          <p>
            Drei Jahre gesetzliche Gewährleistung bei Vertragswidrigkeit. Außerdem reparieren wir jedes unserer Stücke, das
            sich löst, kostenlos und ohne Ablaufdatum; Sie zahlen nur den Rückversand.
          </p>
          <h3>Beschwerden</h3>
          <p>
            Schreiben Sie uns zuerst: Fast alles lässt sich im Gespräch klären. Wenn wir uns nicht einigen, können Sie sich an
            die Verbraucherschlichtungsstelle (Junta Arbitral de Consumo) oder an die Gerichte an Ihrem Wohnort wenden.
          </p>
        </>
      ),
      revision: 'Zuletzt aktualisiert: 8. Oktober 2026.',
    },
  },
);
