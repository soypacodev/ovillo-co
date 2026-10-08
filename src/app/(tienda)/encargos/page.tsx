import Image from 'next/image';
import { Aparece } from '@/componentes/aparece';
import { PreguntasFrecuentes } from '@/componentes/contenido/acordeon';
import { CabeceraPagina } from '@/componentes/contenido/cabecera-pagina';
import { Migas } from '@/componentes/contenido/migas';
import { Pasos } from '@/componentes/contenido/pasos';
import { FormularioEncargo } from '@/componentes/formularios/formulario-encargo';
import type { PreguntaFrecuente } from '@/lib/catalogo/tipos';
import { eur } from '@/lib/formato';
import { metadatosPagina } from '@/lib/metadatos';
import { rutas } from '@/lib/rutas';
import '@/estilos/contenido.css';

export const metadata = metadatosPagina({
  titulo: 'Encargos a medida',
  descripcion:
    'Encarga una pieza de crochet a medida en Ovillo & Co.: amigurumis de mascotas, mantas personalizadas y packs de regalo. Presupuesto sin compromiso en 24–48 horas.',
  ruta: rutas.encargos,
});

const PASOS = [
  'Nos mandas la idea, y fotos si las tienes, con este formulario.',
  'Te contestamos en 24–48 horas con precio, plazo y una propuesta de colores.',
  'Si te encaja, pagas la mitad y empezamos. La otra mitad, al terminar.',
  'Te mandamos fotos del avance; si algo no te convence, lo cambiamos antes de acabar.',
  'Te llega a casa, envuelto para regalo si nos lo pides.',
];

const PRECIOS: [string, number][] = [
  ['Amigurumi pequeño (12–15 cm)', 2200],
  ['Amigurumi mediano (20–25 cm)', 3800],
  ['Amigurumi de mascota', 4500],
  ['Mantita de cuna', 6500],
  ['Manta grande', 11000],
  ['Pack de regalo a medida', 5500],
];

const EJEMPLOS = [
  {
    foto: '/fotos/productos/pulpito-reversible-1.jpg',
    alt: 'Dos pulpitos de ganchillo grises, uno contento y otro enfurruñado',
    titulo: 'Pulpitos para mellizos',
    texto: 'Dos pulpitos reversibles iguales salvo por el color de las orejas, para no confundirlos a las tres de la mañana.',
    precio: 5200,
    plazo: '10 días',
  },
  {
    foto: '/fotos/productos/manta-estrella-1.jpg',
    alt: 'Manta de bebé de ganchillo en estrella, a ondas verde menta y crudo',
    titulo: 'La manta del verde de la pared',
    texto: 'Mantita de cuna en estrella, con el verde exacto de la habitación. Nos mandaron una foto del bote de pintura.',
    precio: 7800,
    plazo: '14 días',
  },
  {
    foto: '/fotos/productos/guirnalda-corazones-1.jpg',
    alt: 'Guirnalda infantil con corazón rosa de ganchillo, cuentas y eucalipto',
    titulo: 'Guirnalda para un bautizo',
    texto: 'Corazones de ganchillo con cuentas de madera y el nombre bordado, para colgar sobre la cuna.',
    precio: 3400,
    plazo: '8 días',
  },
];

const DUDAS: PreguntaFrecuente[] = [
  {
    p: '¿Cuánto tarda un encargo?',
    r: 'Entre una y tres semanas según la pieza, contando desde que pagas la señal. En las semanas antes de Navidad se alarga, y te lo decimos antes de empezar.',
  },
  {
    p: '¿Y si no me gusta el resultado?',
    r: 'Por eso te mandamos fotos durante el proceso: si algo no te encaja, lo cambiamos sin coste. Si ya está terminado y no te convence, te devolvemos la segunda mitad y nos quedamos la pieza.',
  },
  {
    p: '¿Podéis copiar algo que he visto en Pinterest?',
    r: 'Si es el diseño de una artesana identificable, no: no nos parece bien copiar su trabajo. Si es un tipo de pieza genérica, sin problema, y le damos nuestro toque.',
  },
  {
    p: '¿Cómo se paga un encargo?',
    r: 'La mitad al empezar y la otra mitad al terminar, con tarjeta a través de la propia tienda. Nunca te pediremos datos de pago por correo.',
  },
  {
    p: '¿Enviáis los encargos a toda España?',
    r: 'A la península y Baleares, con los mismos precios que el resto de la tienda. Si estás en Málaga, también puedes recogerlo en el taller.',
  },
  {
    p: '¿Hacéis 30 piezas para los detalles de una boda?',
    r: 'Depende mucho de la fecha. Treinta piezas pequeñas son unas sesenta horas de trabajo, así que necesitamos unos tres meses de margen. Escríbenos cuanto antes y lo vemos.',
  },
];

export default function PaginaEncargos() {
  return (
    <div className="wrap">
      <Migas actual="Encargos" />

      <CabeceraPagina etiqueta="Encargos a medida" titulo="Cuéntanos qué tienes en la cabeza" ancho={56}>
        <p>
          Un amigurumi de tu perro, la manta en el verde exacto de la habitación, un pack para una boda. Escríbenos y
          te contestamos en 24–48 horas con precio y plazo. Luego decides tú, sin ninguna presión.
        </p>
      </CabeceraPagina>

      <div className="con-lateral">
        <div>
          <h2 className="oculto-vis">Formulario de encargo</h2>
          <FormularioEncargo />
        </div>

        <aside aria-label="Cómo funcionan los encargos">
          <div className="caja">
            <h2 className="lista-titulo">
              Cómo va esto
            </h2>
            <Pasos pasos={PASOS} className="pasos-lateral" />
          </div>

          <div className="caja-cl">
            <h2 className="titulo-mini">Precios de referencia</h2>
            <table className="tabla tabla-corta mt-3">
              <caption className="oculto-vis">Precio orientativo de cada tipo de encargo</caption>
              <tbody>
                {PRECIOS.map(([tipo, precio]) => (
                  <tr key={tipo}>
                    <th scope="row">{tipo}</th>
                    <td className="derecha">desde {eur(precio)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mini-2 mt-3">
              Son orientativos: el precio final depende del tamaño, el detalle y la lana.
            </p>
          </div>

          <div className="caja-cl">
            <h2 className="titulo-mini">Agenda</h2>
            <p className="mini mt-2">
              Ahora mismo empezamos encargos nuevos en unas <b>dos semanas</b>. Para
              Navidad, el último día para pedir es el <b>15 de noviembre</b>.
            </p>
          </div>
        </aside>
      </div>

      {/* ---------- Ejemplos ---------- */}
      <section>
        <Aparece className="cab-sec">
          <div>
            <p className="eyebrow">Para que te hagas una idea</p>
            <h2 className="mt-1">Encargos que hemos tejido</h2>
          </div>
          <p className="mini-2">Ejemplos ilustrativos de una tienda de demostración.</p>
        </Aparece>
        <Aparece efecto="rev-lista" className="cols-3">
          {EJEMPLOS.map((e) => (
            <article key={e.titulo} className="caja ejemplo">
              <div className="foto">
                <Image src={e.foto} alt={e.alt} fill sizes="(max-width: 620px) 92vw, (max-width: 900px) 46vw, 370px" />
              </div>
              <div className="ejemplo-cuerpo">
                <h3>{e.titulo}</h3>
                <p className="mini">{e.texto}</p>
                <p className="mini-2 ejemplo-dato">
                  {eur(e.precio)} · {e.plazo}
                </p>
              </div>
            </article>
          ))}
        </Aparece>
      </section>

      {/* ---------- Dudas ---------- */}
      <section>
        <div className="ancho-lectura">
          <Aparece className="centro mb-7">
            <p className="eyebrow">Antes de que preguntes</p>
            <h2 className="mt-1">Dudas típicas de los encargos</h2>
          </Aparece>
          <PreguntasFrecuentes preguntas={DUDAS} />
        </div>
      </section>
    </div>
  );
}
