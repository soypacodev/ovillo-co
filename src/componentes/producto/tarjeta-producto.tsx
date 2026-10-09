import Image from 'next/image';
import { rotuloVariante } from '@/lib/catalogo/localizar';
import type { Producto } from '@/lib/catalogo/tipos';
import { precioVenta } from '@/lib/catalogo/precio';
import type { ProductoCesta } from '@/lib/cesta/tipos';
import { eur } from '@/lib/formato';
import { textos } from '@/lib/i18n';
import { Enlace } from '@/lib/i18n/enlace';
import { idiomaActual } from '@/lib/i18n/servidor';
import { rutas } from '@/lib/rutas';
import { BotonAnadir } from './boton-anadir';
import { BotonFavorito } from './boton-favorito';
import { esPorColor } from './variantes';
import { tipografia } from '@/lib/tipografia';

const TAMANOS_TARJETA =
  '(max-width: 620px) 92vw, (max-width: 900px) 46vw, (max-width: 1600px) 290px, 340px';

export function stockTotal(p: Pick<Producto, 'variantes'>): number {
  return p.variantes.reduce((suma, v) => suma + v.stock, 0);
}

/** Lo que necesita el botón de añadir: así no viaja el producto entero al cliente. */
export function paraCesta(p: Producto): ProductoCesta {
  return {
    slug: p.slug,
    nombre: p.nombre,
    categoria: p.categoria,
    precio: p.precio,
    antes: p.antes,
    rebaja: p.rebaja ?? null,
    encargo: p.encargo,
    dias: p.dias,
    variantes: p.variantes,
    etiquetaVariante: p.etiquetaVariante,
    personalizable: p.personalizable,
    fotos: p.fotos.slice(0, 1),
  };
}

/** «Colores», «Tallas», «Modelos». */
const plural = (palabra: string) => (/[aeiouáéó]$/i.test(palabra) ? `${palabra}s` : `${palabra}es`);

const T = textos(
  {
    agotado: 'Agotado',
    novedad: 'Novedad',
    encargo: 'Por encargo',
    avisame: 'Avísame cuando vuelva',
    elegir: (etiqueta: string) => `Elegir ${etiqueta.toLowerCase()}`,
    anadir: 'Añadir a la cesta',
    antes: 'Antes ',
    variantes: (etiqueta: string, lista: string) => `${plural(etiqueta)}: ${lista}`,
  },
  {
    en: {
      agotado: 'Sold out',
      novedad: 'New',
      encargo: 'Custom order',
      avisame: 'Tell me when it’s back',
      elegir: (etiqueta: string) => `Choose ${etiqueta.toLowerCase()}`,
      anadir: 'Add to basket',
      antes: 'Was ',
      variantes: (_etiqueta: string, lista: string) => `Available in: ${lista}`,
    },
    fr: {
      agotado: 'Épuisé',
      novedad: 'Nouveauté',
      encargo: 'Sur mesure',
      avisame: 'Prévenez-moi de son retour',
      elegir: () => 'Choisir une option',
      anadir: 'Ajouter au panier',
      antes: 'Avant ',
      variantes: (_etiqueta: string, lista: string) => `Disponible en\u00a0: ${lista}`,
    },
    de: {
      agotado: 'Ausverkauft',
      novedad: 'Neu',
      encargo: 'Auftragsarbeit',
      avisame: 'Bei Verfügbarkeit benachrichtigen',
      elegir: (etiqueta: string) => `${etiqueta} wählen`,
      anadir: 'In den Warenkorb',
      antes: 'Vorher ',
      variantes: (_etiqueta: string, lista: string) => `Erhältlich in: ${lista}`,
    },
  },
);

export interface PropsTarjeta {
  producto: Producto;
  /** Foto visible al cargar: se pide enseguida y, si es la principal
   *  de la página, con prioridad alta. */
  prioridad?: 'alta' | 'normal';
  sizes?: string;
}

export async function TarjetaProducto({ producto: p, prioridad, sizes = TAMANOS_TARJETA }: PropsTarjeta) {
  const idioma = await idiomaActual();
  const t = T[idioma];
  const precio = precioVenta(p);
  const agotado = stockTotal(p) === 0;
  // Una talla o un modelo no se eligen a ciegas: el botón lleva a la ficha.
  const hayQueElegir = p.variantes.length > 1 && !esPorColor(p.etiquetaVariante);
  const colores = [...new Set(p.variantes.map((v) => v.color))];
  const href = rutas.producto(p.slug);
  const foto = p.fotos[0];

  const etiquetas: { texto: string; clase: string }[] = [];
  if (agotado) etiquetas.push({ texto: t.agotado, clase: 'pastilla-ag' });
  else if (p.etiqueta) etiquetas.push({ texto: p.etiqueta, clase: 'pastilla-of' });
  else if (precio.rebaja) etiquetas.push({ texto: precio.rebaja.nombre, clase: 'pastilla-of' });
  else if (precio.porcentaje) etiquetas.push({ texto: `−${precio.porcentaje} %`, clase: 'pastilla-of' });
  // Como mucho dos pastillas: la novedad cede ante una etiqueta o una rebaja.
  if (!agotado && p.novedad && etiquetas.length === 0) etiquetas.push({ texto: t.novedad, clase: 'pastilla-nu' });
  if (!agotado && p.encargo) etiquetas.push({ texto: t.encargo, clase: 'pastilla-en' });

  return (
    <article className="tarjeta">
      <div className="marco">
        <Enlace href={href} tabIndex={-1} aria-hidden="true">
          {foto && (
            <Image
              src={foto.src}
              alt={foto.alt}
              fill
              sizes={sizes}
              loading={prioridad ? 'eager' : 'lazy'}
              fetchPriority={prioridad === 'alta' ? 'high' : undefined}
            />
          )}
        </Enlace>
        {etiquetas.length > 0 && (
          <div className="esq-i">
            {etiquetas.map((e) => (
              <span key={e.texto} className={`pastilla ${e.clase}`}>
                {e.texto}
              </span>
            ))}
          </div>
        )}
        <BotonFavorito slug={p.slug} nombre={p.nombre} />
        {agotado ? (
          <Enlace className="rapido" href={href}>
            {t.avisame}
            <span className="oculto-vis">: {p.nombre}</span>
          </Enlace>
        ) : hayQueElegir ? (
          <Enlace className="rapido" href={href}>
            {t.elegir(p.etiquetaVariante)}
            <span className="oculto-vis">: {p.nombre}</span>
          </Enlace>
        ) : (
          <BotonAnadir producto={paraCesta(p)} className="rapido">
            {t.anadir}
            <span className="oculto-vis">: {p.nombre}</span>
          </BotonAnadir>
        )}
      </div>
      <h3>
        <Enlace href={href}>{p.nombre}</Enlace>
      </h3>
      <p className="mini tarjeta-corto">
        {tipografia(p.corto)}
      </p>
      <div className="precios">
        <span className="precio">{eur(precio.final, idioma)}</span>
        {precio.anterior !== null && (
          <>
            <span className="antes">
              <span className="oculto-vis">{t.antes}</span>
              {eur(precio.anterior, idioma)}
            </span>
            <span className="dto">−{precio.porcentaje} %</span>
          </>
        )}
      </div>
      <div className="puntos">
        {colores.map((color) => (
          <span key={color} className="punto" style={{ background: color }} />
        ))}
        <span className="oculto-vis">
          {t.variantes(p.etiquetaVariante, p.variantes.map(rotuloVariante).join(', '))}
        </span>
      </div>
    </article>
  );
}
