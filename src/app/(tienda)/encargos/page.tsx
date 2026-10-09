import type { Metadata } from 'next';
import Image from 'next/image';
import { Aparece } from '@/componentes/aparece';
import { PreguntasFrecuentes } from '@/componentes/contenido/acordeon';
import { CabeceraPagina } from '@/componentes/contenido/cabecera-pagina';
import { Migas } from '@/componentes/contenido/migas';
import { Pasos } from '@/componentes/contenido/pasos';
import { FormularioEncargo } from '@/componentes/formularios/formulario-encargo';
import { eur } from '@/lib/formato';
import { idiomaActual } from '@/lib/i18n/servidor';
import { metadatosPagina } from '@/lib/metadatos';
import { rutas } from '@/lib/rutas';
import { T } from './contenido';
import '@/estilos/contenido.css';

export async function generateMetadata(): Promise<Metadata> {
  const idioma = await idiomaActual();
  const t = T[idioma];
  return metadatosPagina({ idioma, titulo: t.titulo, descripcion: t.descripcion, ruta: rutas.encargos });
}

/** Precio orientativo (en céntimos) de cada tipo, en el orden de sus textos. */
const PRECIOS = [2200, 3800, 4500, 6500, 11000, 5500];

/** Foto y precio de cada ejemplo, en el orden de sus textos. */
const EJEMPLOS = [
  { foto: '/fotos/categorias/amigurumis.jpg', precio: 5600 },
  { foto: '/fotos/productos/manta-estrella-1.jpg', precio: 7800 },
  { foto: '/fotos/productos/guirnalda-corazones-1.jpg', precio: 3400 },
];

export default async function PaginaEncargos() {
  const idioma = await idiomaActual();
  const t = T[idioma];
  return (
    <div className="wrap">
      <Migas actual={t.miga} />

      <CabeceraPagina etiqueta={t.etiqueta} titulo={t.cabecera} ancho={56}>
        <p>{t.entradilla}</p>
      </CabeceraPagina>

      <div className="con-lateral">
        <div>
          <h2 className="oculto-vis">{t.formulario}</h2>
          <FormularioEncargo />
        </div>

        <aside aria-label={t.lateral}>
          <div className="caja">
            <h2 className="lista-titulo">{t.comoVa}</h2>
            <Pasos pasos={[...t.pasos]} className="pasos-lateral" />
          </div>

          <div className="caja-cl">
            <h2 className="titulo-mini">{t.preciosTitulo}</h2>
            <table className="tabla tabla-corta mt-3">
              <caption className="oculto-vis">{t.preciosOculto}</caption>
              <tbody>
                {t.precios.map((tipo, i) => (
                  <tr key={tipo}>
                    <th scope="row">{tipo}</th>
                    <td className="derecha">{t.desde(eur(PRECIOS[i] ?? 0, idioma))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mini-2 mt-3">{t.preciosNota}</p>
          </div>

          <div className="caja-cl">
            <h2 className="titulo-mini">{t.agenda}</h2>
            <p className="mini mt-2">{t.agendaTexto()}</p>
          </div>
        </aside>
      </div>

      {/* ---------- Ejemplos ---------- */}
      <section>
        <Aparece className="cab-sec">
          <div>
            <p className="eyebrow">{t.ejemplosEtiqueta}</p>
            <h2 className="mt-1">{t.ejemplosTitulo}</h2>
          </div>
          <p className="mini-2">{t.ejemplosNota}</p>
        </Aparece>
        <Aparece efecto="rev-lista" className="cols-3">
          {t.ejemplos.map((e, i) => (
            <article key={e.titulo} className="caja ejemplo">
              <div className="foto">
                <Image
                  src={EJEMPLOS[i]?.foto ?? ''}
                  alt={e.alt}
                  fill
                  sizes="(max-width: 620px) 92vw, (max-width: 900px) 46vw, 370px"
                />
              </div>
              <div className="ejemplo-cuerpo">
                <h3>{e.titulo}</h3>
                <p className="mini">{e.texto}</p>
                <p className="mini-2 ejemplo-dato">
                  {eur(EJEMPLOS[i]?.precio ?? 0, idioma)} · {e.plazo}
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
            <p className="eyebrow">{t.dudasEtiqueta}</p>
            <h2 className="mt-1">{t.dudasTitulo}</h2>
          </Aparece>
          <PreguntasFrecuentes preguntas={t.dudas} />
        </div>
      </section>
    </div>
  );
}
