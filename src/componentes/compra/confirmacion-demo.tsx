'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { leerLocal } from '@/lib/almacen-local';
import { useCesta } from '@/lib/cesta/contexto';
import { leerResumenDemo } from '@/lib/pagos/resumen-guardado';
import { rutas } from '@/lib/rutas';
import { Confirmacion } from './confirmacion';

/** Confirmación del modo demostración: el resumen está en este navegador. */
export function ConfirmacionDemo({ numero }: { numero: string }) {
  // `hidratada` asegura que localStorage solo se lee en el navegador.
  const { hidratada } = useCesta();
  const pedido = useMemo(() => (hidratada ? leerResumenDemo(leerLocal('ultimo-pedido'), numero) : null), [hidratada, numero]);

  if (!hidratada) {
    return (
      <div className="esqueleto esqueleto-gracias" aria-busy="true">
        <p className="oculto-vis">Cargando tu pedido…</p>
        <div className="hueso" style={{ height: 200 }} />
      </div>
    );
  }
  if (!pedido) return <SinPedido />;
  return <Confirmacion pedido={pedido} />;
}

export function SinPedido({ texto = 'No encontramos ningún pedido reciente en este navegador.' }: { texto?: string }) {
  return (
    <div className="compra-vacia sin-pedido">
      <h1>No hay pedido que mostrar</h1>
      <p className="lead">{texto}</p>
      <div className="botones-centro">
        <Link className="btn btn-1" href={rutas.tienda}>
          Ir a la tienda
        </Link>
        <Link className="btn btn-2" href={rutas.contacto}>
          Escribirnos
        </Link>
      </div>
    </div>
  );
}
