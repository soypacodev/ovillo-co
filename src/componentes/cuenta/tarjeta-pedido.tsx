import Image from 'next/image';
import Link from 'next/link';
import { PastillaEstado } from '@/componentes/panel/pastilla-estado';
import type { ResumenPedidoCuenta } from '@/lib/cuentas/datos';
import { urlFotoGuardada } from '@/lib/datos/fotos';
import { eur, piezas } from '@/lib/formato';
import { NOMBRE_ESTADO_PEDIDO } from '@/lib/panel/estados';
import { fechaLarga } from '@/lib/fechas';
import { rutas } from '@/lib/rutas';

/** Un pedido en la lista de la cuenta: fotos, estado, fecha y total. */
export function TarjetaPedidoCuenta({ pedido }: { pedido: ResumenPedidoCuenta }) {
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
          <Link href={rutas.cuentaPedido(pedido.numero)} className="tarjeta-pedido-enlace">
            Pedido {pedido.numero}
          </Link>
        </h3>
        <p className="mini">
          {fechaLarga(pedido.creado_en)} · {piezas(unidades)} · {pedido.lineas.map((l) => l.nombre_producto).join(', ')}
        </p>
      </div>
      <div className="tarjeta-pedido-lado">
        <PastillaEstado estado={pedido.estado} texto={NOMBRE_ESTADO_PEDIDO[pedido.estado]} />
        <span className="precio">{eur(pedido.total)}</span>
      </div>
    </article>
  );
}
