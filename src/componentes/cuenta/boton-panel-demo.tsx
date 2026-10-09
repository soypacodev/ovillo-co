import { IcoOjo } from '@/componentes/iconos';
import { textos } from '@/lib/i18n';
import { idiomaActual } from '@/lib/i18n/servidor';
import { entrarPanelDemo } from '@/lib/panel/acciones';

const T = textos(
  { texto: 'Ver el panel de demostración' },
  {
    en: { texto: 'See the demo dashboard' },
    fr: { texto: 'Voir le tableau de bord de démonstration' },
    de: { texto: 'Demo-Dashboard ansehen' },
  },
);

interface PropsBoton {
  className?: string;
  texto?: string;
}

/** Formulario de un solo botón: funciona sin JavaScript y las credenciales
 *  de la cuenta de demostración no salen nunca del servidor. */
export async function BotonPanelDemo({ className = 'btn btn-3', texto }: PropsBoton) {
  const t = T[await idiomaActual()];
  return (
    <form action={entrarPanelDemo} className="form-panel-demo">
      <button type="submit" className={className}>
        <IcoOjo width={18} height={18} />
        {texto ?? t.texto}
      </button>
    </form>
  );
}
