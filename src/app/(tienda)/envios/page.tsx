import type { Metadata } from 'next';
import { Aparece } from '@/componentes/aparece';
import { PreguntasFrecuentes } from '@/componentes/contenido/acordeon';
import { BandaCierre } from '@/componentes/contenido/banda-cierre';
import { CabeceraPagina } from '@/componentes/contenido/cabecera-pagina';
import { ListaSiNo } from '@/componentes/contenido/lista-si-no';
import { Pasos } from '@/componentes/contenido/pasos';
import { Migas } from '@/componentes/contenido/migas';
import { IcoInfo, IcoOk } from '@/componentes/iconos';
import { catalogo } from '@/lib/datos';
import { eur } from '@/lib/formato';
import { Enlace } from '@/lib/i18n/enlace';
import { idiomaActual } from '@/lib/i18n/servidor';
import { metadatosPagina } from '@/lib/metadatos';
import { rutas } from '@/lib/rutas';
import { T } from './contenido';
import '@/estilos/contenido.css';
import { tipografia } from '@/lib/tipografia';

export async function generateMetadata(): Promise<Metadata> {
  const idioma = await idiomaActual();
  const t = T[idioma];
  return metadatosPagina({ idioma, titulo: t.titulo, descripcion: t.descripcion, ruta: rutas.envios });
}

export default async function PaginaEnvios() {
  const idioma = await idiomaActual();
  const t = T[idioma];
  const metodos = await catalogo(idioma).metodosEnvio();
  const umbral = metodos.find((m) => m.gratisDesde !== null)?.gratisDesde ?? null;
  const conUmbral = metodos.find((m) => m.gratisDesde === umbral);
  const recogida = metodos.find((m) => m.id === 'recogida');

  return (
    <div className="wrap-m">
      <Migas actual={t.miga} />

      <CabeceraPagina etiqueta={t.etiqueta} titulo={t.cabecera}>
        <p>{t.entradilla}</p>
      </CabeceraPagina>

      {/* ---------- Precios ---------- */}
      <section aria-labelledby="precios">
        <h2 id="precios">{t.preciosTitulo}</h2>
        <Aparece className="caja caja-tabla mt-5">
          <table className="tabla tabla-corta">
            <caption className="oculto-vis">{t.tablaOculta}</caption>
            <thead>
              <tr>
                <th scope="col">{t.metodo}</th>
                <th scope="col">{t.plazo}</th>
                <th scope="col" className="derecha">
                  {t.precio}
                </th>
              </tr>
            </thead>
            <tbody>
              {metodos.map((m) => (
                <tr key={m.id}>
                  <th scope="row">{m.nombre}</th>
                  <td>{tipografia(m.plazo)}</td>
                  <td className="derecha precio-envio">
                    {m.precio === 0 ? t.gratis : eur(m.precio, idioma)}
                    {m.gratisDesde !== null && <span className="mini-2">{t.gratisDesde(eur(m.gratisDesde, idioma))}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Aparece>
        {umbral !== null && conUmbral && (
          <div className="aviso aviso-ok mt-5">
            <IcoOk />
            <p>{t.umbral(eur(umbral, idioma), conUmbral.nombre)}</p>
          </div>
        )}
        <p className="mini mt-4">{t.plazosNota}</p>
      </section>

      {/* ---------- Zonas ---------- */}
      <section aria-labelledby="zonas">
        <h2 id="zonas">{t.zonasTitulo}</h2>
        <Aparece efecto="rev-lista" className="cols-2 mt-6">
          {t.zonas.map((z) => (
            <div key={z.titulo} className="caja tarjeta-info">
              <h3>{z.titulo}</h3>
              <p className="mini">{z.texto}</p>
            </div>
          ))}
          {recogida && (
            <div className="caja tarjeta-info">
              <h3>{recogida.nombre}</h3>
              <p className="mini">{t.recogida}</p>
            </div>
          )}
        </Aparece>
      </section>

      {/* ---------- Tipos de pieza ---------- */}
      <section aria-labelledby="plazos">
        <h2 id="plazos">{t.tiposTitulo}</h2>
        <p className="lead mt-4">{t.tiposTexto}</p>
        <Aparece efecto="rev-lista" className="cols-2 mt-6">
          <div className="caja caja-si tarjeta-info">
            <span className="pastilla pastilla-listo">{t.listo}</span>
            <h3 className="mt-3">{t.listoTitulo}</h3>
            <p className="mini">{t.listoTexto}</p>
          </div>
          <div className="caja tarjeta-info">
            <span className="pastilla pastilla-en">{t.alPedir}</span>
            <h3 className="mt-3">{t.alPedirTitulo}</h3>
            <p className="mini">{t.alPedirTexto}</p>
          </div>
        </Aparece>
        <p className="mini mt-5">{t.mezcla}</p>
      </section>

      {/* ---------- Seguimiento ---------- */}
      <section aria-labelledby="seguimiento">
        <h2 id="seguimiento">{t.seguimientoTitulo}</h2>
        <Aparece className="caja mt-5">
          <Pasos pasos={[...t.seguimiento]} />
        </Aparece>
        <p className="mini mt-4">{t.seguimientoNota}</p>
      </section>

      {/* ---------- Devoluciones ---------- */}
      <section aria-labelledby="devoluciones">
        <h2 id="devoluciones">{t.devolucionesTitulo}</h2>
        <p className="lead mt-4">{t.devolucionesTexto()}</p>
        <Aparece efecto="rev-lista" className="cols-2 mt-6">
          <ListaSiNo tipo="si" titulo={t.siDevolver} elementos={[...t.si]} />
          <ListaSiNo tipo="no" titulo={t.noDevolver} elementos={[...t.no]} />
        </Aparece>

        <h3 className="subtitulo-guia">{t.comoTitulo}</h3>
        <Aparece className="caja mt-4">
          <Pasos pasos={[...t.como]} />
        </Aparece>
        <div className="aviso mt-5">
          <IcoInfo />
          <p>
            {t.vuelta((texto) => (
              <Enlace className="enlace" href={`${rutas.legal}#venta`}>
                {texto}
              </Enlace>
            ))}
          </p>
        </div>
      </section>

      {/* ---------- Roturas ---------- */}
      <section aria-labelledby="roturas">
        <h2 id="roturas">{t.roturasTitulo}</h2>
        <div className="prosa mt-4">{t.roturas()}</div>
      </section>

      {/* ---------- Preguntas ---------- */}
      <section aria-labelledby="preguntas-envios">
        <h2 id="preguntas-envios" className="mb-6">
          {t.otrasPreguntas}
        </h2>
        <PreguntasFrecuentes preguntas={t.preguntas} />
      </section>

      <section>
        <BandaCierre
          titulo={t.cierreTitulo}
          acciones={
            <Enlace className="btn btn-1" href={rutas.contacto}>
              {t.escribirnos}
            </Enlace>
          }
        >
          {t.cierreTexto}
        </BandaCierre>
      </section>
    </div>
  );
}
