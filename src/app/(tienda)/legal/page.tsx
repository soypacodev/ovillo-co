import type { Metadata } from 'next';
import { CabeceraPagina } from '@/componentes/contenido/cabecera-pagina';
import { CajaTabla } from '@/componentes/contenido/caja-tabla';
import { IndiceLateral, type EntradaIndice } from '@/componentes/contenido/indice-lateral';
import { Migas } from '@/componentes/contenido/migas';
import { IcoInfo } from '@/componentes/iconos';
import { idiomaActual } from '@/lib/i18n/servidor';
import { metadatosPagina } from '@/lib/metadatos';
import { rutas } from '@/lib/rutas';
import { T } from './contenido';
import '@/estilos/contenido.css';

export async function generateMetadata(): Promise<Metadata> {
  const idioma = await idiomaActual();
  const t = T[idioma];
  return metadatosPagina({ idioma, titulo: t.titulo, descripcion: t.descripcion, ruta: rutas.legal });
}

/** Anclas de las secciones: las enlazan el pie y otras páginas, no cambian con el idioma. */
const ANCLAS = ['aviso', 'privacidad', 'cookies', 'venta'] as const;

/** Nombres técnicos de lo que se guarda en el navegador, en el orden de la tabla. */
const NOMBRES_ALMACENAMIENTO = ['ovillo.cesta', 'ovillo.favoritos', 'ovillo.cintaInicio', 'sb-…', 'Stripe'];

export default async function PaginaLegal() {
  const idioma = await idiomaActual();
  const t = T[idioma];
  const secciones: EntradaIndice[] = ANCLAS.map((id) => ({ id, texto: t.indice[id] }));

  return (
    <div className="wrap">
      <Migas actual={t.miga} />

      <CabeceraPagina etiqueta={t.etiqueta} titulo={t.cabecera}>
        <p>{t.entradilla}</p>
      </CabeceraPagina>

      <div className="aviso aviso-ficticio" role="note">
        <IcoInfo />
        <p>{t.demo()}</p>
      </div>

      <div className="con-indice">
        <IndiceLateral titulo={t.secciones} entradas={secciones} />

        <article className="prosa guia">
          {/* ---------- Aviso legal ---------- */}
          <h2 id="aviso">{t.avisoTitulo}</h2>
          {t.aviso()}

          {/* ---------- Privacidad ---------- */}
          <h2 id="privacidad">{t.privacidadTitulo}</h2>
          <p>{t.privacidad}</p>
          <h3>{t.datosTitulo}</h3>
          <CajaTabla etiqueta={t.datosTabla}>
            <table className="tabla">
              <caption className="oculto-vis">{t.datosTabla}</caption>
              <thead>
                <tr>
                  {t.datosColumnas.map((c) => (
                    <th key={c} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.datos.map(([dato, para, cuanto]) => (
                  <tr key={dato}>
                    <th scope="row">{dato}</th>
                    <td>{para}</td>
                    <td>{cuanto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CajaTabla>
          {t.privacidadResto()}

          {/* ---------- Cookies ---------- */}
          <h2 id="cookies">{t.cookiesTitulo}</h2>
          <p>{t.cookies}</p>
          <CajaTabla etiqueta={t.cookiesTabla}>
            <table className="tabla">
              <caption className="oculto-vis">{t.cookiesTabla}</caption>
              <thead>
                <tr>
                  {t.cookiesColumnas.map((c) => (
                    <th key={c} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.almacenamiento.map(([para, tipo], i) => (
                  <tr key={NOMBRES_ALMACENAMIENTO[i]}>
                    <th scope="row">
                      <code>{NOMBRES_ALMACENAMIENTO[i]}</code>
                    </th>
                    <td>{para}</td>
                    <td>{tipo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CajaTabla>
          <p>{t.cookiesBorrar}</p>

          {/* ---------- Condiciones de venta ---------- */}
          <h2 id="venta">{t.ventaTitulo}</h2>
          {t.venta()}

          <p className="mini-2 mt-8">{t.revision}</p>
        </article>
      </div>
    </div>
  );
}
