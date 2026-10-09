'use client';

import { startTransition, useActionState, useState, type FormEvent, type ReactNode } from 'react';
import { enviarContacto, type EstadoContacto } from '@/lib/acciones/contacto';
import { MOTIVOS_CON_PEDIDO, ROTULOS_MOTIVOS_CONTACTO, type MotivoContacto } from '@/lib/acciones/opciones';
import { ESTADO_INICIAL } from '@/lib/acciones/tipos';
import { textos } from '@/lib/i18n';
import { useIdioma, useTextos } from '@/lib/i18n/cliente';
import { Enlace } from '@/lib/i18n/enlace';
import { rutas } from '@/lib/rutas';
import { BotonEnviar } from './boton-enviar';
import { Campo, Consentimiento } from './campo';
import { CampoTrampa } from './campo-trampa';
import { Confirmacion } from './confirmacion';
import { ResumenErrores } from './resumen-errores';

const T = textos(
  {
    enviado: 'Mensaje enviado',
    volver: 'Volver al inicio',
    plazo:
      'Te contestamos en 24–48 horas laborables. Si es urgente, dilo al principio del mensaje la próxima vez y lo miramos antes.',
    guardado:
      'Esta tienda es una demostración: el mensaje se ha guardado en una base de datos de prueba y se ve en el panel del taller.',
    noGuardado: 'Esta tienda es una demostración: hemos comprobado el mensaje, pero no se guarda ni se envía a nadie.',
    motivo: '¿De qué se trata?',
    eligeMotivo: 'Elige el motivo',
    pedido: 'Número de pedido',
    pedidoAclaracion: '(si lo tienes a mano)',
    pedidoPista: 'Está en el correo de confirmación y empieza por OV.',
    nombre: 'Tu nombre',
    correo: 'Correo electrónico',
    correoEjemplo: 'tunombre@correo.com',
    mensaje: 'Cuéntanos',
    mensajeEjemplo: 'Escribe aquí con toda la confianza.',
    acepto: (enlace: ReactNode) => <>Acepto que guardéis mis datos para contestarme, según la {enlace}.</>,
    privacidad: 'política de privacidad',
    enviar: 'Enviar el mensaje',
  },
  {
    en: {
      enviado: 'Message sent',
      volver: 'Back to the home page',
      plazo:
        'We’ll reply within 24–48 working hours. If it’s urgent, say so at the start of your message next time and we’ll look at it sooner.',
      guardado:
        'This is a demo shop: your message has been saved in a test database and can be seen in the workshop dashboard.',
      noGuardado: 'This is a demo shop: we’ve checked your message, but it isn’t saved or sent to anyone.',
      motivo: 'What’s it about?',
      eligeMotivo: 'Choose a reason',
      pedido: 'Order number',
      pedidoAclaracion: '(if you have it to hand)',
      pedidoPista: 'It’s in your confirmation email and starts with OV.',
      nombre: 'Your name',
      correo: 'Email address',
      correoEjemplo: 'yourname@email.com',
      mensaje: 'Tell us',
      mensajeEjemplo: 'Write freely – we’re all ears.',
      acepto: (enlace: ReactNode) => <>I agree to you keeping my details in order to reply, as set out in the {enlace}.</>,
      privacidad: 'privacy policy',
      enviar: 'Send message',
    },
    fr: {
      enviado: 'Message envoyé',
      volver: 'Retour à l’accueil',
      plazo:
        'Nous vous répondons sous 24 à 48 heures ouvrées. Si c’est urgent, indiquez-le au début de votre message la prochaine fois et nous le traiterons plus vite.',
      guardado:
        'Cette boutique est une démonstration : le message a été enregistré dans une base de données de test et apparaît dans le tableau de bord de l’atelier.',
      noGuardado:
        'Cette boutique est une démonstration : nous avons vérifié le message, mais il n’est ni enregistré ni envoyé à personne.',
      motivo: 'De quoi s’agit-il ?',
      eligeMotivo: 'Choisissez le motif',
      pedido: 'Numéro de commande',
      pedidoAclaracion: '(si vous l’avez sous la main)',
      pedidoPista: 'Il figure dans l’e-mail de confirmation et commence par OV.',
      nombre: 'Votre nom',
      correo: 'Adresse e-mail',
      correoEjemplo: 'votrenom@email.com',
      mensaje: 'Racontez-nous',
      mensajeEjemplo: 'Écrivez-nous en toute confiance.',
      acepto: (enlace: ReactNode) => (
        <>J’accepte que vous conserviez mes données pour me répondre, conformément à la {enlace}.</>
      ),
      privacidad: 'politique de confidentialité',
      enviar: 'Envoyer le message',
    },
    de: {
      enviado: 'Nachricht gesendet',
      volver: 'Zur Startseite',
      plazo:
        'Wir antworten innerhalb von 24–48 Stunden an Werktagen. Wenn es eilt, schreiben Sie das nächstes Mal gleich an den Anfang Ihrer Nachricht, dann schauen wir früher hinein.',
      guardado:
        'Dies ist ein Demo-Shop: Die Nachricht wurde in einer Testdatenbank gespeichert und ist im Dashboard der Werkstatt zu sehen.',
      noGuardado: 'Dies ist ein Demo-Shop: Wir haben die Nachricht geprüft, aber sie wird weder gespeichert noch verschickt.',
      motivo: 'Worum geht es?',
      eligeMotivo: 'Anliegen wählen',
      pedido: 'Bestellnummer',
      pedidoAclaracion: '(falls Sie sie zur Hand haben)',
      pedidoPista: 'Sie steht in der Bestätigungs-E-Mail und beginnt mit OV.',
      nombre: 'Ihr Name',
      correo: 'E-Mail-Adresse',
      correoEjemplo: 'ihrname@email.de',
      mensaje: 'Ihre Nachricht',
      mensajeEjemplo: 'Schreiben Sie uns ganz ungezwungen.',
      acepto: (enlace: ReactNode) => (
        <>Ich bin einverstanden, dass Sie meine Daten speichern, um mir zu antworten, gemäß der {enlace}.</>
      ),
      privacidad: 'Datenschutzerklärung',
      enviar: 'Nachricht senden',
    },
  },
);

const PREFIJO = 'contacto';
const inicial: EstadoContacto = ESTADO_INICIAL;

const pidePedido = (motivo: string) => MOTIVOS_CON_PEDIDO.includes(motivo as MotivoContacto);

export function FormularioContacto() {
  const t = useTextos(T);
  const motivos = ROTULOS_MOTIVOS_CONTACTO[useIdioma()];
  const [estado, accion, enviando] = useActionState(enviarContacto, inicial);
  const [motivo, setMotivo] = useState('');

  // Enviamos a mano para que React no vacíe el formulario si hay errores.
  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    startTransition(() => accion(datos));
  }

  if (estado.estado === 'enviado') {
    return (
      <Confirmacion
        titulo={t.enviado}
        acciones={
          <Enlace className="btn btn-2" href={rutas.inicio}>
            {t.volver}
          </Enlace>
        }
      >
        <p className="lead">{t.plazo}</p>
        <p className="mini-2">{estado.guardado ? t.guardado : t.noGuardado}</p>
      </Confirmacion>
    );
  }

  const errores = estado.estado === 'error' ? estado.errores : {};
  const valores = estado.estado === 'error' ? estado.valores : {};
  // Sin JavaScript el motivo elegido vuelve en los valores del servidor.
  const motivoActual = motivo || valores.motivo || '';
  const conPedido = pidePedido(motivoActual) || Boolean(errores.pedido);

  return (
    <form action={accion} onSubmit={enviar} noValidate className="formulario">
      {estado.estado === 'error' && (
        <ResumenErrores prefijo={PREFIJO} mensaje={estado.mensaje} errores={errores} intento={estado} />
      )}

      <div className="caja">
        <Campo prefijo={PREFIJO} nombre="motivo" etiqueta={t.motivo} error={errores.motivo}>
          {(aria) => (
            <select {...aria} required defaultValue={valores.motivo ?? ''} onChange={(e) => setMotivo(e.target.value)}>
              <option value="">{t.eligeMotivo}</option>
              {Object.entries(motivos).map(([valor, texto]) => (
                <option key={valor} value={valor}>
                  {texto}
                </option>
              ))}
            </select>
          )}
        </Campo>

        {conPedido && (
          <Campo
            prefijo={PREFIJO}
            nombre="pedido"
            etiqueta={t.pedido}
            aclaracion={t.pedidoAclaracion}
            pista={t.pedidoPista}
            error={errores.pedido}
          >
            {(aria) => (
              <input {...aria} type="text" maxLength={20} autoComplete="off" spellCheck={false} defaultValue={valores.pedido} placeholder="OV-2026-1042" />
            )}
          </Campo>
        )}

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

        <Campo prefijo={PREFIJO} nombre="mensaje" etiqueta={t.mensaje} error={errores.mensaje}>
          {(aria) => (
            <textarea {...aria} required minLength={10} maxLength={3000} rows={6} defaultValue={valores.mensaje} placeholder={t.mensajeEjemplo} />
          )}
        </Campo>

        <Consentimiento prefijo={PREFIJO} error={errores.acepta} marcado={valores.acepta === 'on'}>
          {t.acepto(<Enlace href={`${rutas.legal}#privacidad`}>{t.privacidad}</Enlace>)}
        </Consentimiento>
        <CampoTrampa prefijo={PREFIJO} />

        <div className="formulario-pie">
          <BotonEnviar enviando={enviando} texto={t.enviar} />
        </div>
      </div>
    </form>
  );
}
