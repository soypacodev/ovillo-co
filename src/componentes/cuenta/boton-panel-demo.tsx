import { IcoOjo } from '@/componentes/iconos';
import { entrarPanelDemo } from '@/lib/panel/acciones';

interface PropsBoton {
  className?: string;
  texto?: string;
}

/** Formulario de un solo botón: funciona sin JavaScript y las credenciales
 *  de la cuenta de demostración no salen nunca del servidor. */
export function BotonPanelDemo({ className = 'btn btn-3', texto = 'Ver el panel de demostración' }: PropsBoton) {
  return (
    <form action={entrarPanelDemo} className="form-panel-demo">
      <button type="submit" className={className}>
        <IcoOjo width={18} height={18} />
        {texto}
      </button>
    </form>
  );
}
