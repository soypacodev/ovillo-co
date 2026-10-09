import type { ReactNode } from 'react';
import { IcoInfo } from '@/componentes/iconos';
import { textos } from '@/lib/i18n';
import { Enlace } from '@/lib/i18n/enlace';
import { idiomaActual } from '@/lib/i18n/servidor';
import { rutas } from '@/lib/rutas';
import { BotonPanelDemo } from './boton-panel-demo';
import { VentajasCuenta } from './ventajas-cuenta';

const T = textos(
  {
    acceso: 'Acceso',
    tengoCuenta: 'Ya tengo cuenta',
    crearCuenta: 'Crear cuenta',
    tambien: 'También puedes',
    sinCuenta: 'comprar sin cuenta',
    sobreCuentas: 'Sobre las cuentas',
    demoTitulo: '¿Eres del taller o vienes a curiosear?',
    demoTexto:
      'El panel de demostración enseña cómo se gestionan pedidos, productos y encargos. Se puede mirar todo; los cambios no se guardan.',
  },
  {
    en: {
      acceso: 'Sign in',
      tengoCuenta: 'I have an account',
      crearCuenta: 'Create an account',
      tambien: 'You can also',
      sinCuenta: 'shop without an account',
      sobreCuentas: 'About accounts',
      demoTitulo: 'From the workshop, or just having a look?',
      demoTexto:
        "The demo dashboard shows how orders, products and custom orders are managed. You can look at everything; changes aren't saved.",
    },
    fr: {
      acceso: 'Connexion',
      tengoCuenta: 'J’ai déjà un compte',
      crearCuenta: 'Créer un compte',
      tambien: 'Vous pouvez aussi',
      sinCuenta: 'acheter sans compte',
      sobreCuentas: 'À propos des comptes',
      demoTitulo: 'Vous êtes de l’atelier ou simplement curieux ?',
      demoTexto:
        'Le tableau de bord de démonstration montre comment se gèrent les commandes, les produits et les commandes sur mesure. Vous pouvez tout regarder ; les modifications ne sont pas enregistrées.',
    },
    de: {
      acceso: 'Anmeldung',
      tengoCuenta: 'Ich habe ein Konto',
      crearCuenta: 'Konto anlegen',
      tambien: 'Sie können auch',
      sinCuenta: 'ohne Konto bestellen',
      sobreCuentas: 'Über die Konten',
      demoTitulo: 'Aus der Werkstatt oder nur neugierig?',
      demoTexto:
        'Das Demo-Dashboard zeigt, wie Bestellungen, Produkte und Auftragsarbeiten verwaltet werden. Sie können sich alles ansehen; Änderungen werden nicht gespeichert.',
    },
  },
);

interface PropsPantalla {
  titulo: string;
  entradilla: ReactNode;
  /** Pestaña marcada; sin ella no se enseñan las pestañas. */
  pestana?: 'entrar' | 'registro';
  /** Aviso que llega en la URL (cuenta borrada, enlace caducado…). */
  aviso?: string | null;
  children: ReactNode;
}

/** Marco común de entrar, registro y contraseñas: formulario a un lado y,
 *  al otro, para qué sirve la cuenta y la puerta al panel de demostración. */
export async function PantallaAcceso({ titulo, entradilla, pestana, aviso, children }: PropsPantalla) {
  const t = T[await idiomaActual()];
  return (
    <div className="cuenta-acceso">
      <div className="cuenta-formulario">
        <h1 className="ent ent-1 cuenta-titulo">{titulo}</h1>
        {pestana && (
          <nav className="pestanas ent ent-2" aria-label={t.acceso}>
            <Enlace href={rutas.entrar} aria-current={pestana === 'entrar' ? 'page' : undefined}>
              {t.tengoCuenta}
            </Enlace>
            <Enlace href={rutas.registro} aria-current={pestana === 'registro' ? 'page' : undefined}>
              {t.crearCuenta}
            </Enlace>
          </nav>
        )}
        <p className="lead cuenta-entradilla ent ent-3">{entradilla}</p>
        {aviso && (
          <div className="aviso mt-5" role="status">
            <IcoInfo />
            <span>{aviso}</span>
          </div>
        )}
        <div className="ent ent-4">{children}</div>
        <p className="mini-2 centro mt-7">
          {t.tambien}{' '}
          <Enlace href={rutas.tienda} className="enlace">
            {t.sinCuenta}
          </Enlace>
          .
        </p>
      </div>

      <aside className="cuenta-lateral ent ent-5" aria-label={t.sobreCuentas}>
        <VentajasCuenta />
        <div className="caja-cl mt-4 cuenta-demo">
          <h2 className="titulo-mini">{t.demoTitulo}</h2>
          <p className="mini mt-2">{t.demoTexto}</p>
          <BotonPanelDemo className="btn btn-2 btn-p mt-4" />
        </div>
      </aside>
    </div>
  );
}
