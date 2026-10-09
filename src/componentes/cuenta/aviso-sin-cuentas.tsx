import { IcoInfo } from '@/componentes/iconos';
import { textos } from '@/lib/i18n';
import { Enlace } from '@/lib/i18n/enlace';
import { idiomaActual } from '@/lib/i18n/servidor';
import { rutas } from '@/lib/rutas';
import { BotonPanelDemo } from './boton-panel-demo';
import { VentajasCuenta } from './ventajas-cuenta';

const T = textos(
  {
    titulo: 'Tu cuenta',
    cuentas: 'Cuentas',
    necesitan: 'En esta demostración las cuentas necesitan conectar la base de datos.',
    explicacion:
      'La tienda funciona entera sin ella: puedes comprar sin cuenta y tus favoritos se guardan en este navegador. Lo que sí puedes ver ya es el panel del taller, con pedidos y encargos de ejemplo.',
    seguir: 'Seguir mirando la tienda',
  },
  {
    en: {
      titulo: 'Your account',
      cuentas: 'Accounts',
      necesitan: 'In this demo, accounts need the database to be connected.',
      explicacion:
        "The shop works perfectly well without it: you can buy without an account and your favourites are saved in this browser. What you can already explore is the workshop's dashboard, with sample orders and custom orders.",
      seguir: 'Keep browsing the shop',
    },
    fr: {
      titulo: 'Votre compte',
      cuentas: 'Comptes',
      necesitan: 'Dans cette démonstration, les comptes ont besoin que la base de données soit connectée.',
      explicacion:
        'La boutique fonctionne entièrement sans elle : vous pouvez acheter sans compte et vos favoris sont enregistrés dans ce navigateur. Ce que vous pouvez déjà découvrir, c’est le tableau de bord de l’atelier, avec des exemples de commandes, classiques et sur mesure.',
      seguir: 'Continuer à parcourir la boutique',
    },
    de: {
      titulo: 'Ihr Konto',
      cuentas: 'Konten',
      necesitan: 'In dieser Demo brauchen die Konten eine verbundene Datenbank.',
      explicacion:
        'Der Shop funktioniert auch ohne sie vollständig: Sie können ohne Konto bestellen, und Ihre Favoriten werden in diesem Browser gespeichert. Was Sie schon ansehen können, ist das Dashboard der Werkstatt mit Beispielbestellungen und Auftragsarbeiten.',
      seguir: 'Weiter im Shop stöbern',
    },
  },
);

/** Lo que se ve en las páginas de cuenta cuando la tienda funciona sin
 *  base de datos: qué falta, qué haría la cuenta y adónde ir mientras. */
export async function AvisoSinCuentas({ titulo }: { titulo?: string }) {
  const t = T[await idiomaActual()];
  return (
    <div className="cuenta-acceso">
      <div className="cuenta-formulario">
        <p className="eyebrow ent ent-1">{t.cuentas}</p>
        <h1 className="ent ent-2 cuenta-titulo">{titulo ?? t.titulo}</h1>
        <div className="aviso mt-6 ent ent-3" role="note">
          <IcoInfo />
          <div>
            <p>
              <b>{t.necesitan}</b>
            </p>
            <p className="mt-2">{t.explicacion}</p>
          </div>
        </div>
        <div className="acciones-fila mt-6 ent ent-4">
          <BotonPanelDemo className="btn btn-1" />
          <Enlace className="btn btn-2" href={rutas.tienda}>
            {t.seguir}
          </Enlace>
        </div>
      </div>
      <aside className="ent ent-5">
        <VentajasCuenta />
      </aside>
    </div>
  );
}
