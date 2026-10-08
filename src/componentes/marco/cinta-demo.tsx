import { DEMO } from '@/lib/rutas';

/** Aviso fijo de que la tienda es una demostración, con la puerta abierta a
 *  quien quiera una igual. En pantallas estrechas se queda en lo esencial. */
export function CintaDemo() {
  return (
    <p className="cinta-demo">
      <span className="largo">Tienda de demostración</span>
      <span className="corto">Tienda demo</span>
      <span className="cinta-pedidos">: los pedidos no son reales</span>
      {' · '}
      <span className="largo">¿Quieres una así para tu negocio?</span>
      <span className="corto">¿Quieres una así?</span>{' '}
      <a href={DEMO.contratar}>
        Hablemos
        <span className="oculto-vis"> (escribe a {DEMO.autor} por correo)</span>
      </a>
      <span className="cinta-autor">
        {' · Hecha por '}
        <a href={DEMO.enlace} target="_blank" rel="noopener noreferrer">
          {DEMO.autor}
          <span className="oculto-vis"> en GitHub (se abre en otra pestaña)</span>
        </a>
      </span>
    </p>
  );
}
