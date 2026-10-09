import { IcoPersona } from '@/componentes/iconos';
import { textos } from '@/lib/i18n';
import { Enlace } from '@/lib/i18n/enlace';
import { idiomaActual } from '@/lib/i18n/servidor';
import { rutas } from '@/lib/rutas';
import { BotonCesta } from './boton-cesta';
import { CabeceraPegajosa } from './cabecera-pegajosa';
import { EnlaceBuscar, EnlaceFavoritos } from './enlaces-cabecera';
import { Logo } from './logo';
import { MenuMovil } from './menu-movil';
import { MenuPrincipal } from './menu-principal';
import { SelectorIdioma } from './selector-idioma';

const T = textos(
  { cuenta: 'Mi cuenta', entrar: 'Entrar en mi cuenta' },
  {
    en: { cuenta: 'My account', entrar: 'Sign in to my account' },
    fr: { cuenta: 'Mon compte', entrar: 'Me connecter à mon compte' },
    de: { cuenta: 'Mein Konto', entrar: 'In meinem Konto anmelden' },
  },
);

/** `conSesion` es una pista (hay cookie de sesión): decide si el icono de
 *  la cuenta lleva a la cuenta o a entrar. La cuenta vuelve a comprobarlo. */
export async function Cabecera({ conSesion }: { conSesion: boolean }) {
  const t = T[await idiomaActual()];
  const cuenta = conSesion ? rutas.cuenta : rutas.entrar;
  return (
    <CabeceraPegajosa>
      <div className="wrap nav">
        <Logo />
        <MenuPrincipal />
        <div className="acciones">
          <EnlaceBuscar />
          <EnlaceFavoritos className="icono solo-ancho" />
          <Enlace className="icono solo-ancho" href={cuenta} prefetch={false} aria-label={conSesion ? t.cuenta : t.entrar}>
            <IcoPersona />
          </Enlace>
          <SelectorIdioma className="solo-ancho" />
          <BotonCesta />
          <MenuMovil cuenta={cuenta} />
        </div>
      </div>
    </CabeceraPegajosa>
  );
}
