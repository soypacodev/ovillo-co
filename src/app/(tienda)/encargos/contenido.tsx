// Textos de «Encargos a medida».

import { textos } from '@/lib/i18n';

export const T = textos(
  {
    titulo: 'Encargos a medida',
    descripcion:
      'Encarga una pieza de crochet a medida en Ovillo & Co.: amigurumis de mascotas, mantas personalizadas y packs de regalo. Presupuesto sin compromiso en 24–48 horas.',
    miga: 'Encargos',
    etiqueta: 'Encargos a medida',
    cabecera: 'Cuéntanos qué tienes en la cabeza',
    entradilla:
      'Un amigurumi de tu perro, la manta en el verde exacto de la habitación, un pack para una boda. Escríbenos y te contestamos en 24–48 horas con precio y plazo. Luego decides tú, sin ninguna presión.',
    formulario: 'Formulario de encargo',
    lateral: 'Cómo funcionan los encargos',
    comoVa: 'Cómo va esto',
    pasos: [
      'Nos mandas la idea, y fotos si las tienes, con este formulario.',
      'Te contestamos en 24–48 horas con precio, plazo y una propuesta de colores.',
      'Si te encaja, pagas la mitad y empezamos. La otra mitad, al terminar.',
      'Te mandamos fotos del avance; si algo no te convence, lo cambiamos antes de acabar.',
      'Te llega a casa, envuelto para regalo si nos lo pides.',
    ],
    preciosTitulo: 'Precios de referencia',
    preciosOculto: 'Precio orientativo de cada tipo de encargo',
    precios: [
      'Amigurumi pequeño (12–15 cm)',
      'Amigurumi mediano (20–25 cm)',
      'Amigurumi de mascota',
      'Mantita para el cochecito',
      'Manta grande',
      'Pack de regalo a medida',
    ],
    desde: (importe: string) => `desde ${importe}`,
    preciosNota: 'Son orientativos: el precio final depende del tamaño, el detalle y la lana.',
    agenda: 'Agenda',
    agendaTexto: () => (
      <>
        Ahora mismo empezamos encargos nuevos en unas <b>dos semanas</b>. Para Navidad, el último día para pedir es el{' '}
        <b>15 de noviembre</b>.
      </>
    ),
    ejemplosEtiqueta: 'Para que te hagas una idea',
    ejemplosTitulo: 'Encargos que hemos tejido',
    ejemplosNota: 'Ejemplos ilustrativos de una tienda de demostración.',
    ejemplos: [
      {
        alt: 'Osita de ganchillo con vestido lila y bufanda turquesa',
        titulo: 'Ositas para mellizas',
        texto: 'Dos ositas iguales salvo por el color del vestido, para no confundirlas a las tres de la mañana.',
        plazo: '10 días',
      },
      {
        alt: 'Manta de bebé de ganchillo en estrella, a ondas verde menta y crudo',
        titulo: 'La manta del verde de la pared',
        texto:
          'Mantita en estrella para el cochecito, con el verde exacto de la habitación. Nos mandaron una foto del bote de pintura.',
        plazo: '14 días',
      },
      {
        alt: 'Guirnalda infantil con corazón rosa de ganchillo, cuentas y eucalipto',
        titulo: 'Guirnalda para un bautizo',
        texto:
          'Corazones de ganchillo con cuentas de madera y el nombre bordado, para la pared de la habitación, fuera del alcance del bebé.',
        plazo: '8 días',
      },
    ],
    dudasEtiqueta: 'Antes de que preguntes',
    dudasTitulo: 'Dudas típicas de los encargos',
    dudas: [
      {
        p: '¿Cuánto tarda un encargo?',
        r: 'Entre una y tres semanas según la pieza, contando desde que pagas la señal. En las semanas antes de Navidad se alarga, y te lo decimos antes de empezar.',
      },
      {
        p: '¿Y si no me gusta el resultado?',
        r: 'Por eso te mandamos fotos durante el proceso: si algo no te encaja, lo cambiamos sin coste. Si ya está terminado y no te convence, te devolvemos la segunda mitad y nos quedamos la pieza.',
      },
      {
        p: '¿Podéis copiar algo que he visto en Pinterest?',
        r: 'Si es el diseño de una artesana identificable, no: no nos parece bien copiar su trabajo. Si es un tipo de pieza genérica, sin problema, y le damos nuestro toque.',
      },
      {
        p: '¿Cómo se paga un encargo?',
        r: 'La mitad al empezar y la otra mitad al terminar, con tarjeta a través de la propia tienda. Nunca te pediremos datos de pago por correo.',
      },
      {
        p: '¿Enviáis los encargos a toda España?',
        r: 'A la península y Baleares, con los mismos precios que el resto de la tienda. Si estás en Málaga, también puedes recogerlo en el taller.',
      },
      {
        p: '¿Hacéis 30 piezas para los detalles de una boda?',
        r: 'Depende mucho de la fecha. Treinta piezas pequeñas son unas sesenta horas de trabajo, así que necesitamos unos tres meses de margen. Escríbenos cuanto antes y lo vemos.',
      },
    ],
  },
  {
    en: {
      titulo: 'Custom orders',
      descripcion:
        'Order a made-to-measure crochet piece from Ovillo & Co.: pet amigurumis, personalised blankets and gift sets. A no-obligation quote within 24–48 hours.',
      miga: 'Custom orders',
      etiqueta: 'Custom orders',
      cabecera: 'Tell us what you have in mind',
      entradilla:
        'An amigurumi of your dog, a blanket in the exact green of the nursery, a set of favours for a wedding. Write to us and we’ll reply within 24–48 hours with a price and a timeframe. Then it’s up to you, no pressure at all.',
      formulario: 'Custom order form',
      lateral: 'How custom orders work',
      comoVa: 'How it works',
      pasos: [
        'You send us your idea, and photos if you have them, using this form.',
        'We reply within 24–48 hours with a price, a timeframe and a suggested colour palette.',
        'If it suits you, you pay half and we get started. The other half when it’s finished.',
        'We send you progress photos; if anything doesn’t feel right, we change it before we finish.',
        'It arrives at your door, gift-wrapped if you ask us to.',
      ],
      preciosTitulo: 'Guide prices',
      preciosOculto: 'Approximate price for each type of custom order',
      precios: [
        'Small amigurumi (12–15 cm)',
        'Medium amigurumi (20–25 cm)',
        'Pet amigurumi',
        'Pram blanket',
        'Large blanket',
        'Made-to-order gift set',
      ],
      desde: (importe: string) => `from ${importe}`,
      preciosNota: 'These are a guide: the final price depends on size, detail and yarn.',
      agenda: 'Schedule',
      agendaTexto: () => (
        <>
          Right now we’re starting new custom orders in about <b>two weeks</b>. For Christmas, the last day to order is{' '}
          <b>15 November</b>.
        </>
      ),
      ejemplosEtiqueta: 'To give you an idea',
      ejemplosTitulo: 'Custom orders we’ve made',
      ejemplosNota: 'Illustrative examples from a demo shop.',
      ejemplos: [
        {
          alt: 'Crochet teddy bear in a lilac dress and turquoise scarf',
          titulo: 'Teddies for twin girls',
          texto: 'Two identical teddies except for the colour of their dresses, so nobody mixes them up at three in the morning.',
          plazo: '10 days',
        },
        {
          alt: 'Crochet star-shaped baby blanket with mint green and natural waves',
          titulo: 'The blanket to match the wall',
          texto: 'A star-shaped pram blanket in the exact green of the nursery. They sent us a photo of the paint tin.',
          plazo: '14 days',
        },
        {
          alt: 'Children’s garland with a pink crochet heart, beads and eucalyptus',
          titulo: 'A garland for a christening',
          texto:
            'Crochet hearts with wooden beads and an embroidered name, for the nursery wall, well out of the baby’s reach.',
          plazo: '8 days',
        },
      ],
      dudasEtiqueta: 'Before you ask',
      dudasTitulo: 'Common questions about custom orders',
      dudas: [
        {
          p: 'How long does a custom order take?',
          r: 'Between one and three weeks depending on the piece, counting from when you pay the deposit. In the weeks before Christmas it takes longer, and we’ll tell you before we start.',
        },
        {
          p: 'What if I don’t like the result?',
          r: 'That’s why we send you photos along the way: if anything isn’t right, we change it at no cost. If it’s already finished and you’re not happy, we refund the second half and keep the piece.',
        },
        {
          p: 'Can you copy something I’ve seen on Pinterest?',
          r: 'If it’s the design of an identifiable maker, no: we don’t think it’s right to copy her work. If it’s a generic kind of piece, no problem, and we’ll give it our own touch.',
        },
        {
          p: 'How do I pay for a custom order?',
          r: 'Half when we start and the other half when we finish, by card through the shop itself. We’ll never ask for payment details by email.',
        },
        {
          p: 'Do you ship custom orders all over Spain?',
          r: 'To mainland Spain and the Balearic Islands, at the same prices as the rest of the shop. If you’re in Málaga, you can also collect it from the workshop.',
        },
        {
          p: 'Can you make 30 pieces as wedding favours?',
          r: 'It very much depends on the date. Thirty small pieces mean about sixty hours of work, so we need around three months’ notice. Write to us as soon as you can and we’ll see.',
        },
      ],
    },
    fr: {
      titulo: 'Commandes sur mesure',
      descripcion:
        'Commandez une pièce au crochet sur mesure chez Ovillo & Co. : amigurumis de vos animaux, couvertures personnalisées et coffrets cadeaux. Devis sans engagement sous 24 à 48 heures.',
      miga: 'Commandes sur mesure',
      etiqueta: 'Commandes sur mesure',
      cabecera: 'Dites-nous ce que vous avez en tête',
      entradilla:
        'Un amigurumi de votre chien, la couverture dans le vert exact de la chambre, un coffret pour un mariage. Écrivez-nous et nous vous répondons sous 24 à 48 heures avec un prix et un délai. Ensuite, c’est vous qui décidez, sans aucune pression.',
      formulario: 'Formulaire de commande sur mesure',
      lateral: 'Comment fonctionnent les commandes sur mesure',
      comoVa: 'Comment ça se passe',
      pasos: [
        'Vous nous envoyez votre idée, et des photos si vous en avez, avec ce formulaire.',
        'Nous vous répondons sous 24 à 48 heures avec un prix, un délai et une proposition de couleurs.',
        'Si cela vous convient, vous payez la moitié et nous commençons. L’autre moitié, à la fin.',
        'Nous vous envoyons des photos de l’avancement ; si quelque chose ne vous convainc pas, nous le modifions avant de terminer.',
        'Vous la recevez chez vous, en paquet cadeau si vous nous le demandez.',
      ],
      preciosTitulo: 'Prix indicatifs',
      preciosOculto: 'Prix indicatif de chaque type de commande sur mesure',
      precios: [
        'Petit amigurumi (12–15 cm)',
        'Amigurumi moyen (20–25 cm)',
        'Amigurumi d’animal',
        'Petite couverture de poussette',
        'Grande couverture',
        'Coffret cadeau sur mesure',
      ],
      desde: (importe: string) => `à partir de ${importe}`,
      preciosNota: 'Ils sont indicatifs : le prix final dépend de la taille, des détails et de la laine.',
      agenda: 'Agenda',
      agendaTexto: () => (
        <>
          En ce moment, nous commençons les nouvelles commandes sur mesure dans environ <b>deux semaines</b>. Pour Noël, le
          dernier jour pour commander est le <b>15{' '}novembre</b>.
        </>
      ),
      ejemplosEtiqueta: 'Pour vous donner une idée',
      ejemplosTitulo: 'Des commandes sur mesure que nous avons réalisées',
      ejemplosNota: 'Exemples illustratifs d’une boutique de démonstration.',
      ejemplos: [
        {
          alt: 'Ourse au crochet avec une robe lilas et une écharpe turquoise',
          titulo: 'Des oursonnes pour des jumelles',
          texto: 'Deux oursonnes identiques, sauf la couleur de la robe, pour ne pas les confondre à trois heures du matin.',
          plazo: '10 jours',
        },
        {
          alt: 'Couverture de bébé au crochet en étoile, à vagues vert menthe et écru',
          titulo: 'La couverture assortie au mur',
          texto:
            'Petite couverture en étoile pour la poussette, dans le vert exact de la chambre. On nous a envoyé une photo du pot de peinture.',
          plazo: '14 jours',
        },
        {
          alt: 'Guirlande pour enfant avec un cœur rose au crochet, des perles et de l’eucalyptus',
          titulo: 'Une guirlande pour un baptême',
          texto:
            'Des cœurs au crochet avec des perles en bois et le prénom brodé, pour le mur de la chambre, hors de portée du bébé.',
          plazo: '8 jours',
        },
      ],
      dudasEtiqueta: 'Avant que vous ne posiez la question',
      dudasTitulo: 'Les questions fréquentes sur les commandes sur mesure',
      dudas: [
        {
          p: 'Combien de temps prend une commande sur mesure ?',
          r: 'Entre une et trois semaines selon la pièce, à compter du paiement de l’acompte. Dans les semaines qui précèdent Noël, c’est plus long, et nous vous le disons avant de commencer.',
        },
        {
          p: 'Et si le résultat ne me plaît pas ?',
          r: 'C’est pour ça que nous vous envoyons des photos pendant la réalisation : si quelque chose ne vous convient pas, nous le modifions sans frais. Si la pièce est déjà terminée et ne vous convainc pas, nous vous remboursons la seconde moitié et nous gardons la pièce.',
        },
        {
          p: 'Pouvez-vous copier quelque chose que j’ai vu sur Pinterest ?',
          r: 'S’il s’agit du modèle d’une artisane identifiable, non : copier son travail ne nous semble pas correct. S’il s’agit d’un type de pièce générique, aucun problème, et nous y ajoutons notre touche.',
        },
        {
          p: 'Comment se paie une commande sur mesure ?',
          r: 'La moitié au début et l’autre moitié à la fin, par carte via la boutique elle-même. Nous ne vous demanderons jamais vos coordonnées bancaires par e-mail.',
        },
        {
          p: 'Livrez-vous les commandes sur mesure dans toute l’Espagne ?',
          r: 'En Espagne péninsulaire et aux Baléares, aux mêmes tarifs que le reste de la boutique. Si vous êtes à Málaga, vous pouvez aussi venir la chercher à l’atelier.',
        },
        {
          p: 'Pouvez-vous réaliser 30 pièces comme cadeaux d’invités pour un mariage ?',
          r: 'Cela dépend beaucoup de la date. Trente petites pièces, c’est environ soixante heures de travail : il nous faut donc environ trois mois de marge. Écrivez-nous le plus tôt possible et nous verrons.',
        },
      ],
    },
    de: {
      titulo: 'Auftragsarbeiten',
      descripcion:
        'Bestellen Sie bei Ovillo & Co. ein gehäkeltes Stück nach Maß: Amigurumis Ihres Haustiers, personalisierte Decken und Geschenksets. Unverbindliches Angebot innerhalb von 24–48 Stunden.',
      miga: 'Auftragsarbeiten',
      etiqueta: 'Auftragsarbeiten',
      cabecera: 'Erzählen Sie uns, was Ihnen vorschwebt',
      entradilla:
        'Ein Amigurumi Ihres Hundes, die Decke im exakten Grün des Kinderzimmers, ein Set für eine Hochzeit. Schreiben Sie uns, und wir antworten innerhalb von 24–48 Stunden mit Preis und Lieferzeit. Dann entscheiden Sie – ganz ohne Druck.',
      formulario: 'Formular für Auftragsarbeiten',
      lateral: 'So funktionieren Auftragsarbeiten',
      comoVa: 'So läuft es ab',
      pasos: [
        'Sie schicken uns Ihre Idee, gern mit Fotos, über dieses Formular.',
        'Wir antworten innerhalb von 24–48 Stunden mit Preis, Lieferzeit und einem Farbvorschlag.',
        'Wenn es für Sie passt, zahlen Sie die Hälfte, und wir legen los. Die andere Hälfte, wenn es fertig ist.',
        'Wir schicken Ihnen Fotos vom Fortschritt; wenn Ihnen etwas nicht gefällt, ändern wir es, bevor wir fertig sind.',
        'Es kommt zu Ihnen nach Hause, auf Wunsch als Geschenk verpackt.',
      ],
      preciosTitulo: 'Richtpreise',
      preciosOculto: 'Ungefährer Preis je Art der Auftragsarbeit',
      precios: [
        'Kleines Amigurumi (12–15 cm)',
        'Mittleres Amigurumi (20–25 cm)',
        'Haustier-Amigurumi',
        'Kinderwagendecke',
        'Große Decke',
        'Individuelles Geschenkset',
      ],
      desde: (importe: string) => `ab ${importe}`,
      preciosNota: 'Das sind Richtwerte: Der Endpreis hängt von Größe, Details und Garn ab.',
      agenda: 'Terminplan',
      agendaTexto: () => (
        <>
          Neue Auftragsarbeiten beginnen wir derzeit in etwa <b>zwei Wochen</b>. Für Weihnachten ist der letzte
          Bestelltag der <b>15. November</b>.
        </>
      ),
      ejemplosEtiqueta: 'Damit Sie eine Vorstellung bekommen',
      ejemplosTitulo: 'Auftragsarbeiten, die wir gehäkelt haben',
      ejemplosNota: 'Anschauungsbeispiele aus einem Demo-Shop.',
      ejemplos: [
        {
          alt: 'Gehäkelte Bärin mit fliederfarbenem Kleid und türkisfarbenem Schal',
          titulo: 'Bärinnen für Zwillingsmädchen',
          texto: 'Zwei gleiche Bärinnen, nur die Kleider haben verschiedene Farben – damit man sie um drei Uhr nachts nicht verwechselt.',
          plazo: '10 Tage',
        },
        {
          alt: 'Gehäkelte Babydecke in Sternform mit Wellen in Mintgrün und Naturweiß',
          titulo: 'Die Decke im Grün der Wand',
          texto:
            'Eine Sterndecke für den Kinderwagen im exakten Grün des Kinderzimmers. Man hat uns ein Foto vom Farbeimer geschickt.',
          plazo: '14 Tage',
        },
        {
          alt: 'Kindergirlande mit rosa Häkelherz, Perlen und Eukalyptus',
          titulo: 'Girlande für eine Taufe',
          texto:
            'Gehäkelte Herzen mit Holzperlen und gesticktem Namen, für die Wand im Kinderzimmer, außer Reichweite des Babys.',
          plazo: '8 Tage',
        },
      ],
      dudasEtiqueta: 'Bevor Sie fragen',
      dudasTitulo: 'Typische Fragen zu Auftragsarbeiten',
      dudas: [
        {
          p: 'Wie lange dauert eine Auftragsarbeit?',
          r: 'Je nach Stück zwischen einer und drei Wochen, gerechnet ab der Anzahlung. In den Wochen vor Weihnachten dauert es länger, und wir sagen es Ihnen, bevor wir anfangen.',
        },
        {
          p: 'Und wenn mir das Ergebnis nicht gefällt?',
          r: 'Deshalb schicken wir Ihnen unterwegs Fotos: Wenn Ihnen etwas nicht passt, ändern wir es kostenlos. Ist das Stück schon fertig und überzeugt Sie nicht, erstatten wir die zweite Hälfte und behalten das Stück.',
        },
        {
          p: 'Können Sie etwas nachhäkeln, das ich auf Pinterest gesehen habe?',
          r: 'Wenn es das Design einer erkennbaren Kunsthandwerkerin ist, nein: Ihre Arbeit zu kopieren, finden wir nicht in Ordnung. Ist es eine allgemeine Art von Stück, kein Problem – und wir geben ihm unsere eigene Note.',
        },
        {
          p: 'Wie wird eine Auftragsarbeit bezahlt?',
          r: 'Die Hälfte zu Beginn und die andere Hälfte am Ende, per Karte direkt über den Shop. Wir werden Sie nie per E-Mail nach Zahlungsdaten fragen.',
        },
        {
          p: 'Liefern Sie Auftragsarbeiten in ganz Spanien?',
          r: 'Auf das spanische Festland und die Balearen, zu denselben Preisen wie im übrigen Shop. Wenn Sie in Málaga sind, können Sie es auch in der Werkstatt abholen.',
        },
        {
          p: 'Häkeln Sie 30 Stücke als Gastgeschenke für eine Hochzeit?',
          r: 'Das hängt stark vom Termin ab. Dreißig kleine Stücke sind etwa sechzig Stunden Arbeit, wir brauchen also rund drei Monate Vorlauf. Schreiben Sie uns so früh wie möglich, dann schauen wir.',
        },
      ],
    },
  },
);
