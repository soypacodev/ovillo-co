import Link from 'next/link';
import { Ovillo } from '@/componentes/iconos';
import { rutas } from '@/lib/rutas';

export function Logo({ alPulsar }: { alPulsar?: () => void }) {
  return (
    <Link className="logo" href={rutas.inicio} onClick={alPulsar} aria-label="Ovillo & Co., ir al inicio">
      <Ovillo />
      <span aria-hidden="true">Ovillo &amp; Co.</span>
    </Link>
  );
}
