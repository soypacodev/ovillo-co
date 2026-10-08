import Link from 'next/link';
import { IcoLupa, IcoPersona } from '@/componentes/iconos';
import { rutas } from '@/lib/rutas';
import { BotonCesta } from './boton-cesta';
import { CabeceraPegajosa } from './cabecera-pegajosa';
import { Logo } from './logo';
import { MenuMovil } from './menu-movil';
import { MenuPrincipal } from './menu-principal';

/** `conSesion` es una pista (hay cookie de sesión): decide si el icono de
 *  la cuenta lleva a la cuenta o a entrar. La cuenta vuelve a comprobarlo. */
export function Cabecera({ conSesion }: { conSesion: boolean }) {
  const cuenta = conSesion ? rutas.cuenta : rutas.entrar;
  return (
    <CabeceraPegajosa>
      <div className="wrap nav">
        <Logo />
        <MenuPrincipal />
        <div className="acciones">
          <Link className="icono solo-ancho" href={rutas.tienda} aria-label="Buscar en la tienda">
            <IcoLupa />
          </Link>
          <Link
            className="icono solo-ancho"
            href={cuenta}
            prefetch={false}
            aria-label={conSesion ? 'Mi cuenta' : 'Entrar en mi cuenta'}
          >
            <IcoPersona />
          </Link>
          <BotonCesta />
          <MenuMovil cuenta={cuenta} />
        </div>
      </div>
    </CabeceraPegajosa>
  );
}
