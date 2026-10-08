import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
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
import { metadatosPagina } from '@/lib/metadatos';
import { rutas } from '@/lib/rutas';
import { tipografia } from '@/lib/tipografia';

import '@/estilos/catalogo.css';

interface PropsFicha {
  params: Promise<{ slug: string }>;
}

const CATEGORIAS_INFANTILES = new Set<Producto['categoria']>(['bebe', 'amigurumis']);

export async function generateMetadata({ params }: PropsFicha): Promise<Metadata> {
  const { slug } = await params;
  const producto = await catalogo().producto(slug);
  if (!producto) return { title: 'Pieza no encontrada' };

  return metadatosPagina({
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
function datosEstructurados(producto: Producto) {
  const base = urlSitio();
  const disponible = stockTotal(producto) > 0;
  const { final, rebaja } = precioVenta(producto);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: producto.nombre,
    description: producto.largo,
    sku: producto.slug,
    image: producto.fotos.map((f) => `${base}${f.src}`),
    brand: { '@type': 'Brand', name: 'Ovillo & Co.' },
    material: producto.materiales.join(', '),
    offers: {
      '@type': 'Offer',
      url: `${base}${rutas.producto(producto.slug)}`,
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

function textoEnvios(envios: MetodoEnvio[]) {
  return envios.map((e) => {
    const precio = e.precio === 0 ? 'gratis' : eur(e.precio);
    const gratis = e.gratisDesde ? `, gratis desde ${eur(e.gratisDesde)}` : '';
    return tipografia(`${e.nombre}: ${precio} (${e.plazo}${gratis}).`);
  });
}

export default async function Ficha({ params }: PropsFicha) {
  const { slug } = await params;
  const fuente = catalogo();
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
      titulo: 'Materiales y medidas',
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
      titulo: 'Cómo cuidarlo',
      contenido: (
        <>
          {tipografia(producto.cuidados)}{' '}
          <Link className="enlace-texto" href={rutas.cuidados}>
            Guía completa de cuidados
          </Link>
          .
        </>
      ),
    },
    {
      titulo: 'Envíos y devoluciones',
      contenido: (
        <>
          <ul className="lista-puntadas">
            {textoEnvios(envios).map((t) => (
              <li key={t}>{t}</li>
            ))}
            <li>
              Tienes 14 días para devolverlo
              {producto.personalizable ? ', salvo si lleva iniciales u otra personalización' : ''}.
            </li>
          </ul>
          <Link className="enlace-texto" href={rutas.envios}>
            Ver las condiciones
          </Link>
        </>
      ),
    },
  ];
  if (CATEGORIAS_INFANTILES.has(producto.categoria)) {
    detalles.push({
      titulo: '¿Es seguro para un bebé?',
      contenido:
        'Ojos y detalles van bordados: nada de plástico ni piezas que se puedan soltar. El relleno es fibra hueca hipoalergénica. Aun así, mientras duerme, nada suelto en la cuna, y lo decorativo, como las guirnaldas, siempre fuera de su alcance.',
    });
  }

  return (
    <>
      <JsonLd datos={datosEstructurados(producto)} />

      <div className="wrap">
        <Migas
          actual={producto.nombre}
          camino={[
            { texto: 'Tienda', href: rutas.tienda },
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
                <span className="precio-g">{eur(precio.final)}</span>
                {precio.anterior !== null && (
                  <>
                    <span className="antes">
                      <span className="oculto-vis">Antes </span>
                      {eur(precio.anterior)}
                    </span>
                    <span className="dto">−{precio.porcentaje} %</span>
                  </>
                )}
                <span className="mini">IVA incluido · envío aparte</span>
              </div>

              <div className="ent ent-5 avisos-ficha">
                {producto.encargo ? (
                  <p className="aviso">
                    <IcoInfo />
                    <span>
                      <b>Se teje al pedir · {producto.dias ?? 'unos'} días.</b> Es lo que tardamos en tenerlo listo, más
                      el envío. Te escribimos cuando lo empezamos y cuando sale del taller.
                    </span>
                  </p>
                ) : stockTotal(producto) > 0 ? (
                  <p className="aviso aviso-ok">
                    <IcoOk />
                    <span>
                      <b>Listo para enviar:</b> sale del taller en 24–48 h.
                    </span>
                  </p>
                ) : null}
                {precio.rebaja && (
                  <p className="aviso aviso-rebaja">
                    <IcoInfo />
                    <span>
                      <b>{precio.rebaja.nombre}:</b> −{precio.rebaja.porcentaje} % ya descontado en el precio que
                      ves{precio.rebaja.hasta ? `, hasta el ${diaLargo(precio.rebaja.hasta)}` : ''}. Sin código: en la
                      cesta pagas lo mismo.
                    </span>
                  </p>
                )}
              </div>

              {producto.contenido && producto.contenido.length > 0 && (
                <div className="caja-cl contenido-pack">
                  <h2 className="titulo-mini">Qué lleva dentro</h2>
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
                <p className="eyebrow eyebrow-banda">La historia de esta pieza</p>
                <h2 id="titulo-historia" className="tit-sec">
                  Por qué la tejemos
                </h2>
                <p className="historia-texto">{producto.historia}</p>
              </div>
              {fotoHistoria && (
                <figure className="polaroid polaroid-suelta">
                  <div className="foto">
                    <Image src={fotoHistoria.src} alt={fotoHistoria.alt} fill sizes="(max-width: 880px) 70vw, 260px" />
                  </div>
                  <figcaption>hecho en Málaga, sin prisa</figcaption>
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
              <h2 id="titulo-relacionados">También te puede gustar</h2>
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
