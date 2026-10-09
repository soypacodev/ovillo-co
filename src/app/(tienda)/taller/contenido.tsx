// Textos de «El taller».

import type { ReactNode } from 'react';
import { textos } from '@/lib/i18n';

export const T = textos(
  {
    titulo: 'El taller',
    descripcion:
      'Quién teje, cómo y por qué. Ovillo & Co. es un taller pequeño de crochet en Málaga: materiales, tiempos reales y nuestra forma de trabajar.',
    miga: 'El taller',
    etiqueta: 'Taller de crochet · Málaga',
    cabecera: (destacado: (texto: string) => ReactNode) => <>Tejemos junto a {destacado('una ventana')} que da al mar</>,
    entradilla:
      'Ovillo & Co. es un taller pequeño: una mesa grande, cestos de ovillos ordenados por color y la mejor luz de la casa. Ni fábrica ni almacén. Todo lo que compras aquí lo tejemos a mano, de principio a fin, en Málaga: casi todo a ganchillo y, cuando la pieza lo pide (un gorro, una capota), a dos agujas.',
    fotoPortada: 'Osita de ganchillo con vestido lila y bufanda turquesa',
    sello: 'Una osita así: cinco horas',

    historiaEtiqueta: 'Cómo empezó',
    historiaTitulo: 'Un cervatillo dormilón y una lista de espera',
    historia: [
      'Ovillo & Co. empezó en 2019 con un encargo pequeño: un cervatillo de ganchillo con los ojos cerrados, para un bebé que no había manera de que se durmiera. No sabemos si fue el cervatillo o la casualidad, pero funcionó.',
      'Luego vino otro cervatillo, y una manta, y una lista de espera escrita a lápiz en la puerta de la nevera. Cuando la lista dejó de caber en la puerta, montamos el taller.',
      'Seguimos siendo pocos y seguimos tejiendo en la misma mesa. Hemos cambiado de agujas, de lanas y de paciencia, pero no de manera de trabajar.',
    ],
    rapidoTitulo: 'Por qué no lo hacemos más rápido',
    rapido: [
      'Alguna vez nos han preguntado si no podríamos «industrializarlo un poco». Podríamos, claro. Pero entonces esto sería otra cosa.',
      'Una manta son doce horas. Un amigurumi mediano, cuatro o cinco. Si te decimos diez días es porque son diez días de verdad, no un plazo inflado para curarnos en salud.',
    ],
    polaroids: [
      { alt: 'Manos tejiendo una pieza blanca de ganchillo', pie: 'a medias' },
      { alt: 'Ovillos de algodón en tonos cálidos junto a unas tijeras', pie: 'ordenados por color' },
      { alt: 'Ovillo verde agua y aguja de ganchillo de madera', pie: 'las de siempre' },
    ],

    materialesEtiqueta: 'Sin misterio',
    materialesTitulo: 'Con qué trabajamos',
    materialesTexto:
      'Compramos poco y bueno. Sale más caro por pieza, pero es lo que hace que una manta aguante diez años en vez de dos.',
    materiales: [
      {
        nombre: 'Algodón peinado',
        texto: 'Para amigurumis, mantas y accesorios. Aguanta lavados, no se deforma y tiene el punto justo de brillo.',
      },
      {
        nombre: 'Merino extrafina',
        texto: 'Para gorros, capotas y patucos. No pica, ni siquiera en piel de bebé, y abriga muchísimo para lo poco que pesa.',
      },
      {
        nombre: 'Relleno hipoalergénico',
        texto: 'Fibra hueca siliconada: se lava sin apelmazarse y no da problemas a quien tiene alergias.',
      },
      {
        nombre: 'Trapillo reciclado',
        texto: 'Para cestas y alfombras. Se hace con sobrantes de la industria textil: aprovechamos lo que otros tiran.',
      },
      {
        nombre: 'Ojos bordados',
        texto:
          'En los amigurumis y en todo lo de bebé, los ojos van bordados, nunca de plástico. Cero piezas pequeñas que se puedan arrancar.',
      },
      {
        nombre: 'Papel y cartón',
        texto: 'Envolvemos en papel de seda y caja de cartón, sin plástico. Todo el embalaje se puede reciclar.',
      },
    ],

    procesoEtiqueta: 'De la lana a tu casa',
    procesoTitulo: 'Cómo nace cada pieza',
    procesoTexto: 'Siempre en el mismo orden, tanto si es algo del catálogo como un encargo de los raros.',
    proceso: [
      'Elegimos la lana y tejemos una muestra de 10 × 10 cm para calcular la tensión del punto.',
      'Cada pieza la teje de principio a fin la misma persona: dos manos distintas dan dos tensiones distintas, y se nota.',
      'La lavamos y la bloqueamos con alfileres para que coja su forma definitiva.',
      'Revisamos costuras y remates con lupa. Si algo baila, se deshace y se vuelve a tejer.',
      'Bordamos iniciales, nombres o fechas, si nos los has pedido.',
      'La envolvemos en papel de seda con las instrucciones de lavado escritas a mano.',
    ],

    siNoEtiqueta: 'Para que no haya malentendidos',
    siNoTitulo: 'Lo que sí y lo que no',
    siNoTexto: (pregunta: (texto: string) => ReactNode) => (
      <>
        Preferimos decirlo antes de que pidas nada y no llevarnos un chasco ninguno de los dos. Si tienes dudas con algo
        concreto, {pregunta('pregúntanos')}.
      </>
    ),
    siHacemos: 'Sí hacemos',
    noHacemos: 'No hacemos',
    si: [
      'Cambiar los colores de cualquier pieza del catálogo, sin coste extra.',
      'Bordar nombres, iniciales o fechas.',
      'Amigurumis a partir de fotos de tu mascota.',
      'Ajustar tallas de gorros, bufandas y patucos.',
      'Packs a medida para regalar, con la dedicatoria que quieras.',
      'Arreglar gratis cualquier pieza nuestra que se haya soltado, para siempre.',
    ],
    no: [
      'Copiar el diseño de otra artesana o de una marca.',
      'Más de 15 piezas iguales en un mismo pedido: no llegamos, y preferimos decirlo.',
      'Prendas con patrón complejo, como chaquetas o vestidos.',
      'Encargos nuevos en menos de una semana.',
      'Vender patrones: los nuestros viven en la cabeza y en una libreta llena de tachones.',
    ],

    cierreTitulo: '¿Te decimos si podemos hacer lo que tienes en la cabeza?',
    pedirEncargo: 'Pedir un encargo',
    verTienda: 'Ver la tienda',
    cierreTexto: 'Escríbenos sin compromiso. Te contestamos con la verdad, aunque la verdad sea que no llegamos.',
  },
  {
    en: {
      titulo: 'The workshop',
      descripcion:
        'Who makes our pieces, how and why. Ovillo & Co. is a small crochet workshop in Málaga: our materials, honest timeframes and the way we work.',
      miga: 'The workshop',
      etiqueta: 'Crochet workshop · Málaga',
      cabecera: (destacado: (texto: string) => ReactNode) => <>We crochet beside {destacado('a window')} looking out to sea</>,
      entradilla:
        'Ovillo & Co. is a small workshop: one big table, baskets of yarn sorted by colour and the best light in the house. No factory, no warehouse. Everything you buy here is made by hand, from start to finish, in Málaga: almost all of it crocheted and, when a piece calls for it (a hat, a bonnet), knitted on two needles.',
      fotoPortada: 'Crochet teddy bear in a lilac dress and turquoise scarf',
      sello: 'A teddy like this: five hours',

      historiaEtiqueta: 'How it started',
      historiaTitulo: 'A sleepy little fawn and a waiting list',
      historia: [
        'Ovillo & Co. began in 2019 with one small commission: a crochet fawn with its eyes closed, for a baby who simply wouldn’t go to sleep. We don’t know if it was the fawn or pure chance, but it worked.',
        'Then came another fawn, and a blanket, and a waiting list pencilled on the fridge door. When the list no longer fitted on the door, we set up the workshop.',
        'There are still only a few of us, and we still crochet at the same table. We’ve changed hooks, yarns and levels of patience, but not the way we work.',
      ],
      rapidoTitulo: 'Why we don’t do it faster',
      rapido: [
        'Every now and then someone asks whether we couldn’t “industrialise it a bit”. We could, of course. But then this would be something else.',
        'A blanket takes twelve hours. A medium amigurumi, four or five. If we say ten days, it’s because it really is ten days, not a padded deadline to cover ourselves.',
      ],
      polaroids: [
        { alt: 'Hands crocheting a white piece', pie: 'halfway there' },
        { alt: 'Cotton yarn in warm shades next to a pair of scissors', pie: 'sorted by colour' },
        { alt: 'Aqua green ball of yarn and a wooden crochet hook', pie: 'the usual ones' },
      ],

      materialesEtiqueta: 'No mystery',
      materialesTitulo: 'What we work with',
      materialesTexto:
        'We buy little, and we buy well. It costs more per piece, but it’s what makes a blanket last ten years instead of two.',
      materiales: [
        {
          nombre: 'Combed cotton',
          texto: 'For amigurumis, blankets and accessories. It stands up to washing, keeps its shape and has just the right sheen.',
        },
        {
          nombre: 'Extra-fine merino',
          texto: 'For hats, bonnets and booties. It doesn’t itch, not even on a baby’s skin, and it’s wonderfully warm for how little it weighs.',
        },
        {
          nombre: 'Hypoallergenic stuffing',
          texto: 'Siliconised hollow fibre: it washes without going lumpy and doesn’t bother anyone with allergies.',
        },
        {
          nombre: 'Recycled T-shirt yarn',
          texto: 'For baskets and rugs. It’s made from textile industry offcuts: we use what others throw away.',
        },
        {
          nombre: 'Embroidered eyes',
          texto:
            'On our amigurumis and everything for babies, the eyes are embroidered, never plastic. No small parts that could be pulled off.',
        },
        {
          nombre: 'Paper and cardboard',
          texto: 'We wrap in tissue paper and a cardboard box, with no plastic. All the packaging can be recycled.',
        },
      ],

      procesoEtiqueta: 'From yarn to your home',
      procesoTitulo: 'How each piece comes to life',
      procesoTexto: 'Always in the same order, whether it’s something from the catalogue or one of the more unusual custom orders.',
      proceso: [
        'We choose the yarn and crochet a 10 × 10 cm swatch to work out the tension.',
        'Each piece is made from start to finish by the same person: two different pairs of hands give two different tensions, and it shows.',
        'We wash it and block it with pins so it settles into its final shape.',
        'We check the seams and finishing with a magnifying glass. If anything is loose, it’s undone and crocheted again.',
        'We embroider initials, names or dates, if you’ve asked us to.',
        'We wrap it in tissue paper with handwritten washing instructions.',
      ],

      siNoEtiqueta: 'So there are no misunderstandings',
      siNoTitulo: 'What we do and what we don’t',
      siNoTexto: (pregunta: (texto: string) => ReactNode) => (
        <>
          We’d rather say it before you order anything, so neither of us ends up disappointed. If you’re unsure about
          something specific, {pregunta('just ask')}.
        </>
      ),
      siHacemos: 'We do',
      noHacemos: 'We don’t',
      si: [
        'Change the colours of any piece in the catalogue, at no extra cost.',
        'Embroider names, initials or dates.',
        'Amigurumis based on photos of your pet.',
        'Adjust the sizes of hats, scarves and booties.',
        'Made-to-order gift sets, with any message you like.',
        'Repair any of our pieces that has come loose, free of charge, for ever.',
      ],
      no: [
        'Copy another maker’s or a brand’s design.',
        'More than 15 identical pieces in one order: we can’t manage it, and we’d rather say so.',
        'Garments with complex patterns, such as cardigans or dresses.',
        'New custom orders in less than a week.',
        'Sell patterns: ours live in our heads and in a notebook full of crossings-out.',
      ],

      cierreTitulo: 'Shall we tell you whether we can make what you have in mind?',
      pedirEncargo: 'Request a custom order',
      verTienda: 'Visit the shop',
      cierreTexto: 'Write to us with no obligation. We’ll tell you the truth, even if the truth is that we can’t manage it.',
    },
    fr: {
      titulo: 'L’atelier',
      descripcion:
        'Qui crochète, comment et pourquoi. Ovillo & Co. est un petit atelier de crochet à Málaga : nos matières, des délais réels et notre façon de travailler.',
      miga: 'L’atelier',
      etiqueta: 'Atelier de crochet · Málaga',
      cabecera: (destacado: (texto: string) => ReactNode) => (
        <>Nous crochetons près d’{destacado('une fenêtre')} qui donne sur la mer</>
      ),
      entradilla:
        'Ovillo & Co. est un petit atelier : une grande table, des paniers de pelotes rangées par couleur et la plus belle lumière de la maison. Ni usine ni entrepôt. Tout ce que vous achetez ici est fait main, du début à la fin, à Málaga : presque tout au crochet et, quand la pièce le demande (un bonnet, une capeline), au tricot.',
      fotoPortada: 'Ourse au crochet avec une robe lilas et une écharpe turquoise',
      sello: 'Une ourse comme celle-ci : cinq heures',

      historiaEtiqueta: 'Comment tout a commencé',
      historiaTitulo: 'Un faon endormi et une liste d’attente',
      historia: [
        'Ovillo & Co. a commencé en 2019 avec une petite commande : un faon au crochet aux yeux fermés, pour un bébé qui ne voulait absolument pas s’endormir. Nous ne savons pas si c’était le faon ou le hasard, mais ça a marché.',
        'Puis il y a eu un autre faon, une couverture, et une liste d’attente écrite au crayon sur la porte du frigo. Quand la liste n’a plus tenu sur la porte, nous avons monté l’atelier.',
        'Nous sommes toujours peu nombreux et nous crochetons toujours à la même table. Nous avons changé de crochets, de laines et de patience, mais pas de façon de travailler.',
      ],
      rapidoTitulo: 'Pourquoi nous n’allons pas plus vite',
      rapido: [
        'On nous a parfois demandé si nous ne pourrions pas « industrialiser un peu ». Nous pourrions, bien sûr. Mais ce serait alors autre chose.',
        'Une couverture, c’est douze heures. Un amigurumi moyen, quatre ou cinq. Si nous vous disons dix jours, c’est que ce sont dix vrais jours, pas un délai gonflé par précaution.',
      ],
      polaroids: [
        { alt: 'Des mains qui crochètent une pièce blanche', pie: 'en cours' },
        { alt: 'Pelotes de coton aux tons chauds à côté d’une paire de ciseaux', pie: 'rangées par couleur' },
        { alt: 'Pelote vert d’eau et crochet en bois', pie: 'les fidèles' },
      ],

      materialesEtiqueta: 'Sans mystère',
      materialesTitulo: 'Avec quoi nous travaillons',
      materialesTexto:
        'Nous achetons peu, mais bien. Cela revient plus cher par pièce, mais c’est ce qui permet à une couverture de durer dix ans au lieu de deux.',
      materiales: [
        {
          nombre: 'Coton peigné',
          texto: 'Pour les amigurumis, les couvertures et les accessoires. Il résiste aux lavages, ne se déforme pas et a juste ce qu’il faut de brillant.',
        },
        {
          nombre: 'Mérinos extrafin',
          texto: 'Pour les bonnets, capelines et chaussons. Il ne gratte pas, même sur une peau de bébé, et tient très chaud pour son poids plume.',
        },
        {
          nombre: 'Rembourrage hypoallergénique',
          texto: 'Fibre creuse siliconée : elle se lave sans se tasser et convient aux personnes allergiques.',
        },
        {
          nombre: 'Trapilho recyclé',
          texto: 'Pour les paniers et les tapis. Il est fait de chutes de l’industrie textile : nous utilisons ce que d’autres jettent.',
        },
        {
          nombre: 'Yeux brodés',
          texto:
            'Sur les amigurumis et tout ce qui est pour bébé, les yeux sont brodés, jamais en plastique. Aucune petite pièce qui puisse être arrachée.',
        },
        {
          nombre: 'Papier et carton',
          texto: 'Nous emballons dans du papier de soie et une boîte en carton, sans plastique. Tout l’emballage est recyclable.',
        },
      ],

      procesoEtiqueta: 'De la laine à chez vous',
      procesoTitulo: 'Comment naît chaque pièce',
      procesoTexto: 'Toujours dans le même ordre, qu’il s’agisse d’une pièce du catalogue ou d’une commande sur mesure des plus originales.',
      proceso: [
        'Nous choisissons la laine et crochetons un échantillon de 10 × 10 cm pour calculer la tension.',
        'Chaque pièce est réalisée du début à la fin par la même personne : deux mains différentes donnent deux tensions différentes, et ça se voit.',
        'Nous la lavons et la bloquons avec des épingles pour qu’elle prenne sa forme définitive.',
        'Nous vérifions coutures et finitions à la loupe. Si quelque chose bouge, on défait et on recommence.',
        'Nous brodons initiales, prénoms ou dates, si vous nous l’avez demandé.',
        'Nous l’emballons dans du papier de soie avec les instructions de lavage écrites à la main.',
      ],

      siNoEtiqueta: 'Pour éviter les malentendus',
      siNoTitulo: 'Ce que nous faisons, et ce que nous ne faisons pas',
      siNoTexto: (pregunta: (texto: string) => ReactNode) => (
        <>
          Nous préférons le dire avant que vous ne commandiez quoi que ce soit, pour qu’aucun de nous ne soit déçu. Si
          vous avez un doute sur un point précis, {pregunta('demandez-nous')}.
        </>
      ),
      siHacemos: 'Nous faisons',
      noHacemos: 'Nous ne faisons pas',
      si: [
        'Changer les couleurs de n’importe quelle pièce du catalogue, sans supplément.',
        'Broder des prénoms, des initiales ou des dates.',
        'Des amigurumis d’après les photos de votre animal.',
        'Ajuster les tailles des bonnets, écharpes et chaussons.',
        'Des coffrets cadeaux sur mesure, avec le mot de votre choix.',
        'Réparer gratuitement, à vie, toute pièce de chez nous qui se serait défaite.',
      ],
      no: [
        'Copier le modèle d’une autre artisane ou d’une marque.',
        'Plus de 15 pièces identiques dans une même commande : nous n’y arriverions pas, et nous préférons le dire.',
        'Des vêtements au patron complexe, comme des gilets ou des robes.',
        'De nouvelles commandes sur mesure en moins d’une semaine.',
        'Vendre des patrons : les nôtres vivent dans nos têtes et dans un carnet plein de ratures.',
      ],

      cierreTitulo: 'Voulez-vous savoir si nous pouvons réaliser ce que vous avez en tête ?',
      pedirEncargo: 'Demander une commande sur mesure',
      verTienda: 'Voir la boutique',
      cierreTexto: 'Écrivez-nous sans engagement. Nous vous dirons la vérité, même si la vérité, c’est que nous n’y arriverons pas.',
    },
    de: {
      titulo: 'Die Werkstatt',
      descripcion:
        'Wer häkelt, wie und warum. Ovillo & Co. ist eine kleine Häkelwerkstatt in Málaga: Materialien, ehrliche Lieferzeiten und unsere Art zu arbeiten.',
      miga: 'Die Werkstatt',
      etiqueta: 'Häkelwerkstatt · Málaga',
      cabecera: (destacado: (texto: string) => ReactNode) => <>Wir häkeln an {destacado('einem Fenster')} mit Blick aufs Meer</>,
      entradilla:
        'Ovillo & Co. ist eine kleine Werkstatt: ein großer Tisch, Körbe voller Wollknäuel, nach Farben sortiert, und das beste Licht im ganzen Haus. Keine Fabrik, kein Lager. Alles, was Sie hier kaufen, fertigen wir von Anfang bis Ende von Hand in Málaga: fast alles gehäkelt und, wenn das Stück es verlangt (eine Mütze, ein Häubchen), mit zwei Nadeln gestrickt.',
      fotoPortada: 'Gehäkelte Bärin mit fliederfarbenem Kleid und türkisfarbenem Schal',
      sello: 'So eine Bärin: fünf Stunden',

      historiaEtiqueta: 'Wie alles anfing',
      historiaTitulo: 'Ein verschlafenes Rehkitz und eine Warteliste',
      historia: [
        'Ovillo & Co. begann 2019 mit einem kleinen Auftrag: einem gehäkelten Rehkitz mit geschlossenen Augen, für ein Baby, das partout nicht einschlafen wollte. Ob es am Rehkitz lag oder am Zufall, wissen wir nicht – aber es hat funktioniert.',
        'Dann kam noch ein Rehkitz, und eine Decke, und eine Warteliste, mit Bleistift an die Kühlschranktür geschrieben. Als die Liste nicht mehr auf die Tür passte, haben wir die Werkstatt gegründet.',
        'Wir sind immer noch wenige und häkeln immer noch am selben Tisch. Häkelnadeln, Garne und Geduld haben sich geändert, unsere Arbeitsweise nicht.',
      ],
      rapidoTitulo: 'Warum wir nicht schneller sind',
      rapido: [
        'Manchmal werden wir gefragt, ob wir das nicht „ein bisschen industrialisieren“ könnten. Könnten wir natürlich. Aber dann wäre das hier etwas anderes.',
        'Eine Decke sind zwölf Stunden. Ein mittelgroßes Amigurumi vier oder fünf. Wenn wir zehn Tage sagen, dann sind es wirklich zehn Tage – keine aufgeblähte Frist, um auf Nummer sicher zu gehen.',
      ],
      polaroids: [
        { alt: 'Hände, die ein weißes Stück häkeln', pie: 'halb fertig' },
        { alt: 'Baumwollknäuel in warmen Tönen neben einer Schere', pie: 'nach Farben sortiert' },
        { alt: 'Wasserblaues Knäuel und eine Häkelnadel aus Holz', pie: 'die bewährten' },
      ],

      materialesEtiqueta: 'Kein Geheimnis',
      materialesTitulo: 'Womit wir arbeiten',
      materialesTexto:
        'Wir kaufen wenig, aber gut. Das macht jedes Stück teurer, sorgt aber dafür, dass eine Decke zehn Jahre hält statt zwei.',
      materiales: [
        {
          nombre: 'Gekämmte Baumwolle',
          texto: 'Für Amigurumis, Decken und Accessoires. Sie verträgt viele Wäschen, verzieht sich nicht und hat genau den richtigen Glanz.',
        },
        {
          nombre: 'Extrafeine Merinowolle',
          texto: 'Für Mützen, Häubchen und Babyschuhe. Sie kratzt nicht, nicht einmal auf Babyhaut, und wärmt enorm für ihr geringes Gewicht.',
        },
        {
          nombre: 'Hypoallergene Füllung',
          texto: 'Silikonisierte Hohlfaser: Sie lässt sich waschen, ohne zu verklumpen, und macht Allergikern keine Probleme.',
        },
        {
          nombre: 'Recyceltes Textilgarn',
          texto: 'Für Körbe und Teppiche. Es wird aus Resten der Textilindustrie gemacht: Wir verwenden, was andere wegwerfen.',
        },
        {
          nombre: 'Gestickte Augen',
          texto:
            'Bei Amigurumis und allem fürs Baby sind die Augen gestickt, nie aus Plastik. Keine Kleinteile, die sich abreißen lassen.',
        },
        {
          nombre: 'Papier und Karton',
          texto: 'Wir verpacken in Seidenpapier und Karton, ohne Plastik. Die gesamte Verpackung ist recycelbar.',
        },
      ],

      procesoEtiqueta: 'Vom Garn zu Ihnen nach Hause',
      procesoTitulo: 'Wie jedes Stück entsteht',
      procesoTexto: 'Immer in derselben Reihenfolge – ob Katalogstück oder ausgefallene Auftragsarbeit.',
      proceso: [
        'Wir wählen das Garn aus und häkeln eine Maschenprobe von 10 × 10 cm, um die Maschenfestigkeit zu bestimmen.',
        'Jedes Stück häkelt von Anfang bis Ende dieselbe Person: Zwei verschiedene Hände häkeln unterschiedlich fest, und das sieht man.',
        'Wir waschen es und spannen es mit Stecknadeln, damit es seine endgültige Form bekommt.',
        'Nähte und Abschlüsse prüfen wir mit der Lupe. Wenn etwas wackelt, wird es aufgetrennt und neu gehäkelt.',
        'Wir sticken Initialen, Namen oder Daten, wenn Sie uns darum gebeten haben.',
        'Wir verpacken es in Seidenpapier, mit handgeschriebener Waschanleitung.',
      ],

      siNoEtiqueta: 'Damit es keine Missverständnisse gibt',
      siNoTitulo: 'Was wir machen und was nicht',
      siNoTexto: (pregunta: (texto: string) => ReactNode) => (
        <>
          Wir sagen es lieber, bevor Sie etwas bestellen, damit am Ende niemand enttäuscht ist. Wenn Sie bei etwas
          Bestimmtem unsicher sind, {pregunta('fragen Sie uns')}.
        </>
      ),
      siHacemos: 'Das machen wir',
      noHacemos: 'Das machen wir nicht',
      si: [
        'Die Farben jedes Katalogstücks ändern, ohne Aufpreis.',
        'Namen, Initialen oder Daten sticken.',
        'Amigurumis nach Fotos Ihres Haustiers.',
        'Größen von Mützen, Schals und Babyschuhen anpassen.',
        'Individuelle Geschenksets mit der Widmung Ihrer Wahl.',
        'Jedes unserer Stücke, das sich gelöst hat, kostenlos reparieren – für immer.',
      ],
      no: [
        'Das Design einer anderen Kunsthandwerkerin oder einer Marke kopieren.',
        'Mehr als 15 gleiche Stücke in einer Bestellung: Das schaffen wir nicht, und das sagen wir lieber gleich.',
        'Kleidung mit aufwendigem Schnitt, etwa Jacken oder Kleider.',
        'Neue Auftragsarbeiten in weniger als einer Woche.',
        'Anleitungen verkaufen: Unsere leben im Kopf und in einem Notizbuch voller Durchgestrichenem.',
      ],

      cierreTitulo: 'Sollen wir Ihnen sagen, ob wir umsetzen können, was Ihnen vorschwebt?',
      pedirEncargo: 'Auftragsarbeit anfragen',
      verTienda: 'Zum Shop',
      cierreTexto: 'Schreiben Sie uns unverbindlich. Wir antworten ehrlich, auch wenn die ehrliche Antwort lautet, dass wir es nicht schaffen.',
    },
  },
);
