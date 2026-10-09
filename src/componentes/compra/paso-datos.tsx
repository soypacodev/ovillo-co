'use client';

import { IcoAtras } from '@/componentes/iconos';
import { textos } from '@/lib/i18n';
import { useTextos } from '@/lib/i18n/cliente';
import { Enlace } from '@/lib/i18n/enlace';
import { rutas } from '@/lib/rutas';
import { CampoTexto } from './campos';
import type { PropsPaso } from './datos-pago';

const T = textos(
  {
    titulo: 'Tus datos',
    intro: 'Solo lo necesario para mandarte el paquete y avisarte.',
    correo: 'Correo electrónico',
    ejemploCorreo: 'tunombre@correo.com',
    nombre: 'Nombre',
    apellidos: 'Apellidos',
    telefono: 'Teléfono',
    pistaTelefono: 'Solo para el reparto o para darte cita si lo recoges.',
    volver: 'Volver a la cesta',
    continuar: 'Continuar a la entrega',
  },
  {
    en: {
      titulo: 'Your details',
      intro: 'Just what we need to send you the parcel and keep you posted.',
      correo: 'Email address',
      ejemploCorreo: 'yourname@email.com',
      nombre: 'First name',
      apellidos: 'Surname',
      telefono: 'Phone',
      pistaTelefono: 'Only for the courier, or to arrange a time if you collect it.',
      volver: 'Back to basket',
      continuar: 'Continue to delivery',
    },
    fr: {
      titulo: 'Vos coordonnées',
      intro: 'Juste le nécessaire pour vous envoyer le colis et vous tenir au courant.',
      correo: 'Adresse e-mail',
      ejemploCorreo: 'votrenom@email.com',
      nombre: 'Prénom',
      apellidos: 'Nom',
      telefono: 'Téléphone',
      pistaTelefono: 'Uniquement pour le livreur, ou pour fixer un rendez-vous si vous venez la retirer.',
      volver: 'Retour au panier',
      continuar: 'Continuer vers la livraison',
    },
    de: {
      titulo: 'Ihre Daten',
      intro: 'Nur das Nötigste, um Ihnen das Paket zu schicken und Sie zu informieren.',
      correo: 'E-Mail-Adresse',
      ejemploCorreo: 'ihrname@email.de',
      nombre: 'Vorname',
      apellidos: 'Nachname',
      telefono: 'Telefon',
      pistaTelefono: 'Nur für die Zustellung oder für einen Abholtermin.',
      volver: 'Zurück zum Warenkorb',
      continuar: 'Weiter zur Lieferung',
    },
  },
);

/** Paso 1: quién pide y cómo avisarle. */
export function PasoDatos({ datos, errores, cambiar, titulo }: PropsPaso) {
  const t = useTextos(T);
  return (
    <div className="paso-pago">
      <div className="caja">
        <h2 ref={titulo} tabIndex={-1}>
          {t.titulo}
        </h2>
        <p className="mini">{t.intro}</p>
        <CampoTexto
          nombre="email"
          etiqueta={t.correo}
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder={t.ejemploCorreo}
          valor={datos.email}
          alCambiar={(v) => cambiar('email', v)}
          error={errores.email}
        />
        <div className="par">
          <CampoTexto
            nombre="nombre"
            etiqueta={t.nombre}
            autoComplete="given-name"
            valor={datos.nombre}
            alCambiar={(v) => cambiar('nombre', v)}
            error={errores.nombre}
          />
          <CampoTexto
            nombre="apellidos"
            etiqueta={t.apellidos}
            autoComplete="family-name"
            valor={datos.apellidos}
            alCambiar={(v) => cambiar('apellidos', v)}
            error={errores.apellidos}
          />
        </div>
        <CampoTexto
          nombre="telefono"
          etiqueta={t.telefono}
          type="tel"
          autoComplete="tel"
          placeholder="600 000 000"
          opcional
          pista={t.pistaTelefono}
          valor={datos.telefono}
          alCambiar={(v) => cambiar('telefono', v)}
          error={errores.telefono}
        />
      </div>
      <div className="botones-paso">
        <Enlace className="btn btn-4 btn-p" href={rutas.cesta}>
          <IcoAtras /> {t.volver}
        </Enlace>
        <button type="submit" className="btn btn-1">
          {t.continuar}
        </button>
      </div>
    </div>
  );
}
