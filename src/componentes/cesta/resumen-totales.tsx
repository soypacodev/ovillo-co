import { nombrePromocion } from '@/lib/cesta/nombres';
import type { Totales } from '@/lib/cesta/tipos';
import { eur, eurMenos } from '@/lib/formato';
import { textos } from '@/lib/i18n';
import { useIdioma, useTextos } from '@/lib/i18n/cliente';
import { tipografia } from '@/lib/tipografia';

const T = textos(
  {
    subtotal: 'Subtotal',
    incluye: (rebaja: string, ahorro: string) => `Ya incluye ${rebaja}: te ahorras ${ahorro}.`,
    codigo: (c: string | null) => `Código ${c}`,
    envio: 'Envío',
    envioCodigo: (c: string | null) => ` (código ${c})`,
    gratis: 'Gratis',
    total: 'Total',
  },
  {
    en: {
      subtotal: 'Subtotal',
      incluye: (rebaja: string, ahorro: string) => `Includes ${rebaja}: you save ${ahorro}.`,
      codigo: (c: string | null) => `Code ${c}`,
      envio: 'Delivery',
      envioCodigo: (c: string | null) => ` (code ${c})`,
      gratis: 'Free',
      total: 'Total',
    },
    fr: {
      subtotal: 'Sous-total',
      incluye: (rebaja: string, ahorro: string) => `Comprend\u00a0: ${rebaja}. Vous économisez ${ahorro}.`,
      codigo: (c: string | null) => `Code ${c}`,
      envio: 'Livraison',
      envioCodigo: (c: string | null) => ` (code ${c})`,
      gratis: 'Offerte',
      total: 'Total',
    },
    de: {
      subtotal: 'Zwischensumme',
      incluye: (rebaja: string, ahorro: string) => `Inklusive ${rebaja}: Sie sparen ${ahorro}.`,
      codigo: (c: string | null) => `Code ${c}`,
      envio: 'Versand',
      envioCodigo: (c: string | null) => ` (Code ${c})`,
      gratis: 'Kostenlos',
      total: 'Gesamt',
    },
  },
);

export interface PropsResumen {
  totales: Totales;
  cupon: string | null;
  /** Texto del envío cuando aún no se ha elegido método. */
  etiquetaEnvio?: string;
}

/**
 * Filas de importes: subtotal, cupón, envío y total. El subtotal suma las
 * piezas con su precio ya rebajado, igual que cada línea; las rebajas
 * automáticas se nombran debajo para que se vea lo que se ahorra.
 */
export function ResumenTotales({ totales: t, cupon, etiquetaEnvio }: PropsResumen) {
  const x = useTextos(T);
  const idioma = useIdioma();
  // En español el nombre de la rebaja va en minúscula dentro de la frase.
  const rebaja = (nombre: string) => {
    const visible = nombrePromocion({ nombre }, idioma);
    return tipografia(idioma === 'de' ? visible : visible.toLowerCase());
  };
  return (
    <>
      <div className="fila">
        <span>{x.subtotal}</span>
        <span>{eur(t.subtotal - t.rebajaAuto, idioma)}</span>
      </div>
      {t.rebajasAuto.map((r) => (
        <p className="mini-2 nota-rebaja" key={r.nombre}>
          {x.incluye(rebaja(r.nombre), eur(r.importe, idioma))}
        </p>
      ))}
      {t.rebajaCupon > 0 && (
        <div className="fila">
          <span>{x.codigo(cupon)}</span>
          <span className="rebaja">{eurMenos(t.rebajaCupon, idioma)}</span>
        </div>
      )}
      <div className="fila">
        <span>
          {etiquetaEnvio ?? x.envio}
          {t.envioGratisCupon && x.envioCodigo(cupon)}
        </span>
        <span>{t.envio === 0 ? x.gratis : eur(t.envio, idioma)}</span>
      </div>
      <div className="fila total">
        <span>{x.total}</span>
        <span>{eur(t.total, idioma)}</span>
      </div>
    </>
  );
}
