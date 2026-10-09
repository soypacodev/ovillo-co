// Textos de la guía de cuidados.

import { textos } from '@/lib/i18n';
import { Enlace } from '@/lib/i18n/enlace';
import { rutas } from '@/lib/rutas';

export const T = textos(
  {
    titulo: 'Cómo lavar y cuidar el crochet',
    descripcion:
      'Guía práctica para lavar, secar y guardar piezas de crochet sin estropearlas: algodón, merino, trapillo, amigurumis y mantas de bebé. Cómo quitar bolitas y arreglar un hilo suelto.',
    miga: 'Cuidados',
    etiqueta: 'Guía de cuidados',
    cabecera: 'Cómo cuidar el crochet sin estropearlo',
    entradilla:
      'Una pieza bien tratada dura décadas; una mal lavada, un verano. Esto es lo que contestamos cada vez que alguien nos pregunta, sin tecnicismos y por orden.',
    indice: 'En esta guía',
    apartados: {
      lavar: 'Lavar',
      materiales: 'Según el material',
      secar: 'Secar',
      guardar: 'Guardar',
      bolitas: 'Bolitas y pelusas',
      hilos: 'Un hilo se ha salido',
      amigurumis: 'Amigurumis',
      bebe: 'Piezas de bebé',
    },
    reglaDeOro: () => (
      <>
        <b>La regla de oro:</b> agua fría, sin retorcer y secado en plano. Solo con eso ya te ahorras el 90 % de los
        disgustos.
      </>
    ),
    lavar: () => (
      <>
        <p>
          A mano casi siempre. Llena un barreño con agua fría o tibia (nunca caliente), echa un chorrito de jabón neutro o
          de champú de bebé y mete la pieza. Apriétala con las manos abiertas, como si amasaras despacio. No frotes una
          parte contra otra: eso es lo que hace que la lana se enfieltre y se quede dura.
        </p>
        <p>
          Déjala cinco minutos, aclara con agua a la misma temperatura y saca el exceso de agua apretando entre las palmas
          o enrollándola en una toalla. <b>Nunca la retuerzas:</b> el peso del agua estira los puntos y la pieza se deforma
          para siempre.
        </p>
      </>
    ),
    lavadoraTitulo: '¿Y en la lavadora?',
    lavadora:
      'Solo si la ficha de la pieza lo dice. El algodón aguanta un programa delicado a 30 °C dentro de una bolsa de red, sin centrifugado o al mínimo. La merino, solo si tu lavadora tiene un programa de lana de verdad. Los amigurumis, nunca: el relleno se apelmaza y se queda lleno de bultos.',
    si: 'Sí',
    no: 'No',
    siLavar: [
      'Agua fría o tibia, nunca caliente',
      'Jabón neutro o champú de bebé',
      'Apretar con las palmas abiertas',
      'Escurrir enrollando en una toalla',
      'Bolsa de red si va a la lavadora',
    ],
    noLavar: [
      'Retorcer para escurrir',
      'Frotar una parte contra otra',
      'Lejía, suavizante o quitamanchas',
      'Secadora, radiador o sol directo',
      'Meter amigurumis en la lavadora',
    ],
    materialesTexto:
      'Cada ficha de la tienda dice de qué está hecha la pieza. Si has perdido la etiqueta, esta tabla resume lo importante:',
    tabla: 'Cómo lavar cada material',
    columnas: ['Material', 'Agua', 'Lavadora', 'Cuidado con'],
    filas: [
      {
        fibra: 'Algodón',
        agua: 'Fría o a 30 °C',
        maquina: 'Sí, programa delicado y en bolsa de red',
        ojo: 'Encoge con calor: nada de secadora',
      },
      {
        fibra: 'Merino',
        agua: 'Fría',
        maquina: 'Solo con programa de lana de verdad',
        ojo: 'Se enfieltra si se frota o cambia de temperatura',
      },
      { fibra: 'Trapillo', agua: 'Fría o a 30 °C', maquina: 'Sí, sin centrifugar', ojo: 'Pesa mucho mojado: sécalo bien extendido' },
      { fibra: 'Amigurumi relleno', agua: 'Fría', maquina: 'No', ojo: 'El relleno se apelmaza: mejor limpiar en seco' },
    ],
    secar: [
      'En plano, siempre. Extiende la pieza sobre una toalla seca encima de una superficie horizontal, dale la forma que quieres que tenga y déjala tranquila. Si la cuelgas, el agua tira hacia abajo y la pieza crece varios centímetros de largo y pierde ancho.',
      'Ni radiador, ni sol directo, ni secadora. El calor encoge el algodón y amarillea los tonos crudos. Una manta grande tarda un día entero en secarse y no hay atajo que valga.',
      'Un truco: cambia la toalla de debajo a la media hora. Absorbe muchísima agua y el secado se acorta casi a la mitad.',
    ],
    guardar: [
      'Dobladas, no colgadas: una percha deja marca de hombros en cualquier prenda de punto. Guárdalas en un cajón o en una caja de tela, no en bolsas de plástico cerradas, porque la lana necesita respirar o coge olor a humedad.',
      'Si guardas lana durante el verano, mete en el cajón una pastilla de cedro o una bolsita de lavanda. Las polillas no van a por la lana en sí, sino a por los restos de sudor y comida, así que guárdala siempre limpia.',
    ],
    bolitas: [
      'Salen en las zonas de roce y no significan que la lana sea mala: le pasa hasta al cachemir. Se quitan con una maquinilla quitapelusas, pasándola sin apretar, o con un peine fino para lana.',
      'No las cortes con tijeras a lo bruto: te llevas fibra por delante y haces un hueco.',
    ],
    hilos: () => (
      <>
        <p>
          Que no cunda el pánico y, sobre todo, <b>no tires del hilo</b>. Coge una aguja lanera o un ganchillo fino y
          empuja el hilo suelto hacia dentro de la pieza, por donde salió. Casi siempre desaparece y no se nota nada.
        </p>
        <p>
          Si se ha soltado un remate o ves un agujero, mándanos una foto y te decimos si puedes arreglarlo tú o si es
          mejor que nos lo mandes. <b>Las piezas nuestras las arreglamos gratis, aunque las compraras hace años.</b> Solo
          pagas el envío de vuelta.
        </p>
      </>
    ),
    amigurumis: [
      'Son los más delicados porque llevan relleno. Lo ideal es limpiarlos en seco: un paño húmedo con jabón neutro sobre la mancha y a secar. Si hay que lavarlo entero, a mano y rápido, apretando poco, y luego déjalo secar de pie sobre una toalla para que no pierda la forma.',
      'Si con el tiempo el relleno se apelmaza, masajéalo con los dedos para devolverle el aire. Se nota bastante.',
    ],
    bebe: () => (
      <>
        <p>
          Lávalas a mano antes del primer uso, aunque estén nuevas: se quitan restos del tinte y quedan más suaves. Usa
          jabón sin perfume.
        </p>
        <p>
          Y algo importante que no tiene que ver con el lavado: por muy bonita que sea la manta,{' '}
          <b>no dejes nada suelto en la cuna de un bebé menor de un año mientras duerme</b>. Nuestras mantas son para el
          cochecito, el sofá, las fotos y para arropar mientras estáis despiertos, y las guirnaldas van en la pared o en la
          estantería, fuera de su alcance. Si tienes dudas, consulta las{' '}
          <Enlace href={rutas.contacto}>preguntas frecuentes</Enlace> o escríbenos.
        </p>
      </>
    ),
    cierreTitulo: '¿Te queda alguna duda con tu pieza?',
    escribirnos: 'Escribirnos',
    cierreTexto:
      'Mándanos una foto y te decimos exactamente qué hacer. Es gratis, y nos gusta saber que las piezas siguen vivas por ahí.',
  },
  {
    en: {
      titulo: 'How to wash and care for crochet',
      descripcion:
        'A practical guide to washing, drying and storing crochet without ruining it: cotton, merino, T-shirt yarn, amigurumis and baby blankets. How to remove bobbles and fix a loose thread.',
      miga: 'Care',
      etiqueta: 'Care guide',
      cabecera: 'How to care for crochet without ruining it',
      entradilla:
        'A well-treated piece lasts for decades; a badly washed one, a single summer. This is what we tell everyone who asks, without the jargon and in order.',
      indice: 'In this guide',
      apartados: {
        lavar: 'Washing',
        materiales: 'By material',
        secar: 'Drying',
        guardar: 'Storing',
        bolitas: 'Bobbles and fluff',
        hilos: 'A thread has come loose',
        amigurumis: 'Amigurumis',
        bebe: 'Baby pieces',
      },
      reglaDeOro: () => (
        <>
          <b>The golden rule:</b> cold water, no wringing and dry flat. That alone will save you 90% of the heartache.
        </>
      ),
      lavar: () => (
        <>
          <p>
            By hand, almost always. Fill a basin with cold or lukewarm water (never hot), add a splash of mild soap or baby
            shampoo and put the piece in. Press it gently with open hands, as if slowly kneading dough. Don’t rub one part
            against another: that’s what makes wool felt and go stiff.
          </p>
          <p>
            Leave it for five minutes, rinse in water at the same temperature and press out the excess water between your
            palms or by rolling it up in a towel. <b>Never wring it:</b> the weight of the water stretches the stitches and
            the piece loses its shape for good.
          </p>
        </>
      ),
      lavadoraTitulo: 'What about the washing machine?',
      lavadora:
        'Only if the product page says so. Cotton can handle a delicate cycle at 30 °C inside a mesh bag, with no spin or the lowest setting. Merino, only if your machine has a genuine wool programme. Amigurumis, never: the stuffing clumps together and ends up full of lumps.',
      si: 'Do',
      no: 'Don’t',
      siLavar: [
        'Cold or lukewarm water, never hot',
        'Mild soap or baby shampoo',
        'Press with open palms',
        'Roll in a towel to remove water',
        'A mesh bag if it goes in the machine',
      ],
      noLavar: [
        'Wring it out',
        'Rub one part against another',
        'Bleach, fabric softener or stain remover',
        'Tumble dryer, radiator or direct sun',
        'Put amigurumis in the washing machine',
      ],
      materialesTexto:
        'Every product page in the shop says what the piece is made of. If you’ve lost the label, this table sums up what matters:',
      tabla: 'How to wash each material',
      columnas: ['Material', 'Water', 'Washing machine', 'Watch out for'],
      filas: [
        {
          fibra: 'Cotton',
          agua: 'Cold or 30 °C',
          maquina: 'Yes, delicate cycle in a mesh bag',
          ojo: 'Shrinks with heat: no tumble dryer',
        },
        {
          fibra: 'Merino',
          agua: 'Cold',
          maquina: 'Only on a genuine wool programme',
          ojo: 'Felts if rubbed or if the temperature changes',
        },
        { fibra: 'T-shirt yarn', agua: 'Cold or 30 °C', maquina: 'Yes, no spin', ojo: 'Very heavy when wet: dry it well spread out' },
        { fibra: 'Stuffed amigurumi', agua: 'Cold', maquina: 'No', ojo: 'The stuffing clumps: best to spot-clean' },
      ],
      secar: [
        'Flat, always. Lay the piece on a dry towel on a level surface, ease it into the shape you want it to keep and leave it be. If you hang it up, the water pulls it down and the piece grows several centimetres longer and loses width.',
        'No radiator, no direct sun, no tumble dryer. Heat shrinks cotton and yellows natural shades. A large blanket takes a whole day to dry and there’s no shortcut.',
        'A tip: swap the towel underneath after half an hour. It soaks up a lot of water and the drying time is almost halved.',
      ],
      guardar: [
        'Folded, not hung: a hanger leaves shoulder marks on any knitted or crocheted garment. Keep them in a drawer or a fabric box, not in sealed plastic bags, because wool needs to breathe or it starts to smell damp.',
        'If you’re putting wool away for the summer, tuck a cedar block or a lavender sachet in the drawer. Moths aren’t after the wool itself but the traces of sweat and food, so always store it clean.',
      ],
      bolitas: [
        'They appear where there’s friction and don’t mean the yarn is poor quality: it even happens to cashmere. Remove them with a fabric shaver, passing it over lightly, or with a fine wool comb.',
        'Don’t hack at them with scissors: you’ll take fibre with them and leave a hole.',
      ],
      hilos: () => (
        <>
          <p>
            Don’t panic and, above all, <b>don’t pull the thread</b>. Take a tapestry needle or a fine crochet hook and push
            the loose thread back into the piece, where it came out. It almost always disappears without a trace.
          </p>
          <p>
            If a finishing knot has come undone or you can see a hole, send us a photo and we’ll tell you whether you can
            fix it yourself or whether it’s better to send it to us. <b>We repair our own pieces for free, even if you
            bought them years ago.</b> You only pay for the return postage.
          </p>
        </>
      ),
      amigurumis: [
        'They’re the most delicate because they’re stuffed. Ideally, spot-clean them: a damp cloth with mild soap on the stain, then leave to dry. If it needs a full wash, do it by hand and quickly, pressing gently, then let it dry standing up on a towel so it keeps its shape.',
        'If the stuffing gets flattened over time, massage it with your fingers to fluff it back up. It makes quite a difference.',
      ],
      bebe: () => (
        <>
          <p>
            Wash them by hand before first use, even though they’re new: it removes any traces of dye and makes them
            softer. Use unscented soap.
          </p>
          <p>
            And something important that has nothing to do with washing: however pretty the blanket,{' '}
            <b>never leave anything loose in the cot of a baby under one year old while they sleep</b>. Our blankets are for
            the pram, the sofa, photos and snuggling while you’re awake, and garlands go on the wall or a shelf, out of
            reach. If you’re unsure, have a look at the <Enlace href={rutas.contacto}>frequently asked questions</Enlace> or
            write to us.
          </p>
        </>
      ),
      cierreTitulo: 'Still have a question about your piece?',
      escribirnos: 'Write to us',
      cierreTexto:
        'Send us a photo and we’ll tell you exactly what to do. It’s free, and we love knowing our pieces are still out there being loved.',
    },
    fr: {
      titulo: 'Comment laver et entretenir le crochet',
      descripcion:
        'Guide pratique pour laver, sécher et ranger vos pièces au crochet sans les abîmer : coton, mérinos, trapilho, amigurumis et couvertures de bébé. Comment enlever les bouloches et réparer un fil qui dépasse.',
      miga: 'Entretien',
      etiqueta: 'Guide d’entretien',
      cabecera: 'Entretenir le crochet sans l’abîmer',
      entradilla:
        'Une pièce bien traitée dure des décennies ; une pièce mal lavée, un été. Voici ce que nous répondons chaque fois qu’on nous pose la question, sans jargon et dans l’ordre.',
      indice: 'Dans ce guide',
      apartados: {
        lavar: 'Laver',
        materiales: 'Selon la matière',
        secar: 'Sécher',
        guardar: 'Ranger',
        bolitas: 'Bouloches et peluches',
        hilos: 'Un fil dépasse',
        amigurumis: 'Amigurumis',
        bebe: 'Pièces pour bébé',
      },
      reglaDeOro: () => (
        <>
          <b>La règle d’or{' '}:</b> eau froide, sans tordre et séchage à plat. Rien qu’avec ça, vous vous épargnez
          90{' '}% des déceptions.
        </>
      ),
      lavar: () => (
        <>
          <p>
            À la main, presque toujours. Remplissez une bassine d’eau froide ou tiède (jamais chaude), ajoutez un filet de
            savon neutre ou de shampooing pour bébé et plongez-y la pièce. Pressez-la mains ouvertes, comme si vous pétrissiez
            doucement. Ne frottez pas une partie contre une autre{' '}: c’est ce qui fait feutrer la laine et la rend
            raide.
          </p>
          <p>
            Laissez tremper cinq minutes, rincez à la même température et retirez l’excédent d’eau en pressant entre vos
            paumes ou en l’enroulant dans une serviette. <b>Ne la tordez jamais{' '}:</b> le poids de l’eau étire les
            mailles et la pièce se déforme pour toujours.
          </p>
        </>
      ),
      lavadoraTitulo: 'Et en machine ?',
      lavadora:
        'Seulement si la fiche de la pièce l’indique. Le coton supporte un programme délicat à 30 °C dans un filet de lavage, sans essorage ou au minimum. Le mérinos, seulement si votre machine a un vrai programme laine. Les amigurumis, jamais : le rembourrage se tasse et se remplit de grumeaux.',
      si: 'Oui',
      no: 'Non',
      siLavar: [
        'Eau froide ou tiède, jamais chaude',
        'Savon neutre ou shampooing pour bébé',
        'Presser mains ouvertes',
        'Essorer en roulant dans une serviette',
        'Filet de lavage pour la machine',
      ],
      noLavar: [
        'Tordre pour essorer',
        'Frotter une partie contre une autre',
        'Eau de Javel, adoucissant ou détachant',
        'Sèche-linge, radiateur ou plein soleil',
        'Mettre les amigurumis en machine',
      ],
      materialesTexto:
        'Chaque fiche de la boutique indique de quoi la pièce est faite. Si vous avez perdu l’étiquette, ce tableau résume l’essentiel :',
      tabla: 'Comment laver chaque matière',
      columnas: ['Matière', 'Eau', 'Machine', 'Attention à'],
      filas: [
        {
          fibra: 'Coton',
          agua: 'Froide ou 30 °C',
          maquina: 'Oui, programme délicat et filet de lavage',
          ojo: 'Rétrécit à la chaleur : pas de sèche-linge',
        },
        {
          fibra: 'Mérinos',
          agua: 'Froide',
          maquina: 'Seulement avec un vrai programme laine',
          ojo: 'Feutre si on le frotte ou si la température change',
        },
        {
          fibra: 'Trapilho',
          agua: 'Froide ou 30 °C',
          maquina: 'Oui, sans essorage',
          ojo: 'Très lourd mouillé : bien l’étaler pour sécher',
        },
        { fibra: 'Amigurumi rembourré', agua: 'Froide', maquina: 'Non', ojo: 'Le rembourrage se tasse : nettoyer plutôt à sec' },
      ],
      secar: [
        'À plat, toujours. Étalez la pièce sur une serviette sèche posée sur une surface plane, donnez-lui la forme qu’elle doit garder et laissez-la tranquille. Si vous la suspendez, l’eau tire vers le bas : la pièce s’allonge de plusieurs centimètres et perd en largeur.',
        'Ni radiateur, ni plein soleil, ni sèche-linge. La chaleur fait rétrécir le coton et jaunir les tons écrus. Une grande couverture met une journée entière à sécher, et il n’y a pas de raccourci.',
        'Une astuce : changez la serviette du dessous au bout d’une demi-heure. Elle absorbe énormément d’eau et le séchage est presque deux fois plus court.',
      ],
      guardar: [
        'Pliées, pas suspendues : un cintre marque les épaules de n’importe quel vêtement en maille. Rangez-les dans un tiroir ou une boîte en tissu, pas dans des sacs plastique fermés, car la laine a besoin de respirer, sinon elle prend une odeur d’humidité.',
        'Si vous rangez de la laine pour l’été, glissez dans le tiroir un bloc de cèdre ou un sachet de lavande. Les mites ne s’attaquent pas à la laine elle-même mais aux traces de transpiration et de nourriture : rangez-la donc toujours propre.',
      ],
      bolitas: [
        'Elles apparaissent dans les zones de frottement et ne veulent pas dire que la laine est de mauvaise qualité : cela arrive même au cachemire. On les enlève avec un rasoir anti-bouloches, passé sans appuyer, ou avec un peigne fin pour la laine.',
        'Ne les coupez pas aux ciseaux n’importe comment : vous emporteriez de la fibre et feriez un trou.',
      ],
      hilos: () => (
        <>
          <p>
            Pas de panique et, surtout, <b>ne tirez pas sur le fil</b>. Prenez une aiguille à laine ou un crochet fin et
            repoussez le fil vers l’intérieur de la pièce, par là où il est sorti. Il disparaît presque toujours et on ne voit
            plus rien.
          </p>
          <p>
            Si une finition s’est défaite ou si vous voyez un trou, envoyez-nous une photo et nous vous dirons si vous pouvez
            la réparer vous-même ou s’il vaut mieux nous l’envoyer.{' '}
            <b>Nous réparons gratuitement nos pièces, même achetées il y a des années.</b> Vous ne payez que le renvoi.
          </p>
        </>
      ),
      amigurumis: [
        'Ce sont les plus délicats, car ils sont rembourrés. L’idéal est de les nettoyer à sec : un chiffon humide avec du savon neutre sur la tache, puis séchage. S’il faut le laver entièrement, à la main et rapidement, en pressant peu, puis laissez-le sécher debout sur une serviette pour qu’il garde sa forme.',
        'Si, avec le temps, le rembourrage se tasse, massez-le du bout des doigts pour lui redonner du volume. Ça se voit vraiment.',
      ],
      bebe: () => (
        <>
          <p>
            Lavez-les à la main avant la première utilisation, même neuves : cela élimine les restes de teinture et les
            rend plus douces. Utilisez un savon sans parfum.
          </p>
          <p>
            Et une chose importante qui n’a rien à voir avec le lavage{' '}: aussi jolie que soit la couverture,{' '}
            <b>ne laissez rien dans le lit d’un bébé de moins d’un an pendant qu’il dort</b>. Nos couvertures sont faites pour
            la poussette, le canapé, les photos et pour câliner quand vous êtes réveillés, et les guirlandes se mettent au mur
            ou sur une étagère, hors de sa portée. En cas de doute, consultez les{' '}
            <Enlace href={rutas.contacto}>questions fréquentes</Enlace> ou écrivez-nous.
          </p>
        </>
      ),
      cierreTitulo: 'Encore une question sur votre pièce ?',
      escribirnos: 'Nous écrire',
      cierreTexto:
        'Envoyez-nous une photo et nous vous dirons exactement quoi faire. C’est gratuit, et nous aimons savoir que nos pièces vivent toujours leur vie.',
    },
    de: {
      titulo: 'Gehäkeltes richtig waschen und pflegen',
      descripcion:
        'Praktischer Ratgeber zum Waschen, Trocknen und Aufbewahren von Häkelstücken, ohne sie zu ruinieren: Baumwolle, Merino, Textilgarn, Amigurumis und Babydecken. Wie man Knötchen entfernt und einen losen Faden repariert.',
      miga: 'Pflege',
      etiqueta: 'Pflegeratgeber',
      cabecera: 'Gehäkeltes pflegen, ohne es zu ruinieren',
      entradilla:
        'Ein gut behandeltes Stück hält Jahrzehnte, ein falsch gewaschenes einen Sommer. Das antworten wir jedes Mal, wenn uns jemand fragt – ohne Fachchinesisch und der Reihe nach.',
      indice: 'In diesem Ratgeber',
      apartados: {
        lavar: 'Waschen',
        materiales: 'Je nach Material',
        secar: 'Trocknen',
        guardar: 'Aufbewahren',
        bolitas: 'Knötchen und Fusseln',
        hilos: 'Ein Faden hat sich gelöst',
        amigurumis: 'Amigurumis',
        bebe: 'Babystücke',
      },
      reglaDeOro: () => (
        <>
          <b>Die goldene Regel:</b> kaltes Wasser, nicht auswringen und liegend trocknen. Allein damit ersparen Sie sich
          90{' '}% des Ärgers.
        </>
      ),
      lavar: () => (
        <>
          <p>
            Fast immer von Hand. Füllen Sie eine Schüssel mit kaltem oder lauwarmem Wasser (nie heiß), geben Sie einen
            Spritzer Feinwaschmittel oder Babyshampoo dazu und legen Sie das Stück hinein. Drücken Sie es mit flachen Händen,
            als würden Sie langsam Teig kneten. Reiben Sie keine Stelle an einer anderen: Genau davon verfilzt Wolle und
            wird hart.
          </p>
          <p>
            Lassen Sie es fünf Minuten einweichen, spülen Sie es mit gleich temperiertem Wasser aus und drücken Sie das
            überschüssige Wasser zwischen den Handflächen heraus oder rollen Sie es in ein Handtuch. <b>Niemals
            auswringen:</b> Das Gewicht des Wassers dehnt die Maschen, und das Stück verliert für immer seine Form.
          </p>
        </>
      ),
      lavadoraTitulo: 'Und in der Waschmaschine?',
      lavadora:
        'Nur wenn es auf der Produktseite steht. Baumwolle verträgt ein Schonprogramm bei 30 °C im Wäschenetz, ohne Schleudern oder auf niedrigster Stufe. Merino nur, wenn Ihre Maschine ein echtes Wollprogramm hat. Amigurumis nie: Die Füllung verklumpt und wird ganz knubbelig.',
      si: 'Ja',
      no: 'Nein',
      siLavar: [
        'Kaltes oder lauwarmes Wasser, nie heiß',
        'Feinwaschmittel oder Babyshampoo',
        'Mit flachen Händen drücken',
        'In ein Handtuch gerollt ausdrücken',
        'Wäschenetz, wenn es in die Maschine geht',
      ],
      noLavar: [
        'Zum Entwässern auswringen',
        'Stellen aneinander reiben',
        'Bleichmittel, Weichspüler oder Fleckenentferner',
        'Trockner, Heizung oder direkte Sonne',
        'Amigurumis in die Waschmaschine stecken',
      ],
      materialesTexto:
        'Auf jeder Produktseite im Shop steht, woraus das Stück besteht. Falls Sie das Etikett verloren haben, fasst diese Tabelle das Wichtigste zusammen:',
      tabla: 'So wäscht man jedes Material',
      columnas: ['Material', 'Wasser', 'Waschmaschine', 'Vorsicht bei'],
      filas: [
        {
          fibra: 'Baumwolle',
          agua: 'Kalt oder 30 °C',
          maquina: 'Ja, Schonprogramm im Wäschenetz',
          ojo: 'Läuft bei Hitze ein: kein Trockner',
        },
        {
          fibra: 'Merino',
          agua: 'Kalt',
          maquina: 'Nur mit echtem Wollprogramm',
          ojo: 'Verfilzt durch Reiben oder Temperaturwechsel',
        },
        {
          fibra: 'Textilgarn',
          agua: 'Kalt oder 30 °C',
          maquina: 'Ja, ohne Schleudern',
          ojo: 'Nass sehr schwer: gut ausgebreitet trocknen',
        },
        { fibra: 'Gefülltes Amigurumi', agua: 'Kalt', maquina: 'Nein', ojo: 'Die Füllung verklumpt: besser nur oberflächlich reinigen' },
      ],
      secar: [
        'Immer liegend. Breiten Sie das Stück auf einem trockenen Handtuch auf einer ebenen Fläche aus, bringen Sie es in die gewünschte Form und lassen Sie es in Ruhe. Wenn Sie es aufhängen, zieht das Wasser nach unten: Das Stück wird mehrere Zentimeter länger und schmaler.',
        'Keine Heizung, keine direkte Sonne, kein Trockner. Hitze lässt Baumwolle einlaufen und naturfarbene Töne vergilben. Eine große Decke braucht einen ganzen Tag zum Trocknen, und eine Abkürzung gibt es nicht.',
        'Ein Trick: Tauschen Sie das Handtuch darunter nach einer halben Stunde aus. Es saugt sehr viel Wasser auf, und die Trockenzeit halbiert sich fast.',
      ],
      guardar: [
        'Gefaltet, nicht aufgehängt: Ein Bügel hinterlässt bei jedem Strick- oder Häkelteil Abdrücke an den Schultern. Bewahren Sie die Stücke in einer Schublade oder einer Stoffbox auf, nicht in verschlossenen Plastiktüten – Wolle muss atmen, sonst riecht sie muffig.',
        'Wenn Sie Wolle über den Sommer wegräumen, legen Sie ein Stück Zedernholz oder ein Lavendelsäckchen in die Schublade. Motten interessieren sich nicht für die Wolle selbst, sondern für Reste von Schweiß und Essen – bewahren Sie sie also immer sauber auf.',
      ],
      bolitas: [
        'Sie entstehen an Reibestellen und bedeuten nicht, dass die Wolle schlecht ist: Das passiert sogar bei Kaschmir. Man entfernt sie mit einem Fusselrasierer, ohne Druck darübergeführt, oder mit einem feinen Wollkamm.',
        'Schneiden Sie sie nicht grob mit der Schere ab: Dabei nehmen Sie Fasern mit und hinterlassen ein Loch.',
      ],
      hilos: () => (
        <>
          <p>
            Keine Panik und vor allem: <b>nicht am Faden ziehen</b>. Nehmen Sie eine Wollnadel oder eine feine Häkelnadel
            und schieben Sie den losen Faden dort, wo er herauskam, zurück ins Stück. Fast immer verschwindet er, und man
            sieht nichts mehr.
          </p>
          <p>
            Wenn sich ein Abschluss gelöst hat oder Sie ein Loch sehen, schicken Sie uns ein Foto, und wir sagen Ihnen, ob
            Sie es selbst reparieren können oder es besser zu uns schicken.{' '}
            <b>Unsere eigenen Stücke reparieren wir kostenlos, auch wenn Sie sie vor Jahren gekauft haben.</b> Sie zahlen nur
            den Rückversand.
          </p>
        </>
      ),
      amigurumis: [
        'Sie sind am empfindlichsten, weil sie gefüllt sind. Am besten reinigt man sie nur oberflächlich: ein feuchtes Tuch mit etwas Feinwaschmittel auf den Fleck und trocknen lassen. Muss es ganz gewaschen werden, dann von Hand, schnell und mit wenig Druck; danach aufrecht auf einem Handtuch trocknen lassen, damit es seine Form behält.',
        'Wenn die Füllung mit der Zeit zusammenfällt, massieren Sie sie mit den Fingern wieder auf. Das macht einen deutlichen Unterschied.',
      ],
      bebe: () => (
        <>
          <p>
            Waschen Sie sie vor dem ersten Gebrauch von Hand, auch wenn sie neu sind: So lösen sich Farbreste, und sie
            werden weicher. Verwenden Sie parfümfreies Waschmittel.
          </p>
          <p>
            Und etwas Wichtiges, das nichts mit dem Waschen zu tun hat: So hübsch die Decke auch ist,{' '}
            <b>legen Sie nichts Loses ins Bettchen eines Babys unter einem Jahr, solange es schläft</b>. Unsere Decken sind
            für den Kinderwagen, das Sofa, Fotos und zum Zudecken, solange alle wach sind; Girlanden gehören an die Wand oder
            ins Regal, außer Reichweite. Wenn Sie unsicher sind, lesen Sie die{' '}
            <Enlace href={rutas.contacto}>häufigen Fragen</Enlace> oder schreiben Sie uns.
          </p>
        </>
      ),
      cierreTitulo: 'Noch eine Frage zu Ihrem Stück?',
      escribirnos: 'Schreiben Sie uns',
      cierreTexto:
        'Schicken Sie uns ein Foto, und wir sagen Ihnen genau, was zu tun ist. Das ist kostenlos, und wir freuen uns zu wissen, dass unsere Stücke noch da draußen weiterleben.',
    },
  },
);
