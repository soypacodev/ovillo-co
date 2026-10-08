import type { Metadata } from 'next';
import Link from 'next/link';
import { CabeceraPanel } from '@/componentes/panel/cabecera-panel';
import { FiltroEstados } from '@/componentes/panel/filtro-estados';
import { Paginacion } from '@/componentes/panel/paginacion';
import { PastillaEstado } from '@/componentes/panel/pastilla-estado';
import { ESTADOS_ENCARGO, NOMBRE_ESTADO_ENCARGO, type EstadoEncargo } from '@/lib/panel/estados';
import { haceCuanto } from '@/lib/fechas';
import { POR_PAGINA } from '@/lib/panel/fuente';
import { panel } from '@/lib/panel/servidor';
import { numeroPagina, parametro, type ParametrosUrl } from '@/lib/parametros';
import { rutas } from '@/lib/rutas';

export const metadata: Metadata = { title: 'Encargos' };

function urlLista(estado: EstadoEncargo | null, pagina = 1): string {
  const p = new URLSearchParams();
  if (estado) p.set('estado', estado);
  if (pagina > 1) p.set('pagina', String(pagina));
  const qs = p.toString();
  return qs ? `${rutas.panelEncargos}?${qs}` : rutas.panelEncargos;
}

export default async function EncargosPanel({ searchParams }: { searchParams: ParametrosUrl }) {
  const { fuente } = await panel(rutas.panelEncargos);
  const parametros = await searchParams;
  const estado = ESTADOS_ENCARGO.find((e) => e === parametro(parametros.estado)) ?? null;
  const pagina = numeroPagina(parametros.pagina);
  const { filas, total } = await fuente.encargos({
    estado: estado ?? undefined,
    limite: POR_PAGINA,
    desplazamiento: (pagina - 1) * POR_PAGINA,
  });

  return (
    <>
      <CabeceraPanel titulo="Encargos" descripcion="Piezas a medida que nos piden desde el formulario de encargos." />
      <div className="panel-filtros">
        <FiltroEstados etiqueta="Filtrar por estado" estados={ESTADOS_ENCARGO} nombres={NOMBRE_ESTADO_ENCARGO} actual={estado} url={urlLista} />
      </div>
      <p className="mini resultado-filtros" aria-live="polite">
        {total === 1 ? '1 encargo' : `${total} encargos`}
      </p>

      {filas.length ? (
        <ul className="lista-tarjetas">
          {filas.map((e) => (
            <li key={e.id} className="panel-caja tarjeta-encargo">
              <div className="tarjeta-encargo-cab">
                <h2>
                  <Link className="enlace-fila" href={rutas.panelEncargo(e.id)}>
                    {e.tipo}
                  </Link>
                </h2>
                <PastillaEstado estado={e.estado} texto={NOMBRE_ESTADO_ENCARGO[e.estado]} />
              </div>
              <p className="tarjeta-encargo-texto">{e.descripcion}</p>
              <p className="mini">
                {e.nombre} · {haceCuanto(e.creado_en)}
                {e.presupuesto && ` · ${e.presupuesto}`}
                {e.fotos.length > 0 && ` · ${e.fotos.length === 1 ? '1 foto' : `${e.fotos.length} fotos`}`}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="panel-vacio">
          <p>No hay encargos {estado ? `en «${NOMBRE_ESTADO_ENCARGO[estado]}»` : 'todavía'}.</p>
        </div>
      )}
      <Paginacion pagina={pagina} total={total} porPagina={POR_PAGINA} url={(n) => urlLista(estado, n)} />
    </>
  );
}
