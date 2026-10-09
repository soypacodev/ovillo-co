// Preguntas frecuentes de la página de contacto en cada idioma. El español
// es el de la semilla (PREGUNTAS), que sigue siendo la fuente de verdad.

import type { PreguntaFrecuente } from '@/lib/catalogo/tipos';
import { textos, type Idioma } from '@/lib/i18n';
import { PREGUNTAS } from './semilla';

const PREGUNTAS_T = textos(PREGUNTAS, {
  en: [
    {
      p: 'How long do you take to send an order?',
      r: 'Anything that’s already made leaves the workshop within 24–48 hours. Pieces marked “made to order” take as long as the product page says, usually between 7 and 14 days, plus delivery. We’ll email you when we start and when it’s on its way.',
    },
    {
      p: 'Can I ask for a colour that isn’t on the website?',
      r: 'Almost always. Drop us a line and we’ll tell you whether we have that yarn or can get hold of it. Changing the colour costs nothing.',
    },
    {
      p: 'Is it safe for a baby?',
      r: 'Our amigurumis and Baby pieces have no plastic eyes or parts that could come loose: eyes and details are embroidered, and the stuffing is hypoallergenic hollow fibre. Even so, nothing loose in the cot while your baby sleeps: no blankets, no soft toys. Garlands go on the wall or a shelf, out of reach.',
    },
    {
      p: 'What if I don’t like it?',
      r: 'You have 14 days to return it, as long as it hasn’t been personalised with initials or names. Made-to-measure pieces can’t be resold, so those can’t be returned.',
    },
    {
      p: 'Do you take large orders or orders for shops?',
      r: 'It depends on the dates. We’re a small workshop and there’s a limit to how much we can make. Tell us what you need and when, and we’ll tell you honestly whether we can manage it.',
    },
    {
      p: 'How do I wash crochet without ruining it?',
      r: 'By hand, in cold water and without wringing. Dry it flat on a towel. Every product page has its own instructions, and there’s a full guide under Care.',
    },
    {
      p: 'Can I collect it in person?',
      r: 'Yes, if you’re in Málaga. Choose “Collection from the workshop” at checkout and we’ll arrange a time that suits you.',
    },
    {
      p: 'Do you ship outside Spain?',
      r: 'For now, only to mainland Spain and the Balearic Islands. If you’re elsewhere, drop us a line and we’ll work out the cost before you order anything.',
    },
  ],
  fr: [
    {
      p: 'Combien de temps faut-il pour expédier une commande ?',
      r: 'Ce qui est déjà prêt quitte l’atelier sous 24 à 48 h. Ce qui porte la mention « tricoté à la commande » prend le temps indiqué sur la fiche, généralement entre 7 et 14 jours, plus la livraison. Nous vous prévenons par e-mail quand nous commençons et quand le colis part.',
    },
    {
      p: 'Puis-je demander une couleur qui n’est pas sur le site ?',
      r: 'Presque toujours. Écrivez-nous et nous vous dirons si nous avons cette pelote ou si nous pouvons nous la procurer. Changer de couleur ne coûte rien.',
    },
    {
      p: 'Est-ce sans danger pour un bébé ?',
      r: 'Les amigurumis et les pièces Bébé n’ont ni yeux en plastique ni éléments qui puissent se détacher : les yeux et les détails sont brodés, et le rembourrage est en fibre creuse hypoallergénique. Malgré tout, rien dans le lit pendant que bébé dort : ni couverture, ni peluche. La guirlande se met au mur ou sur une étagère, hors de sa portée.',
    },
    {
      p: 'Et si elle ne me plaît pas ?',
      r: 'Vous avez 14 jours pour la retourner, à condition qu’elle ne soit pas personnalisée avec des initiales ou des prénoms. Les pièces sur mesure ne peuvent pas être revendues, elles ne sont donc ni reprises ni échangées.',
    },
    {
      p: 'Acceptez-vous les grosses commandes ou celles de boutiques ?',
      r: 'Cela dépend des dates. Nous sommes un petit atelier et il y a une limite à ce que nous pouvons réaliser. Dites-nous ce dont vous avez besoin et pour quand, et nous vous dirons franchement si c’est faisable.',
    },
    {
      p: 'Comment laver le crochet sans l’abîmer ?',
      r: 'À la main, à l’eau froide et sans essorer en tordant. Faites-le sécher à plat sur une serviette. Chaque fiche a ses instructions et vous trouverez un guide complet dans Entretien.',
    },
    {
      p: 'Puis-je venir la chercher en personne ?',
      r: 'Oui, si vous êtes à Málaga. Choisissez « Retrait à l’atelier » au moment de payer et nous convenons d’un horaire qui vous arrange.',
    },
    {
      p: 'Livrez-vous en dehors de l’Espagne ?',
      r: 'Pour l’instant, uniquement en Espagne péninsulaire et aux Baléares. Si vous êtes ailleurs, écrivez-nous et nous calculerons le coût avant que vous ne commandiez quoi que ce soit.',
    },
  ],
  de: [
    {
      p: 'Wie lange dauert es, bis eine Bestellung verschickt wird?',
      r: 'Was schon fertig ist, verlässt die Werkstatt innerhalb von 24–48 Stunden. Stücke mit dem Hinweis „wird auf Bestellung gehäkelt“ brauchen so lange, wie auf der Produktseite steht – meist zwischen 7 und 14 Tagen, plus Versand. Wir sagen Ihnen per E-Mail Bescheid, wenn wir anfangen und wenn das Paket unterwegs ist.',
    },
    {
      p: 'Kann ich eine Farbe bestellen, die nicht im Shop steht?',
      r: 'Fast immer. Schreiben Sie uns, und wir sagen Ihnen, ob wir das Garn haben oder besorgen können. Eine andere Farbe kostet nichts extra.',
    },
    {
      p: 'Ist das sicher für ein Baby?',
      r: 'Amigurumis und Baby-Stücke haben keine Plastikaugen und keine Teile, die sich lösen können: Augen und Details sind aufgestickt, die Füllung ist hypoallergene Hohlfaser. Trotzdem gilt: Solange das Baby schläft, nichts Loses ins Bettchen – keine Decken, keine Kuscheltiere. Die Girlande gehört an die Wand oder ins Regal, außer Reichweite.',
    },
    {
      p: 'Und wenn es mir nicht gefällt?',
      r: 'Sie haben 14 Tage Zeit, es zurückzuschicken, sofern es nicht mit Initialen oder Namen personalisiert ist. Maßanfertigungen lassen sich nicht weiterverkaufen und sind deshalb vom Umtausch ausgeschlossen.',
    },
    {
      p: 'Übernehmen Sie große Aufträge oder Bestellungen für Läden?',
      r: 'Das hängt vom Termin ab. Wir sind eine kleine Werkstatt, und wir können nur eine bestimmte Menge häkeln. Sagen Sie uns, was Sie brauchen und bis wann, und wir sagen Ihnen ehrlich, ob wir das schaffen.',
    },
    {
      p: 'Wie wasche ich Gehäkeltes, ohne es zu ruinieren?',
      r: 'Von Hand, in kaltem Wasser und ohne auszuwringen. Liegend auf einem Handtuch trocknen lassen. Jede Produktseite hat ihre eigene Pflegeanleitung, und unter Pflege finden Sie einen ausführlichen Ratgeber.',
    },
    {
      p: 'Kann ich es persönlich abholen?',
      r: 'Ja, wenn Sie in Málaga sind. Wählen Sie beim Bezahlen „Abholung in der Werkstatt“, dann vereinbaren wir eine Uhrzeit, die Ihnen passt.',
    },
    {
      p: 'Liefern Sie auch außerhalb Spaniens?',
      r: 'Vorerst nur auf das spanische Festland und die Balearen. Wenn Sie woanders wohnen, schreiben Sie uns, und wir klären die Kosten, bevor Sie etwas bestellen.',
    },
  ],
});

/** Preguntas frecuentes de la tienda en ese idioma. */
export const preguntasFrecuentes = (idioma: Idioma): readonly PreguntaFrecuente[] => PREGUNTAS_T[idioma];
