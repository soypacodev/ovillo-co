import { IcoCamion, IcoCesta, IcoCorazonG, IcoSobre } from '@/componentes/iconos';
import { textos } from '@/lib/i18n';
import { Enlace } from '@/lib/i18n/enlace';
import { idiomaActual } from '@/lib/i18n/servidor';
import { rutas } from '@/lib/rutas';

const ICONOS = [<IcoCamion key="camion" />, <IcoSobre key="sobre" />, <IcoCorazonG key="corazon" />, <IcoCesta key="cesta" />];

const T = textos(
  {
    ventajas: [
      { titulo: 'Ver tus pedidos', texto: 'Todo el historial con el estado de cada uno y el número de seguimiento.' },
      { titulo: 'No repetir la dirección', texto: 'Guardas las que uses y en el siguiente pedido eliges y listo.' },
      { titulo: 'Favoritos en todas partes', texto: 'Lo que guardas en el móvil aparece también en el ordenador.' },
      { titulo: 'Comprar igual sin cuenta', texto: 'No hace falta para pedir: es solo para quien quiera tenerlo todo a mano.' },
    ],
    conCuenta: 'Con cuenta puedes',
    cuatro: 'Cuatro cosas útiles',
    datosTitulo: 'Sobre tus datos',
    datosTexto:
      'Guardamos tu nombre, tu correo y las direcciones que metas. La contraseña se guarda cifrada: no la podemos ver ni queriendo. Puedes borrar la cuenta cuando quieras desde «Mis datos».',
    privacidad: 'Leer la política de privacidad',
  },
  {
    en: {
      ventajas: [
        { titulo: 'See your orders', texto: 'Your full history, with the status of each order and its tracking number.' },
        { titulo: 'No retyping your address', texto: 'Save the ones you use and just pick one on your next order.' },
        { titulo: 'Favourites everywhere', texto: 'What you save on your phone also shows up on your computer.' },
        { titulo: 'Still shop without one', texto: "You don't need it to order: it's just for anyone who likes to have everything to hand." },
      ],
      conCuenta: 'With an account you can',
      cuatro: 'Four handy things',
      datosTitulo: 'About your data',
      datosTexto:
        "We keep your name, your email and the addresses you add. Your password is stored encrypted: we couldn't see it even if we wanted to. You can delete your account whenever you like from “My details”.",
      privacidad: 'Read the privacy policy',
    },
    fr: {
      ventajas: [
        { titulo: 'Suivre vos commandes', texto: 'Tout l’historique, avec le statut de chacune et le numéro de suivi.' },
        { titulo: 'Ne plus retaper l’adresse', texto: 'Enregistrez celles que vous utilisez et, à la commande suivante, il suffit de choisir.' },
        { titulo: 'Des favoris partout', texto: 'Ce que vous enregistrez sur votre téléphone apparaît aussi sur votre ordinateur.' },
        { titulo: 'Acheter quand même sans compte', texto: 'Il n’est pas nécessaire pour commander : c’est juste pour qui veut tout avoir sous la main.' },
      ],
      conCuenta: 'Avec un compte, vous pouvez',
      cuatro: 'Quatre choses utiles',
      datosTitulo: 'À propos de vos données',
      datosTexto:
        'Nous gardons votre nom, votre adresse e-mail et les adresses que vous ajoutez. Le mot de passe est chiffré : nous ne pourrions pas le voir même en le voulant. Vous pouvez supprimer votre compte quand vous le souhaitez depuis « Mes informations ».',
      privacidad: 'Lire la politique de confidentialité',
    },
    de: {
      ventajas: [
        { titulo: 'Ihre Bestellungen ansehen', texto: 'Der ganze Verlauf mit dem Status jeder Bestellung und der Sendungsnummer.' },
        { titulo: 'Adresse nicht neu eintippen', texto: 'Speichern Sie Ihre Adressen und wählen Sie bei der nächsten Bestellung einfach eine aus.' },
        { titulo: 'Favoriten überall', texto: 'Was Sie auf dem Handy speichern, sehen Sie auch am Computer.' },
        { titulo: 'Auch ohne Konto bestellen', texto: 'Zum Bestellen brauchen Sie keins: Es ist nur für alle, die gern alles griffbereit haben.' },
      ],
      conCuenta: 'Mit einem Konto können Sie',
      cuatro: 'Vier praktische Dinge',
      datosTitulo: 'Über Ihre Daten',
      datosTexto:
        'Wir speichern Ihren Namen, Ihre E-Mail-Adresse und die Adressen, die Sie eingeben. Das Passwort wird verschlüsselt gespeichert: Wir könnten es nicht einmal sehen, wenn wir wollten. Sie können Ihr Konto jederzeit unter „Meine Daten“ löschen.',
      privacidad: 'Datenschutzerklärung lesen',
    },
  },
);

/** Para qué sirve tener cuenta, junto a los formularios de acceso. */
export async function VentajasCuenta() {
  const t = T[await idiomaActual()];
  return (
    <>
      <div className="banda">
        <p className="eyebrow">{t.conCuenta}</p>
        <h2 className="mt-1 cuenta-ventajas-titulo">{t.cuatro}</h2>
        <ul className="cuenta-ventajas">
          {t.ventajas.map((v, i) => (
            <li key={v.titulo}>
              {ICONOS[i]}
              <span>
                <b>{v.titulo}</b>
                {v.texto}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="caja mt-4">
        <h2 className="titulo-mini">{t.datosTitulo}</h2>
        <p className="mini mt-2">{t.datosTexto}</p>
        <Enlace href={`${rutas.legal}#privacidad`} className="mini enlace mt-3">
          {t.privacidad}
        </Enlace>
      </div>
    </>
  );
}
