import type { Metadata } from 'next';
import { BandaCierre } from '@/componentes/contenido/banda-cierre';
import { CabeceraPagina } from '@/componentes/contenido/cabecera-pagina';
import { CajaTabla } from '@/componentes/contenido/caja-tabla';
import { IndiceLateral, type EntradaIndice } from '@/componentes/contenido/indice-lateral';
import { ListaSiNo } from '@/componentes/contenido/lista-si-no';
import { Migas } from '@/componentes/contenido/migas';
import { IcoInfo } from '@/componentes/iconos';
import { Enlace } from '@/lib/i18n/enlace';
import { idiomaActual } from '@/lib/i18n/servidor';
import { metadatosPagina } from '@/lib/metadatos';
import { rutas } from '@/lib/rutas';
import { T } from './contenido';
import '@/estilos/contenido.css';

export async function generateMetadata(): Promise<Metadata> {
  const idioma = await idiomaActual();
  const t = T[idioma];
  return metadatosPagina({ idioma, titulo: t.titulo, descripcion: t.descripcion, ruta: rutas.cuidados, tipo: 'article' });
}

/** Anclas de los apartados, en orden. No cambian con el idioma. */
const ANCLAS = ['lavar', 'materiales', 'secar', 'guardar', 'bolitas', 'hilos', 'amigurumis', 'bebe'] as const;

const n = (i: number) => `${i + 1}. `;

export default async function PaginaCuidados() {
  const idioma = await idiomaActual();
  const t = T[idioma];
  const apartados: EntradaIndice[] = ANCLAS.map((id) => ({ id, texto: t.apartados[id] }));
  const titulo = (id: (typeof ANCLAS)[number]) => `${n(ANCLAS.indexOf(id))}${t.apartados[id]}`;

  return (
    <div className="wrap">
      <Migas actual={t.miga} />

      <CabeceraPagina etiqueta={t.etiqueta} titulo={t.cabecera}>
        <p>{t.entradilla}</p>
      </CabeceraPagina>

      <div className="con-indice">
        <IndiceLateral titulo={t.indice} entradas={apartados} />

        <div>
          <article className="prosa guia">
            <div className="aviso">
              <IcoInfo />
              <p>{t.reglaDeOro()}</p>
            </div>

            <h2 id="lavar">{titulo('lavar')}</h2>
            {t.lavar()}
            <h3>{t.lavadoraTitulo}</h3>
            <p>{t.lavadora}</p>

            <div className="cols-2">
              <ListaSiNo tipo="si" titulo={t.si} elementos={[...t.siLavar]} />
              <ListaSiNo tipo="no" titulo={t.no} elementos={[...t.noLavar]} />
            </div>

            <h2 id="materiales">{titulo('materiales')}</h2>
            <p>{t.materialesTexto}</p>
            <CajaTabla etiqueta={t.tabla}>
              <table className="tabla">
                <caption className="oculto-vis">{t.tabla}</caption>
                <thead>
                  <tr>
                    {t.columnas.map((c) => (
                      <th key={c} scope="col">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t.filas.map((m) => (
                    <tr key={m.fibra}>
                      <th scope="row">{m.fibra}</th>
                      <td>{m.agua}</td>
                      <td>{m.maquina}</td>
                      <td>{m.ojo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CajaTabla>

            <h2 id="secar">{titulo('secar')}</h2>
            {t.secar.map((p) => (
              <p key={p}>{p}</p>
            ))}

            <h2 id="guardar">{titulo('guardar')}</h2>
            {t.guardar.map((p) => (
              <p key={p}>{p}</p>
            ))}

            <h2 id="bolitas">{titulo('bolitas')}</h2>
            {t.bolitas.map((p) => (
              <p key={p}>{p}</p>
            ))}

            <h2 id="hilos">{titulo('hilos')}</h2>
            {t.hilos()}

            <h2 id="amigurumis">{titulo('amigurumis')}</h2>
            {t.amigurumis.map((p) => (
              <p key={p}>{p}</p>
            ))}

            <h2 id="bebe">{titulo('bebe')}</h2>
            {t.bebe()}
          </article>
          <div className="mt-8">
            <BandaCierre
              nivel="h2"
              titulo={t.cierreTitulo}
              acciones={
                <Enlace className="btn btn-1" href={rutas.contacto}>
                  {t.escribirnos}
                </Enlace>
              }
            >
              {t.cierreTexto}
            </BandaCierre>
          </div>
        </div>
      </div>
    </div>
  );
}
