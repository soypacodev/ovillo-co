import type { Metadata } from 'next';
import { Aparece } from '@/componentes/aparece';
import { BarraResultados, BotonQuitarFiltros, ZonaResultados } from '@/componentes/catalogo/barra-resultados';
import { ProveedorFiltros } from '@/componentes/catalogo/contexto-filtros';
import { PanelFiltros } from '@/componentes/catalogo/panel-filtros';
import { Migas } from '@/componentes/contenido/migas';
import { Ovillo } from '@/componentes/iconos';
import { TarjetaProducto } from '@/componentes/producto/tarjeta-producto';
import type { Categoria } from '@/lib/catalogo/tipos';
import { catalogo, leerFiltros, type FiltrosCatalogo, type ParametrosBusqueda } from '@/lib/datos';
import { textos, type Idioma } from '@/lib/i18n';
import { Enlace } from '@/lib/i18n/enlace';
import { idiomaActual } from '@/lib/i18n/servidor';
import { metadatosPagina } from '@/lib/metadatos';
import { rutas } from '@/lib/rutas';

import '@/estilos/catalogo.css';

interface PropsTienda {
  searchParams: Promise<ParametrosBusqueda>;
}

const T = textos(
  {
    tienda: 'Tienda',
    tituloGeneral: 'Toda la tienda',
    textoGeneral:
      'Lo que está hecho sale en 24–48 horas. Lo que pone «por encargo» lo tejemos cuando lo pides, y te decimos el plazo antes.',
    descripcion:
      'Todo el catálogo de crochet hecho a mano: amigurumis, piezas de bebé, accesorios, hogar y packs de regalo.',
    descripcionCategoria: (nombre: string, texto: string) => `${nombre} de crochet tejidos a mano en Málaga. ${texto}`,
    piezasCatalogo: 'Piezas del catálogo',
    sinResultados: 'Aquí no hay nada con esos filtros',
    sinResultadosTexto: 'Prueba a quitar alguno, o escríbenos y te lo tejemos a medida.',
    aMedida: 'Pedirlo a medida',
    ayudaTitulo: '¿No encuentras lo que buscas?',
    ayudaTexto:
      'Cuéntanos qué tienes en la cabeza (color, tamaño, para quién) y te decimos si podemos hacerlo y cuánto tardaríamos.',
    pedirEncargo: 'Pedir un encargo',
  },
  {
    en: {
      tienda: 'Shop',
      tituloGeneral: 'The whole shop',
      textoGeneral:
        'Anything already made ships in 24–48 hours. Anything marked “custom order” we crochet once you order it, and we tell you how long it will take first.',
      descripcion:
        'The full catalogue of handmade crochet: amigurumi, baby pieces, accessories, homeware and gift sets.',
      descripcionCategoria: (nombre: string, texto: string) =>
        `${nombre}: crochet made by hand in Málaga. ${texto}`,
      piezasCatalogo: 'Items in the catalogue',
      sinResultados: 'Nothing here matches those filters',
      sinResultadosTexto: 'Try removing one or two, or drop us a line and we’ll make it to measure for you.',
      aMedida: 'Ask for it made to measure',
      ayudaTitulo: 'Can’t find what you’re looking for?',
      ayudaTexto:
        'Tell us what you have in mind (colour, size, who it’s for) and we’ll let you know whether we can make it and how long it would take.',
      pedirEncargo: 'Request a custom order',
    },
    fr: {
      tienda: 'Boutique',
      tituloGeneral: 'Toute la boutique',
      textoGeneral:
        'Ce qui est déjà prêt part sous 24 à 48\u00a0heures. Ce qui est marqué «\u00a0sur mesure\u00a0», nous le tricotons à la commande, et nous vous indiquons le délai avant.',
      descripcion:
        'Tout le catalogue de crochet fait main\u00a0: amigurumis, pièces pour bébé, accessoires, maison et coffrets cadeaux.',
      descripcionCategoria: (nombre: string, texto: string) =>
        `${nombre}\u00a0: crochet fait main à Málaga. ${texto}`,
      piezasCatalogo: 'Pièces du catalogue',
      sinResultados: 'Rien ne correspond à ces filtres',
      sinResultadosTexto: 'Essayez d’en retirer un ou deux, ou écrivez-nous et nous le tricoterons sur mesure.',
      aMedida: 'Le demander sur mesure',
      ayudaTitulo: 'Vous ne trouvez pas ce que vous cherchez\u00a0?',
      ayudaTexto:
        'Dites-nous ce que vous avez en tête (couleur, taille, pour qui) et nous vous dirons si nous pouvons le faire et en combien de temps.',
      pedirEncargo: 'Demander une commande sur mesure',
    },
    de: {
      tienda: 'Shop',
      tituloGeneral: 'Der ganze Shop',
      textoGeneral:
        'Was schon fertig ist, geht innerhalb von 24–48 Stunden raus. Was als „Auftragsarbeit“ markiert ist, häkeln wir nach Ihrer Bestellung, und die Lieferzeit nennen wir Ihnen vorher.',
      descripcion:
        'Der ganze Katalog mit Handgehäkeltem: Amigurumis, Babysachen, Accessoires, Wohnen und Geschenksets.',
      descripcionCategoria: (nombre: string, texto: string) =>
        `${nombre}: von Hand gehäkelt in Málaga. ${texto}`,
      piezasCatalogo: 'Stücke im Katalog',
      sinResultados: 'Mit diesen Filtern gibt es hier nichts',
      sinResultadosTexto: 'Entfernen Sie einen Filter, oder schreiben Sie uns, dann häkeln wir es nach Maß.',
      aMedida: 'Nach Maß anfragen',
      ayudaTitulo: 'Nicht gefunden, was Sie suchen?',
      ayudaTexto:
        'Erzählen Sie uns, was Ihnen vorschwebt (Farbe, Größe, für wen), und wir sagen Ihnen, ob wir es machen können und wie lange es dauern würde.',
      pedirEncargo: 'Auftragsarbeit anfragen',
    },
  },
);

/** Con una sola categoría, la página entera pasa a ser esa categoría. */
async function categoriaUnica(filtros: FiltrosCatalogo, idioma: Idioma): Promise<Categoria | null> {
  if (filtros.categorias?.length !== 1) return null;
  return catalogo(idioma).categoria(filtros.categorias[0]);
}

export async function generateMetadata({ searchParams }: PropsTienda): Promise<Metadata> {
  const idioma = await idiomaActual();
  const t = T[idioma];
  const filtros = leerFiltros(await searchParams);
  const categoria = await categoriaUnica(filtros, idioma);
  if (categoria) {
    return metadatosPagina({
      idioma,
      titulo: categoria.nombre,
      descripcion: t.descripcionCategoria(categoria.nombre, categoria.texto),
      ruta: rutas.categoria(categoria.slug),
      imagen: { url: categoria.foto.src, alt: categoria.foto.alt },
    });
  }
  // Búsquedas, órdenes y otros filtros apuntan a la tienda entera como
  // canónica: son vistas de la misma página, no páginas distintas.
  return metadatosPagina({
    idioma,
    titulo: t.tienda,
    descripcion: t.descripcion,
    ruta: rutas.tienda,
  });
}

export default async function Tienda({ searchParams }: PropsTienda) {
  const idioma = await idiomaActual();
  const t = T[idioma];
  const filtros = leerFiltros(await searchParams);
  const fuente = catalogo(idioma);
  const [categorias, productos, categoria] = await Promise.all([
    fuente.categorias(),
    fuente.productos(filtros),
    categoriaUnica(filtros, idioma),
  ]);
  const paraFiltros = categorias.map(({ slug, nombre }) => ({ slug, nombre }));

  return (
    <div className="wrap">
      <Migas
        actual={categoria?.nombre ?? t.tienda}
        camino={categoria ? [{ texto: t.tienda, href: rutas.tienda }] : []}
      />

      <header className="cab-tienda">
        <h1 className="ent ent-1">{categoria?.nombre ?? t.tituloGeneral}</h1>
        <p className="lead ent ent-2">{categoria?.texto ?? t.textoGeneral}</p>
      </header>

      <ProveedorFiltros filtros={filtros} total={productos.length}>
        <div className="layout-tienda">
          <PanelFiltros categorias={paraFiltros} />

          <div className="resultados">
            <h2 className="oculto-vis">{t.piezasCatalogo}</h2>
            <BarraResultados categorias={paraFiltros} />
            <ZonaResultados>
              {productos.length > 0 ? (
                <div className="rejilla">
                  {productos.map((p, i) => (
                    <TarjetaProducto
                      key={p.slug}
                      producto={p}
                      // La primera fila se ve al cargar; en móvil, solo la primera tarjeta.
                      prioridad={i === 0 ? 'alta' : i < 3 ? 'normal' : undefined}
                    />
                  ))}
                </div>
              ) : (
                <div className="sin-resultados">
                  <Ovillo width={56} height={56} className="sin-resultados-ovillo" />
                  <h2>{t.sinResultados}</h2>
                  <p className="lead">{t.sinResultadosTexto}</p>
                  <div className="sin-resultados-botones">
                    <BotonQuitarFiltros />
                    <Enlace className="btn btn-1" href={rutas.encargos}>
                      {t.aMedida}
                    </Enlace>
                  </div>
                </div>
              )}
            </ZonaResultados>
          </div>
        </div>
      </ProveedorFiltros>

      <section aria-labelledby="titulo-ayuda">
        <Aparece efecto="rev-zoom" className="banda dos-cta">
          <div>
            <h2 id="titulo-ayuda" className="banda-titulo">
              {t.ayudaTitulo}
            </h2>
            <p className="banda-texto">{t.ayudaTexto}</p>
          </div>
          <Enlace className="btn btn-1" href={rutas.encargos}>
            {t.pedirEncargo}
          </Enlace>
        </Aparece>
      </section>
    </div>
  );
}
