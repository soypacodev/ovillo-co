import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Aparece } from '@/componentes/aparece';
import { FormularioCorreo } from '@/componentes/catalogo/formulario-correo';
import { IcoCamion, IcoCorazonG, IcoEstrella, IcoFlecha, Ovillo } from '@/componentes/iconos';
import { CifrasAnimadas } from '@/componentes/contenido/cifras-animadas';
import { ZonaParalaje } from '@/componentes/portada/zona-paralaje';
import { TarjetaProducto } from '@/componentes/producto/tarjeta-producto';
import { suscribirBoletin } from '@/lib/acciones/boletin';
import type { Categoria, Promocion } from '@/lib/catalogo/tipos';
import { CIFRAS_TALLER, HORAS_MANTA } from '@/datos/taller';
import { catalogo } from '@/lib/datos';
import { diaLargo } from '@/lib/fechas';
import { rutas } from '@/lib/rutas';

import '@/estilos/catalogo.css';
import '@/estilos/portada.css';

export const metadata: Metadata = {
  alternates: { canonical: rutas.inicio },
};

const PASOS = [
  {
    titulo: 'Eliges o encargas',
    texto: 'Lo que ya está hecho sale enseguida. Lo demás lo tejemos cuando lo pides, y te decimos el plazo antes de cobrarte nada.',
  },
  {
    titulo: 'Lo tejemos a mano',
    texto: 'Cada pieza la hace una sola persona de principio a fin. Si algo no nos convence, lo deshacemos y lo repetimos.',
  },
  {
    titulo: 'Te enseñamos el avance',
    texto: 'En los encargos te mandamos fotos por el camino, para que no haya sorpresas al abrir la caja.',
  },
  {
    titulo: 'Llega a tu casa',
    texto: 'Envuelto en papel de seda y con las instrucciones de lavado escritas a mano.',
  },
];

// Tienda de demostración: las opiniones son inventadas y se dice bien claro.
const OPINIONES = [
  {
    texto: 'La regalé por un nacimiento y fue lo que más ilusión hizo. En persona es todavía más bonita que en las fotos.',
    autora: 'Marta, Málaga',
    pieza: 'Manta estrella',
  },
  {
    texto: 'Pedimos un amigurumi de nuestra gata y clavaron hasta la manchita de la pata. Nos fueron mandando fotos y eso nos encantó.',
    autora: 'Julia, Sevilla',
    pieza: 'Encargo personalizado',
  },
  {
    texto: 'Uso el bolso de red casi a diario desde hace meses y sigue como el primer día. Aguanta muchísimo peso.',
    autora: 'Nuria, Granada',
    pieza: 'Bolso de red para el mercado',
  },
];

const PASOS_ENCARGO = [
  'Nos escribes con dos o tres fotos y la idea.',
  'Te contestamos en 24–48 h con precio y plazo.',
  'Si te encaja, pagas la mitad y empezamos.',
  'Te mandamos fotos del proceso por el camino.',
];

/** «50 €» sin decimales cuando el importe es redondo. */
function eurosRedondos(centimos: number): string {
  const euros = centimos / 100;
  return `${Number.isInteger(euros) ? euros : euros.toFixed(2).replace('.', ',')} €`;
}

/** La banda de rebajas se monta con la promoción automática que esté vigente. */
function rebajaDestacada(promociones: Promocion[], categorias: Categoria[]) {
  const promo = promociones.find((p) => p.tipo === 'porcentaje' && p.categoria !== null && p.valor > 0);
  if (!promo?.categoria) return null;
  const categoria = categorias.find((c) => c.slug === promo.categoria);
  if (!categoria) return null;
  return { promo, categoria };
}

export default async function Inicio() {
  const fuente = catalogo();
  const [categorias, todos, novedades, promociones, envios] = await Promise.all([
    fuente.categorias(),
    fuente.productos(),
    fuente.productos({ extras: ['novedades'], orden: 'nuevo' }),
    fuente.promociones(),
    fuente.metodosEnvio(),
  ]);

  const destacados = todos.filter((p) => p.destacado).slice(0, 8);
  const gratisDesde = envios.find((e) => e.id === 'ordinario')?.gratisDesde ?? null;
  const rebaja = rebajaDestacada(promociones, categorias);

  return (
    <>
      {/* ---------- Héroe ---------- */}
      <div className="wrap">
        <ZonaParalaje className="dos-hero heroe" aria-labelledby="titulo-portada">
          <div>
            <p className="eyebrow ent ent-1">Taller de crochet · Málaga</p>
            <h1 id="titulo-portada" className="ent ent-2">
              Cositas blanditas, <em className="destacado">de una en una</em>
              <svg
                className="puntada"
                width="230"
                height="12"
                viewBox="0 0 230 12"
                fill="none"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M2 8c40-6 78-7 116-3 34 3 68 1 110-4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </h1>
            <p className="lead ent ent-3 heroe-texto">
              Tejemos amigurumis, mantas y accesorios en un taller pequeño de Málaga, con lana buena y sin prisa. No
              hay dos piezas iguales porque no hay dos tardes iguales.
            </p>
            <div className="ent ent-4 heroe-botones">
              <Link className="btn btn-1" href={rutas.tienda}>
                Ver la tienda <IcoFlecha />
              </Link>
              <Link className="btn btn-2" href={rutas.encargos}>
                Quiero un encargo
              </Link>
            </div>
            <div className="ventajas ent ent-5 heroe-ventajas">
              <div>
                <IcoCorazonG />
                <span>
                  <b>Pieza única</b>Ninguna sale igual a otra
                </span>
              </div>
              <div>
                <IcoCamion />
                <span>
                  <b>Envío en 48 h</b>
                  {gratisDesde ? `Gratis a partir de ${eurosRedondos(gratisDesde)}` : 'A toda la península'}
                </span>
              </div>
              <div>
                <IcoEstrella />
                <span>
                  <b>Materiales buenos</b>Algodón y merino, sin más
                </span>
              </div>
            </div>
          </div>

          <div className="heroe-foto">
            {/* El paralaje va en un envoltorio: la animación de entrada del
                arco fija su propio transform y lo taparía. */}
            <div className="paralaje">
              <div className="arco ent-arco heroe-arco">
                <Image
                  src="/fotos/portada.jpg"
                  alt="Cervatillo de ganchillo dormido junto a un corazón rosa tejido"
                  fill
                  loading="eager"
                  fetchPriority="high"
                  sizes="(max-width: 880px) min(92vw, 440px), (max-width: 1600px) 440px, 520px"
                />
              </div>
            </div>
            <div className="caja flota sello heroe-sello">
              <Ovillo width={34} height={34} />
              <span className="mini">
                <b>{HORAS_MANTA} horas</b>
                <br />
                por manta terminada
              </span>
            </div>
          </div>
        </ZonaParalaje>
      </div>

      {/* ---------- Categorías ---------- */}
      <div className="wrap">
        <section aria-labelledby="titulo-categorias">
          <Aparece className="cab-sec">
            <div>
              <p className="eyebrow">Por dónde empezar</p>
              <h2 id="titulo-categorias" className="tit-sec">
                Busca por categoría
              </h2>
            </div>
            <Link className="enlace" href={rutas.tienda}>
              Ver todo el catálogo
            </Link>
          </Aparece>
          <Aparece como="ul" efecto="rev-lista" className="tira-h tira-cats">
            {categorias.map((c) => (
              <li key={c.slug}>
                <Link href={rutas.categoria(c.slug)} className="cat-arco">
                  <span className="cat-foto">
                    <Image src={c.foto.src} alt="" fill sizes="(max-width: 900px) 158px, 220px" />
                  </span>
                  <span className="cat-nombre">{c.nombre}</span>
                  <span className="mini-2">{c.texto}</span>
                </Link>
              </li>
            ))}
          </Aparece>
        </section>
      </div>

      {/* ---------- Destacados ---------- */}
      <div className="wrap">
        <section aria-labelledby="titulo-destacados">
          <Aparece className="cab-sec">
            <div>
              <p className="eyebrow">Lo que hay ahora mismo</p>
              <h2 id="titulo-destacados" className="tit-sec">
                En el cesto
              </h2>
              <p className="lead tit-lead">
                Cuando algo se agota tardamos unos días en reponerlo: lo tejemos aquí, no llega en un camión.
              </p>
            </div>
            <Link className="btn btn-2" href={rutas.tienda}>
              Ver las {todos.length} piezas
            </Link>
          </Aparece>
          <Aparece efecto="rev-lista" className="rejilla">
            {destacados.map((p) => (
              <TarjetaProducto key={p.slug} producto={p} />
            ))}
          </Aparece>
        </section>
      </div>

      {/* ---------- Rebajas (solo si hay una automática vigente) ---------- */}
      {rebaja && (
        <div className="wrap">
          <section aria-labelledby="titulo-rebajas">
            <Aparece efecto="rev-zoom" className="banda banda-melocoton dos-cta">
              <div>
                <p className="eyebrow eyebrow-banda">
                  {rebaja.promo.hasta ? `Hasta el ${diaLargo(rebaja.promo.hasta)}` : 'Rebaja en marcha'}
                </p>
                <h2 id="titulo-rebajas" className="tit-sec">
                  −{rebaja.promo.valor} % en {rebaja.categoria.nombre.toLowerCase()}
                </h2>
                <p className="banda-texto">
                  {rebaja.categoria.texto} Se descuenta solo en la cesta, sin código ni letra pequeña.
                </p>
              </div>
              <Link className="btn btn-1" href={rutas.categoria(rebaja.categoria.slug)}>
                Ver {rebaja.categoria.nombre.toLowerCase()}
              </Link>
            </Aparece>
          </section>
        </div>
      )}

      {/* ---------- Novedades ---------- */}
      {novedades.length > 0 && (
        <div className="wrap">
          <section aria-labelledby="titulo-novedades">
            <Aparece className="cab-sec">
              <div>
                <p className="eyebrow">Recién salido de las agujas</p>
                <h2 id="titulo-novedades" className="tit-sec">
                  Novedades
                </h2>
              </div>
              <Link className="enlace" href={`${rutas.tienda}?filtro=novedades`}>
                Ver todas
              </Link>
            </Aparece>
            <Aparece efecto="rev-lista" className="rejilla rejilla-4">
              {novedades.slice(0, 4).map((p) => (
                <TarjetaProducto key={p.slug} producto={p} />
              ))}
            </Aparece>
          </section>
        </div>
      )}

      {/* ---------- El taller ---------- */}
      <div className="wrap">
        <section className="dos" aria-labelledby="titulo-taller">
          <Aparece efecto="rev-izq">
            <p className="eyebrow">Quién está detrás</p>
            <h2 id="titulo-taller" className="tit-sec">
              Una mesa, buena luz
              <br />y mucho hilo
            </h2>
            <p className="lead taller-texto">
              Ovillo &amp; Co. nació en 2019 con un pulpito reversible y una lista de espera apuntada en la nevera.
              Hoy somos un taller pequeño en Málaga y seguimos tejiendo cada pieza de una en una.
            </p>
            <blockquote>
              Si una pieza no nos gusta, la deshacemos. Preferimos tardar un poco más que mandarte algo que no nos
              quedaríamos.
            </blockquote>
            <CifrasAnimadas cifras={CIFRAS_TALLER} />
            <Link className="btn btn-2 taller-boton" href={rutas.taller}>
              Conocer el taller
            </Link>
          </Aparece>

          <Aparece efecto="rev-der" className="polaroids">
            <figure className="polaroid p1">
              <div className="foto">
                <Image
                  src="/fotos/taller-1.jpg"
                  alt="Manos tejiendo una pieza blanca de ganchillo"
                  fill
                  sizes="(max-width: 880px) 48vw, 300px"
                />
              </div>
              <figcaption>a medio hacer</figcaption>
            </figure>
            <figure className="polaroid p2">
              <div className="foto">
                <Image
                  src="/fotos/taller-2.jpg"
                  alt="Ovillos de algodón en tonos cálidos junto a unas tijeras"
                  fill
                  sizes="(max-width: 880px) 44vw, 270px"
                />
              </div>
              <figcaption>el cesto de los ovillos</figcaption>
            </figure>
            <figure className="polaroid p3">
              <div className="foto">
                <Image
                  src="/fotos/taller-3.jpg"
                  alt="Ovillo verde agua y aguja de ganchillo de madera"
                  fill
                  sizes="(max-width: 880px) 34vw, 200px"
                />
              </div>
              <figcaption>punto nube</figcaption>
            </figure>
          </Aparece>
        </section>
      </div>

      {/* ---------- Cómo funciona ---------- */}
      <div className="wrap">
        <section aria-labelledby="titulo-como">
          <Aparece className="centro sec-intro">
            <p className="eyebrow">Sin sorpresas</p>
            <h2 id="titulo-como" className="tit-sec">
              Cómo funciona esto
            </h2>
            <p className="lead tit-lead">
              Somos un taller pequeño, así que preferimos contártelo claro antes de que pidas nada.
            </p>
          </Aparece>
          <Aparece como="ol" efecto="rev-lista" className="cols-4 pasos-portada">
            {PASOS.map((paso, i) => (
              <li key={paso.titulo} className="caja">
                <span className="num" aria-hidden="true">
                  {i + 1}
                </span>
                <h3>{paso.titulo}</h3>
                <p className="mini">{paso.texto}</p>
              </li>
            ))}
          </Aparece>
        </section>
      </div>

      {/* ---------- Opiniones ---------- */}
      <div className="wrap">
        <section aria-labelledby="titulo-opiniones">
          <Aparece className="cab-sec">
            <div>
              <p className="eyebrow">Lo que dicen</p>
              <h2 id="titulo-opiniones" className="tit-sec">
                Quien ya lo tiene en casa
              </h2>
            </div>
            <p className="pastilla">Reseñas de ejemplo · tienda de demostración</p>
          </Aparece>
          <Aparece como="ul" efecto="rev-lista" className="cols-3">
            {OPINIONES.map((o) => (
              <li key={o.autora}>
                <figure className="caja opinion">
                  <p className="estrellas" role="img" aria-label="5 de 5 estrellas">
                    ★★★★★
                  </p>
                  <blockquote>{o.texto}</blockquote>
                  <figcaption className="mini">
                    <b>{o.autora}</b> · {o.pieza}
                  </figcaption>
                </figure>
              </li>
            ))}
          </Aparece>
        </section>
      </div>

      {/* ---------- Encargos ---------- */}
      <div className="wrap">
        <section aria-labelledby="titulo-encargos">
          <Aparece efecto="rev-zoom" className="banda-osc dos-lado">
            <div>
              <p className="eyebrow">Encargos personalizados</p>
              <h2 id="titulo-encargos" className="tit-sec">
                ¿Quieres un amigurumi de tu perro?
              </h2>
              <p className="lead encargo-texto">
                Mándanos dos o tres fotos y te decimos si podemos, cuánto tardaríamos y cuánto costaría. Sin
                compromiso: si no te encaja el presupuesto, no pasa nada.
              </p>
              <Link className="btn btn-claro encargo-boton" href={rutas.encargos}>
                Contarnos tu idea
              </Link>
            </div>
            <ol className="pasos">
              {PASOS_ENCARGO.map((paso, i) => (
                <li key={paso}>
                  <span className="num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span>{paso}</span>
                </li>
              ))}
            </ol>
          </Aparece>
        </section>
      </div>

      {/* ---------- Boletín ---------- */}
      <div className="wrap">
        <section aria-labelledby="titulo-boletin">
          <Aparece className="centro boletin">
            <Ovillo width={44} height={44} className="flota-lento boletin-ovillo" />
            <h2 id="titulo-boletin">Te avisamos cuando haya cosas nuevas</h2>
            <p className="lead tit-lead">Un correo al mes como mucho. Si te cansamos, te das de baja en un clic.</p>
            <FormularioCorreo accion={suscribirBoletin} etiqueta="Tu correo electrónico" boton="Apuntarme" />
          </Aparece>
        </section>
      </div>
    </>
  );
}
