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
import { precioVenta } from '@/lib/catalogo/precio';
import { MAX_UDS_LINEA, type ProductoCesta } from '@/lib/cesta/tipos';
import { eur } from '@/lib/formato';
import { FormularioCorreo } from './formulario-correo';
import { useVariante } from './variante-ficha';

export function CompraProducto({ producto }: { producto: ProductoCesta }) {
  const { variantes, personalizable, nombre, encargo, etiquetaVariante } = producto;
  const id = useId();
  const { final: precio } = precioVenta(producto);
  // Los colores se eligen por la muestra; tallas y modelos, por su nombre.
  const porColor = etiquetaVariante === 'Color';

  const { indice, elegir } = useVariante();
  const [uds, setUds] = useState(1);
  const [iniciales, setIniciales] = useState('');

  const variante = variantes[indice];
  const agotada = !variante || variante.stock === 0;
  const maximo = Math.max(1, Math.min(variante?.stock ?? 0, MAX_UDS_LINEA));
  // Al cambiar a un color con menos unidades, el contador se ajusta solo.
  const unidades = Math.min(uds, maximo);
  const total = precio * unidades;

  const estadoVariante = agotada
    ? 'agotado'
    : encargo
      ? 'se teje al pedir'
      : `${variante.stock} ${variante.stock === 1 ? 'disponible' : 'disponibles'}`;

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
              {porColor ? `${variante?.nombre} · ${estadoVariante}` : estadoVariante}
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
                  aria-label={v.stock === 0 ? `${v.nombre} (agotado)` : v.nombre}
                  title={v.nombre}
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
                  {v.nombre}
                  {v.stock === 0 && <span className="oculto-vis"> (agotado)</span>}
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
              <span className="mini">opcional, gratis</span>
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
              {porColor ? 'Este color se ha agotado' : `«${variante?.nombre}» se ha agotado`}
            </h2>
            <p className="mini aviso-texto">
              Déjanos tu correo y te escribimos en cuanto lo volvamos a tejer. Te avisamos por orden de llegada.
            </p>
            <FormularioCorreo
              key={variante?.nombre}
              accion={pedirAvisoStock}
              etiqueta={`Tu correo para avisarte cuando vuelva ${nombre} en ${variante?.nombre}`}
              boton="Avisadme"
              ocultos={{ producto: producto.slug, variante: variante?.nombre ?? '' }}
              className="form-aviso"
            />
          </div>
        ) : (
          <div className="fila-compra bloque-compra">
            <ContadorUnidades valor={unidades} max={maximo} alCambiar={setUds} nombre={nombre} grande />
            <BotonAnadir producto={producto} className="btn btn-1 btn-anadir" {...opciones}>
              <IcoCesta />
              Añadir a la cesta <span aria-hidden="true">·</span> {eur(total)}
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
            {eur(precio)} · {variante?.nombre}
          </p>
        </div>
        {agotada ? (
          <span className="pastilla pastilla-ag">Agotado</span>
        ) : (
          <BotonAnadir producto={producto} className="btn btn-1 btn-p" {...opciones}>
            Añadir<span className="oculto-vis"> {nombre} a la cesta</span>
          </BotonAnadir>
        )}
      </div>
    </>
  );
}
