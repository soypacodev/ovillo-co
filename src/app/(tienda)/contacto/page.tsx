import type { Metadata } from 'next';
import { Aparece } from '@/componentes/aparece';
import { PreguntasFrecuentes } from '@/componentes/contenido/acordeon';
import { CabeceraPagina } from '@/componentes/contenido/cabecera-pagina';
import { Migas } from '@/componentes/contenido/migas';
import { FormularioContacto } from '@/componentes/formularios/formulario-contacto';
import { IcoInsta, IcoPinterest, IcoSobre } from '@/componentes/iconos';
import { preguntasFrecuentes } from '@/datos/preguntas';
import { Enlace } from '@/lib/i18n/enlace';
import { idiomaActual } from '@/lib/i18n/servidor';
import { metadatosPagina } from '@/lib/metadatos';
import { DEMO, rutas } from '@/lib/rutas';
import { T } from './contenido';
import '@/estilos/contenido.css';

export async function generateMetadata(): Promise<Metadata> {
  const idioma = await idiomaActual();
  const t = T[idioma];
  return metadatosPagina({ idioma, titulo: t.titulo, descripcion: t.descripcion, ruta: rutas.contacto });
}

export default async function PaginaContacto() {
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
          <FormularioContacto />

          <section aria-labelledby="preguntas">
            <Aparece className="cab-sec">
              <div>
                <p className="eyebrow">{t.antes}</p>
                <h2 className="mt-1" id="preguntas">
                  {t.aquiTitulo}
                </h2>
                <p className="lead mt-2">{t.aquiTexto}</p>
              </div>
            </Aparece>
            <PreguntasFrecuentes preguntas={preguntasFrecuentes(idioma)} />
            <p className="mini mt-5">
              {t.remite(
                (texto) => (
                  <Enlace className="enlace" href={rutas.cuidados}>
                    {texto}
                  </Enlace>
                ),
                (texto) => (
                  <Enlace className="enlace" href={rutas.envios}>
                    {texto}
                  </Enlace>
                ),
              )}
            </p>
          </section>
        </div>

        <aside aria-label={t.otrasVias}>
          <div className="caja">
            <h2 className="lista-titulo">{t.otras}</h2>
            <ul className="vias">
              <li>
                <IcoSobre />
                <span>
                  <b>{t.correo}</b>
                  <a className="mini enlace" href={`mailto:${DEMO.correo}`}>
                    {DEMO.correo}
                  </a>
                </span>
              </li>
              <li>
                <IcoInsta />
                <span>
                  <b>Instagram</b>
                  <span className="mini">@ovilloandco {t.deEjemplo}</span>
                </span>
              </li>
              <li>
                <IcoPinterest />
                <span>
                  <b>Pinterest</b>
                  <span className="mini">Ovillo &amp; Co. {t.deEjemplo}</span>
                </span>
              </li>
            </ul>
          </div>

          <div className="caja-cl">
            <h2 className="titulo-mini">{t.cuando}</h2>
            <table className="tabla tabla-corta mt-2">
              <caption className="oculto-vis">{t.horario}</caption>
              <tbody>
                {t.dias.map(([dia, cuando]) => (
                  <tr key={dia}>
                    <th scope="row">{dia}</th>
                    <td className="derecha">{cuando}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mini-2 mt-3">{t.agosto}</p>
          </div>

          <div className="banda banda-lateral">
            <h2 className="lista-titulo">{t.rotoTitulo}</h2>
            <p className="mt-1">{t.rotoTexto}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
