/** Datos estructurados para buscadores. Se escapa «<» para que ningún
 *  texto pueda cerrar la etiqueta <script> antes de tiempo. */
export function JsonLd({ datos }: { datos: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(datos).replace(/</g, '\\u003c') }}
    />
  );
}
