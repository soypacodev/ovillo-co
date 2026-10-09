'use client';

import { startTransition, useActionState, useRef, type FormEvent, type ReactNode } from 'react';
import { enviarEncargo, type EstadoEncargo } from '@/lib/acciones/encargos';
import { PRESUPUESTOS, ROTULOS_PRESUPUESTOS, ROTULOS_TIPOS_ENCARGO } from '@/lib/acciones/opciones';
import { ESTADO_INICIAL } from '@/lib/acciones/tipos';
import { textos } from '@/lib/i18n';
import { useIdioma, useTextos } from '@/lib/i18n/cliente';
import { Enlace } from '@/lib/i18n/enlace';
import { tipografia } from '@/lib/tipografia';
import { DEMO, rutas } from '@/lib/rutas';
import { BotonEnviar } from './boton-enviar';
import { Campo, Consentimiento } from './campo';
import { CampoTrampa } from './campo-trampa';
import { Confirmacion } from './confirmacion';
import { ResumenErrores } from './resumen-errores';
import { SubidaFotos } from './subida-fotos';

const T = textos(
  {
    recibido: 'Recibido, gracias',
    mirarTienda: 'Mirar la tienda mientras',
    volver: 'Volver al inicio',
    respuesta: (correo: ReactNode) => (
      <>
        Te contestamos en 24–48 horas al correo que nos has dejado, con precio, plazo y una propuesta de colores. Si en
        tres días no tienes nada nuestro, mira en la carpeta de spam o escríbenos a {correo}.
      </>
    ),
    guardado:
      'Esta tienda es una demostración: el encargo se ha guardado en una base de datos de prueba, pero nadie va a tejerlo.',
    noGuardado: 'Esta tienda es una demostración: hemos comprobado el encargo, pero no se guarda ni se envía a nadie.',
    queQuieres: 'Qué quieres',
    tipo: '¿De qué tipo?',
    eligeOpcion: 'Elige una opción',
    descripcion: 'Descríbelo con tus palabras',
    descripcionPista: 'Cuanto más concreto, mejor podemos presupuestarlo: colores, tamaño, para quién es.',
    descripcionEjemplo:
      'Es para mi madre: tiene una gata siamesa que se llama Nube y queremos un amigurumi que se le parezca, de unos 20 cm. Lo necesitaría para su cumpleaños, el 14 de octubre.',
    fecha: '¿Para cuándo lo necesitas?',
    fechaEjemplo: '14 de octubre, o «sin prisa»',
    presupuesto: 'Presupuesto que tienes en mente',
    sinPresupuesto: 'Aún no lo sé',
    colores: 'Colores que te gustan',
    opcional: '(opcional)',
    coloresEjemplo: 'verde salvia, crudo, nada de rosa',
    fotos: 'Fotos de referencia',
    fotosIntro:
      'Si es una mascota o una persona, con dos o tres fotos de frente y de perfil nos sobra. También vale la foto de algo parecido que te guste.',
    contestar: 'Cómo te contestamos',
    nombre: 'Tu nombre',
    correo: 'Correo electrónico',
    correoEjemplo: 'tunombre@correo.com',
    instagramAclaracion: '(opcional, si te va mejor por ahí)',
    instagramEjemplo: '@tuusuario',
    acepto: (enlace: ReactNode) => <>Acepto que guardéis mis datos para contestarme, según la {enlace}.</>,
    privacidad: 'política de privacidad',
    enviar: 'Mandar la idea',
    nota: 'No es un pedido, es una consulta: no se cobra nada hasta que digas que sí al presupuesto.',
  },
  {
    en: {
      recibido: 'Got it, thank you',
      mirarTienda: 'Browse the shop in the meantime',
      volver: 'Back to the home page',
      respuesta: (correo: ReactNode) => (
        <>
          We’ll reply within 24–48 hours to the email address you gave us, with a price, a timeframe and a suggested
          colour palette. If you haven’t heard from us in three days, check your spam folder or write to us at {correo}.
        </>
      ),
      guardado: 'This is a demo shop: your custom order has been saved in a test database, but nobody is going to make it.',
      noGuardado: 'This is a demo shop: we’ve checked your custom order, but it isn’t saved or sent to anyone.',
      queQuieres: 'What you’d like',
      tipo: 'What kind of piece?',
      eligeOpcion: 'Choose an option',
      descripcion: 'Describe it in your own words',
      descripcionPista: 'The more specific, the better we can quote: colours, size, who it’s for.',
      descripcionEjemplo:
        'It’s for my mum: she has a Siamese cat called Nube and we’d like an amigurumi that looks like her, about 20 cm tall. I’d need it for her birthday on 14 October.',
      fecha: 'When do you need it by?',
      fechaEjemplo: '14 October, or “no rush”',
      presupuesto: 'Budget you have in mind',
      sinPresupuesto: 'Not sure yet',
      colores: 'Colours you like',
      opcional: '(optional)',
      coloresEjemplo: 'sage green, natural, definitely no pink',
      fotos: 'Reference photos',
      fotosIntro:
        'For a pet or a person, two or three photos from the front and side are plenty. A photo of something similar you like works too.',
      contestar: 'How we’ll reply',
      nombre: 'Your name',
      correo: 'Email address',
      correoEjemplo: 'yourname@email.com',
      instagramAclaracion: '(optional, if that suits you better)',
      instagramEjemplo: '@yourusername',
      acepto: (enlace: ReactNode) => <>I agree to you keeping my details in order to reply, as set out in the {enlace}.</>,
      privacidad: 'privacy policy',
      enviar: 'Send my idea',
      nota: 'This isn’t an order, it’s an enquiry: nothing is charged until you say yes to the quote.',
    },
    fr: {
      recibido: 'Bien reçu, merci',
      mirarTienda: 'Voir la boutique en attendant',
      volver: 'Retour à l’accueil',
      respuesta: (correo: ReactNode) => (
        <>
          Nous vous répondons sous 24 à 48{' '}heures à l’adresse e-mail que vous nous avez laissée, avec un prix, un
          délai et une proposition de couleurs. Si vous n’avez rien reçu de notre part d’ici trois jours, regardez dans
          vos spams ou écrivez-nous à {correo}.
        </>
      ),
      guardado:
        'Cette boutique est une démonstration : la commande sur mesure a été enregistrée dans une base de données de test, mais personne ne va la réaliser.',
      noGuardado:
        'Cette boutique est une démonstration : nous avons vérifié la commande sur mesure, mais elle n’est ni enregistrée ni envoyée à personne.',
      queQuieres: 'Ce que vous souhaitez',
      tipo: 'Quel type de pièce ?',
      eligeOpcion: 'Choisissez une option',
      descripcion: 'Décrivez-la avec vos mots',
      descripcionPista: 'Plus c’est précis, mieux nous pouvons faire le devis : couleurs, taille, pour qui c’est.',
      descripcionEjemplo:
        'C’est pour ma mère : elle a une chatte siamoise qui s’appelle Nube et nous voudrions un amigurumi qui lui ressemble, d’environ 20 cm. Il me le faudrait pour son anniversaire, le 14 octobre.',
      fecha: 'Pour quand en avez-vous besoin ?',
      fechaEjemplo: '14 octobre, ou « rien ne presse »',
      presupuesto: 'Budget envisagé',
      sinPresupuesto: 'Je ne sais pas encore',
      colores: 'Couleurs que vous aimez',
      opcional: '(facultatif)',
      coloresEjemplo: 'vert sauge, écru, surtout pas de rose',
      fotos: 'Photos de référence',
      fotosIntro:
        'Pour un animal ou une personne, deux ou trois photos de face et de profil suffisent largement. La photo d’une pièce similaire qui vous plaît convient aussi.',
      contestar: 'Comment vous répondre',
      nombre: 'Votre nom',
      correo: 'Adresse e-mail',
      correoEjemplo: 'votrenom@email.com',
      instagramAclaracion: '(facultatif, si c’est plus pratique pour vous)',
      instagramEjemplo: '@votrenom',
      acepto: (enlace: ReactNode) => (
        <>J’accepte que vous conserviez mes données pour me répondre, conformément à la {enlace}.</>
      ),
      privacidad: 'politique de confidentialité',
      enviar: 'Envoyer mon idée',
      nota: 'Ce n’est pas une commande mais une demande : rien n’est facturé tant que vous n’avez pas accepté le devis.',
    },
    de: {
      recibido: 'Angekommen, danke!',
      mirarTienda: 'Solange im Shop stöbern',
      volver: 'Zur Startseite',
      respuesta: (correo: ReactNode) => (
        <>
          Wir antworten innerhalb von 24–48 Stunden an die angegebene E-Mail-Adresse – mit Preis, Lieferzeit und einem
          Farbvorschlag. Falls Sie nach drei Tagen nichts von uns gehört haben, sehen Sie bitte im Spam-Ordner nach oder
          schreiben Sie an {correo}.
        </>
      ),
      guardado:
        'Dies ist ein Demo-Shop: Die Auftragsarbeit wurde in einer Testdatenbank gespeichert, aber niemand wird sie häkeln.',
      noGuardado:
        'Dies ist ein Demo-Shop: Wir haben die Anfrage geprüft, aber sie wird weder gespeichert noch verschickt.',
      queQuieres: 'Was Sie sich wünschen',
      tipo: 'Was für ein Stück?',
      eligeOpcion: 'Bitte wählen',
      descripcion: 'Beschreiben Sie es mit Ihren Worten',
      descripcionPista: 'Je genauer, desto besser können wir kalkulieren: Farben, Größe, für wen es ist.',
      descripcionEjemplo:
        'Es ist für meine Mutter: Sie hat eine Siamkatze namens Nube, und wir hätten gern ein Amigurumi, das ihr ähnlich sieht, etwa 20 cm groß. Ich bräuchte es zu ihrem Geburtstag am 14. Oktober.',
      fecha: 'Bis wann brauchen Sie es?',
      fechaEjemplo: '14. Oktober oder „keine Eile“',
      presupuesto: 'Ihr ungefähres Budget',
      sinPresupuesto: 'Weiß ich noch nicht',
      colores: 'Farben, die Ihnen gefallen',
      opcional: '(optional)',
      coloresEjemplo: 'Salbeigrün, Naturweiß, bloß kein Rosa',
      fotos: 'Referenzfotos',
      fotosIntro:
        'Bei einem Haustier oder einer Person reichen zwei oder drei Fotos von vorn und von der Seite völlig. Ein Foto von etwas Ähnlichem, das Ihnen gefällt, hilft auch.',
      contestar: 'Wie wir Ihnen antworten',
      nombre: 'Ihr Name',
      correo: 'E-Mail-Adresse',
      correoEjemplo: 'ihrname@email.de',
      instagramAclaracion: '(optional, falls Ihnen das lieber ist)',
      instagramEjemplo: '@ihrname',
      acepto: (enlace: ReactNode) => (
        <>Ich bin einverstanden, dass Sie meine Daten speichern, um mir zu antworten, gemäß der {enlace}.</>
      ),
      privacidad: 'Datenschutzerklärung',
      enviar: 'Idee abschicken',
      nota: 'Das ist keine Bestellung, sondern eine Anfrage: Es wird nichts berechnet, bevor Sie dem Angebot zustimmen.',
    },
  },
);

const PREFIJO = 'encargo';
const inicial: EstadoEncargo = ESTADO_INICIAL;

export function FormularioEncargo() {
  const idioma = useIdioma();
  const t = useTextos(T);
  const [estado, accion, enviando] = useActionState(enviarEncargo, inicial);
  const fotos = useRef<File[]>([]);

  // Enviamos a mano para meter las fotos de la vista previa (no las del
  // input) y para que React no vacíe el formulario si hay errores.
  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    datos.delete('fotos');
    for (const foto of fotos.current) datos.append('fotos', foto);
    startTransition(() => accion(datos));
  }

  if (estado.estado === 'enviado') {
    return (
      <Confirmacion
        titulo={t.recibido}
        acciones={
          <>
            <Enlace className="btn btn-2" href={rutas.tienda}>
              {t.mirarTienda}
            </Enlace>
            <Enlace className="btn btn-4" href={rutas.inicio}>
              {t.volver}
            </Enlace>
          </>
        }
      >
        <p className="lead">
          {t.respuesta(
            <a className="enlace" href={`mailto:${DEMO.correo}`}>
              {DEMO.correo}
            </a>,
          )}
        </p>
        <p className="mini-2">{estado.guardado ? t.guardado : t.noGuardado}</p>
      </Confirmacion>
    );
  }

  const errores = estado.estado === 'error' ? estado.errores : {};
  const valores = estado.estado === 'error' ? estado.valores : {};

  return (
    <form action={accion} onSubmit={enviar} noValidate aria-describedby="encargo-nota" className="formulario">
      {estado.estado === 'error' && (
        <ResumenErrores prefijo={PREFIJO} mensaje={estado.mensaje} errores={errores} intento={estado} />
      )}

      <fieldset className="caja">
        <legend className="caja-titulo">{t.queQuieres}</legend>

        <Campo prefijo={PREFIJO} nombre="tipo" etiqueta={t.tipo} error={errores.tipo}>
          {(aria) => (
            <select {...aria} required defaultValue={valores.tipo ?? ''}>
              <option value="">{t.eligeOpcion}</option>
              {Object.entries(ROTULOS_TIPOS_ENCARGO[idioma]).map(([valor, texto]) => (
                <option key={valor} value={valor}>
                  {texto}
                </option>
              ))}
            </select>
          )}
        </Campo>

        <Campo
          prefijo={PREFIJO}
          nombre="descripcion"
          etiqueta={t.descripcion}
          pista={t.descripcionPista}
          error={errores.descripcion}
        >
          {(aria) => (
            <textarea
              {...aria}
              required
              minLength={20}
              maxLength={4000}
              rows={6}
              defaultValue={valores.descripcion}
              placeholder={t.descripcionEjemplo}
            />
          )}
        </Campo>

        <div className="par">
          <Campo prefijo={PREFIJO} nombre="fecha" etiqueta={t.fecha} error={errores.fecha}>
            {(aria) => (
              <input {...aria} type="text" maxLength={80} defaultValue={valores.fecha} placeholder={t.fechaEjemplo} />
            )}
          </Campo>
          <Campo prefijo={PREFIJO} nombre="presupuesto" etiqueta={t.presupuesto} error={errores.presupuesto}>
            {(aria) => (
              <select {...aria} defaultValue={valores.presupuesto ?? ''}>
                <option value="">{t.sinPresupuesto}</option>
                {PRESUPUESTOS.map((p, i) => (
                  <option key={p} value={p}>
                    {tipografia(ROTULOS_PRESUPUESTOS[idioma][i] ?? p)}
                  </option>
                ))}
              </select>
            )}
          </Campo>
        </div>

        <Campo prefijo={PREFIJO} nombre="colores" etiqueta={t.colores} aclaracion={t.opcional} error={errores.colores}>
          {(aria) => (
            <input {...aria} type="text" maxLength={200} defaultValue={valores.colores} placeholder={t.coloresEjemplo} />
          )}
        </Campo>
      </fieldset>

      <fieldset className="caja">
        <legend className="caja-titulo">
          {t.fotos} <span className="aclaracion">{t.opcional}</span>
        </legend>
        <p className="mini caja-intro">{t.fotosIntro}</p>
        <SubidaFotos prefijo={PREFIJO} error={errores.fotos} onCambio={(lista) => (fotos.current = lista)} />
      </fieldset>

      <fieldset className="caja">
        <legend className="caja-titulo">{t.contestar}</legend>
        <div className="par">
          <Campo prefijo={PREFIJO} nombre="nombre" etiqueta={t.nombre} error={errores.nombre}>
            {(aria) => <input {...aria} type="text" required maxLength={120} autoComplete="name" defaultValue={valores.nombre} />}
          </Campo>
          <Campo prefijo={PREFIJO} nombre="correo" etiqueta={t.correo} error={errores.correo}>
            {(aria) => (
              <input
                {...aria}
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                spellCheck={false}
                defaultValue={valores.correo}
                placeholder={t.correoEjemplo}
              />
            )}
          </Campo>
        </div>
        <Campo
          prefijo={PREFIJO}
          nombre="instagram"
          etiqueta="Instagram"
          aclaracion={t.instagramAclaracion}
          error={errores.instagram}
        >
          {(aria) => (
            <input {...aria} type="text" maxLength={31} autoComplete="off" spellCheck={false} defaultValue={valores.instagram} placeholder={t.instagramEjemplo} />
          )}
        </Campo>
        <Consentimiento prefijo={PREFIJO} error={errores.acepta} marcado={valores.acepta === 'on'}>
          {t.acepto(<Enlace href={`${rutas.legal}#privacidad`}>{t.privacidad}</Enlace>)}
        </Consentimiento>
        <CampoTrampa prefijo={PREFIJO} />
      </fieldset>

      <div className="formulario-pie">
        <BotonEnviar enviando={enviando} texto={t.enviar} />
        <p className="mini-2" id="encargo-nota">
          {t.nota}
        </p>
      </div>
    </form>
  );
}
