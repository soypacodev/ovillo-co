import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Aparece } from '@/componentes/aparece';
import { CompraProducto } from '@/componentes/catalogo/compra-producto';
import { GaleriaProducto } from '@/componentes/catalogo/galeria-producto';
import { Acordeon, type ElementoAcordeon } from '@/componentes/contenido/acordeon';
import { JsonLd } from '@/componentes/contenido/json-ld';
import { Migas } from '@/componentes/contenido/migas';
import { IcoInfo, IcoOk } from '@/componentes/iconos';
import { paraCesta, TarjetaProducto } from '@/componentes/producto/tarjeta-producto';
import { ProveedorVariante } from '@/componentes/catalogo/variante-ficha';
import { precioVenta } from '@/lib/catalogo/precio';
import type { MetodoEnvio, Producto } from '@/lib/catalogo/tipos';
import { catalogo, stockTotal } from '@/lib/datos';
import { urlSitio } from '@/lib/datos/entorno';
import { eur } from '@/lib/formato';
import { diaLargo } from '@/lib/fechas';
import { conIdioma, DATOS_IDIOMA, textos, type Idioma } from '@/lib/i18n';
import { Enlace } from '@/lib/i18n/enlace';
import { idiomaActual } from '@/lib/i18n/servidor';
import { metadatosPagina } from '@/lib/metadatos';
import { rutas } from '@/lib/rutas';
import { tipografia } from '@/lib/tipografia';

import '@/estilos/catalogo.css';

interface PropsFicha {
  params: Promise<{ slug: string }>;
}

const T = textos(
  {
    noEncontrada: 'Pieza no encontrada',
    tienda: 'Tienda',
    gratis: 'gratis',
    gratisDesde: (importe: string) => `, gratis desde ${importe}`,
    envio: (nombre: string, precio: string, plazo: string, gratis: string) => `${nombre}: ${precio} (${plazo}${gratis}).`,
    materiales: 'Materiales y medidas',
    cuidados: 'Cómo cuidarlo',
    guiaCuidados: 'Guía completa de cuidados',
    envios: 'Envíos y devoluciones',
    devolucion: (personalizable: boolean) =>
      `Tienes 14 días para devolverlo${personalizable ? ', salvo si lleva iniciales u otra personalización' : ''}.`,
    condiciones: 'Ver las condiciones',
    seguroBebe: '¿Es seguro para un bebé?',
    seguroBebeTexto:
      'Ojos y detalles van bordados: nada de plástico ni piezas que se puedan soltar. El relleno es fibra hueca hipoalergénica. Aun así, mientras duerme, nada suelto en la cuna, y lo decorativo, como las guirnaldas, siempre fuera de su alcance.',
    antes: 'Antes ',
    iva: 'IVA incluido · envío aparte',
    alPedir: (dias: number | null) => (
      <>
        <b>Se teje al pedir · {dias ?? 'unos'} días.</b> Es lo que tardamos en tenerlo listo, más el envío. Te escribimos
        cuando lo empezamos y cuando sale del taller.
      </>
    ),
    listo: (
      <>
        <b>Listo para enviar:</b> sale del taller en 24–48 h.
      </>
    ),
    rebaja: (nombre: string, porcentaje: number, hasta: string | null) => (
      <>
        <b>{nombre}:</b> −{porcentaje} % ya descontado en el precio que ves{hasta ? `, hasta el ${hasta}` : ''}. Sin
        código: en la cesta pagas lo mismo.
      </>
    ),
    contenidoPack: 'Qué lleva dentro',
    historiaEyebrow: 'La historia de esta pieza',
    historiaTitulo: 'Por qué la tejemos',
    historiaPie: 'hecho en Málaga, sin prisa',
    relacionados: 'También te puede gustar',
  },
  {
    en: {
      noEncontrada: 'Item not found',
      tienda: 'Shop',
      gratis: 'free',
      gratisDesde: (importe: string) => `, free over ${importe}`,
      envio: (nombre: string, precio: string, plazo: string, gratis: string) => `${nombre}: ${precio} (${plazo}${gratis}).`,
      materiales: 'Materials and size',
      cuidados: 'How to care for it',
      guiaCuidados: 'Full care guide',
      envios: 'Shipping and returns',
      devolucion: (personalizable: boolean) =>
        `You have 14 days to return it${personalizable ? ', unless it has initials or other personalisation' : ''}.`,
      condiciones: 'See the terms',
      seguroBebe: 'Is it safe for a baby?',
      seguroBebeTexto:
        'Eyes and details are embroidered: no plastic and no parts that can come loose. The stuffing is hypoallergenic hollow fibre. Even so, nothing loose in the cot while they sleep, and decorative pieces such as garlands should always be kept out of reach.',
      antes: 'Was ',
      iva: 'VAT included · shipping extra',
      alPedir: (dias: number | null) => (
        <>
          <b>Made to order · {dias ?? 'a few'} days.</b> That’s how long it takes us to get it ready, plus delivery.
          We’ll write to you when we start it and when it leaves the workshop.
        </>
      ),
      listo: (
        <>
          <b>Ready to ship:</b> leaves the workshop in 24–48 h.
        </>
      ),
      rebaja: (nombre: string, porcentaje: number, hasta: string | null) => (
        <>
          <b>{nombre}:</b> {porcentaje}% already taken off the price you see{hasta ? `, until ${hasta}` : ''}. No
          code needed: you pay the same in your basket.
        </>
      ),
      contenidoPack: 'What’s inside',
      historiaEyebrow: 'The story behind this piece',
      historiaTitulo: 'Why we make it',
      historiaPie: 'made in Málaga, unhurried',
      relacionados: 'You might also like',
    },
    fr: {
      noEncontrada: 'Pièce introuvable',
      tienda: 'Boutique',
      gratis: 'gratuit',
      gratisDesde: (importe: string) => `, offert dès ${importe}`,
      envio: (nombre: string, precio: string, plazo: string, gratis: string) =>
        `${nombre} : ${precio} (${plazo}${gratis}).`,
      materiales: 'Matières et dimensions',
      cuidados: 'Comment l’entretenir',
      guiaCuidados: 'Guide d’entretien complet',
      envios: 'Livraison et retours',
      devolucion: (personalizable: boolean) =>
        `Vous avez 14 jours pour le retourner${personalizable ? ', sauf s’il porte des initiales ou une autre personnalisation' : ''}.`,
      condiciones: 'Voir les conditions',
      seguroBebe: 'Est-ce adapté à un bébé ?',
      seguroBebeTexto:
        'Les yeux et les détails sont brodés : pas de plastique ni de pièces qui pourraient se détacher. Le rembourrage est en fibre creuse hypoallergénique. Malgré tout, rien de détaché dans le lit pendant son sommeil, et les objets décoratifs, comme les guirlandes, toujours hors de sa portée.',
      antes: 'Avant ',
      iva: 'TVA incluse · livraison en sus',
      alPedir: (dias: number | null) => (
        <>
          <b>{`Tricoté à la commande · ${dias ?? 'quelques'}\u00a0jours.`}</b> C’est le temps qu’il nous faut pour le
          terminer, plus la livraison. Nous vous écrivons quand nous le commençons et quand il quitte l’atelier.
        </>
      ),
      listo: (
        <>
          <b>{'Prêt à expédier\u00a0:'}</b> part de l’atelier sous 24–48 h.
        </>
      ),
      rebaja: (nombre: string, porcentaje: number, hasta: string | null) => (
        <>
          <b>{`${nombre}\u00a0:`}</b>{' '}
          {`−${porcentaje}\u00a0% déjà déduits du prix affiché${hasta ? `, jusqu’au ${hasta}` : ''}. Sans code\u00a0: vous payez la même chose dans le panier.`}
        </>
      ),
      contenidoPack: 'Ce qu’il contient',
      historiaEyebrow: 'L’histoire de cette pièce',
      historiaTitulo: 'Pourquoi nous la tricotons',
      historiaPie: 'fait à Málaga, sans se presser',
      relacionados: 'Vous aimerez aussi',
    },
    de: {
      noEncontrada: 'Stück nicht gefunden',
      tienda: 'Shop',
      gratis: 'kostenlos',
      gratisDesde: (importe: string) => `, kostenlos ab ${importe}`,
      envio: (nombre: string, precio: string, plazo: string, gratis: string) => `${nombre}: ${precio} (${plazo}${gratis}).`,
      materiales: 'Material und Maße',
      cuidados: 'Pflegehinweise',
      guiaCuidados: 'Ausführliche Pflegeanleitung',
      envios: 'Versand und Rücksendungen',
      devolucion: (personalizable: boolean) =>
        `Sie haben 14 Tage Zeit für eine Rücksendung${personalizable ? ', außer bei Initialen oder einer anderen Personalisierung' : ''}.`,
      condiciones: 'Bedingungen ansehen',
      seguroBebe: 'Ist es sicher für ein Baby?',
      seguroBebeTexto:
        'Augen und Details sind aufgestickt: kein Plastik und keine Teile, die sich lösen können. Die Füllung ist hypoallergene Hohlfaser. Trotzdem gilt: Im Schlaf nichts Loses im Bettchen, und Dekoratives wie Girlanden immer außer Reichweite.',
      antes: 'Vorher ',
      iva: 'inkl. MwSt. · zzgl. Versand',
      alPedir: (dias: number | null) => (
        <>
          <b>Wird auf Bestellung gehäkelt · {dias ?? 'einige'} Tage.</b> So lange brauchen wir, bis es fertig ist, plus
          Versand. Wir schreiben Ihnen, wenn wir anfangen und wenn es die Werkstatt verlässt.
        </>
      ),
      listo: (
        <>
          <b>Versandfertig:</b> verlässt die Werkstatt innerhalb von 24–48 h.
        </>
      ),
      rebaja: (nombre: string, porcentaje: number, hasta: string | null) => (
        <>
          <b>{nombre}:</b> −{porcentaje} % sind im angezeigten Preis schon abgezogen{hasta ? `, bis zum ${hasta}` : ''}.
          Ohne Code: Im Warenkorb zahlen Sie dasselbe.
        </>
      ),
      contenidoPack: 'Was drin ist',
      historiaEyebrow: 'Die Geschichte dieses Stücks',
      historiaTitulo: 'Warum wir es häkeln',
      historiaPie: 'gemacht in Málaga, ohne Eile',
      relacionados: 'Das könnte Ihnen auch gefallen',
    },
  },
);

const CATEGORIAS_INFANTILES = new Set<Producto['categoria']>(['bebe', 'amigurumis']);

export async function generateMetadata({ params }: PropsFicha): Promise<Metadata> {
  const { slug } = await params;
  const idioma = await idiomaActual();
  const producto = await catalogo(idioma).producto(slug);
  if (!producto) return { title: T[idioma].noEncontrada };

  return metadatosPagina({
    idioma,
    titulo: producto.nombre,
    descripcion: recortar(`${producto.corto} ${producto.largo}`, 160),
    ruta: rutas.producto(producto.slug),
    // La compone ./opengraph-image.tsx con la foto, el nombre y el precio.
    imagen: 'ruta',
    precio: precioVenta(producto).final,
  });
}

/** Corta en la última palabra entera para no dejar «tejid…» a medias. */
function recortar(texto: string, maximo: number): string {
  if (texto.length <= maximo) return texto;
  const corte = texto.slice(0, maximo - 1);
  return `${corte.slice(0, corte.lastIndexOf(' '))}…`;
}

/** Datos estructurados de schema.org para que el buscador entienda la ficha. */
function datosEstructurados(producto: Producto, idioma: Idioma) {
  const base = urlSitio();
  const disponible = stockTotal(producto) > 0;
  const { final, rebaja } = precioVenta(producto);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    inLanguage: DATOS_IDIOMA[idioma].formato,
    name: producto.nombre,
    description: producto.largo,
    sku: producto.slug,
    image: producto.fotos.map((f) => `${base}${f.src}`),
    brand: { '@type': 'Brand', name: 'Ovillo & Co.' },
    material: producto.materiales.join(', '),
    offers: {
      '@type': 'Offer',
      url: `${base}${conIdioma(rutas.producto(producto.slug), idioma)}`,
      priceCurrency: 'EUR',
      // El precio que se paga, con la rebaja automática ya aplicada.
      price: (final / 100).toFixed(2),
      ...(rebaja?.hasta && { priceValidUntil: rebaja.hasta }),
      itemCondition: 'https://schema.org/NewCondition',
      availability: !disponible
        ? 'https://schema.org/OutOfStock'
        : producto.encargo
          ? 'https://schema.org/MadeToOrder'
          : 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Ovillo & Co.' },
    },
  };
}

function textoEnvios(envios: MetodoEnvio[], idioma: Idioma) {
  const t = T[idioma];
  return envios.map((e) => {
    const precio = e.precio === 0 ? t.gratis : eur(e.precio, idioma);
    const gratis = e.gratisDesde ? t.gratisDesde(eur(e.gratisDesde, idioma)) : '';
    return tipografia(t.envio(e.nombre, precio, e.plazo, gratis));
  });
}

export default async function Ficha({ params }: PropsFicha) {
  const { slug } = await params;
  const idioma = await idiomaActual();
  const t = T[idioma];
  const fuente = catalogo(idioma);
  const producto = await fuente.producto(slug);
  if (!producto) notFound();

  const [categoria, relacionados, envios] = await Promise.all([
    fuente.categoria(producto.categoria),
    fuente.relacionados(producto.slug, 4),
    fuente.metodosEnvio(),
  ]);

  const precio = precioVenta(producto);
  const fotoDeVariante = producto.variantes.map((v) =>
    v.foto ? producto.fotos.findIndex((f) => f.src === v.foto?.src) : -1,
  );
  const primeraConStock = Math.max(0, producto.variantes.findIndex((v) => v.stock > 0));
  const fotoHistoria = producto.fotos[1] ?? producto.fotos[0];
  const detalles: ElementoAcordeon[] = [
    {
      titulo: t.materiales,
      abierto: true,
      contenido: (
        <ul className="lista-puntadas">
          {producto.materiales.map((m) => (
            <li key={m}>{tipografia(m)}</li>
          ))}
          <li>{tipografia(producto.medidas)}</li>
        </ul>
      ),
    },
    {
      titulo: t.cuidados,
      contenido: (
        <>
          {tipografia(producto.cuidados)}{' '}
          <Enlace className="enlace-texto" href={rutas.cuidados}>
            {t.guiaCuidados}
          </Enlace>
          .
        </>
      ),
    },
    {
      titulo: t.envios,
      contenido: (
        <>
          <ul className="lista-puntadas">
            {textoEnvios(envios, idioma).map((texto) => (
              <li key={texto}>{texto}</li>
            ))}
            <li>{t.devolucion(Boolean(producto.personalizable))}</li>
          </ul>
          <Enlace className="enlace-texto" href={rutas.envios}>
            {t.condiciones}
          </Enlace>
        </>
      ),
    },
  ];
  if (CATEGORIAS_INFANTILES.has(producto.categoria)) {
    detalles.push({
      titulo: t.seguroBebe,
      contenido: t.seguroBebeTexto,
    });
  }

  return (
    <>
      <JsonLd datos={datosEstructurados(producto, idioma)} />

      <div className="wrap">
        <Migas
          actual={producto.nombre}
          camino={[
            { texto: t.tienda, href: rutas.tienda },
            ...(categoria ? [{ texto: categoria.nombre, href: rutas.categoria(categoria.slug) }] : []),
          ]}
        />

        <ProveedorVariante inicial={primeraConStock}>
          <div className="ficha">
            <GaleriaProducto
              fotos={producto.fotos}
              fotoDeVariante={fotoDeVariante}
              nombre={producto.nombre}
              encargo={producto.encargo}
              descuento={precio.porcentaje}
            />

            <div className="datos-ficha">
              <p className="eyebrow ent ent-1">{categoria?.nombre ?? producto.categoria}</p>
              <h1 className="ent ent-2 tit-ficha">{producto.nombre}</h1>
              <p className="lead ent ent-3 desc-ficha">{tipografia(producto.largo)}</p>

              <div className="ent ent-4 precio-ficha">
                <span className="precio-g">{eur(precio.final, idioma)}</span>
                {precio.anterior !== null && (
                  <>
                    <span className="antes">
                      <span className="oculto-vis">{t.antes}</span>
                      {eur(precio.anterior, idioma)}
                    </span>
                    <span className="dto">−{precio.porcentaje} %</span>
                  </>
                )}
                <span className="mini">{t.iva}</span>
              </div>

              <div className="ent ent-5 avisos-ficha">
                {producto.encargo ? (
                  <p className="aviso">
                    <IcoInfo />
                    <span>{t.alPedir(producto.dias)}</span>
                  </p>
                ) : stockTotal(producto) > 0 ? (
                  <p className="aviso aviso-ok">
                    <IcoOk />
                    <span>{t.listo}</span>
                  </p>
                ) : null}
                {precio.rebaja && (
                  <p className="aviso aviso-rebaja">
                    <IcoInfo />
                    <span>
                      {t.rebaja(
                        precio.rebaja.nombre,
                        precio.rebaja.porcentaje,
                        precio.rebaja.hasta ? diaLargo(precio.rebaja.hasta, idioma) : null,
                      )}
                    </span>
                  </p>
                )}
              </div>

              {producto.contenido && producto.contenido.length > 0 && (
                <div className="caja-cl contenido-pack">
                  <h2 className="titulo-mini">{t.contenidoPack}</h2>
                  <ul>
                    {producto.contenido.map((c) => (
                      <li key={c} className="mini">
                        <span aria-hidden="true">✓</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <CompraProducto producto={paraCesta(producto)} />

              <Acordeon className="acordeon-ficha" elementos={detalles} />
            </div>
          </div>
        </ProveedorVariante>
      </div>

      {producto.historia && (
        <div className="wrap">
          <section aria-labelledby="titulo-historia">
            <Aparece efecto="rev-zoom" className="banda banda-melocoton dos-lado">
              <div>
                <p className="eyebrow eyebrow-banda">{t.historiaEyebrow}</p>
                <h2 id="titulo-historia" className="tit-sec">
                  {t.historiaTitulo}
                </h2>
                <p className="historia-texto">{producto.historia}</p>
              </div>
              {fotoHistoria && (
                <figure className="polaroid polaroid-suelta">
                  <div className="foto">
                    <Image src={fotoHistoria.src} alt={fotoHistoria.alt} fill sizes="(max-width: 880px) 70vw, 260px" />
                  </div>
                  <figcaption>{t.historiaPie}</figcaption>
                </figure>
              )}
            </Aparece>
          </section>
        </div>
      )}

      {relacionados.length > 0 && (
        <div className="wrap">
          <section aria-labelledby="titulo-relacionados">
            <Aparece className="cab-sec">
              <h2 id="titulo-relacionados">{t.relacionados}</h2>
            </Aparece>
            <Aparece efecto="rev-lista" className="rejilla rejilla-4">
              {relacionados.map((p) => (
                <TarjetaProducto key={p.slug} producto={p} />
              ))}
            </Aparece>
          </section>
        </div>
      )}
    </>
  );
}
