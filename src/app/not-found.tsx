import type { Metadata } from 'next';
import Form from 'next/form';
import { Aparece } from '@/componentes/aparece';
import { BandaCierre } from '@/componentes/contenido/banda-cierre';
import { HiloSuelto } from '@/componentes/contenido/hilo-suelto';
import { IcoLupa } from '@/componentes/iconos';
import { MarcoTienda } from '@/componentes/marco/marco-tienda';
import { TarjetaProducto } from '@/componentes/producto/tarjeta-producto';
import { catalogo } from '@/lib/datos';
import { conIdioma, textos } from '@/lib/i18n';
import { Enlace } from '@/lib/i18n/enlace';
import { idiomaActual } from '@/lib/i18n/servidor';
import { rutas } from '@/lib/rutas';
import '@/estilos/contenido.css';

const T = textos(
  {
    titulo: 'Aquí se ha soltado un hilo',
    descripcion: 'La página que buscas no existe o ha cambiado de sitio.',
    texto:
      'Esta página no existe, o existía y la hemos movido. No pasa nada: volvemos al principio y seguimos por buen camino.',
    inicio: 'Volver al inicio',
    tienda: 'Ir a la tienda',
    buscar: 'Buscar en la tienda',
    ejemplo: '¿Qué estabas buscando?',
    porSiAcaso: 'Por si acaso',
    sugerencias: 'Lo que más se busca',
    verCatalogo: 'Ver todo el catálogo',
    enlaceTitulo: '¿Llegaste desde un enlace nuestro?',
    avisarnos: 'Avisarnos',
    enlaceTexto: 'Entonces el roto es nuestro. Dinos de dónde venías y lo arreglamos.',
  },
  {
    en: {
      titulo: 'A thread has come loose here',
      descripcion: 'The page you’re looking for doesn’t exist or has moved.',
      texto:
        'This page doesn’t exist, or it did and we’ve moved it. Never mind: let’s go back to the start and pick up the thread.',
      inicio: 'Back to the home page',
      tienda: 'Go to the shop',
      buscar: 'Search the shop',
      ejemplo: 'What were you looking for?',
      porSiAcaso: 'Just in case',
      sugerencias: 'Most searched for',
      verCatalogo: 'See the full catalogue',
      enlaceTitulo: 'Did you get here from one of our links?',
      avisarnos: 'Let us know',
      enlaceTexto: 'Then the hole is ours. Tell us where you came from and we’ll mend it.',
    },
    fr: {
      titulo: 'Un fil s’est défait ici',
      descripcion: 'La page que vous cherchez n’existe pas ou a changé d’adresse.',
      texto:
        'Cette page n’existe pas, ou elle existait et nous l’avons déplacée. Ce n’est pas grave\u00a0: revenons au début et reprenons le bon chemin.',
      inicio: 'Retour à l’accueil',
      tienda: 'Aller à la boutique',
      buscar: 'Rechercher dans la boutique',
      ejemplo: 'Que cherchiez-vous\u00a0?',
      porSiAcaso: 'Au cas où',
      sugerencias: 'Les plus recherchés',
      verCatalogo: 'Voir tout le catalogue',
      enlaceTitulo: 'Vous venez d’un de nos liens\u00a0?',
      avisarnos: 'Nous prévenir',
      enlaceTexto: 'Alors la maille filée est de notre côté. Dites-nous d’où vous veniez et nous réparerons ça.',
    },
    de: {
      titulo: 'Hier hat sich ein Faden gelöst',
      descripcion: 'Die gesuchte Seite gibt es nicht oder sie ist umgezogen.',
      texto:
        'Diese Seite gibt es nicht, oder es gab sie und wir haben sie verschoben. Kein Problem: Wir fangen von vorn an und finden den richtigen Weg.',
      inicio: 'Zur Startseite',
      tienda: 'Zum Shop',
      buscar: 'Im Shop suchen',
      ejemplo: 'Wonach haben Sie gesucht?',
      porSiAcaso: 'Für alle Fälle',
      sugerencias: 'Am meisten gesucht',
      verCatalogo: 'Den ganzen Katalog ansehen',
      enlaceTitulo: 'Sind Sie über einen unserer Links hier gelandet?',
      avisarnos: 'Bescheid geben',
      enlaceTexto: 'Dann liegt der Fehler bei uns. Sagen Sie uns, woher Sie kamen, und wir beheben es.',
    },
  },
);

export async function generateMetadata(): Promise<Metadata> {
  const t = T[await idiomaActual()];
  return { title: t.titulo, description: t.descripcion };
}

export default async function NoEncontrada() {
  const idioma = await idiomaActual();
  const t = T[idioma];
  const sugerencias = (await catalogo(idioma).productos()).slice(0, 4);

  // Una dirección que no existe no pasa por ningún layout de grupo: el
  // marco de la tienda se pone aquí para no dejar la página sin menú.
  return (
    <MarcoTienda>
      <div className="wrap">
        <section className="pagina-error">
          <div className="ent ent-1">
            <HiloSuelto />
          </div>
          <p className="eyebrow ent ent-2">Error 404</p>
          <h1 className="ent ent-3 mt-2">{t.titulo}</h1>
          <p className="lead ent ent-4">{t.texto}</p>

          <div className="acciones-fila ent ent-5">
            <Enlace className="btn btn-1" href={rutas.inicio}>
              {t.inicio}
            </Enlace>
            <Enlace className="btn btn-2" href={rutas.tienda}>
              {t.tienda}
            </Enlace>
          </div>

          <Form action={conIdioma(rutas.tienda, idioma)} role="search" className="busca ent ent-6">
            <label htmlFor="busca-404" className="oculto-vis">
              {t.buscar}
            </label>
            <IcoLupa width={17} height={17} />
            <input type="search" id="busca-404" name="q" placeholder={t.ejemplo} autoComplete="off" />
          </Form>
        </section>

        {sugerencias.length > 0 && (
          <section aria-labelledby="sugerencias">
            <Aparece className="cab-sec">
              <div>
                <p className="eyebrow">{t.porSiAcaso}</p>
                <h2 className="mt-1" id="sugerencias">
                  {t.sugerencias}
                </h2>
              </div>
              <Enlace className="enlace" href={rutas.tienda}>
                {t.verCatalogo}
              </Enlace>
            </Aparece>
            <Aparece efecto="rev-lista" className="rejilla rejilla-4 sugerencias-error">
              {sugerencias.map((p) => (
                <TarjetaProducto key={p.slug} producto={p} />
              ))}
            </Aparece>
          </section>
        )}

        <section>
          <BandaCierre
            titulo={t.enlaceTitulo}
            acciones={
              <Enlace className="btn btn-1" href={rutas.contacto}>
                {t.avisarnos}
              </Enlace>
            }
          >
            {t.enlaceTexto}
          </BandaCierre>
        </section>
      </div>
    </MarcoTienda>
  );
}
