import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IcoAtras } from '@/componentes/iconos';
import { CabeceraPanel } from '@/componentes/panel/cabecera-panel';
import { FormularioEstadoEncargo } from '@/componentes/panel/formulario-estado-encargo';
import { PastillaEstado } from '@/componentes/panel/pastilla-estado';
import { permisoEscritura } from '@/lib/panel/acceso';
import { NOMBRE_ESTADO_ENCARGO } from '@/lib/panel/estados';
import { fechaHora } from '@/lib/fechas';
import { panel } from '@/lib/panel/servidor';
import { esUuid } from '@/lib/parametros';
import { rutas } from '@/lib/rutas';

export const metadata: Metadata = { title: 'Encargo' };

export default async function EncargoPanel({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { acceso, fuente } = await panel(rutas.panelEncargo(id));
  if (!esUuid(id)) notFound();
  const e = await fuente.encargo(id);
  if (!e) notFound();
  const permiso = permisoEscritura(acceso);

  const datos: [string, string | null][] = [
    ['Para cuándo', e.fecha_deseada],
    ['Presupuesto', e.presupuesto],
    ['Colores', e.colores],
  ];

  return (
    <>
      <CabeceraPanel
        volver={
          <Link className="volver mini" href={rutas.panelEncargos}>
            <IcoAtras width={16} height={16} />
            Encargos
          </Link>
        }
        titulo={
          <>
            {e.tipo} <PastillaEstado estado={e.estado} texto={NOMBRE_ESTADO_ENCARGO[e.estado]} />
          </>
        }
        descripcion={`Recibido el ${fechaHora(e.creado_en)}`}
      />

      <div className="panel-rejilla panel-ficha">
        <div className="panel-columna">
          <section className="panel-caja" aria-labelledby="titulo-pide">
            <h2 id="titulo-pide" className="panel-caja-titulo">
              Qué nos pide
            </h2>
            <p className="texto-largo">{e.descripcion}</p>
            <dl className="datos-panel datos-tres">
              {datos.map(([t, v]) => (
                <div key={t}>
                  <dt>{t}</dt>
                  <dd>{v ?? '—'}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="panel-caja" aria-labelledby="titulo-fotos">
            <h2 id="titulo-fotos" className="panel-caja-titulo">
              Fotos de referencia
            </h2>
            {e.urls_fotos.length ? (
              <ul className="galeria-panel">
                {e.urls_fotos.map((f, i) => (
                  <li key={f.ruta}>
                    <a href={f.url} target="_blank" rel="noopener noreferrer">
                      <Image
                        src={f.url}
                        alt={`Foto de referencia ${i + 1} de ${e.urls_fotos.length}`}
                        fill
                        sizes="(max-width: 620px) 45vw, 200px"
                        unoptimized={!f.url.startsWith('/')}
                      />
                      <span className="oculto-vis"> (abrir en grande en otra pestaña)</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mini">No ha mandado fotos.</p>
            )}
            {acceso.modo === 'supabase' && e.urls_fotos.length > 0 && (
              <p className="mini-2 mt-3">Los enlaces de las fotos son privados y caducan a los 10 minutos.</p>
            )}
          </section>
        </div>

        <div className="panel-columna">
          <section className="panel-caja" aria-labelledby="titulo-respuesta">
            <h2 id="titulo-respuesta" className="panel-caja-titulo">
              Respuesta
            </h2>
            <FormularioEstadoEncargo
              key={e.estado}
              id={e.id}
              estado={e.estado}
              nota={e.nota_admin}
              bloqueado={permiso.ok ? null : permiso.motivo}
            />
          </section>
          <section className="panel-caja" aria-labelledby="titulo-quien">
            <h2 id="titulo-quien" className="panel-caja-titulo">
              Quién lo pide
            </h2>
            <dl className="datos-panel">
              <div>
                <dt>Nombre</dt>
                <dd>{e.nombre}</dd>
              </div>
              <div>
                <dt>Correo</dt>
                <dd>
                  <a className="enlace" href={`mailto:${e.email}?subject=${encodeURIComponent(`Tu encargo: ${e.tipo}`)}`}>
                    {e.email}
                  </a>
                </dd>
              </div>
              {e.instagram && (
                <div>
                  <dt>Instagram</dt>
                  <dd>{e.instagram}</dd>
                </div>
              )}
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}
