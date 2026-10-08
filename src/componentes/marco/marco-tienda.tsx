import type { ReactNode } from 'react';
import { CajonCesta } from '@/componentes/cesta/cajon-cesta';
import { SincronizarFavoritos } from '@/componentes/cuenta/sincronizar-favoritos';
import { haySesionProbable } from '@/lib/cuentas/cookies';
import { Cabecera } from './cabecera';
import { CintaAvisos } from './cinta-avisos';
import { Pie } from './pie';

/** Cabecera, contenido, pie y cajón de la cesta: todo lo que rodea a una
 *  página de la tienda. El panel del taller tiene su propio marco. */
export async function MarcoTienda({ children }: { children: ReactNode }) {
  const conSesion = await haySesionProbable();
  return (
    <>
      <div role="region" aria-label="Avisos de la tienda">
        <CintaAvisos />
      </div>
      <Cabecera conSesion={conSesion} />
      <main id="contenido" tabIndex={-1}>
        {children}
      </main>
      <Pie />
      <CajonCesta />
      {conSesion && <SincronizarFavoritos />}
    </>
  );
}
