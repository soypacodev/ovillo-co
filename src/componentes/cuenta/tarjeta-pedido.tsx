import Image from 'next/image';
import { PastillaEstado } from '@/componentes/panel/pastilla-estado';
import type { ResumenPedidoCuenta } from '@/lib/cuentas/datos';
import { urlFotoGuardada } from '@/lib/datos/fotos';
import { fechaLarga } from '@/lib/fechas';
import { eur, piezas } from '@/lib/formato';
import { textos } from '@/lib/i18n';
import { Enlace } from '@/lib/i18n/enlace';
import { idiomaActual } from '@/lib/i18n/servidor';
import { rutas } from '@/lib/rutas';
import { ESTADOS_PEDIDO_T } from './estados-pedido';

export const T_PEDIDO = textos(
  { pedido: (numero: string) => `Pedido ${numero}` },
  {
    en: { pedido: (numero: string) => `Order ${numero}` },
    fr: { pedido: (numero: string) => `Commande ${numero}` },
    de: { pedido: (numero: string) => `Bestellung ${numero}` },
  },
);

/** Un pedido en la lista de la cuenta: fotos, estado, fecha y total. */
export async function TarjetaPedidoCuenta({ pedido }: { pedido: ResumenPedidoCuenta }) {
  const idioma = await idiomaActual();
  const unidades = pedido.lineas.reduce((s, l) => s + l.cantidad, 0);
  const fotos = pedido.lineas.map((l) => urlFotoGuardada(l.foto_ruta)).filter((f): f is string => Boolean(f)).slice(0, 3);

  return (
    <article className="tarjeta-pedido">
      <div className="tarjeta-pedido-fotos" aria-hidden="true">
        {fotos.map((src) => (
          <span key={src} className="mini-foto">
            <Image src={src} alt="" fill sizes="56px" />
          </span>
        ))}
      </div>
      <div className="tarjeta-pedido-texto">
        <h3>
          <Enlace href={rutas.cuentaPedido(pedido.numero)} className="tarjeta-pedido-enlace">
            {T_PEDIDO[idioma].pedido(pedido.numero)}
          </Enlace>
        </h3>
        <p className="mini">
          {fechaLarga(pedido.creado_en, idioma)} · {piezas(unidades, idioma)} · {pedido.lineas.map((l) => l.nombre_producto).join(', ')}
        </p>
      </div>
      <div className="tarjeta-pedido-lado">
        <PastillaEstado estado={pedido.estado} texto={ESTADOS_PEDIDO_T[idioma][pedido.estado]} />
        <span className="precio">{eur(pedido.total, idioma)}</span>
      </div>
    </article>
  );
}
