import Image from 'next/image';
import Link from 'next/link';
import { ResumenTotales } from '@/componentes/cesta/resumen-totales';
import { IcoInfo } from '@/componentes/iconos';
import type { LineaCesta, Totales } from '@/lib/cesta/tipos';
import { eur } from '@/lib/formato';
import { rutas } from '@/lib/rutas';
import { Garantias } from './garantias';

/** Resumen lateral del pago: piezas, importes con el envío elegido y plazo. */
export function ResumenPedido({ lineas, totales: t, cupon }: { lineas: readonly LineaCesta[]; totales: Totales; cupon: string | null }) {
  return (
    <aside className="resumen-lado" aria-labelledby="pedido-titulo">
      <div className="caja">
        <div className="cab-resumen">
          <h2 id="pedido-titulo">Tu pedido</h2>
          <Link className="mini enlace" href={rutas.cesta}>
            editar<span className="oculto-vis"> la cesta</span>
          </Link>
        </div>
        <ul className="lineas-resumen">
          {lineas.map((l) => (
            <li key={l.id} className="linea-resumen">
              <div className="miniatura">{l.foto && <Image src={l.foto.src} alt="" fill sizes="52px" />}</div>
              <div>
                <p className="nom">{l.nombre}</p>
                <p className="mini-2">
                  {l.variante} · {l.uds} ud.{l.personalizacion && ` · «${l.personalizacion}»`}
                </p>
              </div>
              <span className="mini precio">{eur(l.precio * l.uds - (t.rebajaPorLinea[l.id] ?? 0))}</span>
            </li>
          ))}
        </ul>
        <div className="totales-resumen" aria-live="polite">
          <ResumenTotales totales={t} cupon={cupon} etiquetaEnvio={t.metodo.nombre} />
        </div>
        {t.plazoEncargo && (
          <div className="aviso mt-2">
            <IcoInfo />
            <span>
              El pedido sale completo cuando terminemos las piezas por encargo: unos <b>{t.plazoEncargo} días</b>.
            </span>
          </div>
        )}
      </div>
      <Garantias en="pago" />
    </aside>
  );
}
