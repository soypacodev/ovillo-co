import type { Metadata } from 'next';
import Image from 'next/image';
import { Aparece } from '@/componentes/aparece';
import { BandaCierre } from '@/componentes/contenido/banda-cierre';
import { CifrasAnimadas } from '@/componentes/contenido/cifras-animadas';
import { ListaSiNo } from '@/componentes/contenido/lista-si-no';
import { Migas } from '@/componentes/contenido/migas';
import { Pasos } from '@/componentes/contenido/pasos';
import { Polaroids } from '@/componentes/contenido/polaroids';
import { IcoCorazonG, IcoEstrella, IcoOk, IcoSobre, IcoTijeras, Ovillo } from '@/componentes/iconos';
import { cifrasTaller } from '@/datos/taller';
import { Enlace } from '@/lib/i18n/enlace';
import { idiomaActual } from '@/lib/i18n/servidor';
import { metadatosPagina } from '@/lib/metadatos';
import { rutas } from '@/lib/rutas';
import { T } from './contenido';
import '@/estilos/contenido.css';

export async function generateMetadata(): Promise<Metadata> {
  const idioma = await idiomaActual();
  const t = T[idioma];
  return metadatosPagina({ idioma, titulo: t.titulo, descripcion: t.descripcion, ruta: rutas.taller });
}

/** Icono de cada material, en el mismo orden que sus textos. */
const ICONOS_MATERIALES = [
  <IcoEstrella key="algodon" />,
  <IcoCorazonG key="merino" />,
  <IcoTijeras key="relleno" />,
  <Ovillo key="trapillo" width={22} height={22} />,
  <IcoOk key="ojos" />,
  <IcoSobre key="papel" />,
];

const FOTOS_POLAROID = ['/fotos/taller-1.jpg', '/fotos/taller-2.jpg', '/fotos/taller-3.jpg'];

export default async function PaginaTaller() {
  const idioma = await idiomaActual();
  const t = T[idioma];
  return (
    <div className="wrap">
      <Migas actual={t.miga} />

      {/* ---------- Portada ---------- */}
      <section className="dos-hero taller-heroe">
        <div>
          <p className="eyebrow ent ent-1">{t.etiqueta}</p>
          <h1 className="ent ent-2 mt-2">
            {t.cabecera((texto) => (
              <em className="destacado">{texto}</em>
            ))}
          </h1>
          <p className="lead ent ent-3 mt-5">{t.entradilla}</p>
          <CifrasAnimadas cifras={cifrasTaller(idioma)} className="ent ent-4" />
        </div>
        <div className="arco-foto">
          <div className="arco ent-arco">
            <Image
              src="/fotos/categorias/amigurumis.jpg"
              alt={t.fotoPortada}
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 880px) min(92vw, 400px), 460px"
            />
          </div>
          <p className="sello sello-texto flota-lento">
            <Ovillo width={22} height={22} /> {t.sello}
          </p>
        </div>
      </section>

      {/* ---------- Historia ---------- */}
      <section>
        <div className="dos dos-arr">
          <Aparece efecto="rev-izq" className="prosa">
            <p className="eyebrow">{t.historiaEtiqueta}</p>
            <h2 className="tit-bloque">{t.historiaTitulo}</h2>
            {t.historia.map((parrafo) => (
              <p key={parrafo}>{parrafo}</p>
            ))}

            <h3>{t.rapidoTitulo}</h3>
            {t.rapido.map((parrafo) => (
              <p key={parrafo}>{parrafo}</p>
            ))}
          </Aparece>

          <Polaroids
            grande
            fotos={t.polaroids.map((f, i) => ({ src: FOTOS_POLAROID[i] ?? '', alt: f.alt, pie: f.pie }))}
          />
        </div>
      </section>

      {/* ---------- Materiales ---------- */}
      <section>
        <Aparece className="centro sec-intro">
          <p className="eyebrow">{t.materialesEtiqueta}</p>
          <h2 className="mt-1">{t.materialesTitulo}</h2>
          <p className="lead mt-3 centro">{t.materialesTexto}</p>
        </Aparece>
        <Aparece efecto="rev-lista" className="cols-3 mt-7">
          {t.materiales.map((m, i) => (
            <div key={m.nombre} className="caja tarjeta-info">
              <span className="ico">{ICONOS_MATERIALES[i]}</span>
              <h3>{m.nombre}</h3>
              <p className="mini">{m.texto}</p>
            </div>
          ))}
        </Aparece>
      </section>

      {/* ---------- Proceso ---------- */}
      <section>
        <Aparece efecto="rev-zoom" className="banda-osc">
          <div className="dos">
            <div>
              <p className="eyebrow">{t.procesoEtiqueta}</p>
              <h2 className="mt-1">{t.procesoTitulo}</h2>
              <p className="lead mt-4">{t.procesoTexto}</p>
            </div>
            <Pasos pasos={[...t.proceso]} />
          </div>
        </Aparece>
      </section>

      {/* ---------- Lo que sí y lo que no ---------- */}
      <section>
        <div className="dos dos-arr">
          <Aparece efecto="rev-izq">
            <p className="eyebrow">{t.siNoEtiqueta}</p>
            <h2 className="tit-bloque">{t.siNoTitulo}</h2>
            <p className="lead">
              {t.siNoTexto((texto) => (
                <Enlace className="enlace" href={rutas.contacto}>
                  {texto}
                </Enlace>
              ))}
            </p>
          </Aparece>
          <Aparece efecto="rev-der">
            <ListaSiNo tipo="si" titulo={t.siHacemos} elementos={[...t.si]} />
            <ListaSiNo tipo="no" titulo={t.noHacemos} elementos={[...t.no]} />
          </Aparece>
        </div>
      </section>

      {/* ---------- Cierre ---------- */}
      <section>
        <BandaCierre
          titulo={t.cierreTitulo}
          acciones={
            <>
              <Enlace className="btn btn-1" href={rutas.encargos}>
                {t.pedirEncargo}
              </Enlace>
              <Enlace className="btn btn-2" href={rutas.tienda}>
                {t.verTienda}
              </Enlace>
            </>
          }
        >
          {t.cierreTexto}
        </BandaCierre>
      </section>
    </div>
  );
}
