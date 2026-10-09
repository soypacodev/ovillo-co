// Página de confirmación de un pedido, venga de Stripe (modo prueba) o
// del modo demostración. No usa estado propio: la pinta el servidor
// cuando hay sesión de Stripe y el navegador en el modo demostración.

import Image from 'next/image';
import type { ReactNode } from 'react';
import { IcoInfo, Ovillo } from '@/componentes/iconos';
import { fechaLarga } from '@/lib/fechas';
import { eur, eurMenos } from '@/lib/formato';
import { textos, type Idioma } from '@/lib/i18n';
import { Enlace } from '@/lib/i18n/enlace';
import type { ResumenPedido } from '@/lib/pagos/tipos';
import { rutas } from '@/lib/rutas';
import { BotonImprimir } from './boton-imprimir';
import { Confeti } from './confeti';
import { VaciarAlConfirmar } from './vaciar-al-confirmar';

const T = textos(
  {
    avisoDemo: 'Pedido de demostración: no se ha realizado ningún pago ni se ha pedido ninguna tarjeta.',
    avisoPendiente:
      'Stripe aún no ha confirmado el pago. En cuanto lo haga, el pedido queda en marcha; tu cesta sigue guardada por si acaso.',
    avisoPagado: 'Pago de prueba con Stripe: no se ha cobrado nada real.',
    recibido: 'Pedido recibido',
    recibidoPendiente: 'Ya tenemos tus datos. Falta que el banco confirme el pago.',
    recibidoHecho: 'Ahora mismo. Ya tenemos tus datos y el pedido está en marcha.',
    tejiendo: 'Lo estamos tejiendo',
    preparando: 'Preparando el paquete',
    tejiendoTexto: 'Te escribimos cuando lo empecemos. Si quieres fotos del proceso, pídenoslas.',
    preparandoTexto: 'Lo envolvemos en papel de seda con las instrucciones de lavado escritas a mano.',
    listoRecoger: 'Listo para recoger',
    listoRecogerTexto: 'Te escribimos para darte cita en el taller, en Málaga.',
    deCamino: 'De camino',
    deCaminoTexto: (envio: string, plazo: string) =>
      `Te mandamos el seguimiento del ${envio.toLowerCase()} en cuanto salga${plazo ? ` (${plazo.toLowerCase()})` : ''}.`,
    enTusManos: 'En tus manos',
    enTuCasa: 'En tu casa',
    finalTexto: 'Si algo no está como esperabas, escríbenos y lo solucionamos.',
    fecha: 'Fecha',
    aNombre: 'A nombre de',
    correo: 'Correo',
    direccion: 'Dirección',
    recogida: 'Recogida',
    recogidaTexto: 'En el taller, en Málaga, con cita',
    envio: 'Envío',
    regalo: 'Regalo',
    regaloTexto: 'Envuelto para regalar, sin precio en el paquete',
    dedicatoria: 'Dedicatoria',
    nota: 'Tu nota',
    cita: (texto: string) => `«${texto}»`,
    enProceso: 'Pago en proceso',
    confirmado: 'Pedido confirmado',
    casi: 'Casi está',
    gracias: '¡Gracias! Nos ponemos con ello',
    plazoEncargo: (dias: number) => `Como hay piezas que se tejen al pedir, calcula unos ${dias} días antes de que salga.`,
    plazoRecogida: 'Todo está hecho: en 24–48 horas lo tendrás listo para recoger.',
    plazoEnvio: 'Todo está hecho, así que sale del taller en 24–48 horas.',
    sinCorreo: (email: ReactNode) => (
      <>
        Al ser una tienda de demostración no te llegará ningún correo; en la tienda real, la confirmación iría a{' '}
        {email}.
      </>
    ),
    seguirMirando: 'Seguir mirando',
    queAhora: 'Qué pasa ahora',
    hecho: ' (hecho)',
    pedido: 'Lo que has pedido',
    unidades: (n: number) => `${n} ud.`,
    bordado: (texto: string) => ` · bordado «${texto}»`,
    subtotal: 'Subtotal',
    gratis: 'Gratis',
    totalDemo: 'Total (sin cobrar)',
    totalPagado: 'Total pagado',
    favor: '¿Nos haces un favor?',
    favorTexto:
      'Cuando te llegue, si te gusta, mándanos una foto en casa. Con tu permiso la ponemos en la web: así quien dude ve las piezas de verdad y no solo nuestras fotos.',
    mandarFoto: 'Mandarnos una foto',
    datosPedido: 'Datos del pedido',
    numero: 'Número de pedido',
    problema: '¿Algún problema?',
    problemaTexto:
      'Escríbenos con tu número de pedido y lo arreglamos. Te contesta el taller, no un departamento de atención al cliente.',
    escribirnos: 'Escribirnos',
  },
  {
    en: {
      avisoDemo: 'Demo order: no payment has been made and no card has been requested.',
      avisoPendiente:
        'Stripe hasn’t confirmed the payment yet. As soon as it does, your order is under way; your basket is still saved just in case.',
      avisoPagado: 'Test payment with Stripe: nothing real has been charged.',
      recibido: 'Order received',
      recibidoPendiente: 'We have your details. We’re just waiting for the bank to confirm the payment.',
      recibidoHecho: 'Just now. We have your details and your order is under way.',
      tejiendo: 'We’re crocheting your order',
      preparando: 'Getting your parcel ready',
      tejiendoTexto: 'We’ll write to you when we start. If you’d like photos of the process, just ask.',
      preparandoTexto: 'We wrap it in tissue paper with handwritten washing instructions.',
      listoRecoger: 'Ready for collection',
      listoRecogerTexto: 'We’ll write to arrange a time to collect it from the workshop in Málaga.',
      deCamino: 'On its way',
      deCaminoTexto: (envio: string, plazo: string) =>
        `We’ll send you the ${envio.toLowerCase()} tracking as soon as it ships${plazo ? ` (${plazo.toLowerCase()})` : ''}.`,
      enTusManos: 'In your hands',
      enTuCasa: 'At your door',
      finalTexto: 'If anything isn’t as you expected, write to us and we’ll sort it out.',
      fecha: 'Date',
      aNombre: 'Name',
      correo: 'Email',
      direccion: 'Address',
      recogida: 'Collection',
      recogidaTexto: 'From the workshop in Málaga, by appointment',
      envio: 'Delivery',
      regalo: 'Gift',
      regaloTexto: 'Gift-wrapped, with no price in the parcel',
      dedicatoria: 'Message',
      nota: 'Your note',
      cita: (texto: string) => `“${texto}”`,
      enProceso: 'Payment in progress',
      confirmado: 'Order confirmed',
      casi: 'Almost there',
      gracias: 'Thank you! We’re on it',
      plazoEncargo: (dias: number) =>
        `As some items are made to order, allow about ${dias} days before it ships.`,
      plazoRecogida: 'Everything is ready: it will be ready for collection within 24–48 hours.',
      plazoEnvio: 'Everything is ready, so it leaves the workshop within 24–48 hours.',
      sinCorreo: (email: ReactNode) => (
        <>
          As this is a demo shop, you won’t receive any email; in the real shop, the confirmation would go to {email}.
        </>
      ),
      seguirMirando: 'Keep browsing',
      queAhora: 'What happens next',
      hecho: ' (done)',
      pedido: 'What you ordered',
      unidades: (n: number) => (n === 1 ? '1 item' : `${n} items`),
      bordado: (texto: string) => ` · embroidered “${texto}”`,
      subtotal: 'Subtotal',
      gratis: 'Free',
      totalDemo: 'Total (not charged)',
      totalPagado: 'Total paid',
      favor: 'Could you do us a favour?',
      favorTexto:
        'When it arrives, if you like it, send us a photo of it at home. With your permission we’ll put it on the website: that way anyone unsure can see the real pieces, not just our photos.',
      mandarFoto: 'Send us a photo',
      datosPedido: 'Order details',
      numero: 'Order number',
      problema: 'Any problems?',
      problemaTexto:
        'Write to us with your order number and we’ll put it right. You’ll hear back from the workshop, not a customer service department.',
      escribirnos: 'Write to us',
    },
    fr: {
      avisoDemo: 'Commande de démonstration\u00a0: aucun paiement n’a été effectué et aucune carte n’a été demandée.',
      avisoPendiente:
        'Stripe n’a pas encore confirmé le paiement. Dès que ce sera fait, votre commande sera lancée\u202f; votre panier reste enregistré au cas où.',
      avisoPagado: 'Paiement test avec Stripe\u00a0: rien n’a été réellement débité.',
      recibido: 'Commande reçue',
      recibidoPendiente: 'Nous avons vos coordonnées. Il ne manque que la confirmation du paiement par la banque.',
      recibidoHecho: 'À l’instant. Nous avons vos coordonnées et votre commande est lancée.',
      tejiendo: 'Nous crochetons votre commande',
      preparando: 'Préparation du colis',
      tejiendoTexto: 'Nous vous écrirons quand nous commencerons. Si vous voulez des photos de l’avancement, demandez-les-nous.',
      preparandoTexto: 'Nous l’emballons dans du papier de soie avec les instructions de lavage écrites à la main.',
      listoRecoger: 'Prête à être retirée',
      listoRecogerTexto: 'Nous vous écrirons pour fixer un rendez-vous à l’atelier, à Málaga.',
      deCamino: 'En route',
      deCaminoTexto: (envio: string, plazo: string) =>
        `Nous vous enverrons le suivi de la ${envio.toLowerCase()} dès son départ${plazo ? ` (${plazo.toLowerCase()})` : ''}.`,
      enTusManos: 'Entre vos mains',
      enTuCasa: 'Chez vous',
      finalTexto: 'Si quelque chose ne correspond pas à vos attentes, écrivez-nous et nous trouverons une solution.',
      fecha: 'Date',
      aNombre: 'Au nom de',
      correo: 'E-mail',
      direccion: 'Adresse',
      recogida: 'Retrait',
      recogidaTexto: 'À l’atelier, à Málaga, sur rendez-vous',
      envio: 'Livraison',
      regalo: 'Cadeau',
      regaloTexto: 'Emballé pour offrir, sans le prix dans le colis',
      dedicatoria: 'Dédicace',
      nota: 'Votre note',
      cita: (texto: string) => `«\u00a0${texto}\u00a0»`,
      enProceso: 'Paiement en cours',
      confirmado: 'Commande confirmée',
      casi: 'Presque terminé',
      gracias: 'Merci\u202f! Nous nous y mettons',
      plazoEncargo: (dias: number) =>
        `Comme certaines pièces sont crochetées à la commande, comptez environ ${dias} jours avant l’expédition.`,
      plazoRecogida: 'Tout est déjà fait\u00a0: elle sera prête à être retirée sous 24 à 48 heures.',
      plazoEnvio: 'Tout est déjà fait, la commande quitte donc l’atelier sous 24 à 48 heures.',
      sinCorreo: (email: ReactNode) => (
        <>
          {'Comme il s’agit d’une boutique de démonstration, vous ne recevrez aucun e-mail\u202f; dans la vraie boutique, '}
          la confirmation serait envoyée à {email}.
        </>
      ),
      seguirMirando: 'Continuer la visite',
      queAhora: 'Et maintenant\u202f?',
      hecho: ' (fait)',
      pedido: 'Votre commande',
      unidades: (n: number) => (n === 1 ? '1 article' : `${n} articles`),
      bordado: (texto: string) => ` · brodé «\u00a0${texto}\u00a0»`,
      subtotal: 'Sous-total',
      gratis: 'Offerte',
      totalDemo: 'Total (non débité)',
      totalPagado: 'Total payé',
      favor: 'Vous nous rendez un service\u202f?',
      favorTexto:
        'Quand vous la recevrez, si elle vous plaît, envoyez-nous une photo chez vous. Avec votre accord, nous la publierons sur le site\u00a0: ainsi, celles et ceux qui hésitent verront les pièces en vrai, et pas seulement nos photos.',
      mandarFoto: 'Nous envoyer une photo',
      datosPedido: 'Détails de la commande',
      numero: 'Numéro de commande',
      problema: 'Un problème\u202f?',
      problemaTexto:
        'Écrivez-nous avec votre numéro de commande et nous arrangerons cela. C’est l’atelier qui vous répond, pas un service client.',
      escribirnos: 'Nous écrire',
    },
    de: {
      avisoDemo: 'Demo-Bestellung: Es wurde keine Zahlung ausgeführt und keine Karte abgefragt.',
      avisoPendiente:
        'Stripe hat die Zahlung noch nicht bestätigt. Sobald das passiert, geht Ihre Bestellung los; Ihr Warenkorb bleibt sicherheitshalber gespeichert.',
      avisoPagado: 'Testzahlung mit Stripe: Es wurde nichts wirklich abgebucht.',
      recibido: 'Bestellung eingegangen',
      recibidoPendiente: 'Wir haben Ihre Daten. Jetzt fehlt nur noch die Bestätigung der Zahlung durch die Bank.',
      recibidoHecho: 'Gerade eben. Wir haben Ihre Daten und Ihre Bestellung ist unterwegs.',
      tejiendo: 'Wir häkeln Ihre Bestellung',
      preparando: 'Wir packen Ihr Paket',
      tejiendoTexto: 'Wir schreiben Ihnen, sobald wir anfangen. Wenn Sie Fotos vom Entstehen möchten, fragen Sie einfach.',
      preparandoTexto: 'Wir wickeln alles in Seidenpapier, mit handgeschriebener Pflegeanleitung.',
      listoRecoger: 'Bereit zur Abholung',
      listoRecogerTexto: 'Wir schreiben Ihnen, um einen Abholtermin in der Werkstatt in Málaga zu vereinbaren.',
      deCamino: 'Unterwegs',
      deCaminoTexto: (envio: string, plazo: string) =>
        `Sobald das Paket losgeht, schicken wir Ihnen die Sendungsverfolgung (${envio}${plazo ? `, ${plazo}` : ''}).`,
      enTusManos: 'In Ihren Händen',
      enTuCasa: 'Bei Ihnen zu Hause',
      finalTexto: 'Wenn etwas nicht so ist, wie Sie es erwartet haben, schreiben Sie uns und wir finden eine Lösung.',
      fecha: 'Datum',
      aNombre: 'Name',
      correo: 'E-Mail',
      direccion: 'Adresse',
      recogida: 'Abholung',
      recogidaTexto: 'In der Werkstatt in Málaga, nach Terminvereinbarung',
      envio: 'Versand',
      regalo: 'Geschenk',
      regaloTexto: 'Als Geschenk verpackt, ohne Preis im Paket',
      dedicatoria: 'Widmung',
      nota: 'Ihre Notiz',
      cita: (texto: string) => `„${texto}“`,
      enProceso: 'Zahlung wird bearbeitet',
      confirmado: 'Bestellung bestätigt',
      casi: 'Fast geschafft',
      gracias: 'Danke! Wir machen uns an die Arbeit',
      plazoEncargo: (dias: number) =>
        `Da einige Stücke erst auf Bestellung gehäkelt werden, rechnen Sie mit etwa ${dias} Tagen bis zum Versand.`,
      plazoRecogida: 'Alles ist fertig: In 24–48 Stunden liegt es zur Abholung bereit.',
      plazoEnvio: 'Alles ist fertig, daher verlässt es die Werkstatt in 24–48 Stunden.',
      sinCorreo: (email: ReactNode) => (
        <>
          Da dies ein Demo-Shop ist, erhalten Sie keine E-Mail; im echten Shop ginge die Bestätigung an {email}.
        </>
      ),
      seguirMirando: 'Weiter stöbern',
      queAhora: 'Wie es weitergeht',
      hecho: ' (erledigt)',
      pedido: 'Ihre Bestellung',
      unidades: (n: number) => `${n} Stück`,
      bordado: (texto: string) => ` · bestickt mit „${texto}“`,
      subtotal: 'Zwischensumme',
      gratis: 'Kostenlos',
      totalDemo: 'Gesamt (nicht abgebucht)',
      totalPagado: 'Bezahlt',
      favor: 'Tun Sie uns einen Gefallen?',
      favorTexto:
        'Wenn es angekommen ist und Ihnen gefällt, schicken Sie uns ein Foto von zu Hause. Mit Ihrer Erlaubnis zeigen wir es auf der Website: So sehen alle, die noch zögern, die Stücke in echt und nicht nur auf unseren Fotos.',
      mandarFoto: 'Foto schicken',
      datosPedido: 'Bestelldaten',
      numero: 'Bestellnummer',
      problema: 'Gibt es ein Problem?',
      problemaTexto:
        'Schreiben Sie uns mit Ihrer Bestellnummer und wir kümmern uns darum. Ihnen antwortet die Werkstatt, keine Kundenservice-Abteilung.',
      escribirnos: 'Schreiben Sie uns',
    },
  },
);

type TextosConfirmacion = (typeof T)[Idioma];

function aviso(t: TextosConfirmacion, p: ResumenPedido): string {
  if (p.estado === 'demo') return t.avisoDemo;
  if (p.estado === 'pendiente') return t.avisoPendiente;
  return t.avisoPagado;
}

function hitos(t: TextosConfirmacion, p: ResumenPedido): { clase: string; marca: string; titulo: string; texto: string }[] {
  const recogida = p.envio.id === 'recogida';
  return [
    {
      clase: p.estado === 'pendiente' ? 'ahora' : 'hecho',
      marca: p.estado === 'pendiente' ? '1' : '✓',
      titulo: t.recibido,
      texto: p.estado === 'pendiente' ? t.recibidoPendiente : t.recibidoHecho,
    },
    {
      clase: p.estado === 'pendiente' ? '' : 'ahora',
      marca: '2',
      titulo: p.diasConfeccion ? t.tejiendo : t.preparando,
      texto: p.diasConfeccion ? t.tejiendoTexto : t.preparandoTexto,
    },
    recogida
      ? { clase: '', marca: '3', titulo: t.listoRecoger, texto: t.listoRecogerTexto }
      : { clase: '', marca: '3', titulo: t.deCamino, texto: t.deCaminoTexto(p.envio.nombre, p.envio.plazo) },
    {
      clase: '',
      marca: '4',
      titulo: recogida ? t.enTusManos : t.enTuCasa,
      texto: t.finalTexto,
    },
  ];
}

/** La pinta el servidor (Stripe) o el navegador (demostración): el idioma llega como prop. */
export function Confirmacion({ pedido: p, idioma }: { pedido: ResumenPedido; idioma: Idioma }) {
  const t = T[idioma];
  const datos: [string, string][] = [
    [t.fecha, fechaLarga(p.fecha, idioma)],
    [t.aNombre, p.nombre],
    [t.correo, p.email],
    p.direccion ? [t.direccion, p.direccion] : [t.recogida, t.recogidaTexto],
    [t.envio, [p.envio.nombre, p.envio.plazo].filter(Boolean).join(' · ')],
  ];
  if (p.regalo) datos.push([t.regalo, t.regaloTexto]);
  if (p.dedicatoria) datos.push([t.dedicatoria, t.cita(p.dedicatoria)]);
  if (p.nota) datos.push([t.nota, t.cita(p.nota)]);

  return (
    <>
      {p.estado !== 'pendiente' && <VaciarAlConfirmar numero={p.numero} />}

      <section className="gracias-cab">
        {p.estado !== 'pendiente' && <Confeti />}
        <Ovillo width={64} height={64} className="flota ovillo-gracias" />
        <p className="eyebrow ent ent-1">{p.estado === 'pendiente' ? t.enProceso : t.confirmado}</p>
        <h1 className="ent ent-2">{p.estado === 'pendiente' ? t.casi : t.gracias}</h1>
        <p className="lead ent ent-3">
          {p.diasConfeccion
            ? t.plazoEncargo(p.diasConfeccion)
            : p.envio.id === 'recogida'
              ? t.plazoRecogida
              : t.plazoEnvio}{' '}
          {t.sinCorreo(<b>{p.email}</b>)}
        </p>
        <div className={p.estado === 'pendiente' ? 'aviso ent ent-3' : 'aviso aviso-ok ent ent-3'} role="status">
          <IcoInfo />
          <span>{aviso(t, p)}</span>
        </div>
        <div className="botones-centro acciones-gracias ent ent-4">
          <Enlace className="btn btn-2" href={rutas.tienda}>
            {t.seguirMirando}
          </Enlace>
          <BotonImprimir />
        </div>
      </section>

      <div className="dos-lado dos-arr layout-gracias">
        <div className="columna-gracias">
          <div className="caja">
            <h2>{t.queAhora}</h2>
            <ol className="hitos">
              {hitos(t, p).map((h) => (
                <li key={h.titulo} className={`hito ${h.clase}`} aria-current={h.clase === 'ahora' ? 'step' : undefined}>
                  <span className="bolita" aria-hidden="true">
                    {h.marca}
                  </span>
                  <div>
                    <p className="hito-tit">
                      {h.titulo}
                      {h.clase === 'hecho' && <span className="oculto-vis">{t.hecho}</span>}
                    </p>
                    <p className="mini mt-1">
                      {h.texto}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="caja">
            <h2>{t.pedido}</h2>
            <ul className="lineas-gracias">
              {p.lineas.map((l, i) => (
                <li key={`${l.slug}-${i}`} className="linea-resumen">
                  <div className="miniatura">{l.foto && <Image src={l.foto.src} alt="" fill sizes="60px" />}</div>
                  <div>
                    <p className="nom">{l.nombre}</p>
                    <p className="mini-2">
                      {l.rotulo ?? l.variante} · {t.unidades(l.cantidad)}
                      {l.personalizacion && t.bordado(l.personalizacion)}
                    </p>
                  </div>
                  <span className="precio">{eur(l.total, idioma)}</span>
                </li>
              ))}
            </ul>
            <div className="totales-resumen mt-5">
              <div className="fila">
                <span>{t.subtotal}</span>
                <span>{eur(p.subtotal, idioma)}</span>
              </div>
              {p.descuento > 0 && (
                <div className="fila">
                  <span>{p.nombreDescuento}</span>
                  <span className="rebaja">{eurMenos(p.descuento, idioma)}</span>
                </div>
              )}
              <div className="fila">
                <span>{p.envio.nombre}</span>
                <span>{p.envioImporte === 0 ? t.gratis : eur(p.envioImporte, idioma)}</span>
              </div>
              <div className="fila total">
                <span>{p.estado === 'demo' ? t.totalDemo : t.totalPagado}</span>
                <span>{eur(p.total, idioma)}</span>
              </div>
            </div>
          </div>

          <div className="banda favor-foto">
            <h3 className="tit-favor">{t.favor}</h3>
            <p className="texto-favor">{t.favorTexto}</p>
            <Enlace className="btn btn-1 mt-5" href={rutas.contacto}>
              {t.mandarFoto}
            </Enlace>
          </div>
        </div>

        <aside className="lateral-gracias" aria-label={t.datosPedido}>
          <div className="caja">
            <p className="eyebrow">{t.numero}</p>
            <p className="numero-pedido">{p.numero}</p>
            <hr className="sep sep-corto" />
            <dl className="datos-pedido">
              {datos.map(([etiqueta, valor]) => (
                <div key={etiqueta}>
                  <dt>{etiqueta}</dt>
                  <dd>{valor}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="caja-cl">
            <h2 className="titulo-mini">{t.problema}</h2>
            <p className="mini mt-2">{t.problemaTexto}</p>
            <Enlace className="btn btn-2 btn-p mt-3" href={rutas.contacto}>
              {t.escribirnos}
            </Enlace>
          </div>
        </aside>
      </div>
    </>
  );
}
