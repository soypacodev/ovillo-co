'use client';

import { IcoCesta } from '@/componentes/iconos';
import { useCesta } from '@/lib/cesta/contexto';
import { piezas } from '@/lib/formato';

export function BotonCesta() {
  const { unidades, abrir, abierta } = useCesta();
  return (
    <button
      type="button"
      className="icono"
      onClick={abrir}
      aria-haspopup="dialog"
      aria-expanded={abierta}
      aria-controls="cajon-cesta"
      aria-label={unidades ? `Ver la cesta, ${piezas(unidades)}` : 'Ver la cesta, vacía'}
    >
      <IcoCesta />
      {unidades > 0 && (
        // La clave cambia con el número: el globito se vuelve a montar y late.
        <span key={unidades} className="globo late" aria-hidden="true">
          {unidades > 99 ? '99+' : unidades}
        </span>
      )}
    </button>
  );
}
