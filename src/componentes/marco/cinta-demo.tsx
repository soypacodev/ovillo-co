import { DEMO } from '@/lib/rutas';

/** Aviso fijo de que la tienda es una demostración. */
export function CintaDemo() {
  return (
    <p className="cinta-demo">
      <span className="largo">Tienda de demostración · los pedidos no son reales · </span>
      <span className="corto">Demo · pedidos no reales · </span>
      Hecha por{' '}
      <a href={DEMO.enlace} target="_blank" rel="noopener noreferrer">
        {DEMO.autor}
        <span className="oculto-vis"> (se abre en otra pestaña)</span>
      </a>
    </p>
  );
}
