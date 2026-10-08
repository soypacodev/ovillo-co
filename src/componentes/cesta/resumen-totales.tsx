import type { Totales } from '@/lib/cesta/tipos';
import { eur, eurMenos } from '@/lib/formato';
import { tipografia } from '@/lib/tipografia';

export interface PropsResumen {
  totales: Totales;
  cupon: string | null;
  /** Texto del envío cuando aún no se ha elegido método. */
  etiquetaEnvio?: string;
}

/**
 * Filas de importes: subtotal, cupón, envío y total. El subtotal suma las
 * piezas con su precio ya rebajado, igual que cada línea; las rebajas
 * automáticas se nombran debajo para que se vea lo que se ahorra.
 */
export function ResumenTotales({ totales: t, cupon, etiquetaEnvio = 'Envío' }: PropsResumen) {
  return (
    <>
      <div className="fila">
        <span>Subtotal</span>
        <span>{eur(t.subtotal - t.rebajaAuto)}</span>
      </div>
      {t.rebajasAuto.map((r) => (
        <p className="mini-2 nota-rebaja" key={r.nombre}>
          Ya incluye {tipografia(r.nombre.toLowerCase())}: te ahorras {eur(r.importe)}.
        </p>
      ))}
      {t.rebajaCupon > 0 && (
        <div className="fila">
          <span>Código {cupon}</span>
          <span className="rebaja">{eurMenos(t.rebajaCupon)}</span>
        </div>
      )}
      <div className="fila">
        <span>
          {etiquetaEnvio}
          {t.envioGratisCupon && ` (código ${cupon})`}
        </span>
        <span>{t.envio === 0 ? 'Gratis' : eur(t.envio)}</span>
      </div>
      <div className="fila total">
        <span>Total</span>
        <span>{eur(t.total)}</span>
      </div>
    </>
  );
}
