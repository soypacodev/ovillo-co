// Textos de la portada en cada idioma.

import { textos } from '@/lib/i18n';

export const T = textos(
  {
    ogTitulo: 'Ovillo & Co. · Crochet hecho a mano en Málaga',
    descripcionTienda:
      'Amigurumis, mantas y accesorios de crochet tejidos a mano en Málaga, de uno en uno. Piezas únicas y encargos personalizados.',
    descripcionDemo:
      'Tienda online de demostración hecha por Paco Dev: crochet a mano en Málaga, con catálogo, pago, envíos, encargos y panel para el taller.',

    eyebrow: 'Taller de crochet · Málaga',
    titulo: 'Cositas blanditas, ',
    tituloDestacado: 'de una en una',
    entradilla:
      'Tejemos amigurumis, mantas y accesorios en un taller pequeño de Málaga, con lana buena y sin prisa. No hay dos piezas iguales porque no hay dos tardes iguales.',
    verTienda: 'Ver la tienda',
    quieroEncargo: 'Quiero un encargo',
    unica: 'Pieza única',
    unicaTexto: 'Ninguna sale igual a otra',
    saleEn: 'Sale del taller en ',
    gratisDesde: (importe: string) => `Gratis a partir de ${importe}`,
    peninsula: 'A toda la península',
    materiales: 'Materiales buenos',
    materialesTexto: 'Algodón y merino, sin más',
    altPortada: 'Cervatillo de ganchillo dormido junto a un corazón rosa tejido',
    horas: (n: number) => `${n} horas`,
    porManta: 'por manta terminada',

    categoriasEyebrow: 'Por dónde empezar',
    categoriasTitulo: 'Busca por categoría',
    verCatalogo: 'Ver todo el catálogo',

    destacadosEyebrow: 'Lo que hay ahora mismo',
    destacadosTitulo: 'En el cesto',
    destacadosTexto: 'Cuando algo se agota tardamos unos días en reponerlo: lo tejemos aquí, no llega en un camión.',
    verPiezas: (n: number) => `Ver las ${n} piezas`,

    rebajaHasta: (dia: string) => `Hasta el ${dia}`,
    rebajaEnMarcha: 'Rebaja en marcha',
    rebajaTitulo: (valor: number, categoria: string) => `−${valor} % en ${categoria.toLowerCase()}`,
    rebajaTexto: (texto: string) =>
      `${texto} Ya va descontado en el precio de cada pieza, sin código ni letra pequeña.`,
    verCategoria: (categoria: string) => `Ver ${categoria.toLowerCase()}`,

    novedadesEyebrow: 'Recién salido de las agujas',
    novedadesTitulo: 'Novedades',
    verTodas: 'Ver todas',

    tallerEyebrow: 'Quién está detrás',
    tallerTitulo: 'Una mesa, buena luz',
    tallerTitulo2: 'y mucho hilo',
    tallerTexto:
      'Ovillo & Co. nació en 2019 con un cervatillo dormilón y una lista de espera apuntada en la nevera. Hoy somos un taller pequeño en Málaga y seguimos tejiendo cada pieza de una en una.',
    tallerCita:
      'Si una pieza no nos gusta, la deshacemos. Preferimos tardar un poco más que mandarte algo que no nos quedaríamos.',
    cifras: ['piezas tejidas', 'pedidos enviados', 'años con la aguja'],
    conocerTaller: 'Conocer el taller',
    polaroids: [
      { alt: 'Manos tejiendo una pieza blanca de ganchillo', pie: 'a medio hacer' },
      { alt: 'Ovillos de algodón en tonos cálidos junto a unas tijeras', pie: 'el cesto de los ovillos' },
      { alt: 'Ovillo verde agua y aguja de ganchillo de madera', pie: 'punto nube' },
    ],

    comoEyebrow: 'Sin sorpresas',
    comoTitulo: 'Cómo funciona esto',
    comoTexto: 'Somos un taller pequeño, así que preferimos contártelo claro antes de que pidas nada.',
    pasos: [
      {
        titulo: 'Eliges o encargas',
        texto:
          'Lo que ya está hecho sale enseguida. Lo demás lo tejemos cuando lo pides, y te decimos el plazo antes de cobrarte nada.',
      },
      {
        titulo: 'Lo tejemos a mano',
        texto:
          'Cada pieza la hace una sola persona de principio a fin. Si algo no nos convence, lo deshacemos y lo repetimos.',
      },
      {
        titulo: 'Te enseñamos el avance',
        texto: 'En los encargos te mandamos fotos por el camino, para que no haya sorpresas al abrir la caja.',
      },
      {
        titulo: 'Llega a tu casa',
        texto: 'Envuelto en papel de seda y con las instrucciones de lavado escritas a mano.',
      },
    ],

    opinionesEyebrow: 'Lo que dicen',
    opinionesTitulo: 'Quien ya lo tiene en casa',
    opinionesAviso: 'Reseñas de ejemplo · tienda de demostración',
    estrellas: '5 de 5 estrellas',
    // Tienda de demostración: las opiniones son inventadas y se dice bien claro.
    opiniones: [
      {
        texto:
          'La regalé por un nacimiento y fue lo que más ilusión hizo. En persona es todavía más bonita que en las fotos.',
        autora: 'Marta, Málaga',
        pieza: 'Manta estrella',
      },
      {
        texto:
          'Pedimos un amigurumi de nuestra gata y clavaron hasta la manchita de la pata. Nos fueron mandando fotos y eso nos encantó.',
        autora: 'Julia, Sevilla',
        pieza: 'Encargo personalizado',
      },
      {
        texto:
          'Uso el bolso de red casi a diario desde hace meses y sigue como el primer día. Aguanta muchísimo peso.',
        autora: 'Nuria, Granada',
        pieza: 'Bolso de red para el mercado',
      },
    ],

    encargosEyebrow: 'Encargos personalizados',
    encargosTitulo: '¿Quieres un amigurumi de tu perro?',
    encargosTexto:
      'Mándanos dos o tres fotos y te decimos si podemos, cuánto tardaríamos y cuánto costaría. Sin compromiso: si no te encaja el presupuesto, no pasa nada.',
    contarIdea: 'Contarnos tu idea',
    pasosEncargo: [
      'Nos escribes con dos o tres fotos y la idea.',
      'Te contestamos en 24–48 h con precio y plazo.',
      'Si te encaja, pagas la mitad y empezamos.',
      'Te mandamos fotos del proceso por el camino.',
    ],

    boletinTitulo: 'Te avisamos cuando haya cosas nuevas',
    boletinTexto: 'Un correo al mes como mucho. Si te cansamos, te das de baja en un clic.',
    boletinEtiqueta: 'Tu correo electrónico',
    boletinBoton: 'Apuntarme',
  },
  {
    en: {
      ogTitulo: 'Ovillo & Co. · Handmade crochet from Málaga',
      descripcionTienda:
        'Amigurumi, blankets and crochet accessories made by hand in Málaga, one at a time. One-of-a-kind pieces and custom orders.',
      descripcionDemo:
        'Online demo shop built by Paco Dev: handmade crochet from Málaga, with catalogue, checkout, shipping, custom orders and a workshop dashboard.',

      eyebrow: 'Crochet workshop · Málaga',
      titulo: 'Soft little things, ',
      tituloDestacado: 'one at a time',
      entradilla:
        'We crochet amigurumi, blankets and accessories in a small workshop in Málaga, with good yarn and no rush. No two pieces are alike, because no two afternoons are.',
      verTienda: 'Visit the shop',
      quieroEncargo: 'I’d like a custom order',
      unica: 'One of a kind',
      unicaTexto: 'No two come out the same',
      saleEn: 'Leaves the workshop in ',
      gratisDesde: (importe: string) => `Free delivery over ${importe}`,
      peninsula: 'Anywhere on the Spanish mainland',
      materiales: 'Good materials',
      materialesTexto: 'Cotton and merino, nothing else',
      altPortada: 'Crochet fawn asleep beside a pink knitted heart',
      horas: (n: number) => `${n} hours`,
      porManta: 'per finished blanket',

      categoriasEyebrow: 'Where to start',
      categoriasTitulo: 'Browse by category',
      verCatalogo: 'See the full catalogue',

      destacadosEyebrow: 'What we have right now',
      destacadosTitulo: 'In the basket',
      destacadosTexto:
        'When something sells out it takes us a few days to make more: we crochet it here, it doesn’t arrive on a lorry.',
      verPiezas: (n: number) => `See all ${n} items`,

      rebajaHasta: (dia: string) => `Until ${dia}`,
      rebajaEnMarcha: 'Sale on now',
      rebajaTitulo: (valor: number, categoria: string) => `${valor}% off ${categoria.toLowerCase()}`,
      rebajaTexto: (texto: string) =>
        `${texto} The discount is already taken off the price of every piece: no code, no small print.`,
      verCategoria: (categoria: string) => `Shop ${categoria.toLowerCase()}`,

      novedadesEyebrow: 'Fresh off the hook',
      novedadesTitulo: 'New in',
      verTodas: 'See them all',

      tallerEyebrow: 'Who’s behind it',
      tallerTitulo: 'A table, good light',
      tallerTitulo2: 'and plenty of yarn',
      tallerTexto:
        'Ovillo & Co. began in 2019 with a sleepy fawn and a waiting list stuck to the fridge. Today we’re a small workshop in Málaga and we still crochet every piece one at a time.',
      tallerCita:
        'If we don’t like a piece, we unravel it. We’d rather take a little longer than send you something we wouldn’t keep ourselves.',
      cifras: ['pieces crocheted', 'orders shipped', 'years with the hook'],
      conocerTaller: 'Meet the workshop',
      polaroids: [
        { alt: 'Hands crocheting a white piece', pie: 'half done' },
        { alt: 'Cotton balls of yarn in warm tones next to a pair of scissors', pie: 'the yarn basket' },
        { alt: 'Aqua ball of yarn and a wooden crochet hook', pie: 'cloud stitch' },
      ],

      comoEyebrow: 'No surprises',
      comoTitulo: 'How it works',
      comoTexto: 'We’re a small workshop, so we’d rather explain it clearly before you order anything.',
      pasos: [
        {
          titulo: 'Choose or commission',
          texto:
            'Anything already made ships straight away. Everything else we crochet when you order it, and we tell you how long it will take before charging you a thing.',
        },
        {
          titulo: 'We crochet it by hand',
          texto:
            'Each piece is made by one person from start to finish. If something isn’t quite right, we unravel it and start again.',
        },
        {
          titulo: 'We show you the progress',
          texto: 'For custom orders we send you photos along the way, so there are no surprises when you open the box.',
        },
        {
          titulo: 'It arrives at your door',
          texto: 'Wrapped in tissue paper, with handwritten washing instructions.',
        },
      ],

      opinionesEyebrow: 'What people say',
      opinionesTitulo: 'From those who already have one at home',
      opinionesAviso: 'Sample reviews · demo shop',
      estrellas: '5 out of 5 stars',
      opiniones: [
        {
          texto:
            'I gave it as a gift for a new baby and it was the present everyone loved most. In person it’s even lovelier than in the photos.',
          autora: 'Marta, Málaga',
          pieza: 'Star blanket',
        },
        {
          texto:
            'We ordered an amigurumi of our cat and they got everything right, down to the little spot on her paw. They kept sending us photos, which we loved.',
          autora: 'Julia, Sevilla',
          pieza: 'Custom order',
        },
        {
          texto:
            'I’ve used the mesh bag almost every day for months and it still looks brand new. It holds an amazing amount of weight.',
          autora: 'Nuria, Granada',
          pieza: 'Mesh market bag',
        },
      ],

      encargosEyebrow: 'Custom orders',
      encargosTitulo: 'Fancy an amigurumi of your dog?',
      encargosTexto:
        'Send us two or three photos and we’ll tell you whether we can do it, how long it would take and how much it would cost. No obligation: if the quote doesn’t suit you, that’s absolutely fine.',
      contarIdea: 'Tell us your idea',
      pasosEncargo: [
        'You write to us with two or three photos and your idea.',
        'We reply within 24–48 h with a price and a timeframe.',
        'If it suits you, you pay half and we get started.',
        'We send you photos of the work along the way.',
      ],

      boletinTitulo: 'We’ll let you know when there’s something new',
      boletinTexto: 'One email a month at most. If you get tired of us, unsubscribe in one click.',
      boletinEtiqueta: 'Your email address',
      boletinBoton: 'Sign me up',
    },
    fr: {
      ogTitulo: 'Ovillo & Co. · Crochet fait main à Málaga',
      descripcionTienda:
        'Amigurumis, couvertures et accessoires au crochet faits main à Málaga, pièce par pièce. Pièces uniques et commandes sur mesure.',
      descripcionDemo:
        'Boutique en ligne de démonstration réalisée par Paco Dev : crochet fait main à Málaga, avec catalogue, paiement, livraisons, commandes sur mesure et tableau de bord pour l’atelier.',

      eyebrow: 'Atelier de crochet · Málaga',
      titulo: 'De petites douceurs, ',
      tituloDestacado: 'une à une',
      entradilla:
        'Nous crochetons des amigurumis, des couvertures et des accessoires dans un petit atelier de Málaga, avec de la bonne laine et sans nous presser. Il n’y a pas deux pièces identiques, parce qu’il n’y a pas deux après-midi identiques.',
      verTienda: 'Voir la boutique',
      quieroEncargo: 'Je veux une pièce sur mesure',
      unica: 'Pièce unique',
      unicaTexto: 'Aucune n’est pareille à une autre',
      saleEn: 'Part de l’atelier sous ',
      gratisDesde: (importe: string) => `Livraison offerte dès ${importe}`,
      peninsula: 'Partout en Espagne péninsulaire',
      materiales: 'De bonnes matières',
      materialesTexto: 'Du coton et du mérinos, tout simplement',
      altPortada: 'Faon au crochet endormi à côté d’un cœur rose tricoté',
      horas: (n: number) => `${n} heures`,
      porManta: 'par couverture terminée',

      categoriasEyebrow: 'Par où commencer',
      categoriasTitulo: 'Parcourir par catégorie',
      verCatalogo: 'Voir tout le catalogue',

      destacadosEyebrow: 'Ce qui est prêt en ce moment',
      destacadosTitulo: 'Dans le panier à ouvrages',
      destacadosTexto:
        'Quand une pièce est épuisée, il nous faut quelques jours pour la refaire : nous la tricotons ici, elle n’arrive pas par camion.',
      verPiezas: (n: number) => `Voir les ${n} pièces`,

      rebajaHasta: (dia: string) => `Jusqu’au ${dia}`,
      rebajaEnMarcha: 'Soldes en cours',
      rebajaTitulo: (valor: number, categoria: string) => `${categoria} : −${valor} %`,
      rebajaTexto: (texto: string) =>
        `${texto} La remise est déjà déduite du prix de chaque pièce, sans code ni petites lignes.`,
      verCategoria: (categoria: string) => `Voir la catégorie ${categoria}`,

      novedadesEyebrow: 'Tout juste sorti des aiguilles',
      novedadesTitulo: 'Nouveautés',
      verTodas: 'Tout voir',

      tallerEyebrow: 'Qui se cache derrière',
      tallerTitulo: 'Une table, une belle lumière',
      tallerTitulo2: 'et beaucoup de fil',
      tallerTexto:
        'Ovillo & Co. est né en 2019 avec un faon endormi et une liste d’attente collée sur le frigo. Aujourd’hui, nous sommes un petit atelier à Málaga et nous crochetons toujours chaque pièce une à une.',
      tallerCita:
        'Si une pièce ne nous plaît pas, nous la défaisons. Nous préférons prendre un peu plus de temps plutôt que de vous envoyer quelque chose que nous ne garderions pas.',
      cifras: ['pièces crochetées', 'commandes expédiées', 'années de crochet'],
      conocerTaller: 'Découvrir l’atelier',
      polaroids: [
        { alt: 'Des mains crochetant une pièce blanche', pie: 'en cours' },
        { alt: 'Pelotes de coton aux tons chauds à côté d’une paire de ciseaux', pie: 'le panier à pelotes' },
        { alt: 'Pelote vert d’eau et crochet en bois', pie: 'point nuage' },
      ],

      comoEyebrow: 'Sans surprise',
      comoTitulo: 'Comment ça marche',
      comoTexto: 'Nous sommes un petit atelier, alors nous préférons tout vous expliquer clairement avant que vous ne commandiez.',
      pasos: [
        {
          titulo: 'Vous choisissez ou commandez',
          texto:
            'Ce qui est déjà prêt part tout de suite. Le reste, nous le tricotons à la commande, et nous vous indiquons le délai avant de vous facturer quoi que ce soit.',
        },
        {
          titulo: 'Nous le tricotons à la main',
          texto:
            'Chaque pièce est réalisée par une seule personne, du début à la fin. Si quelque chose ne nous convainc pas, nous le défaisons et recommençons.',
        },
        {
          titulo: 'Nous vous montrons l’avancement',
          texto:
            'Pour les commandes sur mesure, nous vous envoyons des photos en cours de route, pour éviter toute surprise à l’ouverture du colis.',
        },
        {
          titulo: 'Elle arrive chez vous',
          texto: 'Emballée dans du papier de soie, avec les instructions de lavage écrites à la main.',
        },
      ],

      opinionesEyebrow: 'Ce qu’on en dit',
      opinionesTitulo: 'Ceux qui l’ont déjà chez eux',
      opinionesAviso: 'Avis fictifs · boutique de démonstration',
      estrellas: '5 étoiles sur 5',
      opiniones: [
        {
          texto:
            'Je l’ai offerte pour une naissance et c’est le cadeau qui a fait le plus plaisir. En vrai, elle est encore plus jolie qu’en photo.',
          autora: 'Marta, Málaga',
          pieza: 'Couverture étoile',
        },
        {
          texto:
            'Nous avons commandé un amigurumi de notre chatte et ils ont reproduit jusqu’à la petite tache sur sa patte. Ils nous ont envoyé des photos au fil du travail et nous avons adoré.',
          autora: 'Julia, Sevilla',
          pieza: 'Commande sur mesure',
        },
        {
          texto:
            'J’utilise le filet presque tous les jours depuis des mois et il est comme au premier jour. Il supporte un poids incroyable.',
          autora: 'Nuria, Granada',
          pieza: 'Filet à provisions',
        },
      ],

      encargosEyebrow: 'Commandes sur mesure',
      encargosTitulo: 'Envie d’un amigurumi de votre chien ?',
      encargosTexto:
        'Envoyez-nous deux ou trois photos et nous vous dirons si c’est possible, en combien de temps et pour quel prix. Sans engagement : si le devis ne vous convient pas, aucun souci.',
      contarIdea: 'Nous raconter votre idée',
      pasosEncargo: [
        'Vous nous écrivez avec deux ou trois photos et votre idée.',
        'Nous vous répondons sous 24–48 h avec un prix et un délai.',
        'Si cela vous convient, vous payez la moitié et nous commençons.',
        'Nous vous envoyons des photos de l’avancement en cours de route.',
      ],

      boletinTitulo: 'Nous vous prévenons quand il y a des nouveautés',
      boletinTexto: 'Un e-mail par mois au maximum. Si vous vous lassez, vous vous désabonnez en un clic.',
      boletinEtiqueta: 'Votre adresse e-mail',
      boletinBoton: 'Je m’inscris',
    },
    de: {
      ogTitulo: 'Ovillo & Co. · Handgehäkeltes aus Málaga',
      descripcionTienda:
        'Amigurumis, Decken und Häkel-Accessoires, in Málaga von Hand gefertigt, Stück für Stück. Unikate und Auftragsarbeiten.',
      descripcionDemo:
        'Demo-Onlineshop von Paco Dev: Handgehäkeltes aus Málaga, mit Katalog, Bezahlung, Versand, Auftragsarbeiten und Dashboard für die Werkstatt.',

      eyebrow: 'Häkelwerkstatt · Málaga',
      titulo: 'Weiche Kleinigkeiten, ',
      tituloDestacado: 'Stück für Stück',
      entradilla:
        'Wir häkeln Amigurumis, Decken und Accessoires in einer kleinen Werkstatt in Málaga, mit gutem Garn und ohne Eile. Keine zwei Stücke sind gleich, weil kein Nachmittag dem anderen gleicht.',
      verTienda: 'Zum Shop',
      quieroEncargo: 'Ich möchte eine Auftragsarbeit',
      unica: 'Unikat',
      unicaTexto: 'Keins gleicht dem anderen',
      saleEn: 'Verlässt die Werkstatt in ',
      gratisDesde: (importe: string) => `Kostenloser Versand ab ${importe}`,
      peninsula: 'Auf das gesamte spanische Festland',
      materiales: 'Gute Materialien',
      materialesTexto: 'Baumwolle und Merino, sonst nichts',
      altPortada: 'Gehäkeltes Rehkitz, das neben einem rosa Strickherz schläft',
      horas: (n: number) => `${n} Stunden`,
      porManta: 'pro fertige Decke',

      categoriasEyebrow: 'Wo anfangen',
      categoriasTitulo: 'Nach Kategorie stöbern',
      verCatalogo: 'Den ganzen Katalog ansehen',

      destacadosEyebrow: 'Was es gerade gibt',
      destacadosTitulo: 'Im Körbchen',
      destacadosTexto:
        'Wenn etwas ausverkauft ist, brauchen wir ein paar Tage, um es nachzuarbeiten: Wir häkeln es hier, es kommt nicht mit dem Lastwagen.',
      verPiezas: (n: number) => `Alle ${n} Stücke ansehen`,

      rebajaHasta: (dia: string) => `Bis zum ${dia}`,
      rebajaEnMarcha: 'Sale läuft',
      rebajaTitulo: (valor: number, categoria: string) => `−${valor} % auf ${categoria}`,
      rebajaTexto: (texto: string) =>
        `${texto} Der Rabatt ist im Preis jedes Stücks schon abgezogen, ohne Code und ohne Kleingedrucktes.`,
      verCategoria: (categoria: string) => `${categoria} ansehen`,

      novedadesEyebrow: 'Frisch von der Nadel',
      novedadesTitulo: 'Neuheiten',
      verTodas: 'Alle ansehen',

      tallerEyebrow: 'Wer dahintersteckt',
      tallerTitulo: 'Ein Tisch, gutes Licht',
      tallerTitulo2: 'und viel Garn',
      tallerTexto:
        'Ovillo & Co. entstand 2019 mit einem verschlafenen Rehkitz und einer Warteliste am Kühlschrank. Heute sind wir eine kleine Werkstatt in Málaga und häkeln noch immer jedes Stück einzeln.',
      tallerCita:
        'Wenn uns ein Stück nicht gefällt, ribbeln wir es wieder auf. Wir brauchen lieber etwas länger, als Ihnen etwas zu schicken, das wir selbst nicht behalten würden.',
      cifras: ['gehäkelte Stücke', 'verschickte Bestellungen', 'Jahre an der Häkelnadel'],
      conocerTaller: 'Die Werkstatt kennenlernen',
      polaroids: [
        { alt: 'Hände häkeln ein weißes Stück', pie: 'halb fertig' },
        { alt: 'Baumwollknäuel in warmen Tönen neben einer Schere', pie: 'der Garnkorb' },
        { alt: 'Wassergrünes Garnknäuel und Häkelnadel aus Holz', pie: 'Wolkenmuster' },
      ],

      comoEyebrow: 'Keine Überraschungen',
      comoTitulo: 'So funktioniert es',
      comoTexto: 'Wir sind eine kleine Werkstatt und erklären es Ihnen deshalb lieber klar, bevor Sie etwas bestellen.',
      pasos: [
        {
          titulo: 'Sie wählen oder geben in Auftrag',
          texto:
            'Was schon fertig ist, geht sofort raus. Alles andere häkeln wir nach Ihrer Bestellung, und die Lieferzeit nennen wir Ihnen, bevor wir etwas berechnen.',
        },
        {
          titulo: 'Wir häkeln es von Hand',
          texto:
            'Jedes Stück fertigt eine einzige Person von Anfang bis Ende. Wenn uns etwas nicht überzeugt, ribbeln wir es auf und fangen neu an.',
        },
        {
          titulo: 'Wir zeigen Ihnen den Fortschritt',
          texto:
            'Bei Auftragsarbeiten schicken wir Ihnen unterwegs Fotos, damit es beim Öffnen des Pakets keine Überraschungen gibt.',
        },
        {
          titulo: 'Es kommt zu Ihnen nach Hause',
          texto: 'In Seidenpapier verpackt und mit handgeschriebener Waschanleitung.',
        },
      ],

      opinionesEyebrow: 'Was andere sagen',
      opinionesTitulo: 'Von denen, die es schon zu Hause haben',
      opinionesAviso: 'Beispielbewertungen · Demo-Shop',
      estrellas: '5 von 5 Sternen',
      opiniones: [
        {
          texto:
            'Ich habe sie zur Geburt verschenkt, und sie hat die größte Freude gemacht. In echt ist sie sogar noch schöner als auf den Fotos.',
          autora: 'Marta, Málaga',
          pieza: 'Sternendecke',
        },
        {
          texto:
            'Wir haben ein Amigurumi unserer Katze bestellt, und sie haben sogar den kleinen Fleck an der Pfote getroffen. Unterwegs haben sie uns Fotos geschickt, das fanden wir toll.',
          autora: 'Julia, Sevilla',
          pieza: 'Auftragsarbeit',
        },
        {
          texto:
            'Ich benutze das Netz seit Monaten fast täglich, und es sieht aus wie am ersten Tag. Es hält unglaublich viel Gewicht aus.',
          autora: 'Nuria, Granada',
          pieza: 'Einkaufsnetz für den Markt',
        },
      ],

      encargosEyebrow: 'Auftragsarbeiten',
      encargosTitulo: 'Wie wäre es mit einem Amigurumi Ihres Hundes?',
      encargosTexto:
        'Schicken Sie uns zwei oder drei Fotos, und wir sagen Ihnen, ob wir es können, wie lange es dauern würde und was es kosten würde. Unverbindlich: Wenn der Kostenvoranschlag nicht passt, ist das völlig in Ordnung.',
      contarIdea: 'Erzählen Sie uns Ihre Idee',
      pasosEncargo: [
        'Sie schreiben uns mit zwei oder drei Fotos und Ihrer Idee.',
        'Wir antworten innerhalb von 24–48 h mit Preis und Lieferzeit.',
        'Wenn es passt, zahlen Sie die Hälfte und wir legen los.',
        'Unterwegs schicken wir Ihnen Fotos vom Fortschritt.',
      ],

      boletinTitulo: 'Wir sagen Ihnen Bescheid, wenn es Neues gibt',
      boletinTexto: 'Höchstens eine E-Mail im Monat. Wenn es Ihnen zu viel wird, melden Sie sich mit einem Klick ab.',
      boletinEtiqueta: 'Ihre E-Mail-Adresse',
      boletinBoton: 'Anmelden',
    },
  },
);
