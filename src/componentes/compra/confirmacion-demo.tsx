'use client';

import { useMemo } from 'react';
import { leerLocal } from '@/lib/almacen-local';
import { useCesta } from '@/lib/cesta/contexto';
import { textos } from '@/lib/i18n';
import { useIdioma, useTextos } from '@/lib/i18n/cliente';
import { Enlace } from '@/lib/i18n/enlace';
import { leerResumenDemo } from '@/lib/pagos/resumen-guardado';
import { rutas } from '@/lib/rutas';
import { Confirmacion } from './confirmacion';

const T = textos(
  {
    cargando: 'Cargando tu pedido…',
    sinReciente: 'No encontramos ningún pedido reciente en este navegador.',
    titulo: 'No hay pedido que mostrar',
    tienda: 'Ir a la tienda',
    escribirnos: 'Escribirnos',
  },
  {
    en: {
      cargando: 'Loading your order…',
      sinReciente: 'We can’t find any recent order in this browser.',
      titulo: 'No order to show',
      tienda: 'Go to the shop',
      escribirnos: 'Write to us',
    },
    fr: {
      cargando: 'Chargement de votre commande…',
      sinReciente: 'Nous ne trouvons aucune commande récente dans ce navigateur.',
      titulo: 'Aucune commande à afficher',
      tienda: 'Aller à la boutique',
      escribirnos: 'Nous écrire',
    },
    de: {
      cargando: 'Ihre Bestellung wird geladen…',
      sinReciente: 'Wir finden in diesem Browser keine aktuelle Bestellung.',
      titulo: 'Keine Bestellung vorhanden',
      tienda: 'Zum Shop',
      escribirnos: 'Schreiben Sie uns',
    },
  },
);

/** Confirmación del modo demostración: el resumen está en este navegador. */
export function ConfirmacionDemo({ numero }: { numero: string }) {
  // `hidratada` asegura que localStorage solo se lee en el navegador.
  const { hidratada } = useCesta();
  const idioma = useIdioma();
  const t = useTextos(T);
  const pedido = useMemo(() => (hidratada ? leerResumenDemo(leerLocal('ultimo-pedido'), numero) : null), [hidratada, numero]);

  if (!hidratada) {
    return (
      <div className="esqueleto esqueleto-gracias" aria-busy="true">
        <p className="oculto-vis">{t.cargando}</p>
        <div className="hueso" style={{ height: 200 }} />
      </div>
    );
  }
  if (!pedido) return <SinPedido />;
  return <Confirmacion pedido={pedido} idioma={idioma} />;
}

export function SinPedido({ texto }: { texto?: string }) {
  const t = useTextos(T);
  return (
    <div className="compra-vacia sin-pedido">
      <h1>{t.titulo}</h1>
      <p className="lead">{texto ?? t.sinReciente}</p>
      <div className="botones-centro">
        <Enlace className="btn btn-1" href={rutas.tienda}>
          {t.tienda}
        </Enlace>
        <Enlace className="btn btn-2" href={rutas.contacto}>
          {t.escribirnos}
        </Enlace>
      </div>
    </div>
  );
}
