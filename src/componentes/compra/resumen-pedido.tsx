import Image from 'next/image';
import type { ReactNode } from 'react';
import { ResumenTotales } from '@/componentes/cesta/resumen-totales';
import { IcoInfo } from '@/componentes/iconos';
import type { LineaCesta, Totales } from '@/lib/cesta/tipos';
import { eur } from '@/lib/formato';
import { textos } from '@/lib/i18n';
import { useIdioma, useTextos } from '@/lib/i18n/cliente';
import { Enlace } from '@/lib/i18n/enlace';
import { rutas } from '@/lib/rutas';
import { Garantias } from './garantias';

const T = textos(
  {
    titulo: 'Tu pedido',
    editar: 'editar',
    editarOculto: ' la cesta',
    unidades: (n: number) => `${n} ud.`,
    personalizacion: (texto: string) => ` · «${texto}»`,
    plazo: (dias: ReactNode) => (
      <>El pedido sale completo cuando terminemos las piezas por encargo: unos {dias}.</>
    ),
    dias: (n: number) => `${n} días`,
  },
  {
    en: {
      titulo: 'Your order',
      editar: 'edit',
      editarOculto: ' the basket',
      unidades: (n: number) => (n === 1 ? '1 item' : `${n} items`),
      personalizacion: (texto: string) => ` · “${texto}”`,
      plazo: (dias: ReactNode) => <>Your order ships in full once we finish the made-to-order items: about {dias}.</>,
      dias: (n: number) => `${n} days`,
    },
    fr: {
      titulo: 'Votre commande',
      editar: 'modifier',
      editarOculto: ' le panier',
      unidades: (n: number) => (n === 1 ? '1 article' : `${n} articles`),
      personalizacion: (texto: string) => ` · «\u00a0${texto}\u00a0»`,
      plazo: (dias: ReactNode) => (
        <>La commande part complète une fois les pièces sur mesure terminées{'\u00a0'}: environ {dias}.</>
      ),
      dias: (n: number) => `${n} jours`,
    },
    de: {
      titulo: 'Ihre Bestellung',
      editar: 'bearbeiten',
      editarOculto: ' (Warenkorb)',
      unidades: (n: number) => `${n} Stück`,
      personalizacion: (texto: string) => ` · „${texto}“`,
      plazo: (dias: ReactNode) => (
        <>Die Bestellung wird komplett verschickt, sobald die Auftragsarbeiten fertig sind: in etwa {dias}.</>
      ),
      dias: (n: number) => `${n} Tagen`,
    },
  },
);

/** Resumen lateral del pago: piezas, importes con el envío elegido y plazo. */
export function ResumenPedido({ lineas, totales: t, cupon }: { lineas: readonly LineaCesta[]; totales: Totales; cupon: string | null }) {
  const x = useTextos(T);
  const idioma = useIdioma();
  return (
    <aside className="resumen-lado" aria-labelledby="pedido-titulo">
      <div className="caja">
        <div className="cab-resumen">
          <h2 id="pedido-titulo">{x.titulo}</h2>
          <Enlace className="mini enlace" href={rutas.cesta}>
            {x.editar}
            <span className="oculto-vis">{x.editarOculto}</span>
          </Enlace>
        </div>
        <ul className="lineas-resumen">
          {lineas.map((l) => (
            <li key={l.id} className="linea-resumen">
              <div className="miniatura">{l.foto && <Image src={l.foto.src} alt="" fill sizes="52px" />}</div>
              <div>
                <p className="nom">{l.nombre}</p>
                <p className="mini-2">
                  {l.rotulo ?? l.variante} · {x.unidades(l.uds)}
                  {l.personalizacion && x.personalizacion(l.personalizacion)}
                </p>
              </div>
              <span className="mini precio">{eur(l.precio * l.uds - (t.rebajaPorLinea[l.id] ?? 0), idioma)}</span>
            </li>
          ))}
        </ul>
        <div className="totales-resumen" aria-live="polite">
          <ResumenTotales totales={t} cupon={cupon} etiquetaEnvio={t.metodo.nombre} />
        </div>
        {t.plazoEncargo && (
          <div className="aviso mt-2">
            <IcoInfo />
            <span>{x.plazo(<b>{x.dias(t.plazoEncargo)}</b>)}</span>
          </div>
        )}
      </div>
      <Garantias en="pago" />
    </aside>
  );
}
