import type { Metadata } from 'next';
import Image from 'next/image';
import { Aparece } from '@/componentes/aparece';
import { FormularioCorreo } from '@/componentes/catalogo/formulario-correo';
import { IcoCamion, IcoCorazonG, IcoEstrella, IcoFlecha, Ovillo } from '@/componentes/iconos';
import { CifrasAnimadas } from '@/componentes/contenido/cifras-animadas';
import { ZonaParalaje } from '@/componentes/portada/zona-paralaje';
import { TarjetaProducto } from '@/componentes/producto/tarjeta-producto';
import { suscribirBoletin } from '@/lib/acciones/boletin';
import { INDEXAR_TIENDA, ROBOTS_PORTADA } from '@/lib/buscadores/indexacion';
import { alternativas, IMAGEN_GENERAL } from '@/lib/metadatos';
import type { Categoria, Promocion } from '@/lib/catalogo/tipos';
import { CIFRAS_TALLER, HORAS_MANTA } from '@/datos/taller';
import { catalogo, stockTotal } from '@/lib/datos';
import { diaLargo } from '@/lib/fechas';
import { eur } from '@/lib/formato';
import { DATOS_IDIOMA, IDIOMAS, type Idioma } from '@/lib/i18n';
import { Enlace } from '@/lib/i18n/enlace';
import { idiomaActual } from '@/lib/i18n/servidor';
import { rutas } from '@/lib/rutas';
import { T } from './contenido-portada';

import '@/estilos/catalogo.css';
import '@/estilos/portada.css';

// La portada es la única página que se indexa en la demo (ver
// src/lib/buscadores/indexacion.ts), así que su descripción dice qué es y
// quién la ha hecho. En una instalación real habla solo de la tienda.
export async function generateMetadata(): Promise<Metadata> {
  const idioma = await idiomaActual();
  const t = T[idioma];
  const descripcion = INDEXAR_TIENDA ? t.descripcionTienda : t.descripcionDemo;
  const alternates = alternativas(rutas.inicio, idioma);
  return {
    description: descripcion,
    alternates,
    robots: ROBOTS_PORTADA,
    openGraph: {
      type: 'website',
      locale: DATOS_IDIOMA[idioma].og,
      alternateLocale: IDIOMAS.filter((i) => i !== idioma).map((i) => DATOS_IDIOMA[i].og),
      siteName: 'Ovillo & Co.',
      url: alternates.canonical as string,
      title: t.ogTitulo,
      description: descripcion,
      // Al definir su propio Open Graph, la portada no hereda la imagen de app/.
      images: [{ ...IMAGEN_GENERAL, alt: t.ogTitulo }],
    },
  };
}

/** «50 €» sin decimales cuando el importe es redondo. */
function eurosRedondos(centimos: number, idioma: Idioma): string {
  const euros = centimos / 100;
  if (idioma === 'es') return `${Number.isInteger(euros) ? euros : euros.toFixed(2).replace('.', ',')}\u00a0€`;
  if (!Number.isInteger(euros)) return eur(centimos, idioma);
  return idioma === 'en' ? `€${euros}` : `${euros}\u00a0€`;
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
  const idioma = await idiomaActual();
  const t = T[idioma];
  const fuente = catalogo(idioma);
  const [categorias, todos, novedades, promociones, envios] = await Promise.all([
    fuente.categorias(),
    fuente.productos(),
    fuente.productos({ extras: ['novedades'], orden: 'nuevo' }),
    fuente.promociones(),
    fuente.metodosEnvio(),
  ]);

  // Ningún producto sale en dos bloques: las novedades tienen el suyo, y
  // «lo que hay ahora mismo» es solo lo que está hecho y sale ya.
  const novedadesVisibles = novedades.slice(0, 4);
  const enNovedades = new Set(novedadesVisibles.map((p) => p.slug));
  const destacados = todos
    .filter((p) => !p.encargo && stockTotal(p) > 0 && !enNovedades.has(p.slug))
    .slice(0, 4);
  const gratisDesde = envios.find((e) => e.id === 'ordinario')?.gratisDesde ?? null;
  const rebaja = rebajaDestacada(promociones, categorias);
  const cifras = CIFRAS_TALLER.map((c, i) => ({ valor: c.valor, texto: t.cifras[i] ?? c.texto }));

  return (
    <>
      {/* ---------- Héroe ---------- */}
      <div className="wrap">
        <ZonaParalaje className="dos-hero heroe" aria-labelledby="titulo-portada">
          <div>
            <p className="eyebrow ent ent-1">{t.eyebrow}</p>
            <h1 id="titulo-portada" className="ent ent-2">
              {t.titulo}
              <em className="destacado">{t.tituloDestacado}</em>
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
            <p className="lead ent ent-3 heroe-texto">{t.entradilla}</p>
            <div className="ent ent-4 heroe-botones">
              <Enlace className="btn btn-1" href={rutas.tienda}>
                {t.verTienda} <IcoFlecha />
              </Enlace>
              <Enlace className="btn btn-2" href={rutas.encargos}>
                {t.quieroEncargo}
              </Enlace>
            </div>
            <div className="ventajas ent ent-5 heroe-ventajas">
              <div>
                <IcoCorazonG />
                <span>
                  <b>{t.unica}</b>
                  {t.unicaTexto}
                </span>
              </div>
              <div>
                <IcoCamion />
                <span>
                  <b>
                    {t.saleEn}
                    <span className="sin-salto">24–48 h</span>
                  </b>
                  {gratisDesde ? t.gratisDesde(eurosRedondos(gratisDesde, idioma)) : t.peninsula}
                </span>
              </div>
              <div>
                <IcoEstrella />
                <span>
                  <b>{t.materiales}</b>
                  {t.materialesTexto}
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
                  alt={t.altPortada}
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
                <b>{t.horas(HORAS_MANTA)}</b>
                <br />
                {t.porManta}
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
              <p className="eyebrow">{t.categoriasEyebrow}</p>
              <h2 id="titulo-categorias" className="tit-sec">
                {t.categoriasTitulo}
              </h2>
            </div>
            <Enlace className="enlace" href={rutas.tienda}>
              {t.verCatalogo}
            </Enlace>
          </Aparece>
          <Aparece como="ul" efecto="rev-lista" className="tira-h tira-cats">
            {categorias.map((c) => (
              <li key={c.slug}>
                <Enlace href={rutas.categoria(c.slug)} className="cat-arco">
                  <span className="cat-foto">
                    <Image src={c.foto.src} alt="" fill sizes="(max-width: 900px) 158px, 220px" />
                  </span>
                  <span className="cat-nombre">{c.nombre}</span>
                  <span className="mini-2">{c.texto}</span>
                </Enlace>
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
              <p className="eyebrow">{t.destacadosEyebrow}</p>
              <h2 id="titulo-destacados" className="tit-sec">
                {t.destacadosTitulo}
              </h2>
              <p className="lead tit-lead">{t.destacadosTexto}</p>
            </div>
            <Enlace className="btn btn-2" href={rutas.tienda}>
              {t.verPiezas(todos.length)}
            </Enlace>
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
                  {rebaja.promo.hasta ? t.rebajaHasta(diaLargo(rebaja.promo.hasta, idioma)) : t.rebajaEnMarcha}
                </p>
                <h2 id="titulo-rebajas" className="tit-sec">
                  {t.rebajaTitulo(rebaja.promo.valor, rebaja.categoria.nombre)}
                </h2>
                <p className="banda-texto">{t.rebajaTexto(rebaja.categoria.texto)}</p>
              </div>
              <Enlace className="btn btn-1" href={rutas.categoria(rebaja.categoria.slug)}>
                {t.verCategoria(rebaja.categoria.nombre)}
              </Enlace>
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
                <p className="eyebrow">{t.novedadesEyebrow}</p>
                <h2 id="titulo-novedades" className="tit-sec">
                  {t.novedadesTitulo}
                </h2>
              </div>
              <Enlace className="enlace" href={`${rutas.tienda}?filtro=novedades`}>
                {t.verTodas}
              </Enlace>
            </Aparece>
            <Aparece efecto="rev-lista" className="rejilla rejilla-4">
              {novedadesVisibles.map((p) => (
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
            <p className="eyebrow">{t.tallerEyebrow}</p>
            <h2 id="titulo-taller" className="tit-sec">
              {t.tallerTitulo}
              <br />
              {t.tallerTitulo2}
            </h2>
            <p className="lead taller-texto">{t.tallerTexto}</p>
            <blockquote>{t.tallerCita}</blockquote>
            <CifrasAnimadas cifras={cifras} />
            <Enlace className="btn btn-2 taller-boton" href={rutas.taller}>
              {t.conocerTaller}
            </Enlace>
          </Aparece>

          <Aparece efecto="rev-der" className="polaroids">
            <figure className="polaroid p1">
              <div className="foto">
                <Image
                  src="/fotos/taller-1.jpg"
                  alt={t.polaroids[0].alt}
                  fill
                  sizes="(max-width: 880px) 48vw, 300px"
                />
              </div>
              <figcaption>{t.polaroids[0].pie}</figcaption>
            </figure>
            <figure className="polaroid p2">
              <div className="foto">
                <Image
                  src="/fotos/taller-2.jpg"
                  alt={t.polaroids[1].alt}
                  fill
                  sizes="(max-width: 880px) 44vw, 270px"
                />
              </div>
              <figcaption>{t.polaroids[1].pie}</figcaption>
            </figure>
            <figure className="polaroid p3">
              <div className="foto">
                <Image
                  src="/fotos/taller-3.jpg"
                  alt={t.polaroids[2].alt}
                  fill
                  sizes="(max-width: 880px) 34vw, 200px"
                />
              </div>
              <figcaption>{t.polaroids[2].pie}</figcaption>
            </figure>
          </Aparece>
        </section>
      </div>

      {/* ---------- Cómo funciona ---------- */}
      <div className="wrap">
        <section aria-labelledby="titulo-como">
          <Aparece className="centro sec-intro">
            <p className="eyebrow">{t.comoEyebrow}</p>
            <h2 id="titulo-como" className="tit-sec">
              {t.comoTitulo}
            </h2>
            <p className="lead tit-lead">{t.comoTexto}</p>
          </Aparece>
          <Aparece como="ol" efecto="rev-lista" className="cols-4 pasos-portada">
            {t.pasos.map((paso, i) => (
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
              <p className="eyebrow">{t.opinionesEyebrow}</p>
              <h2 id="titulo-opiniones" className="tit-sec">
                {t.opinionesTitulo}
              </h2>
            </div>
            <p className="pastilla">{t.opinionesAviso}</p>
          </Aparece>
          <Aparece como="ul" efecto="rev-lista" className="cols-3">
            {t.opiniones.map((o) => (
              <li key={o.autora}>
                <figure className="caja opinion">
                  <p className="estrellas" role="img" aria-label={t.estrellas}>
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
              <p className="eyebrow">{t.encargosEyebrow}</p>
              <h2 id="titulo-encargos" className="tit-sec">
                {t.encargosTitulo}
              </h2>
              <p className="lead encargo-texto">{t.encargosTexto}</p>
              <Enlace className="btn btn-claro encargo-boton" href={rutas.encargos}>
                {t.contarIdea}
              </Enlace>
            </div>
            <ol className="pasos">
              {t.pasosEncargo.map((paso, i) => (
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
            <h2 id="titulo-boletin">{t.boletinTitulo}</h2>
            <p className="lead tit-lead">{t.boletinTexto}</p>
            <FormularioCorreo accion={suscribirBoletin} etiqueta={t.boletinEtiqueta} boton={t.boletinBoton} />
          </Aparece>
        </section>
      </div>
    </>
  );
}
