'use client';

// Bloque de compra de la ficha: variante (color, talla o modelo),
// iniciales, unidades, añadir y favoritos, más la barra fija del móvil,
// que comparte el mismo estado. La variante elegida vive en
// <ProveedorVariante> para que la galería enseñe su foto.

import { useId, useState } from 'react';
import { ContadorUnidades } from '@/componentes/cesta/contador-unidades';
import { IcoCesta } from '@/componentes/iconos';
import { BotonAnadir } from '@/componentes/producto/boton-anadir';
import { BotonFavorito } from '@/componentes/producto/boton-favorito';
import { pedirAvisoStock } from '@/lib/acciones/aviso-stock';
import { esPorColor } from '@/componentes/producto/variantes';
import { rotuloVariante } from '@/lib/catalogo/localizar';
import { precioVenta } from '@/lib/catalogo/precio';
import { MAX_UDS_LINEA, type ProductoCesta } from '@/lib/cesta/tipos';
import { eur } from '@/lib/formato';
import { textos } from '@/lib/i18n';
import { useIdioma, useTextos } from '@/lib/i18n/cliente';
import { FormularioCorreo } from './formulario-correo';
import { useVariante } from './variante-ficha';

const T = textos(
  {
    agotado: 'agotado',
    alPedir: 'se teje al pedir',
    disponibles: (n: number) => `${n} ${n === 1 ? 'disponible' : 'disponibles'}`,
    agotadoOculto: ' (agotado)',
    opcional: 'opcional, gratis',
    colorAgotado: 'Este color se ha agotado',
    varianteAgotada: (variante: string) => `«${variante}» se ha agotado`,
    avisoTexto: 'Déjanos tu correo y te escribimos en cuanto lo volvamos a tejer. Te avisamos por orden de llegada.',
    avisoEtiqueta: (nombre: string, variante: string) =>
      `Tu correo para avisarte cuando vuelva ${nombre} en ${variante}`,
    avisadme: 'Avisadme',
    anadirCesta: 'Añadir a la cesta',
    agotadoPastilla: 'Agotado',
    anadir: 'Añadir',
    anadirOculto: (nombre: string) => ` ${nombre} a la cesta`,
  },
  {
    en: {
      agotado: 'sold out',
      alPedir: 'made to order',
      disponibles: (n: number) => `${n} available`,
      agotadoOculto: ' (sold out)',
      opcional: 'optional, free',
      colorAgotado: 'This colour has sold out',
      varianteAgotada: (variante: string) => `“${variante}” has sold out`,
      avisoTexto: 'Leave us your email and we’ll write as soon as we’ve made it again. We let people know in the order they signed up.',
      avisoEtiqueta: (nombre: string, variante: string) =>
        `Your email, so we can let you know when ${nombre} in ${variante} is back`,
      avisadme: 'Let me know',
      anadirCesta: 'Add to basket',
      agotadoPastilla: 'Sold out',
      anadir: 'Add',
      anadirOculto: (nombre: string) => ` ${nombre} to basket`,
    },
    fr: {
      agotado: 'épuisé',
      alPedir: 'tricoté à la commande',
      disponibles: (n: number) => `${n} ${n === 1 ? 'disponible' : 'disponibles'}`,
      agotadoOculto: ' (épuisé)',
      opcional: 'facultatif, gratuit',
      colorAgotado: 'Cette couleur est épuisée',
      varianteAgotada: (variante: string) => `«\u00a0${variante}\u00a0» est épuisé`,
      avisoTexto:
        'Laissez-nous votre adresse e-mail et nous vous écrirons dès que nous l’aurons tricoté à nouveau. Nous prévenons par ordre d’inscription.',
      avisoEtiqueta: (nombre: string, variante: string) =>
        `Votre e-mail pour être prévenu du retour de ${nombre} en ${variante}`,
      avisadme: 'Prévenez-moi',
      anadirCesta: 'Ajouter au panier',
      agotadoPastilla: 'Épuisé',
      anadir: 'Ajouter',
      anadirOculto: (nombre: string) => ` ${nombre} au panier`,
    },
    de: {
      agotado: 'ausverkauft',
      alPedir: 'wird auf Bestellung gehäkelt',
      disponibles: (n: number) => `${n} verfügbar`,
      agotadoOculto: ' (ausverkauft)',
      opcional: 'optional, kostenlos',
      colorAgotado: 'Diese Farbe ist ausverkauft',
      varianteAgotada: (variante: string) => `„${variante}“ ist ausverkauft`,
      avisoTexto:
        'Hinterlassen Sie uns Ihre E-Mail-Adresse, und wir schreiben Ihnen, sobald wir es neu gehäkelt haben. Wir benachrichtigen in der Reihenfolge der Anmeldungen.',
      avisoEtiqueta: (nombre: string, variante: string) =>
        `Ihre E-Mail-Adresse, damit wir Ihnen Bescheid geben, wenn ${nombre} in ${variante} wieder da ist`,
      avisadme: 'Benachrichtigen',
      anadirCesta: 'In den Warenkorb',
      agotadoPastilla: 'Ausverkauft',
      anadir: 'Hinzufügen',
      anadirOculto: (nombre: string) => ` ${nombre} in den Warenkorb`,
    },
  },
);

export function CompraProducto({ producto }: { producto: ProductoCesta }) {
  const { variantes, personalizable, nombre, encargo, etiquetaVariante } = producto;
  const id = useId();
  const idioma = useIdioma();
  const t = useTextos(T);
  const { final: precio } = precioVenta(producto);
  // Los colores se eligen por la muestra; tallas y modelos, por su nombre.
  const porColor = esPorColor(etiquetaVariante);

  const { indice, elegir } = useVariante();
  const [uds, setUds] = useState(1);
  const [iniciales, setIniciales] = useState('');

  const variante = variantes[indice];
  const rotulo = variante ? rotuloVariante(variante) : undefined;
  const agotada = !variante || variante.stock === 0;
  const maximo = Math.max(1, Math.min(variante?.stock ?? 0, MAX_UDS_LINEA));
  // Al cambiar a un color con menos unidades, el contador se ajusta solo.
  const unidades = Math.min(uds, maximo);
  const total = precio * unidades;

  const estadoVariante = agotada ? t.agotado : encargo ? t.alPedir : t.disponibles(variante.stock);

  const opciones = {
    variante: indice,
    uds: unidades,
    personalizacion: iniciales.trim() || undefined,
  };

  return (
    <>
      <div className="compra">
        {/* ---------- Variante ---------- */}
        <div className="bloque-compra" role="group" aria-labelledby={`${id}-variante`}>
          <div className="fila-etiqueta">
            <span id={`${id}-variante`} className="etiqueta-compra">
              {etiquetaVariante}
            </span>
            <span className="mini" aria-live="polite">
              {porColor ? `${rotulo} · ${estadoVariante}` : estadoVariante}
            </span>
          </div>
          <div className={porColor ? 'muestras' : 'muestras muestras-texto'}>
            {variantes.map((v, i) =>
              porColor ? (
                <button
                  key={v.nombre}
                  type="button"
                  className={v.stock === 0 ? 'sw sin' : 'sw'}
                  aria-pressed={i === indice}
                  aria-label={v.stock === 0 ? `${rotuloVariante(v)}${t.agotadoOculto}` : rotuloVariante(v)}
                  title={rotuloVariante(v)}
                  onClick={() => elegir(i)}
                >
                  <i style={{ background: v.color }} />
                </button>
              ) : (
                <button
                  key={v.nombre}
                  type="button"
                  className={v.stock === 0 ? 'chip chip-variante sin' : 'chip chip-variante'}
                  aria-pressed={i === indice}
                  onClick={() => elegir(i)}
                >
                  {rotuloVariante(v)}
                  {v.stock === 0 && <span className="oculto-vis">{t.agotadoOculto}</span>}
                </button>
              ),
            )}
          </div>
        </div>

        {/* ---------- Personalización ---------- */}
        {personalizable && !agotada && (
          <div className="campo bloque-compra">
            <div className="fila-etiqueta">
              <label htmlFor={`${id}-iniciales`}>{personalizable.etiqueta}</label>
              <span className="mini">{t.opcional}</span>
            </div>
            <input
              id={`${id}-iniciales`}
              type="text"
              value={iniciales}
              onChange={(e) => setIniciales(e.target.value.slice(0, personalizable.max))}
              maxLength={personalizable.max}
              placeholder={personalizable.ejemplo}
              autoComplete="off"
              aria-describedby={`${id}-pista`}
            />
            <p id={`${id}-pista`} className="pista">
              {personalizable.pista}{' '}
              <span aria-hidden="true">
                ({iniciales.length}/{personalizable.max})
              </span>
            </p>
          </div>
        )}

        {/* ---------- Comprar o pedir aviso ---------- */}
        {agotada ? (
          <div className="caja bloque-compra">
            <h2 className="tit-agotado">
              {porColor ? t.colorAgotado : t.varianteAgotada(rotulo ?? '')}
            </h2>
            <p className="mini aviso-texto">{t.avisoTexto}</p>
            <FormularioCorreo
              key={variante?.nombre}
              accion={pedirAvisoStock}
              etiqueta={t.avisoEtiqueta(nombre, rotulo ?? '')}
              boton={t.avisadme}
              ocultos={{ producto: producto.slug, variante: variante?.nombre ?? '' }}
              className="form-aviso"
            />
          </div>
        ) : (
          <div className="fila-compra bloque-compra">
            <ContadorUnidades valor={unidades} max={maximo} alCambiar={setUds} nombre={nombre} grande />
            <BotonAnadir producto={producto} className="btn btn-1 btn-anadir" {...opciones}>
              <IcoCesta />
              {t.anadirCesta} <span aria-hidden="true">·</span> {eur(total, idioma)}
            </BotonAnadir>
          </div>
        )}

        <BotonFavorito slug={producto.slug} nombre={nombre} className="btn btn-4 btn-p fav-ficha" conTexto />
      </div>

      {/* ---------- Barra fija en móvil ---------- */}
      <div className="barra-movil">
        <div className="barra-movil-datos">
          <p className="barra-movil-nombre">{nombre}</p>
          <p className="mini">
            {eur(precio, idioma)} · {rotulo}
          </p>
        </div>
        {agotada ? (
          <span className="pastilla pastilla-ag">{t.agotadoPastilla}</span>
        ) : (
          <BotonAnadir producto={producto} className="btn btn-1 btn-p" {...opciones}>
            {t.anadir}
            <span className="oculto-vis">{t.anadirOculto(nombre)}</span>
          </BotonAnadir>
        )}
      </div>
    </>
  );
}
