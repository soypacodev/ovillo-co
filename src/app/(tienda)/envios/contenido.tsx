// Textos de «Envíos y devoluciones».

import type { ReactNode } from 'react';
import { textos } from '@/lib/i18n';

export const T = textos(
  {
    titulo: 'Envíos y devoluciones',
    descripcion:
      'Precios y plazos de envío de Ovillo & Co., envío gratis, seguimiento del paquete, devoluciones en 14 días y arreglos gratuitos. Sin letra pequeña.',
    miga: 'Envíos y devoluciones',
    etiqueta: 'Sin letra pequeña',
    cabecera: 'Envíos y devoluciones',
    entradilla:
      'Lo que cuesta, lo que tarda y cómo se devuelve, escrito claro. Si algo no te cuadra, pregúntanos antes de pedir.',

    preciosTitulo: 'Cuánto cuesta y cuánto tarda',
    tablaOculta: 'Métodos de envío con su plazo y su precio',
    metodo: 'Método',
    plazo: 'Plazo',
    precio: 'Precio',
    gratis: 'Gratis',
    gratisDesde: (importe: string) => `gratis desde ${importe}`,
    umbral: (importe: string, metodo: string) => (
      <>
        <b>Envío gratis a partir de {importe}</b> con {metodo.toLowerCase()}. Se aplica solo en la cesta, sin código, y
        cuenta lo que pagas por las piezas después de rebajas y códigos: si un código de descuento te deja por debajo, la
        cesta te avisa de cuánto falta.
      </>
    ),
    plazosNota:
      'Los plazos cuentan desde que el paquete sale del taller, no desde que pagas. Si tu pedido lleva piezas por encargo, el reloj empieza cuando terminamos de tejerlas.',

    zonasTitulo: 'A dónde llegamos',
    zonas: [
      { titulo: 'Península y Baleares', texto: 'Con los precios de la tabla. A Baleares puede tardar un día más.' },
      {
        titulo: 'Canarias, Ceuta y Melilla',
        texto: 'El coste es distinto y puede haber trámites de aduana. Escríbenos antes y te damos el precio exacto.',
      },
      { titulo: 'Resto de Europa', texto: 'Caso por caso, según el peso y el país. Pregúntanos antes de hacer el pedido.' },
    ],
    recogida: 'Gratis, en Málaga. Al pagar eliges la recogida y quedamos contigo en un horario que te venga bien.',

    tiposTitulo: 'Por qué a veces tardamos más',
    tiposTexto: 'En la tienda hay dos tipos de pieza, y la ficha siempre dice cuál es:',
    listo: 'Listo para enviar',
    listoTitulo: 'Ya está tejido',
    listoTexto: 'Está en la estantería, envuelto y esperando. Sale del taller en 24–48 horas laborables.',
    alPedir: 'Se teje al pedir',
    alPedirTitulo: 'Lo tejemos para ti',
    alPedirTexto: 'Entre 7 y 14 días según la pieza; la ficha dice cuántos. Te escribimos cuando lo empezamos y cuando sale.',
    mezcla:
      'Si mezclas los dos tipos en un pedido, sale todo junto cuando esté la pieza más lenta. Si prefieres recibir antes lo que ya está hecho, dínoslo en la nota del pedido y lo separamos sin cobrarte un segundo envío.',

    seguimientoTitulo: 'Cómo sabes dónde está',
    seguimiento: [
      'Al pagar te llega un correo de confirmación con el número de pedido.',
      'Si hay piezas por encargo, te avisamos el día que empezamos a tejerlas.',
      'Cuando el paquete sale del taller, te mandamos el número de seguimiento de Correos.',
      'Con ese número ves en la web de Correos dónde está, en cualquier momento.',
    ],
    seguimientoNota:
      'Si pasan cinco días desde el aviso de envío y no ha llegado, escríbenos. Suele estar esperando en la oficina, pero la reclamación la ponemos nosotros.',

    devolucionesTitulo: 'Devoluciones y cambios',
    devolucionesTexto: () => (
      <>
        Tienes <b>14 días naturales</b> desde que recibes el paquete para devolverlo sin dar explicaciones. Es tu derecho,
        y nos parece justo.
      </>
    ),
    siDevolver: 'Se puede devolver',
    noDevolver: 'No se puede devolver',
    si: [
      'Cualquier pieza del catálogo sin personalizar',
      'Piezas sin usar y sin lavar',
      'Packs completos, con todo lo que llevaban',
      'Piezas con un defecto de fabricación, siempre',
    ],
    no: [
      'Piezas con nombres, iniciales o fechas bordadas',
      'Encargos tejidos a medida desde cero',
      'Piezas lavadas o con señales claras de uso',
    ],
    comoTitulo: 'Cómo se hace',
    como: [
      'Nos escribes diciendo qué quieres devolver (el motivo es opcional).',
      'Te contestamos en menos de 24 horas laborables con la dirección de vuelta.',
      'Lo mandas por Correos, bien envuelto para que no llegue aplastado.',
      'Al recibirlo lo revisamos y te devolvemos el dinero en 3–5 días, por el mismo medio de pago.',
    ],
    vuelta: (condiciones: (texto: string) => ReactNode) => (
      <>
        El envío de vuelta corre de tu cuenta, salvo si la pieza llegó con un defecto o nos equivocamos nosotros: en ese
        caso lo pagamos todo. Más detalles en las {condiciones('condiciones de venta')}.
      </>
    ),

    roturasTitulo: 'Si llega roto o se estropea después',
    roturas: () => (
      <>
        <p>
          <b>Llegó mal:</b> mándanos una foto en los dos días siguientes y te enviamos otra pieza o te devolvemos el dinero,
          lo que prefieras.
        </p>
        <p>
          <b>Se ha soltado un hilo dos años después:</b> te lo arreglamos gratis. Nos lo mandas, lo repasamos y te lo
          devolvemos; solo pagas el envío de vuelta. Esto no caduca.
        </p>
      </>
    ),

    otrasPreguntas: 'Otras preguntas',
    preguntas: [
      {
        p: '¿Puedo cambiar la dirección después de pagar?',
        r: 'Sí, mientras el paquete no haya salido del taller. Escríbenos con el número de pedido y la dirección nueva y lo cambiamos.',
      },
      {
        p: '¿Qué pasa si no estoy en casa cuando llega?',
        r: 'Correos deja un aviso y el paquete espera en tu oficina durante quince días. Si vuelve al taller, te lo reenviamos pagando solo el segundo envío.',
      },
      {
        p: '¿Puedo pedir que lo envolváis para regalo?',
        r: 'Todo sale envuelto en papel de seda. Si es un regalo, márcalo al pagar: no incluimos el precio y añadimos la dedicatoria escrita a mano.',
      },
      {
        p: '¿Enviáis a Canarias, Ceuta, Melilla o fuera de España?',
        r: 'De momento, solo a la península y Baleares. Si estás en otro sitio, escríbenos antes de pedir y vemos el coste y los trámites.',
      },
    ],

    cierreTitulo: '¿Alguna duda con tu envío?',
    escribirnos: 'Escribirnos',
    cierreTexto: 'Dinos el número de pedido y lo miramos. Si escribes por la mañana, te contestamos en el día.',
  },
  {
    en: {
      titulo: 'Shipping and returns',
      descripcion:
        'Ovillo & Co. delivery prices and times, free delivery, parcel tracking, 14-day returns and free repairs. No small print.',
      miga: 'Shipping and returns',
      etiqueta: 'No small print',
      cabecera: 'Shipping and returns',
      entradilla:
        'What it costs, how long it takes and how to return it, written plainly. If anything doesn’t add up, ask us before you order.',

      preciosTitulo: 'What it costs and how long it takes',
      tablaOculta: 'Delivery methods with their timeframe and price',
      metodo: 'Method',
      plazo: 'Timeframe',
      precio: 'Price',
      gratis: 'Free',
      gratisDesde: (importe: string) => `free over ${importe}`,
      umbral: (importe: string, metodo: string) => (
        <>
          <b>Free delivery on orders over {importe}</b> with {metodo.toLowerCase()}. It’s applied automatically in the
          basket, no code needed, and counts what you pay for the items after sale prices and discount codes: if a discount
          code takes you below the threshold, the basket tells you how much more you need.
        </>
      ),
      plazosNota:
        'Delivery times start from when the parcel leaves the workshop, not from when you pay. If your order includes custom-made pieces, the clock starts when we finish making them.',

      zonasTitulo: 'Where we deliver',
      zonas: [
        {
          titulo: 'Mainland Spain and the Balearic Islands',
          texto: 'At the prices in the table. The Balearics may take an extra day.',
        },
        {
          titulo: 'Canary Islands, Ceuta and Melilla',
          texto: 'The cost is different and there may be customs formalities. Write to us first and we’ll give you the exact price.',
        },
        {
          titulo: 'Rest of Europe',
          texto: 'Case by case, depending on weight and country. Ask us before placing your order.',
        },
      ],
      recogida: 'Free, in Málaga. Choose collection at checkout and we’ll arrange a time that suits you.',

      tiposTitulo: 'Why we sometimes take longer',
      tiposTexto: 'There are two kinds of piece in the shop, and the product page always says which one it is:',
      listo: 'Ready to ship',
      listoTitulo: 'Already made',
      listoTexto: 'It’s on the shelf, wrapped and waiting. It leaves the workshop within 24–48 working hours.',
      alPedir: 'Made to order',
      alPedirTitulo: 'We make it for you',
      alPedirTexto:
        'Between 7 and 14 days depending on the piece; the product page says how many. We’ll write when we start and when it’s on its way.',
      mezcla:
        'If you mix both kinds in one order, everything ships together once the slowest piece is ready. If you’d rather receive what’s already made first, tell us in the order note and we’ll split it without charging for a second delivery.',

      seguimientoTitulo: 'How you know where it is',
      seguimiento: [
        'When you pay, you’ll get a confirmation email with your order number.',
        'If there are made-to-order pieces, we’ll let you know the day we start making them.',
        'When the parcel leaves the workshop, we send you the Correos tracking number.',
        'With that number you can see where it is on the Correos website, at any time.',
      ],
      seguimientoNota:
        'If five days go by after the dispatch notice and it hasn’t arrived, write to us. It’s usually waiting at the post office, but we’ll file the claim ourselves.',

      devolucionesTitulo: 'Returns and exchanges',
      devolucionesTexto: () => (
        <>
          You have <b>14 calendar days</b> from receiving the parcel to return it without giving a reason. It’s your right,
          and we think it’s fair.
        </>
      ),
      siDevolver: 'Can be returned',
      noDevolver: 'Can’t be returned',
      si: [
        'Any catalogue piece that hasn’t been personalised',
        'Unused, unwashed pieces',
        'Complete gift sets, with everything they came with',
        'Pieces with a manufacturing defect, always',
      ],
      no: [
        'Pieces with embroidered names, initials or dates',
        'Custom orders made to measure from scratch',
        'Pieces that have been washed or show clear signs of use',
      ],
      comoTitulo: 'How it works',
      como: [
        'You write to us saying what you’d like to return (giving a reason is optional).',
        'We reply within 24 working hours with the return address.',
        'You send it by Correos, well wrapped so it doesn’t arrive squashed.',
        'Once it arrives we check it and refund you within 3–5 days, using the same payment method.',
      ],
      vuelta: (condiciones: (texto: string) => ReactNode) => (
        <>
          Return postage is at your expense, unless the piece arrived with a defect or we made a mistake: in that case we pay
          for everything. More details in the {condiciones('terms of sale')}.
        </>
      ),

      roturasTitulo: 'If it arrives broken or gets damaged later',
      roturas: () => (
        <>
          <p>
            <b>It arrived damaged:</b> send us a photo within two days and we’ll send you another piece or refund you,
            whichever you prefer.
          </p>
          <p>
            <b>A thread has come loose two years later:</b> we’ll repair it for free. You send it to us, we fix it and send
            it back; you only pay for the return postage. This never expires.
          </p>
        </>
      ),

      otrasPreguntas: 'Other questions',
      preguntas: [
        {
          p: 'Can I change the address after paying?',
          r: 'Yes, as long as the parcel hasn’t left the workshop. Write to us with your order number and the new address and we’ll change it.',
        },
        {
          p: 'What happens if I’m not at home when it arrives?',
          r: 'Correos leaves a card and the parcel waits at your local post office for fifteen days. If it comes back to the workshop, we’ll resend it and you only pay for the second delivery.',
        },
        {
          p: 'Can I ask you to gift-wrap it?',
          r: 'Everything goes out wrapped in tissue paper. If it’s a gift, tick the box at checkout: we leave out the price and add your message, handwritten.',
        },
        {
          p: 'Do you deliver to the Canary Islands, Ceuta, Melilla or outside Spain?',
          r: 'For now, only to mainland Spain and the Balearic Islands. If you’re somewhere else, write to us before ordering and we’ll look at the cost and paperwork.',
        },
      ],

      cierreTitulo: 'Any questions about your delivery?',
      escribirnos: 'Write to us',
      cierreTexto: 'Give us your order number and we’ll look into it. If you write in the morning, we’ll reply the same day.',
    },
    fr: {
      titulo: 'Livraison et retours',
      descripcion:
        'Tarifs et délais de livraison d’Ovillo & Co., livraison gratuite, suivi du colis, retours sous 14 jours et réparations gratuites. Sans petits caractères.',
      miga: 'Livraison et retours',
      etiqueta: 'Sans petits caractères',
      cabecera: 'Livraison et retours',
      entradilla:
        'Ce que ça coûte, combien de temps ça prend et comment retourner un article, écrit clairement. Si quelque chose ne vous semble pas clair, demandez-nous avant de commander.',

      preciosTitulo: 'Combien ça coûte et combien de temps ça prend',
      tablaOculta: 'Modes de livraison avec leur délai et leur prix',
      metodo: 'Mode',
      plazo: 'Délai',
      precio: 'Prix',
      gratis: 'Gratuit',
      gratisDesde: (importe: string) => `gratuit dès ${importe}`,
      umbral: (importe: string, metodo: string) => (
        <>
          <b>Livraison gratuite dès {importe}</b> en {metodo.toLowerCase()}. Elle s’applique automatiquement dans le
          panier, sans code, et tient compte de ce que vous payez pour les articles après soldes et codes{' '}: si un
          code de réduction vous fait passer en dessous, le panier vous indique combien il manque.
        </>
      ),
      plazosNota:
        'Les délais courent à partir du moment où le colis quitte l’atelier, pas du paiement. Si votre commande comprend des pièces sur commande, le compteur démarre quand nous avons fini de les réaliser.',

      zonasTitulo: 'Où nous livrons',
      zonas: [
        {
          titulo: 'Espagne péninsulaire et Baléares',
          texto: 'Aux tarifs du tableau. Pour les Baléares, comptez parfois un jour de plus.',
        },
        {
          titulo: 'Canaries, Ceuta et Melilla',
          texto: 'Le coût est différent et il peut y avoir des formalités de douane. Écrivez-nous avant et nous vous donnerons le prix exact.',
        },
        {
          titulo: 'Reste de l’Europe',
          texto: 'Au cas par cas, selon le poids et le pays. Demandez-nous avant de passer commande.',
        },
      ],
      recogida: 'Gratuit, à Málaga. Choisissez le retrait au moment de payer et nous convenons d’un horaire qui vous arrange.',

      tiposTitulo: 'Pourquoi nous mettons parfois plus de temps',
      tiposTexto: 'Il y a deux types de pièces dans la boutique, et la fiche indique toujours de quel type il s’agit :',
      listo: 'Prêt à expédier',
      listoTitulo: 'Déjà réalisé',
      listoTexto: 'Il est sur l’étagère, emballé, et il attend. Il quitte l’atelier sous 24 à 48 heures ouvrées.',
      alPedir: 'Tricoté à la commande',
      alPedirTitulo: 'Nous le réalisons pour vous',
      alPedirTexto:
        'Entre 7 et 14 jours selon la pièce ; la fiche indique combien. Nous vous écrivons quand nous commençons et quand le colis part.',
      mezcla:
        'Si vous mélangez les deux types dans une commande, tout part ensemble quand la pièce la plus longue est prête. Si vous préférez recevoir d’abord ce qui est déjà fait, dites-le-nous dans la note de commande et nous séparons l’envoi sans vous facturer une seconde livraison.',

      seguimientoTitulo: 'Comment savoir où il en est',
      seguimiento: [
        'Au paiement, vous recevez un e-mail de confirmation avec le numéro de commande.',
        'S’il y a des pièces sur commande, nous vous prévenons le jour où nous commençons à les réaliser.',
        'Quand le colis quitte l’atelier, nous vous envoyons le numéro de suivi Correos.',
        'Avec ce numéro, vous voyez à tout moment où il se trouve sur le site de Correos.',
      ],
      seguimientoNota:
        'Si cinq jours passent après l’avis d’expédition et qu’il n’est pas arrivé, écrivez-nous. Il attend généralement au bureau de poste, mais c’est nous qui faisons la réclamation.',

      devolucionesTitulo: 'Retours et échanges',
      devolucionesTexto: () => (
        <>
          Vous disposez de <b>14{' '}jours calendaires</b> à compter de la réception du colis pour le retourner sans
          avoir à vous justifier. C’est votre droit, et nous trouvons cela juste.
        </>
      ),
      siDevolver: 'Peut être retourné',
      noDevolver: 'Ne peut pas être retourné',
      si: [
        'Toute pièce du catalogue non personnalisée',
        'Les pièces non utilisées et non lavées',
        'Les coffrets complets, avec tout ce qu’ils contenaient',
        'Les pièces présentant un défaut de fabrication, toujours',
      ],
      no: [
        'Les pièces avec prénoms, initiales ou dates brodés',
        'Les commandes sur mesure réalisées de zéro',
        'Les pièces lavées ou présentant des signes évidents d’usage',
      ],
      comoTitulo: 'Comment faire',
      como: [
        'Vous nous écrivez pour nous dire ce que vous souhaitez retourner (le motif est facultatif).',
        'Nous vous répondons en moins de 24 heures ouvrées avec l’adresse de retour.',
        'Vous l’envoyez par Correos, bien emballé pour qu’il n’arrive pas écrasé.',
        'À réception, nous le vérifions et vous remboursons sous 3 à 5 jours, avec le même moyen de paiement.',
      ],
      vuelta: (condiciones: (texto: string) => ReactNode) => (
        <>
          Les frais de retour sont à votre charge, sauf si la pièce est arrivée avec un défaut ou si nous nous sommes
          trompés{' '}: dans ce cas, nous payons tout. Plus de détails dans les {condiciones('conditions de vente')}.
        </>
      ),

      roturasTitulo: 'Si elle arrive abîmée ou s’abîme plus tard',
      roturas: () => (
        <>
          <p>
            <b>Arrivée en mauvais état{' '}:</b> envoyez-nous une photo dans les deux jours et nous vous envoyons une
            autre pièce ou vous remboursons, comme vous préférez.
          </p>
          <p>
            <b>Un fil s’est défait deux ans plus tard{' '}:</b> nous la réparons gratuitement. Vous nous l’envoyez, nous
            la reprenons et vous la renvoyons{' '}; vous ne payez que le renvoi. Cela n’expire jamais.
          </p>
        </>
      ),

      otrasPreguntas: 'Autres questions',
      preguntas: [
        {
          p: 'Puis-je modifier l’adresse après avoir payé ?',
          r: 'Oui, tant que le colis n’a pas quitté l’atelier. Écrivez-nous avec le numéro de commande et la nouvelle adresse et nous la modifions.',
        },
        {
          p: 'Que se passe-t-il si je ne suis pas chez moi à la livraison ?',
          r: 'Correos laisse un avis de passage et le colis vous attend au bureau de poste pendant quinze jours. S’il revient à l’atelier, nous vous le renvoyons et vous ne payez que le second envoi.',
        },
        {
          p: 'Pouvez-vous faire un paquet cadeau ?',
          r: 'Tout part emballé dans du papier de soie. Si c’est un cadeau, indiquez-le au moment de payer : nous n’incluons pas le prix et ajoutons votre mot, écrit à la main.',
        },
        {
          p: 'Livrez-vous aux Canaries, à Ceuta, à Melilla ou hors d’Espagne ?',
          r: 'Pour l’instant, uniquement en Espagne péninsulaire et aux Baléares. Si vous êtes ailleurs, écrivez-nous avant de commander et nous regarderons le coût et les formalités.',
        },
      ],

      cierreTitulo: 'Une question sur votre livraison ?',
      escribirnos: 'Nous écrire',
      cierreTexto:
        'Donnez-nous le numéro de commande et nous regardons. Si vous écrivez le matin, nous vous répondons dans la journée.',
    },
    de: {
      titulo: 'Versand und Rücksendungen',
      descripcion:
        'Versandkosten und Lieferzeiten von Ovillo & Co., kostenloser Versand, Sendungsverfolgung, 14 Tage Rückgaberecht und kostenlose Reparaturen. Ohne Kleingedrucktes.',
      miga: 'Versand und Rücksendungen',
      etiqueta: 'Ohne Kleingedrucktes',
      cabecera: 'Versand und Rücksendungen',
      entradilla:
        'Was es kostet, wie lange es dauert und wie die Rücksendung funktioniert – klar und deutlich. Wenn Ihnen etwas unklar ist, fragen Sie uns vor der Bestellung.',

      preciosTitulo: 'Was es kostet und wie lange es dauert',
      tablaOculta: 'Versandarten mit Lieferzeit und Preis',
      metodo: 'Versandart',
      plazo: 'Lieferzeit',
      precio: 'Preis',
      gratis: 'Kostenlos',
      gratisDesde: (importe: string) => `kostenlos ab ${importe}`,
      umbral: (importe: string, metodo: string) => (
        <>
          <b>Kostenloser Versand ab {importe}</b> mit {metodo}. Er wird automatisch im Warenkorb berücksichtigt, ganz ohne
          Code, und zählt, was Sie nach Rabatten und Gutscheincodes für die Artikel bezahlen: Rutschen Sie durch einen
          Rabattcode darunter, zeigt Ihnen der Warenkorb, wie viel noch fehlt.
        </>
      ),
      plazosNota:
        'Die Lieferzeiten zählen ab dem Moment, in dem das Paket die Werkstatt verlässt, nicht ab der Zahlung. Enthält Ihre Bestellung Auftragsarbeiten, beginnt die Uhr zu laufen, sobald wir mit dem Häkeln fertig sind.',

      zonasTitulo: 'Wohin wir liefern',
      zonas: [
        {
          titulo: 'Spanisches Festland und Balearen',
          texto: 'Zu den Preisen aus der Tabelle. Auf die Balearen kann es einen Tag länger dauern.',
        },
        {
          titulo: 'Kanaren, Ceuta und Melilla',
          texto: 'Die Kosten sind anders, und es kann Zollformalitäten geben. Schreiben Sie uns vorher, dann nennen wir Ihnen den genauen Preis.',
        },
        {
          titulo: 'Übriges Europa',
          texto: 'Von Fall zu Fall, je nach Gewicht und Land. Fragen Sie uns, bevor Sie bestellen.',
        },
      ],
      recogida:
        'Kostenlos, in Málaga. Wählen Sie beim Bezahlen die Abholung, und wir vereinbaren eine Uhrzeit, die Ihnen passt.',

      tiposTitulo: 'Warum es manchmal länger dauert',
      tiposTexto: 'Im Shop gibt es zwei Arten von Stücken, und auf der Produktseite steht immer, welche es ist:',
      listo: 'Versandfertig',
      listoTitulo: 'Schon gehäkelt',
      listoTexto: 'Es liegt verpackt im Regal und wartet. Es verlässt die Werkstatt innerhalb von 24–48 Stunden an Werktagen.',
      alPedir: 'Wird auf Bestellung gehäkelt',
      alPedirTitulo: 'Wir häkeln es für Sie',
      alPedirTexto:
        'Je nach Stück zwischen 7 und 14 Tagen; wie viele, steht auf der Produktseite. Wir schreiben Ihnen, wenn wir anfangen und wenn es unterwegs ist.',
      mezcla:
        'Wenn Sie beide Arten in einer Bestellung kombinieren, geht alles zusammen raus, sobald das langsamste Stück fertig ist. Möchten Sie das bereits Fertige lieber vorab erhalten, schreiben Sie es in die Bestellnotiz – wir teilen die Sendung, ohne einen zweiten Versand zu berechnen.',

      seguimientoTitulo: 'So wissen Sie, wo Ihr Paket ist',
      seguimiento: [
        'Nach der Zahlung erhalten Sie eine Bestätigungs-E-Mail mit der Bestellnummer.',
        'Bei Auftragsarbeiten sagen wir Ihnen Bescheid, sobald wir mit dem Häkeln beginnen.',
        'Wenn das Paket die Werkstatt verlässt, schicken wir Ihnen die Sendungsnummer von Correos.',
        'Mit dieser Nummer sehen Sie jederzeit auf der Website von Correos, wo es gerade ist.',
      ],
      seguimientoNota:
        'Wenn fünf Tage nach der Versandbenachrichtigung nichts angekommen ist, schreiben Sie uns. Meist wartet das Paket in der Filiale, aber die Reklamation übernehmen wir.',

      devolucionesTitulo: 'Rücksendungen und Umtausch',
      devolucionesTexto: () => (
        <>
          Sie haben ab Erhalt des Pakets <b>14 Kalendertage</b> Zeit, es ohne Angabe von Gründen zurückzuschicken. Das ist
          Ihr Recht, und wir finden das fair.
        </>
      ),
      siDevolver: 'Rückgabe möglich',
      noDevolver: 'Keine Rückgabe möglich',
      si: [
        'Jedes nicht personalisierte Katalogstück',
        'Ungetragene und ungewaschene Stücke',
        'Vollständige Geschenksets mit allem, was dazugehörte',
        'Stücke mit einem Herstellungsfehler, immer',
      ],
      no: [
        'Stücke mit aufgestickten Namen, Initialen oder Daten',
        'Von Grund auf maßgefertigte Auftragsarbeiten',
        'Gewaschene Stücke oder solche mit deutlichen Gebrauchsspuren',
      ],
      comoTitulo: 'So geht’s',
      como: [
        'Sie schreiben uns, was Sie zurückschicken möchten (einen Grund müssen Sie nicht angeben).',
        'Wir antworten innerhalb von 24 Stunden an Werktagen mit der Rücksendeadresse.',
        'Sie schicken es mit Correos, gut verpackt, damit es nicht zerdrückt ankommt.',
        'Sobald es da ist, prüfen wir es und erstatten Ihnen das Geld innerhalb von 3–5 Tagen auf demselben Zahlungsweg.',
      ],
      vuelta: (condiciones: (texto: string) => ReactNode) => (
        <>
          Die Kosten der Rücksendung tragen Sie, es sei denn, das Stück kam mit einem Mangel an oder wir haben uns geirrt:
          Dann übernehmen wir alles. Mehr dazu in den {condiciones('Verkaufsbedingungen')}.
        </>
      ),

      roturasTitulo: 'Wenn es beschädigt ankommt oder später kaputtgeht',
      roturas: () => (
        <>
          <p>
            <b>Beschädigt angekommen:</b> Schicken Sie uns innerhalb von zwei Tagen ein Foto, und wir senden Ihnen ein
            neues Stück oder erstatten den Betrag – ganz wie Sie möchten.
          </p>
          <p>
            <b>Nach zwei Jahren hat sich ein Faden gelöst:</b> Wir reparieren es kostenlos. Sie schicken es uns, wir bessern
            es aus und senden es zurück; Sie zahlen nur den Rückversand. Das verfällt nie.
          </p>
        </>
      ),

      otrasPreguntas: 'Weitere Fragen',
      preguntas: [
        {
          p: 'Kann ich die Adresse nach dem Bezahlen noch ändern?',
          r: 'Ja, solange das Paket die Werkstatt noch nicht verlassen hat. Schreiben Sie uns die Bestellnummer und die neue Adresse, dann ändern wir sie.',
        },
        {
          p: 'Was passiert, wenn ich bei der Zustellung nicht zu Hause bin?',
          r: 'Correos hinterlässt eine Benachrichtigung, und das Paket wartet fünfzehn Tage in Ihrer Filiale. Geht es an die Werkstatt zurück, schicken wir es erneut, und Sie zahlen nur den zweiten Versand.',
        },
        {
          p: 'Können Sie es als Geschenk verpacken?',
          r: 'Alles wird in Seidenpapier verpackt verschickt. Wenn es ein Geschenk ist, markieren Sie das beim Bezahlen: Wir legen keinen Preis bei und fügen Ihre Widmung handgeschrieben hinzu.',
        },
        {
          p: 'Liefern Sie auf die Kanaren, nach Ceuta, Melilla oder ins Ausland?',
          r: 'Vorerst nur auf das spanische Festland und die Balearen. Wenn Sie woanders wohnen, schreiben Sie uns vor der Bestellung, und wir klären Kosten und Formalitäten.',
        },
      ],

      cierreTitulo: 'Fragen zu Ihrer Lieferung?',
      escribirnos: 'Schreiben Sie uns',
      cierreTexto: 'Nennen Sie uns die Bestellnummer, und wir sehen nach. Wenn Sie morgens schreiben, antworten wir noch am selben Tag.',
    },
  },
);
