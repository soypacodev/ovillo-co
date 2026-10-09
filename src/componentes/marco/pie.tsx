import { BotonPanelDemo } from '@/componentes/cuenta/boton-panel-demo';
import { CATEGORIAS_T } from '@/datos/semilla-traducida';
import { localizarCategoria } from '@/lib/catalogo/localizar';
import { anioMadrid } from '@/lib/fechas';
import { textos } from '@/lib/i18n';
import { Enlace } from '@/lib/i18n/enlace';
import { idiomaActual } from '@/lib/i18n/servidor';
import { DEMO, rutas } from '@/lib/rutas';
import { ListaIdiomas } from './selector-idioma';

const T = textos(
  {
    lema: 'Crochet hecho a mano en Málaga. Piezas únicas, encargos con calma y ningún atajo.',
    tienda: 'Tienda',
    rebajas: 'Rebajas',
    ayuda: 'Ayuda',
    enlacesAyuda: ['Envíos y plazos', 'Devoluciones', 'Cómo cuidar el crochet', 'Contacto', 'Encargos a medida'],
    legal: 'Legal',
    enlacesLegal: ['Aviso legal', 'Privacidad', 'Cookies', 'Términos de venta'],
    idioma: 'Idioma',
    autorTitulo: '¿Quieres una tienda así para tu negocio?',
    autorTexto: (autor: string) =>
      `Esta tienda es una demostración hecha por ${autor}: catálogo, pagos, envíos, encargos y panel para el dueño. Mira cómo se lleva por dentro o escríbeme y lo hablamos.`,
    instagramOculto: (autor: string) => ` de ${autor}, autor de la demo (se abre en otra pestaña)`,
    githubOculto: (autor: string) => ` de ${autor} (se abre en otra pestaña)`,
    derechos: 'Hecho con hilo y paciencia.',
    pagos: 'Pagos con Stripe (modo de prueba) · Envíos con Correos',
  },
  {
    en: {
      lema: 'Handmade crochet from Málaga. One-of-a-kind pieces, unhurried custom orders and no shortcuts.',
      tienda: 'Shop',
      rebajas: 'Sale',
      ayuda: 'Help',
      enlacesAyuda: ['Shipping and delivery times', 'Returns', 'Caring for crochet', 'Contact', 'Custom orders'],
      legal: 'Legal',
      enlacesLegal: ['Legal notice', 'Privacy', 'Cookies', 'Terms of sale'],
      idioma: 'Language',
      autorTitulo: 'Want a shop like this for your business?',
      autorTexto: (autor: string) =>
        `This shop is a demo built by ${autor}: catalogue, payments, shipping, custom orders and an owner's dashboard. See how it works under the hood, or drop me a line and let's talk.`,
      instagramOculto: (autor: string) => ` of ${autor}, author of the demo (opens in a new tab)`,
      githubOculto: (autor: string) => ` of ${autor} (opens in a new tab)`,
      derechos: 'Made with yarn and patience.',
      pagos: 'Payments by Stripe (test mode) · Shipping with Correos',
    },
    fr: {
      lema: 'Crochet fait main à Málaga. Des pièces uniques, des commandes sur mesure sans précipitation et aucun raccourci.',
      tienda: 'Boutique',
      rebajas: 'Soldes',
      ayuda: 'Aide',
      enlacesAyuda: ['Livraison et délais', 'Retours', 'Entretenir le crochet', 'Contact', 'Commandes sur mesure'],
      legal: 'Mentions légales',
      enlacesLegal: ['Mentions légales', 'Confidentialité', 'Cookies', 'Conditions de vente'],
      idioma: 'Langue',
      autorTitulo: 'Vous voulez une boutique comme celle-ci pour votre activité ?',
      autorTexto: (autor: string) =>
        `Cette boutique est une démonstration réalisée par ${autor} : catalogue, paiements, livraisons, commandes sur mesure et tableau de bord pour le propriétaire. Découvrez comment elle fonctionne ou écrivez-moi pour en parler.`,
      instagramOculto: (autor: string) => ` de ${autor}, auteur de la démo (s’ouvre dans un nouvel onglet)`,
      githubOculto: (autor: string) => ` de ${autor} (s’ouvre dans un nouvel onglet)`,
      derechos: 'Fait avec du fil et de la patience.',
      pagos: 'Paiements par Stripe (mode test) · Livraison par Correos',
    },
    de: {
      lema: 'Handgehäkeltes aus Málaga. Unikate, Auftragsarbeiten in Ruhe und keine Abkürzungen.',
      tienda: 'Shop',
      rebajas: 'Sale',
      ayuda: 'Hilfe',
      enlacesAyuda: ['Versand und Lieferzeiten', 'Rücksendungen', 'Häkelstücke richtig pflegen', 'Kontakt', 'Auftragsarbeiten'],
      legal: 'Rechtliches',
      enlacesLegal: ['Impressum', 'Datenschutz', 'Cookies', 'Verkaufsbedingungen'],
      idioma: 'Sprache',
      autorTitulo: 'So einen Shop für Ihr Geschäft?',
      autorTexto: (autor: string) =>
        `Dieser Shop ist eine Demo von ${autor}: Katalog, Zahlungen, Versand, Auftragsarbeiten und ein Dashboard für den Inhaber. Schauen Sie hinter die Kulissen oder schreiben Sie mir, dann sprechen wir darüber.`,
      instagramOculto: (autor: string) => ` von ${autor}, Autor der Demo (öffnet in neuem Tab)`,
      githubOculto: (autor: string) => ` von ${autor} (öffnet in neuem Tab)`,
      derechos: 'Gemacht mit Garn und Geduld.',
      pagos: 'Zahlungen über Stripe (Testmodus) · Versand mit Correos',
    },
  },
);

const AYUDA = [rutas.envios, rutas.devoluciones, rutas.cuidados, rutas.contacto, rutas.encargos];
const LEGAL = [`${rutas.legal}#aviso`, `${rutas.legal}#privacidad`, `${rutas.legal}#cookies`, `${rutas.legal}#venta`];

export async function Pie() {
  const idioma = await idiomaActual();
  const t = T[idioma];
  const categorias = CATEGORIAS_T.map((c) => localizarCategoria(c, idioma));
  const anio = anioMadrid();
  return (
    <footer className="pie-web">
      <div className="wrap">
        <div className="pie-rej">
          <div>
            <p className="pie-marca">Ovillo &amp; Co.</p>
            <p className="pie-lema">{t.lema}</p>
            <p className="mt-3">
              <a href={`mailto:${DEMO.correo}`}>{DEMO.correo}</a>
            </p>
            <div className="pie-idiomas">
              <h2 className="oculto-vis">{t.idioma}</h2>
              <ListaIdiomas />
            </div>
          </div>
          <nav aria-labelledby="pie-tienda">
            <h2 id="pie-tienda">{t.tienda}</h2>
            <ul>
              {categorias.map((c) => (
                <li key={c.slug}>
                  <Enlace href={rutas.categoria(c.slug)}>{c.nombre}</Enlace>
                </li>
              ))}
              <li>
                <Enlace href={rutas.ofertas}>{t.rebajas}</Enlace>
              </li>
            </ul>
          </nav>
          <nav aria-labelledby="pie-ayuda">
            <h2 id="pie-ayuda">{t.ayuda}</h2>
            <ul>
              {AYUDA.map((href, i) => (
                <li key={href}>
                  <Enlace href={href}>{t.enlacesAyuda[i]}</Enlace>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-labelledby="pie-legal">
            <h2 id="pie-legal">{t.legal}</h2>
            <ul>
              {LEGAL.map((href, i) => (
                <li key={href}>
                  <Enlace href={href}>{t.enlacesLegal[i]}</Enlace>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {/* La tienda es ficticia y no tiene redes propias: el único enlace
            social es el del autor, y dice claramente de quién es. */}
        <section className="pie-demo" aria-labelledby="pie-autor">
          <div>
            <h2 id="pie-autor">{t.autorTitulo}</h2>
            <p>{t.autorTexto(DEMO.autor)}</p>
            <ul className="pie-autor-enlaces">
              <li>
                <a href={DEMO.contratar(idioma)}>{DEMO.correoAutor}</a>
              </li>
              <li>
                <a href={DEMO.instagram} target="_blank" rel="noopener noreferrer">
                  Instagram {DEMO.usuarioInstagram}
                  <span className="oculto-vis">{t.instagramOculto(DEMO.autor)}</span>
                </a>
              </li>
              <li>
                <a href={DEMO.enlace} target="_blank" rel="noopener noreferrer">
                  GitHub
                  <span className="oculto-vis">{t.githubOculto(DEMO.autor)}</span>
                </a>
              </li>
            </ul>
          </div>
          <BotonPanelDemo className="btn btn-claro btn-p" />
        </section>
        <div className="legal">
          <span>
            © {anio} Ovillo &amp; Co. {t.derechos}
          </span>
          <span>{t.pagos}</span>
        </div>
      </div>
    </footer>
  );
}
