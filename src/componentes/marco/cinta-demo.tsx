import { textos } from '@/lib/i18n';
import { idiomaActual } from '@/lib/i18n/servidor';
import { DEMO } from '@/lib/rutas';

const T = textos(
  {
    demoLargo: 'Tienda de demostración',
    demoCorto: 'Tienda demo',
    pedidos: ': los pedidos no son reales',
    preguntaLarga: '¿Quieres una así para tu negocio?',
    preguntaCorta: '¿Quieres una así?',
    hablemos: 'Hablemos',
    hablemosOculto: (autor: string) => ` (escribe a ${autor} por correo)`,
    hechaPor: ' · Hecha por ',
    enGithub: ' en GitHub (se abre en otra pestaña)',
  },
  {
    en: {
      demoLargo: 'Demo shop',
      demoCorto: 'Demo shop',
      pedidos: ': orders are not real',
      preguntaLarga: 'Want one like this for your business?',
      preguntaCorta: 'Want one like this?',
      hablemos: "Let's talk",
      hablemosOculto: (autor: string) => ` (email ${autor})`,
      hechaPor: ' · Built by ',
      enGithub: ' on GitHub (opens in a new tab)',
    },
    fr: {
      demoLargo: 'Boutique de démonstration',
      demoCorto: 'Boutique démo',
      pedidos: ' : les commandes ne sont pas réelles',
      preguntaLarga: 'Vous voulez la même pour votre activité ?',
      preguntaCorta: 'Vous voulez la même ?',
      hablemos: 'Parlons-en',
      hablemosOculto: (autor: string) => ` (écrire à ${autor} par e-mail)`,
      hechaPor: ' · Réalisée par ',
      enGithub: ' sur GitHub (s’ouvre dans un nouvel onglet)',
    },
    de: {
      demoLargo: 'Demo-Shop',
      demoCorto: 'Demo-Shop',
      pedidos: ': Bestellungen sind nicht echt',
      preguntaLarga: 'So einen Shop für Ihr Geschäft?',
      preguntaCorta: 'So einen Shop?',
      hablemos: 'Schreiben Sie mir',
      hablemosOculto: (autor: string) => ` (E-Mail an ${autor})`,
      hechaPor: ' · Erstellt von ',
      enGithub: ' auf GitHub (öffnet in neuem Tab)',
    },
  },
);

/** Aviso fijo de que la tienda es una demostración, con la puerta abierta a
 *  quien quiera una igual. En pantallas estrechas se queda en lo esencial. */
export async function CintaDemo() {
  const idioma = await idiomaActual();
  const t = T[idioma];
  return (
    <p className="cinta-demo">
      <span className="largo">{t.demoLargo}</span>
      <span className="corto">{t.demoCorto}</span>
      <span className="cinta-pedidos">{t.pedidos}</span>
      {' · '}
      <span className="largo">{t.preguntaLarga}</span>
      <span className="corto">{t.preguntaCorta}</span>{' '}
      <a href={DEMO.contratar(idioma)}>
        {t.hablemos}
        <span className="oculto-vis">{t.hablemosOculto(DEMO.autor)}</span>
      </a>
      <span className="cinta-autor">
        {t.hechaPor}
        <a href={DEMO.enlace} target="_blank" rel="noopener noreferrer">
          {DEMO.autor}
          <span className="oculto-vis">{t.enGithub}</span>
        </a>
      </span>
    </p>
  );
}
