'use client';

import type { MetodoEnvio } from '@/lib/catalogo/tipos';
import type { LineaCesta } from '@/lib/cesta/tipos';
import { totales } from '@/lib/cesta/totales';
import { eur } from '@/lib/formato';
import { textos } from '@/lib/i18n';
import { useIdioma, useTextos } from '@/lib/i18n/cliente';
import type { IdEnvio } from '@/lib/pagos/opciones';
import { tipografia } from '@/lib/tipografia';

export interface PropsSelectorEnvio {
  metodos: readonly MetodoEnvio[];
  lineas: readonly LineaCesta[];
  cupon: string | null;
  valor: IdEnvio;
  alCambiar: (id: IdEnvio) => void;
  leyenda: string;
  /** Leyenda solo para lectores de pantalla (cuando ya hay un título visible). */
  leyendaOculta?: boolean;
  compacto?: boolean;
}

const T = textos(
  { gratis: 'Gratis' },
  { en: { gratis: 'Free' }, fr: { gratis: 'Offerte' }, de: { gratis: 'Kostenlos' } },
);

/** Métodos de envío con su precio real para esta cesta (gratis si llega al umbral). */
export function SelectorEnvio({
  metodos,
  lineas,
  cupon,
  valor,
  alCambiar,
  leyenda,
  leyendaOculta,
  compacto,
}: PropsSelectorEnvio) {
  const t = useTextos(T);
  const idioma = useIdioma();
  return (
    <fieldset className={compacto ? 'envios envios-compacto' : 'envios'}>
      <legend className={leyendaOculta ? 'oculto-vis' : undefined}>{leyenda}</legend>
      {metodos.map((m) => {
        const { envio } = totales(lineas, cupon, { envioId: m.id, envios: metodos });
        return (
          <label key={m.id} className="opcion opcion-envio">
            <input
              type="radio"
              name="envio"
              value={m.id}
              checked={valor === m.id}
              onChange={() => alCambiar(m.id)}
            />
            <span className="opcion-txt">
              <b>{m.nombre}</b>
              <span className="mini">{tipografia(m.plazo)}</span>
            </span>
            <span className="precio">{envio === 0 ? t.gratis : eur(envio, idioma)}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
