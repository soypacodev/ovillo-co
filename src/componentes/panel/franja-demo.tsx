import { IcoCandado } from '@/componentes/iconos';
import type { ModoPanel } from '@/lib/panel/fuente';
import { DEMO } from '@/lib/rutas';

/** Aviso fijo en lo alto del panel cuando no se puede guardar nada. */
export function FranjaDemo({ modo }: { modo: ModoPanel }) {
  return (
    <div className="franja-demo" role="note">
      <IcoCandado />
      <p>
        <b>Panel de demostración: puedes mirar todo, los cambios no se guardan.</b>{' '}
        <span className="franja-demo-detalle">
          {modo === 'local'
            ? 'Los pedidos, encargos y mensajes son inventados y se generan al vuelo, sin base de datos.'
            : 'Los datos de ejemplo se ven completos; los de clientes reales, enmascarados.'}
        </span>{' '}
        <span className="franja-demo-contratar">
          ¿Quieres un panel así para tu negocio?{' '}
          <a href={DEMO.contratar}>
            Habla con {DEMO.autor}
            <span className="oculto-vis"> por correo</span>
          </a>
          .
        </span>
      </p>
    </div>
  );
}
