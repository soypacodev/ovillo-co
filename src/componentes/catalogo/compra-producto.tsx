'use client';

// Bloque de compra de la ficha: color, iniciales, unidades, añadir y
// favoritos, más la barra fija del móvil, que comparte el mismo estado.

import { useId, useState } from 'react';
import { ContadorUnidades } from '@/componentes/cesta/contador-unidades';
import { IcoCesta } from '@/componentes/iconos';
import { BotonAnadir } from '@/componentes/producto/boton-anadir';
import { BotonFavorito } from '@/componentes/producto/boton-favorito';
import { pedirAvisoStock } from '@/lib/acciones/aviso-stock';
import { MAX_UDS_LINEA, type ProductoCesta } from '@/lib/cesta/tipos';
import { eur } from '@/lib/formato';
import { FormularioCorreo } from './formulario-correo';

export function CompraProducto({ producto }: { producto: ProductoCesta }) {
  const { variantes, personalizable, nombre, precio, encargo } = producto;
  const id = useId();

  const primeraConStock = variantes.findIndex((v) => v.stock > 0);
  const [indice, setIndice] = useState(Math.max(0, primeraConStock));
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
        {/* ---------- Color ---------- */}
        <div className="bloque-compra" role="group" aria-labelledby={`${id}-color`}>
          <div className="fila-etiqueta">
            <span id={`${id}-color`} className="etiqueta-compra">
              Color
            </span>
            <span className="mini" aria-live="polite">
              {variante?.nombre} · {estadoVariante}
            </span>
          </div>
          <div className="muestras">
            {variantes.map((v, i) => (
              <button
                key={v.nombre}
                type="button"
                className={v.stock === 0 ? 'sw sin' : 'sw'}
                aria-pressed={i === indice}
                aria-label={v.stock === 0 ? `${v.nombre} (agotado)` : v.nombre}
                title={v.nombre}
                onClick={() => setIndice(i)}
              >
                <i style={{ background: v.color }} />
              </button>
            ))}
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
            <h2 className="tit-agotado">Este color se ha agotado</h2>
            <p className="mini aviso-texto">
              Déjanos tu correo y te avisamos en cuanto lo volvamos a tejer. Sin listas raras: primero quien avisa.
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
