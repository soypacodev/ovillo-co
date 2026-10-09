'use client';

import { Ovillo } from '@/componentes/iconos';
import { textos } from '@/lib/i18n';
import { useTextos } from '@/lib/i18n/cliente';
import { Enlace } from '@/lib/i18n/enlace';
import { rutas } from '@/lib/rutas';

const T = textos(
  { inicio: 'Ovillo & Co., ir al inicio' },
  {
    en: { inicio: 'Ovillo & Co., go to the home page' },
    fr: { inicio: "Ovillo & Co., aller à l'accueil" },
    de: { inicio: 'Ovillo & Co., zur Startseite' },
  },
);

export function Logo({ alPulsar }: { alPulsar?: () => void }) {
  const t = useTextos(T);
  return (
    <Enlace className="logo" href={rutas.inicio} onClick={alPulsar} aria-label={t.inicio}>
      <Ovillo />
      <span aria-hidden="true">Ovillo &amp; Co.</span>
    </Enlace>
  );
}
