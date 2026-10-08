import type { ReactNode } from 'react';
import { IcoCamion, IcoCorazonG, IcoOk, IcoSobre, IcoTijeras } from '@/componentes/iconos';
import { ENVIO_GRATIS_DESDE } from '@/datos/semilla';
import { eur } from '@/lib/formato';

const EN_LA_CESTA: [ReactNode, string][] = [
  [<IcoCamion key="i" />, `Envío gratis a partir de ${eur(ENVIO_GRATIS_DESDE).replace(',00', '')}`],
  [<IcoTijeras key="i" />, 'Tejido a mano, pieza por pieza'],
  [<IcoSobre key="i" />, 'Te avisamos por correo en cada paso'],
  [<IcoCorazonG key="i" />, '14 días para devolverlo'],
];

const EN_EL_PAGO: [ReactNode, string][] = [
  [<IcoOk key="i" />, 'Sin cargos ocultos: el total es el total'],
  [<IcoSobre key="i" />, 'Te escribimos cuando empezamos y cuando sale'],
  [<IcoCorazonG key="i" />, '14 días para devolverlo (salvo personalizados)'],
];

export function Garantias({ en }: { en: 'cesta' | 'pago' }) {
  const lista = en === 'cesta' ? EN_LA_CESTA : EN_EL_PAGO;
  return (
    <div className="caja-cl">
      <ul className="garantias">
        {lista.map(([icono, texto]) => (
          <li key={texto}>
            {icono}
            {texto}
          </li>
        ))}
      </ul>
    </div>
  );
}
