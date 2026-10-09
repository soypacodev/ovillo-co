// Textos de la página de contacto.

import type { ReactNode } from 'react';
import { textos } from '@/lib/i18n';

export const T = textos(
  {
    titulo: 'Contacto y preguntas frecuentes',
    descripcion:
      'Escribe a Ovillo & Co. para dudas, pedidos, arreglos o encargos. Te contestamos en 24–48 horas. Preguntas frecuentes sobre plazos, colores, bebés y devoluciones.',
    miga: 'Contacto',
    etiqueta: 'Hablamos',
    cabecera: 'Escríbenos y te contestamos nosotros',
    entradilla:
      'Sin centralitas ni respuestas automáticas. Leemos todos los mensajes y contestamos en 24–48 horas laborables, salvo en los puentes largos.',
    formulario: 'Formulario de contacto',
    antes: 'Antes de escribir',
    aquiTitulo: 'A lo mejor está aquí',
    aquiTexto: 'Las preguntas que más nos llegan, contestadas de una vez.',
    remite: (cuidados: (texto: string) => ReactNode, envios: (texto: string) => ReactNode) => (
      <>
        ¿Dudas con el lavado? Tienes la {cuidados('guía de cuidados')} completa. ¿Plazos y devoluciones? Están en{' '}
        {envios('envíos')}.
      </>
    ),
    otrasVias: 'Otras formas de contacto',
    otras: 'Otras formas',
    correo: 'Correo',
    deEjemplo: '(de ejemplo)',
    cuando: 'Cuándo contestamos',
    horario: 'Horario de respuesta',
    dias: [
      ['Lunes a viernes', 'por la mañana'],
      ['Sábados', 'a ratos'],
      ['Domingos', 'descansamos'],
    ],
    agosto: 'En agosto tardamos algo más: es cuando aprovechamos para tejer sin parar.',
    rotoTitulo: '¿Se te ha roto algo nuestro?',
    rotoTexto: 'Te lo arreglamos gratis, aunque lo compraras hace años. Solo pagas el envío de vuelta.',
  },
  {
    en: {
      titulo: 'Contact and frequently asked questions',
      descripcion:
        'Write to Ovillo & Co. with questions, orders, repairs or custom orders. We reply within 24–48 hours. FAQs on delivery times, colours, babies and returns.',
      miga: 'Contact',
      etiqueta: 'Let’s talk',
      cabecera: 'Write to us and a real person will reply',
      entradilla:
        'No call centres, no automatic replies. We read every message and reply within 24–48 working hours, except over long bank holiday weekends.',
      formulario: 'Contact form',
      antes: 'Before you write',
      aquiTitulo: 'It might already be here',
      aquiTexto: 'The questions we get most often, answered once and for all.',
      remite: (cuidados: (texto: string) => ReactNode, envios: (texto: string) => ReactNode) => (
        <>
          Questions about washing? There’s a full {cuidados('care guide')}. Delivery times and returns? They’re under{' '}
          {envios('shipping')}.
        </>
      ),
      otrasVias: 'Other ways to get in touch',
      otras: 'Other ways',
      correo: 'Email',
      deEjemplo: '(example)',
      cuando: 'When we reply',
      horario: 'Reply times',
      dias: [
        ['Monday to Friday', 'in the morning'],
        ['Saturdays', 'now and then'],
        ['Sundays', 'we rest'],
      ],
      agosto: 'In August we take a little longer: it’s when we make the most of the time to crochet non-stop.',
      rotoTitulo: 'Has something of ours broken?',
      rotoTexto: 'We’ll repair it for free, even if you bought it years ago. You only pay for the return postage.',
    },
    fr: {
      titulo: 'Contact et questions fréquentes',
      descripcion:
        'Écrivez à Ovillo & Co. pour une question, une commande, une réparation ou une commande sur mesure. Nous répondons sous 24 à 48 heures. Questions fréquentes sur les délais, les couleurs, les bébés et les retours.',
      miga: 'Contact',
      etiqueta: 'Parlons-en',
      cabecera: 'Écrivez-nous, c’est nous qui vous répondons',
      entradilla:
        'Ni standard téléphonique ni réponses automatiques. Nous lisons tous les messages et répondons sous 24 à 48 heures ouvrées, sauf pendant les longs week-ends fériés.',
      formulario: 'Formulaire de contact',
      antes: 'Avant d’écrire',
      aquiTitulo: 'La réponse est peut-être ici',
      aquiTexto: 'Les questions qu’on nous pose le plus souvent, avec leurs réponses.',
      remite: (cuidados: (texto: string) => ReactNode, envios: (texto: string) => ReactNode) => (
        <>
          Des doutes sur le lavage{' '}? Vous avez le {cuidados('guide d’entretien')} complet. Délais et
          retours{' '}? C’est dans {envios('livraison')}.
        </>
      ),
      otrasVias: 'Autres moyens de contact',
      otras: 'Autres moyens',
      correo: 'E-mail',
      deEjemplo: '(exemple)',
      cuando: 'Quand nous répondons',
      horario: 'Horaires de réponse',
      dias: [
        ['Du lundi au vendredi', 'le matin'],
        ['Le samedi', 'de temps en temps'],
        ['Le dimanche', 'nous nous reposons'],
      ],
      agosto: 'En août, nous mettons un peu plus de temps : c’est le moment où nous en profitons pour crocheter sans relâche.',
      rotoTitulo: 'Une de nos pièces s’est abîmée ?',
      rotoTexto: 'Nous la réparons gratuitement, même si vous l’avez achetée il y a des années. Vous ne payez que le renvoi.',
    },
    de: {
      titulo: 'Kontakt und häufige Fragen',
      descripcion:
        'Schreiben Sie Ovillo & Co. bei Fragen, Bestellungen, Reparaturen oder Auftragsarbeiten. Wir antworten innerhalb von 24–48 Stunden. Häufige Fragen zu Lieferzeiten, Farben, Babys und Rücksendungen.',
      miga: 'Kontakt',
      etiqueta: 'Schreiben Sie uns',
      cabecera: 'Schreiben Sie uns – wir antworten persönlich',
      entradilla:
        'Keine Hotline, keine automatischen Antworten. Wir lesen jede Nachricht und antworten innerhalb von 24–48 Stunden an Werktagen, außer an langen Brückentagen.',
      formulario: 'Kontaktformular',
      antes: 'Bevor Sie schreiben',
      aquiTitulo: 'Vielleicht steht es schon hier',
      aquiTexto: 'Die Fragen, die uns am häufigsten erreichen – ein für alle Mal beantwortet.',
      remite: (cuidados: (texto: string) => ReactNode, envios: (texto: string) => ReactNode) => (
        <>
          Fragen zum Waschen? Dafür gibt es den ausführlichen {cuidados('Pflegeratgeber')}. Lieferzeiten und
          Rücksendungen? Stehen unter {envios('Versand')}.
        </>
      ),
      otrasVias: 'Weitere Kontaktmöglichkeiten',
      otras: 'Weitere Wege',
      correo: 'E-Mail',
      deEjemplo: '(Beispiel)',
      cuando: 'Wann wir antworten',
      horario: 'Antwortzeiten',
      dias: [
        ['Montag bis Freitag', 'vormittags'],
        ['Samstags', 'ab und zu'],
        ['Sonntags', 'Ruhetag'],
      ],
      agosto: 'Im August dauert es etwas länger: Dann nutzen wir die Zeit, um ohne Pause zu häkeln.',
      rotoTitulo: 'Ist etwas von uns kaputtgegangen?',
      rotoTexto: 'Wir reparieren es kostenlos, auch wenn Sie es vor Jahren gekauft haben. Sie zahlen nur den Rückversand.',
    },
  },
);
