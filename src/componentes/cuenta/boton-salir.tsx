'use client';

import { IcoSalir } from '@/componentes/iconos';
import { cerrarSesion } from '@/lib/cuentas/acciones-acceso';
import { textos } from '@/lib/i18n';
import { useTextos } from '@/lib/i18n/cliente';

const T = textos(
  { salir: 'Cerrar sesión' },
  { en: { salir: 'Sign out' }, fr: { salir: 'Se déconnecter' }, de: { salir: 'Abmelden' } },
);

/** Cierra la sesión. Olvida también que los favoritos de este navegador
 *  ya se fusionaron, para que la próxima cuenta que entre los reciba. */
export function BotonSalir({ className = 'btn btn-4 btn-p' }: { className?: string }) {
  const t = useTextos(T);
  return (
    <form
      action={cerrarSesion}
      onSubmit={() => {
        try {
          window.sessionStorage.removeItem('ovillo.favoritosFusionados');
        } catch {
          // Sin sessionStorage no hay nada que olvidar.
        }
      }}
    >
      <button type="submit" className={className}>
        <IcoSalir width={18} height={18} />
        {t.salir}
      </button>
    </form>
  );
}
