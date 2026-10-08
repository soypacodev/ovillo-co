import type { VentaDia } from '@/lib/panel/filas';
import { eur } from '@/lib/formato';
import { diaCorto } from '@/lib/fechas';

// Barras de ventas por día, dibujadas a mano. Una sola serie: el título la
// nombra y no hace falta leyenda. Los ejes van en HTML fuera del SVG para
// que el texto no encoja con el dibujo en el móvil; el SVG se estira a
// lo ancho y conserva una altura legible en cualquier pantalla.

/** Etiqueta del eje: sin decimales, que ahí solo estorban. */
const euros = (c: number) => `${new Intl.NumberFormat('es-ES').format(Math.round(c / 100))} €`;

const ANCHO = 600;
const ALTO = 200;
const HUECO = 2;
const RADIO = 3;

/** Techo «redondo» del eje: 87 → 100, 430 → 500, 1240 → 1500 (en euros). */
function techo(maxCentimos: number): number {
  const euros = Math.max(maxCentimos / 100, 10);
  const potencia = 10 ** Math.floor(Math.log10(euros));
  const paso = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((m) => m * potencia >= euros) ?? 10;
  return paso * potencia * 100;
}

/** Barra con las dos esquinas de arriba redondeadas y apoyada en la base. */
function barra(x: number, ancho: number, alto: number): string {
  const r = Math.min(RADIO, ancho / 2, alto);
  const y = ALTO - alto;
  return `M${x},${ALTO}V${y + r}Q${x},${y} ${x + r},${y}H${x + ancho - r}Q${x + ancho},${y} ${x + ancho},${y + r}V${ALTO}Z`;
}

export function GraficoVentas({ dias }: { dias: VentaDia[] }) {
  const max = techo(Math.max(0, ...dias.map((d) => d.ventas)));
  const total = dias.reduce((s, d) => s + d.ventas, 0);
  const pedidos = dias.reduce((s, d) => s + d.pedidos, 0);
  const mejor = dias.reduce<VentaDia | null>((m, d) => (d.ventas > (m?.ventas ?? 0) ? d : m), null);
  const paso = ANCHO / Math.max(dias.length, 1);
  const etiquetas = dias.map((d, i) => ({ d, i })).filter(({ i }) => (dias.length - 1 - i) % 7 === 0);

  return (
    <figure className="grafico">
      <figcaption className="grafico-resumen" id="grafico-ventas-resumen">
        {eur(total)} en {pedidos === 1 ? '1 pedido' : `${pedidos} pedidos`} en los últimos {dias.length} días
        {mejor && (
          <>
            . El mejor día, el {diaCorto(mejor.dia)}, con {eur(mejor.ventas)}
          </>
        )}
        .
      </figcaption>

      <div className="grafico-cuerpo">
        <div className="grafico-eje-y" aria-hidden="true">
          <span>{euros(max)}</span>
          <span>{euros(max / 2)}</span>
          <span>0 €</span>
        </div>
        <div className="grafico-lienzo">
          <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} preserveAspectRatio="none" role="img" aria-labelledby="grafico-ventas-resumen" focusable="false">
            {[0, 0.5, 1].map((f) => (
              <line key={f} className="grafico-rejilla" x1="0" x2={ANCHO} y1={ALTO * f} y2={ALTO * f} />
            ))}
            {dias.map((d, i) => {
              const alto = (d.ventas / max) * (ALTO - 4);
              const hoy = i === dias.length - 1;
              return (
                <g key={d.dia} className={hoy ? 'grafico-barra hoy' : 'grafico-barra'}>
                  <title>
                    {`${diaCorto(d.dia)}: ${d.ventas ? `${eur(d.ventas)} · ${d.pedidos === 1 ? '1 pedido' : `${d.pedidos} pedidos`}` : 'sin ventas'}`}
                  </title>
                  {/* Zona de toque de toda la columna, más grande que la barra. */}
                  <rect className="grafico-zona" x={i * paso} y="0" width={paso} height={ALTO} />
                  {alto > 0 && <path d={barra(i * paso + HUECO / 2, paso - HUECO, Math.max(alto, 2))} />}
                </g>
              );
            })}
          </svg>
          <div className="grafico-eje-x" aria-hidden="true">
            {etiquetas.map(({ d, i }) => (
              <span key={d.dia} style={{ left: `${((i + 0.5) / dias.length) * 100}%` }}>
                {i === dias.length - 1 ? 'Hoy' : diaCorto(d.dia)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <details className="grafico-datos">
        <summary>Ver los datos en una tabla</summary>
        <div className="caja-tabla-panel">
          <table className="tabla tabla-panel">
            <caption className="oculto-vis">Ventas por día</caption>
            <thead>
              <tr>
                <th scope="col">Día</th>
                <th scope="col" className="derecha">
                  Pedidos
                </th>
                <th scope="col" className="derecha">
                  Ventas
                </th>
              </tr>
            </thead>
            <tbody>
              {[...dias].reverse().map((d) => (
                <tr key={d.dia}>
                  <th scope="row">{diaCorto(d.dia)}</th>
                  <td className="derecha">{d.pedidos}</td>
                  <td className="derecha">{eur(d.ventas)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
