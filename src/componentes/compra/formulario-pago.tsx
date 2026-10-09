'use client';

// Pago en tres pasos: tus datos, entrega y revisión. Aquí viven el estado
// y la navegación entre pasos; cada paso pinta sus campos (paso-*.tsx).
// Se valida con las mismas reglas que el servidor antes de dejar avanzar;
// al confirmar, el servidor vuelve a validarlo todo y recalcula el pedido.

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition, type FormEvent } from 'react';
import { IcoInfo, Ovillo } from '@/componentes/iconos';
import { guardarLocal } from '@/lib/almacen-local';
import type { MetodoEnvio } from '@/lib/catalogo/tipos';
import { useCesta } from '@/lib/cesta/contexto';
import type { LineaCesta, ProductoCesta } from '@/lib/cesta/tipos';
import { totales as calcularTotales } from '@/lib/cesta/totales';
import { textos } from '@/lib/i18n';
import { useIdioma, useTextos } from '@/lib/i18n/cliente';
import { Enlace } from '@/lib/i18n/enlace';
import { confirmarPedido } from '@/lib/pagos/acciones';
import { provinciaDeCodigo, type ErroresCampos, type IdEnvio } from '@/lib/pagos/opciones';
import { rutas } from '@/lib/rutas';
import {
  borrarBorrador,
  CAMPOS_PASO,
  enfocar,
  erroresDe,
  guardarBorrador,
  leerBorrador,
  PASOS,
  type Cambiar,
  type Datos,
  type ModoPago,
  type Paso,
} from './datos-pago';
import { PasoDatos } from './paso-datos';
import { PasoEntrega } from './paso-entrega';
import { PasoRevision } from './paso-revision';
import { ResumenPedido } from './resumen-pedido';
import { useSincronizarCesta } from './use-sincronizar-cesta';
import { guardarEnvio, lineasParaPedido } from './utiles';

const T = textos(
  {
    cargando: 'Cargando tu pedido…',
    nadaQuePagar: 'No hay nada que pagar',
    vacia: 'Tu cesta está vacía.',
    verTienda: 'Ver la tienda',
    sinConexion: 'No hemos podido conectar con la tienda. Revisa la conexión y vuelve a probar.',
    pasos: 'Pasos del pago',
    nombresPaso: { 1: 'Tus datos', 2: 'Entrega', 3: 'Revisión y pago' },
    hechoVolver: ' (hecho, volver)',
    cancelado: 'Has vuelto sin pagar. Tu cesta y tus datos siguen aquí; cuando quieras, seguimos.',
  },
  {
    en: {
      cargando: 'Loading your order…',
      nadaQuePagar: 'Nothing to pay for',
      vacia: 'Your basket is empty.',
      verTienda: 'Browse the shop',
      sinConexion: 'We couldn’t connect to the shop. Check your connection and try again.',
      pasos: 'Checkout steps',
      nombresPaso: { 1: 'Your details', 2: 'Delivery', 3: 'Review and pay' },
      hechoVolver: ' (done, go back)',
      cancelado: 'You came back without paying. Your basket and details are still here; carry on whenever you like.',
    },
    fr: {
      cargando: 'Chargement de votre commande…',
      nadaQuePagar: 'Rien à payer',
      vacia: 'Votre panier est vide.',
      verTienda: 'Voir la boutique',
      sinConexion: 'Impossible de joindre la boutique. Vérifiez votre connexion et réessayez.',
      pasos: 'Étapes du paiement',
      nombresPaso: { 1: 'Vos coordonnées', 2: 'Livraison', 3: 'Vérification et paiement' },
      hechoVolver: ' (fait, revenir)',
      cancelado:
        'Vous voilà de retour sans avoir payé. Votre panier et vos coordonnées sont toujours là\u202f; reprenez quand vous voulez.',
    },
    de: {
      cargando: 'Ihre Bestellung wird geladen…',
      nadaQuePagar: 'Nichts zu bezahlen',
      vacia: 'Ihr Warenkorb ist leer.',
      verTienda: 'Zum Shop',
      sinConexion: 'Wir konnten den Shop nicht erreichen. Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
      pasos: 'Schritte der Bezahlung',
      nombresPaso: { 1: 'Ihre Daten', 2: 'Lieferung', 3: 'Prüfen und bezahlen' },
      hechoVolver: ' (erledigt, zurück)',
      cancelado:
        'Sie sind ohne Bezahlung zurückgekehrt. Ihr Warenkorb und Ihre Daten sind noch da; machen Sie weiter, wann Sie möchten.',
    },
  },
);

export interface PropsFormularioPago {
  productos: ProductoCesta[];
  metodos: MetodoEnvio[];
  modo: ModoPago;
  cancelado: boolean;
}

export function FormularioPago({ productos, metodos, modo, cancelado }: PropsFormularioPago) {
  const { lineas, cupon, hidratada } = useCesta();
  const t = useTextos(T);
  useSincronizarCesta(productos);

  if (!hidratada) {
    return (
      <div className="esqueleto" aria-busy="true">
        <p className="oculto-vis">{t.cargando}</p>
        <div className="hueso" style={{ height: 260 }} />
      </div>
    );
  }

  if (!lineas.length) {
    return (
      <div className="compra-vacia">
        <Ovillo width={64} height={64} className="ovillo-vacio" />
        <h2>{t.nadaQuePagar}</h2>
        <p className="lead">{t.vacia}</p>
        <div className="botones-centro">
          <Enlace className="btn btn-1" href={rutas.tienda}>
            {t.verTienda}
          </Enlace>
        </div>
      </div>
    );
  }

  return <Pasos lineas={lineas} cupon={cupon} metodos={metodos} modo={modo} cancelado={cancelado} />;
}

interface PropsPasos {
  lineas: LineaCesta[];
  cupon: string | null;
  metodos: MetodoEnvio[];
  modo: ModoPago;
  cancelado: boolean;
}

function Pasos({ lineas, cupon, metodos, modo, cancelado }: PropsPasos) {
  const router = useRouter();
  const { quitarCupon } = useCesta();
  const x = useTextos(T);
  const idioma = useIdioma();
  // Solo se monta en el navegador: puede leer el borrador al iniciar.
  const [datos, setDatos] = useState<Datos>(leerBorrador);
  const [paso, setPaso] = useState<Paso>(() =>
    cancelado && !Object.keys(erroresDe(datos, [...CAMPOS_PASO[1], ...CAMPOS_PASO[2]], idioma)).length ? 3 : 1,
  );
  const [errores, setErrores] = useState<ErroresCampos>({});
  const [errorGeneral, setErrorGeneral] = useState<{ mensaje: string; cupon?: boolean } | null>(null);
  const [enviando, iniciar] = useTransition();
  const [saliendo, setSaliendo] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);
  const pasoAnterior = useRef(paso);

  const t = calcularTotales(lineas, cupon, { envioId: datos.envio, envios: metodos });

  useEffect(() => guardarBorrador(datos), [datos]);

  // Al cambiar de paso, el foco va a su título y la página arriba.
  useEffect(() => {
    if (pasoAnterior.current === paso) return;
    pasoAnterior.current = paso;
    window.scrollTo({ top: 0 });
    titulo.current?.focus({ preventScroll: true });
  }, [paso]);

  const cambiar: Cambiar = (campo, valor) => {
    setDatos((d) => {
      const nuevo = { ...d, [campo]: valor };
      // Con el código postal completo, la provincia se rellena sola.
      if (campo === 'cp' && typeof valor === 'string' && !d.provincia) {
        nuevo.provincia = provinciaDeCodigo(valor) ?? '';
      }
      return nuevo;
    });
    if (campo === 'envio') guardarEnvio(valor as IdEnvio);
    if (errores[campo]) {
      setErrores((e) => {
        const resto = { ...e };
        delete resto[campo];
        return resto;
      });
    }
  };

  const avanzar = (desde: Paso) => {
    const e = erroresDe(datos, CAMPOS_PASO[desde], idioma);
    setErrores(e);
    const primero = CAMPOS_PASO[desde].find((c) => e[c]);
    if (primero) {
      enfocar(primero);
      return;
    }
    setPaso((desde + 1) as Paso);
  };

  /** Lleva al primer paso con errores y enfoca el campo. */
  const mostrarErrores = (e: ErroresCampos) => {
    setErrores(e);
    for (const p of [1, 2, 3] as Paso[]) {
      const primero = CAMPOS_PASO[p].find((c) => e[c]);
      if (primero) {
        setPaso(p);
        enfocar(primero);
        return;
      }
    }
  };

  const confirmar = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (paso !== 3) {
      avanzar(paso);
      return;
    }
    const e = erroresDe(datos, [...CAMPOS_PASO[1], ...CAMPOS_PASO[2], ...CAMPOS_PASO[3]], idioma);
    if (Object.keys(e).length) {
      mostrarErrores(e);
      return;
    }
    setErrorGeneral(null);

    // Solo se manda un código que de verdad se aplica a esta cesta.
    const cuponValido = t.promocionCupon && !t.cuponFaltaMinimo ? cupon : null;
    iniciar(async () => {
      let r: Awaited<ReturnType<typeof confirmarPedido>>;
      try {
        r = await confirmarPedido({
          datos,
          lineas: lineasParaPedido(lineas),
          cupon: cuponValido,
          totalVisto: t.total,
        });
      } catch {
        // Sin conexión o con el servidor caído: se avisa y la cesta sigue intacta.
        setErrorGeneral({ mensaje: x.sinConexion, cupon: false });
        return;
      }
      if (r.ok) {
        setSaliendo(true);
        borrarBorrador();
        if (r.modo === 'demo') {
          guardarLocal('ultimo-pedido', r.resumen);
          router.push(r.url);
        } else {
          window.location.assign(r.url);
        }
        return;
      }
      if (r.tipo === 'datos') {
        mostrarErrores(r.errores);
        return;
      }
      setErrorGeneral({ mensaje: r.mensaje, cupon: r.tipo === 'cesta' && r.codigo === 'CUPON' });
      // Catálogo nuevo desde el servidor: la cesta se pone al día sola.
      if (r.tipo === 'cesta') router.refresh();
    });
  };

  const ocupado = enviando || saliendo;

  return (
    <>
      <ol className="pasos-pago" aria-label={x.pasos}>
        {PASOS.map((n) => (
          <li key={n} className={n < paso ? 'hecho' : undefined} aria-current={n === paso ? 'step' : undefined}>
            {n < paso ? (
              <button type="button" onClick={() => setPaso(n)}>
                <b>{n}.</b> {x.nombresPaso[n]}
                <span className="oculto-vis">{x.hechoVolver}</span>
              </button>
            ) : (
              <span>
                <b>{n}.</b> {x.nombresPaso[n]}
              </span>
            )}
          </li>
        ))}
      </ol>

      <div className="layout-compra mt-7">
        <form onSubmit={confirmar} noValidate aria-describedby={errorGeneral ? 'error-pago' : undefined}>
          {cancelado && paso === 3 && !errorGeneral && (
            <div className="aviso mb-6">
              <IcoInfo />
              <span>{x.cancelado}</span>
            </div>
          )}

          {paso === 1 && <PasoDatos datos={datos} errores={errores} cambiar={cambiar} titulo={titulo} />}

          {paso === 2 && (
            <PasoEntrega
              datos={datos}
              errores={errores}
              cambiar={cambiar}
              titulo={titulo}
              metodos={metodos}
              lineas={lineas}
              cupon={cupon}
              volver={() => setPaso(1)}
            />
          )}

          {paso === 3 && (
            <PasoRevision
              datos={datos}
              errores={errores}
              cambiar={cambiar}
              titulo={titulo}
              metodos={metodos}
              modo={modo}
              total={t.total}
              irA={setPaso}
              ocupado={ocupado}
              errorGeneral={errorGeneral}
              quitarCupon={() => {
                quitarCupon();
                setErrorGeneral(null);
              }}
            />
          )}
        </form>

        <ResumenPedido lineas={lineas} totales={t} cupon={cupon} />
      </div>
    </>
  );
}
