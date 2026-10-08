export interface EntradaIndice {
  id: string;
  texto: string;
}

/** Índice de una página larga. Pegado al lado en escritorio; en móvil,
 *  una fila de enlaces arriba del texto. */
export function IndiceLateral({ titulo, entradas }: { titulo: string; entradas: readonly EntradaIndice[] }) {
  return (
    <nav className="indice" aria-labelledby="indice-titulo">
      <p className="eyebrow" id="indice-titulo">
        {titulo}
      </p>
      <ul>
        {entradas.map((e) => (
          <li key={e.id}>
            <a href={`#${e.id}`}>{e.texto}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
