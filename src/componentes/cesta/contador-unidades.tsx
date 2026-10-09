'use client';

import { IcoMasMini, IcoMenos } from '@/componentes/iconos';
import { textos } from '@/lib/i18n';
import { useTextos } from '@/lib/i18n/cliente';

const T = textos(
  {
    grupo: (nombre: string) => `Unidades de ${nombre}`,
    quitar: (nombre: string) => `Quitar ${nombre} de la cesta`,
    menos: (nombre: string) => `Una unidad menos de ${nombre}`,
    agotado: (nombre: string) => `No quedan más unidades de ${nombre}`,
    mas: (nombre: string) => `Una unidad más de ${nombre}`,
    unidades: (n: number) => (n === 1 ? 'unidad' : 'unidades'),
  },
  {
    en: {
      grupo: (nombre: string) => `Quantity of ${nombre}`,
      quitar: (nombre: string) => `Remove ${nombre} from your basket`,
      menos: (nombre: string) => `Decrease the quantity of ${nombre}`,
      agotado: (nombre: string) => `No more ${nombre} available`,
      mas: (nombre: string) => `Increase the quantity of ${nombre}`,
      unidades: (n: number) => (n === 1 ? 'item' : 'items'),
    },
    fr: {
      grupo: (nombre: string) => `Quantité de ${nombre}`,
      quitar: (nombre: string) => `Retirer ${nombre} du panier`,
      menos: (nombre: string) => `Retirer une unité de ${nombre}`,
      agotado: (nombre: string) => `Plus d’unités disponibles pour ${nombre}`,
      mas: (nombre: string) => `Ajouter une unité de ${nombre}`,
      unidades: (n: number) => (n === 1 ? 'unité' : 'unités'),
    },
    de: {
      grupo: (nombre: string) => `Menge von ${nombre}`,
      quitar: (nombre: string) => `${nombre} aus dem Warenkorb entfernen`,
      menos: (nombre: string) => `Menge von ${nombre} verringern`,
      agotado: (nombre: string) => `Von ${nombre} sind keine weiteren verfügbar`,
      mas: (nombre: string) => `Menge von ${nombre} erhöhen`,
      unidades: () => 'Stück',
    },
  },
);

export interface PropsContador {
  valor: number;
  /** Tope superior (stock o límite por línea). */
  max: number;
  /** Por debajo de este valor el botón de restar se desactiva. Con 0, el
   *  botón sigue activo en 1 y sirve para quitar la línea. */
  min?: number;
  alCambiar: (nuevo: number) => void;
  /** Nombre de la pieza, para que los botones digan de qué son. */
  nombre: string;
  grande?: boolean;
  className?: string;
}

export function ContadorUnidades({ valor, max, min = 1, alCambiar, nombre, grande, className }: PropsContador) {
  const t = useTextos(T);
  const clases = ['contador', grande && 'contador-g', className].filter(Boolean).join(' ');
  const quitaLinea = min === 0 && valor === 1;
  return (
    <div className={clases} role="group" aria-label={t.grupo(nombre)}>
      <button
        type="button"
        onClick={() => alCambiar(valor - 1)}
        disabled={valor <= min}
        aria-label={quitaLinea ? t.quitar(nombre) : t.menos(nombre)}
      >
        <IcoMenos />
      </button>
      <output aria-live="polite" aria-atomic="true">
        {valor}
        <span className="oculto-vis"> {t.unidades(valor)}</span>
      </output>
      <button
        type="button"
        onClick={() => alCambiar(valor + 1)}
        disabled={valor >= max}
        aria-label={valor >= max ? t.agotado(nombre) : t.mas(nombre)}
      >
        <IcoMasMini />
      </button>
    </div>
  );
}
