// Confeti de puntadas para la confirmación. Las posiciones salen de una
// sucesión fija en lugar de Math.random(): así el servidor y el navegador
// pintan lo mismo. Con «reducir movimiento» no se muestra (compra.css).

const COLORES = ['#C6DCEC', '#E39B7B', '#B8CDB0', '#82ADCC'];
const PIEZAS = Array.from({ length: 26 }, (_, i) => ({
  left: `${((i * 37.7 + 11) % 100).toFixed(1)}%`,
  animationDelay: `${((i * 0.53) % 1.4).toFixed(2)}s`,
  color: COLORES[i % COLORES.length],
  fontSize: `${10 + ((i * 7) % 9)}px`,
}));

export function Confeti() {
  return (
    <div className="confeti" aria-hidden="true">
      {PIEZAS.map((estilo, i) => (
        <span key={i} style={estilo}>
          ✻
        </span>
      ))}
    </div>
  );
}
