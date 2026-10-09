'use client';

// Cesta completa. La página de servidor lee el catálogo y pinta las
// tarjetas de producto; este componente decide qué enseñar según lo que
// hay guardado en el navegador.

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
import { textos } from '@/lib/i18n';
import { useIdioma, useTextos } from '@/lib/i18n/cliente';
import { Enlace } from '@/lib/i18n/enlace';
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
  /** Slugs con stock: solo se sugiere lo que se puede comprar ya. */
  sugeribles: string[];
  /** Para cada pieza, las que la acompañan bien (misma categoría o complementarias), en orden. */
  afines: Record<string, string[]>;
}

const T = textos(
  {
    todoHecho: 'Todo está hecho: sale del taller en 24–48 horas.',
    encargos: (n: number) => (n === 1 ? 'Hay una pieza que se teje al pedir' : `Hay ${n} piezas que se tejen al pedir`),
    plazo: (cuantas: string, dias: number) => `${cuantas}, así que el pedido saldrá completo en unos ${dias} días.`,
    cargando: 'Cargando tu cesta…',
    piezas: 'Piezas en la cesta',
    seguir: 'Seguir comprando',
    vaciada: 'Cesta vaciada',
    resumen: 'Resumen',
    envio: 'Envío',
    pagar: 'Ir a pagar',
    seguro: 'Pago seguro con Stripe · tienda de demostración, sin cobros reales',
    combina: 'Se lleva bien con…',
    nadaTodavia: 'Aquí no hay nada todavía',
    favoritosEsperan: 'Lo que guardaste en favoritos sigue aquí esperándote.',
    daUnaVuelta: 'Date una vuelta por la tienda o pídenos algo a medida.',
    verTienda: 'Ver la tienda',
    aMedida: 'Pedir algo a medida',
    tusFavoritos: 'Tus favoritos',
  },
  {
    en: {
      todoHecho: 'Everything is ready: it leaves the workshop within 24–48 hours.',
      encargos: (n: number) => (n === 1 ? 'One item is made to order' : `${n} items are made to order`),
      plazo: (cuantas: string, dias: number) => `${cuantas}, so the full order will ship in about ${dias} days.`,
      cargando: 'Loading your basket…',
      piezas: 'Items in your basket',
      seguir: 'Continue shopping',
      vaciada: 'Basket emptied',
      resumen: 'Summary',
      envio: 'Delivery',
      pagar: 'Go to checkout',
      seguro: 'Secure payment with Stripe · demo shop, no real charges',
      combina: 'Goes well with…',
      nadaTodavia: 'Nothing here yet',
      favoritosEsperan: 'What you saved to your favourites is still here waiting for you.',
      daUnaVuelta: 'Have a browse around the shop or ask us for a custom order.',
      verTienda: 'Browse the shop',
      aMedida: 'Request a custom order',
      tusFavoritos: 'Your favourites',
    },
    fr: {
      todoHecho: 'Tout est déjà fait\u00a0: la commande quitte l’atelier sous 24 à 48 heures.',
      encargos: (n: number) =>
        n === 1 ? 'Une pièce est crochetée à la commande' : `${n} pièces sont crochetées à la commande`,
      plazo: (cuantas: string, dias: number) =>
        `${cuantas}, la commande complète partira donc dans ${dias} jours environ.`,
      cargando: 'Chargement de votre panier…',
      piezas: 'Articles du panier',
      seguir: 'Continuer mes achats',
      vaciada: 'Panier vidé',
      resumen: 'Récapitulatif',
      envio: 'Livraison',
      pagar: 'Passer au paiement',
      seguro: 'Paiement sécurisé avec Stripe · boutique de démonstration, aucun débit réel',
      combina: 'Se marie bien avec…',
      nadaTodavia: 'Il n’y a encore rien ici',
      favoritosEsperan: 'Ce que vous avez mis en favoris vous attend toujours ici.',
      daUnaVuelta: 'Faites un tour dans la boutique ou demandez-nous une commande sur mesure.',
      verTienda: 'Voir la boutique',
      aMedida: 'Demander une commande sur mesure',
      tusFavoritos: 'Vos favoris',
    },
    de: {
      todoHecho: 'Alles ist fertig: Ihre Bestellung verlässt die Werkstatt in 24–48 Stunden.',
      encargos: (n: number) =>
        n === 1 ? 'Ein Stück wird erst auf Bestellung gehäkelt' : `${n} Stücke werden erst auf Bestellung gehäkelt`,
      plazo: (cuantas: string, dias: number) =>
        `${cuantas}, daher wird die komplette Bestellung in etwa ${dias} Tagen verschickt.`,
      cargando: 'Ihr Warenkorb wird geladen…',
      piezas: 'Artikel im Warenkorb',
      seguir: 'Weiter einkaufen',
      vaciada: 'Warenkorb geleert',
      resumen: 'Übersicht',
      envio: 'Versand',
      pagar: 'Zur Kasse',
      seguro: 'Sichere Zahlung mit Stripe · Demo-Shop, keine echten Abbuchungen',
      combina: 'Passt gut zu…',
      nadaTodavia: 'Hier ist noch nichts',
      favoritosEsperan: 'Was Sie in Ihren Favoriten gespeichert haben, wartet hier noch auf Sie.',
      daUnaVuelta: 'Stöbern Sie im Shop oder fragen Sie uns nach einer Auftragsarbeit.',
      verTienda: 'Zum Shop',
      aMedida: 'Auftragsarbeit anfragen',
      tusFavoritos: 'Ihre Favoriten',
    },
  },
);

type TextosCesta = (typeof T)[keyof typeof T];

function frasePlazo(t: TextosCesta, lineas: readonly LineaCesta[], plazo: number | null): string {
  const encargos = lineas.filter((l) => l.encargo).length;
  if (!plazo || !encargos) return t.todoHecho;
  return t.plazo(t.encargos(encargos), plazo);
}

export function VistaCesta({ productos, metodos, tarjetas, sugeribles, afines }: PropsVistaCesta) {
  const { lineas, cupon, hidratada, fijarUnidades, quitar, vaciar, maxUnidades } = useCesta();
  const t = useTextos(T);
  useSincronizarCesta(productos);

  if (!hidratada) {
    return (
      <div className="esqueleto" aria-busy="true">
        <p className="oculto-vis">{t.cargando}</p>
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
      afines={afines}
      fijarUnidades={fijarUnidades}
      quitar={quitar}
      vaciar={vaciar}
      maxUnidades={maxUnidades}
    />
  );
}

interface PropsConArticulos extends Pick<PropsVistaCesta, 'metodos' | 'tarjetas' | 'sugeribles' | 'afines'> {
  lineas: LineaCesta[];
  cupon: string | null;
  fijarUnidades: (id: string, uds: number) => void;
  quitar: (id: string) => void;
  vaciar: () => void;
  maxUnidades: (id: string) => number;
}

function ConArticulos({ lineas, cupon, metodos, tarjetas, sugeribles, afines, fijarUnidades, quitar, vaciar, maxUnidades }: PropsConArticulos) {
  const avisar = useBrindis();
  const x = useTextos(T);
  const idioma = useIdioma();
  // Este bloque solo se monta en el navegador, así que puede leer lo guardado.
  const [envioId, setEnvioId] = useState<IdEnvio>(leerEnvioGuardado);
  const titulo = useRef<HTMLHeadingElement>(null);

  const t = calcularTotales(lineas, cupon, { envioId, envios: metodos });
  const enCesta = new Set(lineas.map((l) => l.slug));
  // Lo que acompaña a cada pieza de la cesta, empezando por la primera.
  const disponibles = new Set(sugeribles);
  const sugerencias = [...new Set(lineas.flatMap((l) => afines[l.slug] ?? []))]
    .filter((s) => !enCesta.has(s) && disponibles.has(s) && tarjetas[s])
    .slice(0, 4);

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
        {piezas(t.unidades, idioma)}. {frasePlazo(x, lineas, t.plazoEncargo)}
      </p>

      <div className="layout-compra">
        <div>
          <h2 ref={titulo} tabIndex={-1} className="oculto-vis">
            {x.piezas}
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
            <Enlace className="btn btn-2" href={rutas.tienda}>
              {x.seguir}
            </Enlace>
            <DialogoVaciar
              unidades={t.unidades}
              alConfirmar={() => {
                vaciar();
                avisar(x.vaciada);
                // El estado vacío aparece en el siguiente pintado.
                requestAnimationFrame(() => document.getElementById('cesta-vacia')?.focus());
              }}
            />
          </div>

        </div>

        <aside className="resumen-lado" aria-labelledby="resumen-titulo">
          <div className="caja">
            <h2 id="resumen-titulo">{x.resumen}</h2>
            <BarraEnvioGratis totales={t} />
            <SelectorEnvio
              metodos={metodos}
              lineas={lineas}
              cupon={cupon}
              valor={envioId}
              alCambiar={elegirEnvio}
              leyenda={x.envio}
              compacto
            />
            <FormularioCupon abierto />
            <div className="totales-resumen">
              <ResumenTotales totales={t} cupon={cupon} etiquetaEnvio={t.metodo.nombre} />
            </div>
            <Enlace className="btn btn-1 btn-bloque mt-3" href={rutas.pago}>
              {x.pagar}
            </Enlace>
            <p className="mini-2 pago-seguro">{x.seguro}</p>
          </div>
          <Garantias en="cesta" />
        </aside>
      </div>

      {sugerencias.length > 0 && (
        <section className="sugerencias" aria-labelledby="sugerencias-titulo">
          <div className="cab-sec">
            <h2 id="sugerencias-titulo" className="tit-sugerencias">
              {x.combina}
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
  const t = useTextos(T);

  return (
    <div className="compra-vacia">
      <Ovillo width={64} height={64} className="flota ovillo-vacio" />
      <h2 id="cesta-vacia" tabIndex={-1}>
        {t.nadaTodavia}
      </h2>
      <p className="lead">{guardados.length ? t.favoritosEsperan : t.daUnaVuelta}</p>
      <div className="botones-centro">
        <Enlace className="btn btn-1" href={rutas.tienda}>
          {t.verTienda}
        </Enlace>
        <Enlace className="btn btn-2" href={rutas.encargos}>
          {t.aMedida}
        </Enlace>
      </div>
      {guardados.length > 0 && (
        <section className="favoritos-vacia" aria-labelledby="favoritos-titulo">
          <div className="cab-sec">
            <h2 id="favoritos-titulo" className="tit-sugerencias">
              {t.tusFavoritos}
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
