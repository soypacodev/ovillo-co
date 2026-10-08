'use client';

// Cesta completa. La página de servidor lee el catálogo y pinta las
// tarjetas de producto; este componente decide qué enseñar según lo que
// hay guardado en el navegador.

import Link from 'next/link';
import { useCallback, useRef, useState, type ReactNode } from 'react';
import { useBrindis } from '@/componentes/brindis';
import { BarraEnvioGratis } from '@/componentes/cesta/barra-envio-gratis';
import { FormularioCupon } from '@/componentes/cesta/formulario-cupon';
import { ResumenTotales } from '@/componentes/cesta/resumen-totales';
import { Ovillo } from '@/componentes/iconos';
import type { MetodoEnvio } from '@/lib/catalogo/tipos';
import { useCesta, useFavoritos } from '@/lib/cesta/contexto';
import type { LineaCesta, ProductoCesta } from '@/lib/cesta/tipos';
import { totales as calcularTotales } from '@/lib/cesta/totales';
import { piezas } from '@/lib/formato';
import type { IdEnvio } from '@/lib/pagos/opciones';
import { rutas } from '@/lib/rutas';
import { DialogoVaciar } from './dialogo-vaciar';
import { FilaCesta } from './fila-cesta';
import { Garantias } from './garantias';
import { SelectorEnvio } from './selector-envio';
import { useSincronizarCesta } from './use-sincronizar-cesta';
import { guardarEnvio, leerEnvioGuardado } from './utiles';

export interface PropsVistaCesta {
  productos: ProductoCesta[];
  metodos: MetodoEnvio[];
  /** Tarjetas de producto ya pintadas en el servidor, por slug. */
  tarjetas: Record<string, ReactNode>;
  /** Slugs con stock, en el orden en que conviene sugerirlos. */
  sugeribles: string[];
}

function frasePlazo(lineas: readonly LineaCesta[], plazo: number | null): string {
  const encargos = lineas.filter((l) => l.encargo).length;
  if (!plazo || !encargos) return 'Todo está hecho: sale del taller en 24–48 horas.';
  const cuantas = encargos === 1 ? 'Hay una pieza que se teje al pedir' : `Hay ${encargos} piezas que se tejen al pedir`;
  return `${cuantas}, así que el pedido saldrá completo en unos ${plazo} días.`;
}

export function VistaCesta({ productos, metodos, tarjetas, sugeribles }: PropsVistaCesta) {
  const { lineas, cupon, hidratada, fijarUnidades, quitar, vaciar, maxUnidades } = useCesta();
  useSincronizarCesta(productos);

  if (!hidratada) {
    return (
      <div className="esqueleto" aria-busy="true">
        <p className="oculto-vis">Cargando tu cesta…</p>
        <div className="hueso" />
        <div className="hueso" />
      </div>
    );
  }

  if (!lineas.length) return <CestaVacia tarjetas={tarjetas} />;

  return (
    <ConArticulos
      lineas={lineas}
      cupon={cupon}
      metodos={metodos}
      tarjetas={tarjetas}
      sugeribles={sugeribles}
      fijarUnidades={fijarUnidades}
      quitar={quitar}
      vaciar={vaciar}
      maxUnidades={maxUnidades}
    />
  );
}

interface PropsConArticulos extends Pick<PropsVistaCesta, 'metodos' | 'tarjetas' | 'sugeribles'> {
  lineas: LineaCesta[];
  cupon: string | null;
  fijarUnidades: (id: string, uds: number) => void;
  quitar: (id: string) => void;
  vaciar: () => void;
  maxUnidades: (id: string) => number;
}

function ConArticulos({ lineas, cupon, metodos, tarjetas, sugeribles, fijarUnidades, quitar, vaciar, maxUnidades }: PropsConArticulos) {
  const avisar = useBrindis();
  // Este bloque solo se monta en el navegador, así que puede leer lo guardado.
  const [envioId, setEnvioId] = useState<IdEnvio>(leerEnvioGuardado);
  const titulo = useRef<HTMLHeadingElement>(null);

  const t = calcularTotales(lineas, cupon, { envioId, envios: metodos });
  const enCesta = new Set(lineas.map((l) => l.slug));
  const sugerencias = sugeribles.filter((s) => !enCesta.has(s) && tarjetas[s]).slice(0, 4);

  const elegirEnvio = useCallback((id: IdEnvio) => {
    setEnvioId(id);
    guardarEnvio(id);
  }, []);

  // Al quitar una línea su botón desaparece: el foco pasa a la lista.
  const quitarLinea = (id: string) => {
    quitar(id);
    titulo.current?.focus();
  };

  return (
    <>
      <p className="lead plazo-cesta" aria-live="polite">
        {piezas(t.unidades)}. {frasePlazo(lineas, t.plazoEncargo)}
      </p>

      <div className="layout-compra">
        <div>
          <h2 ref={titulo} tabIndex={-1} className="oculto-vis">
            Piezas en la cesta
          </h2>
          <ul className="filas-cesta">
            {lineas.map((l) => (
              <FilaCesta
                key={l.id}
                linea={l}
                max={maxUnidades(l.id)}
                rebaja={t.rebajaPorLinea[l.id] ?? 0}
                alCambiar={(n) => fijarUnidades(l.id, n)}
                alQuitar={() => quitarLinea(l.id)}
              />
            ))}
          </ul>

          <div className="acciones-cesta">
            <Link className="btn btn-2" href={rutas.tienda}>
              Seguir comprando
            </Link>
            <DialogoVaciar
              unidades={t.unidades}
              alConfirmar={() => {
                vaciar();
                avisar('Cesta vaciada');
                // El estado vacío aparece en el siguiente pintado.
                requestAnimationFrame(() => document.getElementById('cesta-vacia')?.focus());
              }}
            />
          </div>

        </div>

        <aside className="resumen-lado" aria-labelledby="resumen-titulo">
          <div className="caja">
            <h2 id="resumen-titulo">Resumen</h2>
            <BarraEnvioGratis totales={t} />
            <SelectorEnvio
              metodos={metodos}
              lineas={lineas}
              cupon={cupon}
              valor={envioId}
              alCambiar={elegirEnvio}
              leyenda="Envío"
              compacto
            />
            <FormularioCupon abierto />
            <div className="totales-resumen">
              <ResumenTotales totales={t} cupon={cupon} etiquetaEnvio={t.metodo.nombre} />
            </div>
            <Link className="btn btn-1 btn-bloque mt-3" href={rutas.pago}>
              Ir a pagar
            </Link>
            <p className="mini-2 pago-seguro">Pago seguro con Stripe · tienda de demostración, sin cobros reales</p>
          </div>
          <Garantias en="cesta" />
        </aside>
      </div>

      {sugerencias.length > 0 && (
        <section className="sugerencias" aria-labelledby="sugerencias-titulo">
          <div className="cab-sec">
            <h2 id="sugerencias-titulo" className="tit-sugerencias">
              Se lleva bien con…
            </h2>
          </div>
          <div className="rejilla rejilla-4">
            {sugerencias.map((slug) => (
              <div key={slug} style={{ display: 'contents' }}>
                {tarjetas[slug]}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function CestaVacia({ tarjetas }: { tarjetas: Record<string, ReactNode> }) {
  const { favoritos } = useFavoritos();
  const guardados = favoritos.filter((slug) => tarjetas[slug]).slice(0, 4);

  return (
    <div className="compra-vacia">
      <Ovillo width={64} height={64} className="flota ovillo-vacio" />
      <h2 id="cesta-vacia" tabIndex={-1}>
        Aquí no hay nada todavía
      </h2>
      <p className="lead">
        {guardados.length
          ? 'Lo que guardaste en favoritos sigue aquí esperándote.'
          : 'Date una vuelta por la tienda o pídenos algo a medida.'}
      </p>
      <div className="botones-centro">
        <Link className="btn btn-1" href={rutas.tienda}>
          Ver la tienda
        </Link>
        <Link className="btn btn-2" href={rutas.encargos}>
          Pedir algo a medida
        </Link>
      </div>
      {guardados.length > 0 && (
        <section className="favoritos-vacia" aria-labelledby="favoritos-titulo">
          <div className="cab-sec">
            <h2 id="favoritos-titulo" className="tit-sugerencias">
              Tus favoritos
            </h2>
          </div>
          <div className="rejilla rejilla-4">
            {guardados.map((slug) => (
              <div key={slug} style={{ display: 'contents' }}>
                {tarjetas[slug]}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
