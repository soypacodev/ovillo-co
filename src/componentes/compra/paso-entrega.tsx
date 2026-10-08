'use client';

import { IcoAtras, IcoInfo } from '@/componentes/iconos';
import type { MetodoEnvio } from '@/lib/catalogo/tipos';
import type { LineaCesta } from '@/lib/cesta/tipos';
import { MAX_DEDICATORIA, MAX_NOTA, NOMBRES_PROVINCIA } from '@/lib/pagos/opciones';
import { CampoArea, CampoSelect, CampoTexto } from './campos';
import type { PropsPaso } from './datos-pago';
import { SelectorEnvio } from './selector-envio';

interface PropsPasoEntrega extends PropsPaso {
  metodos: MetodoEnvio[];
  lineas: LineaCesta[];
  cupon: string | null;
  volver: () => void;
}

/** Paso 2: método de envío, dirección y si es para regalo. */
export function PasoEntrega({ datos, errores, cambiar, titulo, metodos, lineas, cupon, volver }: PropsPasoEntrega) {
  return (
    <div className="paso-pago">
      <div className="caja">
        <h2 ref={titulo} tabIndex={-1}>
          Cómo te lo hacemos llegar
        </h2>
        <SelectorEnvio
          metodos={metodos}
          lineas={lineas}
          cupon={cupon}
          valor={datos.envio}
          alCambiar={(id) => cambiar('envio', id)}
          leyenda="Método de envío"
          leyendaOculta
        />
      </div>

      {datos.envio === 'recogida' ? (
        <div className="aviso">
          <IcoInfo />
          <span>
            Lo recoges en nuestro taller de Málaga, sin coste. Cuando esté listo te escribimos para darte cita.
          </span>
        </div>
      ) : (
        <div className="caja">
          <h3>Dónde te lo mandamos</h3>
          <CampoTexto
            nombre="calle"
            etiqueta="Calle y número"
            autoComplete="address-line1"
            valor={datos.calle}
            alCambiar={(v) => cambiar('calle', v)}
            error={errores.calle}
          />
          <CampoTexto
            nombre="piso"
            etiqueta="Piso, puerta, escalera"
            autoComplete="address-line2"
            opcional
            valor={datos.piso}
            alCambiar={(v) => cambiar('piso', v)}
            error={errores.piso}
          />
          <div className="par par-cp">
            <CampoTexto
              nombre="cp"
              etiqueta="Código postal"
              autoComplete="postal-code"
              inputMode="numeric"
              maxLength={5}
              valor={datos.cp}
              alCambiar={(v) => cambiar('cp', v.replace(/\D/g, ''))}
              error={errores.cp}
            />
            <CampoTexto
              nombre="ciudad"
              etiqueta="Ciudad"
              autoComplete="address-level2"
              valor={datos.ciudad}
              alCambiar={(v) => cambiar('ciudad', v)}
              error={errores.ciudad}
            />
          </div>
          <CampoSelect
            nombre="provincia"
            etiqueta="Provincia"
            autoComplete="address-level1"
            vacio="Elige provincia"
            opciones={NOMBRES_PROVINCIA}
            valor={datos.provincia}
            alCambiar={(v) => cambiar('provincia', v)}
            error={errores.provincia}
          />
          <p className="mini-2">Enviamos a toda España.</p>
        </div>
      )}

      <div className="caja">
        <h3>¿Es un regalo?</h3>
        <label className="check mt-4">
          <input type="checkbox" checked={datos.regalo} onChange={(e) => cambiar('regalo', e.target.checked)} />
          <span>
            Sí, envolvedlo para regalar y no metáis el precio en el paquete <span className="mini-2">(gratis)</span>
          </span>
        </label>
        {datos.regalo && (
          <CampoArea
            nombre="dedicatoria"
            etiqueta="Dedicatoria escrita a mano"
            opcional
            max={MAX_DEDICATORIA}
            rows={3}
            placeholder="Para Lola, que llega en marzo. Con mucho cariño."
            pista="La escribimos en una tarjeta de papel de algodón. "
            valor={datos.dedicatoria}
            alCambiar={(v) => cambiar('dedicatoria', v)}
            error={errores.dedicatoria}
          />
        )}
        <CampoArea
          nombre="nota"
          etiqueta="Nota para el taller"
          opcional
          max={MAX_NOTA}
          rows={3}
          placeholder="Si no estoy en casa, dejadlo en el bajo, o “Es para el día 20”"
          valor={datos.nota}
          alCambiar={(v) => cambiar('nota', v)}
          error={errores.nota}
        />
      </div>

      <div className="botones-paso">
        <button type="button" className="btn btn-4 btn-p" onClick={volver}>
          <IcoAtras /> Volver a tus datos
        </button>
        <button type="submit" className="btn btn-1">
          Revisar el pedido
        </button>
      </div>
    </div>
  );
}
