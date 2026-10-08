import type { Totales } from '@/lib/cesta/tipos';
import { eur } from '@/lib/formato';

/** Progreso hacia el envío gratis. */
export function BarraEnvioGratis({ totales }: { totales: Totales }) {
  if (totales.faltaEnvioGratis <= 0) {
    return <p className="mini conseguido">¡Envío gratis conseguido!</p>;
  }
  return (
    <div className="progreso">
      <p className="mini">
        Te faltan <b>{eur(totales.faltaEnvioGratis)}</b> para el envío gratis
      </p>
      <div
        className="barra"
        role="progressbar"
        aria-label="Camino al envío gratis"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={totales.progresoEnvioGratis}
      >
        <i style={{ width: `${totales.progresoEnvioGratis}%` }} />
      </div>
    </div>
  );
}
