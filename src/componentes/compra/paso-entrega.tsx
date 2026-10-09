'use client';

import { IcoAtras, IcoInfo } from '@/componentes/iconos';
import type { MetodoEnvio } from '@/lib/catalogo/tipos';
import type { LineaCesta } from '@/lib/cesta/tipos';
import { textos } from '@/lib/i18n';
import { useTextos } from '@/lib/i18n/cliente';
import { MAX_DEDICATORIA, MAX_NOTA, NOMBRES_PROVINCIA } from '@/lib/pagos/opciones';
import { CampoArea, CampoSelect, CampoTexto } from './campos';
import type { PropsPaso } from './datos-pago';
import { SelectorEnvio } from './selector-envio';

interface PropsPasoEntrega extends PropsPaso {
  metodos: MetodoEnvio[];
  lineas: LineaCesta[];
  cupon: string | null;
  volver: () => void;
}

const T = textos(
  {
    titulo: 'Cómo te lo hacemos llegar',
    metodo: 'Método de envío',
    recogida: 'Lo recoges en nuestro taller de Málaga, sin coste. Cuando esté listo te escribimos para darte cita.',
    donde: 'Dónde te lo mandamos',
    calle: 'Calle y número',
    piso: 'Piso, puerta, escalera',
    cp: 'Código postal',
    ciudad: 'Ciudad',
    provincia: 'Provincia',
    eligeProvincia: 'Elige provincia',
    toda: 'Enviamos a toda España.',
    regalo: '¿Es un regalo?',
    envolver: 'Sí, envolvedlo para regalar y no metáis el precio en el paquete ',
    gratis: '(gratis)',
    dedicatoria: 'Dedicatoria escrita a mano',
    ejemploDedicatoria: 'Para Lola, que llega en marzo. Con mucho cariño.',
    pistaDedicatoria: 'La escribimos en una tarjeta de papel de algodón. ',
    nota: 'Nota para el taller',
    ejemploNota: 'Si no estoy en casa, dejadlo en el bajo, o “Es para el día 20”',
    volver: 'Volver a tus datos',
    revisar: 'Revisar el pedido',
  },
  {
    en: {
      titulo: 'How we’ll get it to you',
      metodo: 'Delivery method',
      recogida: 'You collect it from our workshop in Málaga, free of charge. When it’s ready we’ll write to arrange a time.',
      donde: 'Where should we send it?',
      calle: 'Street and number',
      piso: 'Flat, floor, staircase',
      cp: 'Postcode',
      ciudad: 'Town or city',
      provincia: 'Province',
      eligeProvincia: 'Choose a province',
      toda: 'We deliver anywhere in Spain.',
      regalo: 'Is it a gift?',
      envolver: 'Yes, please gift-wrap it and leave the price out of the parcel ',
      gratis: '(free)',
      dedicatoria: 'Handwritten message',
      ejemploDedicatoria: 'For Lola, arriving in March. With much love.',
      pistaDedicatoria: 'We write it on a cotton paper card. ',
      nota: 'Note for the workshop',
      ejemploNota: 'If I’m not in, leave it with the neighbour downstairs, or “It’s for the 20th”',
      volver: 'Back to your details',
      revisar: 'Review your order',
    },
    fr: {
      titulo: 'Comment vous la faire parvenir',
      metodo: 'Mode de livraison',
      recogida:
        'Vous la retirez dans notre atelier de Málaga, sans frais. Quand elle sera prête, nous vous écrirons pour fixer un rendez-vous.',
      donde: 'Où vous l’envoyer',
      calle: 'Rue et numéro',
      piso: 'Étage, porte, escalier',
      cp: 'Code postal',
      ciudad: 'Ville',
      provincia: 'Province',
      eligeProvincia: 'Choisissez une province',
      toda: 'Nous livrons dans toute l’Espagne.',
      regalo: 'C’est un cadeau\u202f?',
      envolver: 'Oui, emballez-le pour offrir et ne mettez pas le prix dans le colis ',
      gratis: '(gratuit)',
      dedicatoria: 'Dédicace écrite à la main',
      ejemploDedicatoria: 'Pour Lola, qui arrive en mars. Avec toute notre tendresse.',
      pistaDedicatoria: 'Nous l’écrivons sur une carte en papier de coton. ',
      nota: 'Note pour l’atelier',
      ejemploNota: 'En cas d’absence, laissez-le chez le gardien, ou «\u00a0C’est pour le 20\u00a0»',
      volver: 'Retour à vos coordonnées',
      revisar: 'Vérifier la commande',
    },
    de: {
      titulo: 'Wie Ihre Bestellung zu Ihnen kommt',
      metodo: 'Versandart',
      recogida:
        'Sie holen es kostenlos in unserer Werkstatt in Málaga ab. Sobald es fertig ist, schreiben wir Ihnen für einen Termin.',
      donde: 'Wohin sollen wir es schicken?',
      calle: 'Straße und Hausnummer',
      piso: 'Stockwerk, Tür, Treppe',
      cp: 'Postleitzahl',
      ciudad: 'Ort',
      provincia: 'Provinz',
      eligeProvincia: 'Provinz wählen',
      toda: 'Wir liefern in ganz Spanien.',
      regalo: 'Ist es ein Geschenk?',
      envolver: 'Ja, bitte als Geschenk verpacken und keinen Preis ins Paket legen ',
      gratis: '(kostenlos)',
      dedicatoria: 'Handgeschriebene Widmung',
      ejemploDedicatoria: 'Für Lola, die im März kommt. In Liebe.',
      pistaDedicatoria: 'Wir schreiben sie auf eine Karte aus Baumwollpapier. ',
      nota: 'Notiz für die Werkstatt',
      ejemploNota: 'Wenn ich nicht da bin, bitte beim Nachbarn abgeben, oder „Es ist für den 20.“',
      volver: 'Zurück zu Ihren Daten',
      revisar: 'Bestellung prüfen',
    },
  },
);

/** Paso 2: método de envío, dirección y si es para regalo. */
export function PasoEntrega({ datos, errores, cambiar, titulo, metodos, lineas, cupon, volver }: PropsPasoEntrega) {
  const t = useTextos(T);
  return (
    <div className="paso-pago">
      <div className="caja">
        <h2 ref={titulo} tabIndex={-1}>
          {t.titulo}
        </h2>
        <SelectorEnvio
          metodos={metodos}
          lineas={lineas}
          cupon={cupon}
          valor={datos.envio}
          alCambiar={(id) => cambiar('envio', id)}
          leyenda={t.metodo}
          leyendaOculta
        />
      </div>

      {datos.envio === 'recogida' ? (
        <div className="aviso">
          <IcoInfo />
          <span>{t.recogida}</span>
        </div>
      ) : (
        <div className="caja">
          <h3>{t.donde}</h3>
          <CampoTexto
            nombre="calle"
            etiqueta={t.calle}
            autoComplete="address-line1"
            valor={datos.calle}
            alCambiar={(v) => cambiar('calle', v)}
            error={errores.calle}
          />
          <CampoTexto
            nombre="piso"
            etiqueta={t.piso}
            autoComplete="address-line2"
            opcional
            valor={datos.piso}
            alCambiar={(v) => cambiar('piso', v)}
            error={errores.piso}
          />
          <div className="par par-cp">
            <CampoTexto
              nombre="cp"
              etiqueta={t.cp}
              autoComplete="postal-code"
              inputMode="numeric"
              maxLength={5}
              valor={datos.cp}
              alCambiar={(v) => cambiar('cp', v.replace(/\D/g, ''))}
              error={errores.cp}
            />
            <CampoTexto
              nombre="ciudad"
              etiqueta={t.ciudad}
              autoComplete="address-level2"
              valor={datos.ciudad}
              alCambiar={(v) => cambiar('ciudad', v)}
              error={errores.ciudad}
            />
          </div>
          <CampoSelect
            nombre="provincia"
            etiqueta={t.provincia}
            autoComplete="address-level1"
            vacio={t.eligeProvincia}
            opciones={NOMBRES_PROVINCIA}
            valor={datos.provincia}
            alCambiar={(v) => cambiar('provincia', v)}
            error={errores.provincia}
          />
          <p className="mini-2">{t.toda}</p>
        </div>
      )}

      <div className="caja">
        <h3>{t.regalo}</h3>
        <label className="check mt-4">
          <input type="checkbox" checked={datos.regalo} onChange={(e) => cambiar('regalo', e.target.checked)} />
          <span>
            {t.envolver}
            <span className="mini-2">{t.gratis}</span>
          </span>
        </label>
        {datos.regalo && (
          <CampoArea
            nombre="dedicatoria"
            etiqueta={t.dedicatoria}
            opcional
            max={MAX_DEDICATORIA}
            rows={3}
            placeholder={t.ejemploDedicatoria}
            pista={t.pistaDedicatoria}
            valor={datos.dedicatoria}
            alCambiar={(v) => cambiar('dedicatoria', v)}
            error={errores.dedicatoria}
          />
        )}
        <CampoArea
          nombre="nota"
          etiqueta={t.nota}
          opcional
          max={MAX_NOTA}
          rows={3}
          placeholder={t.ejemploNota}
          valor={datos.nota}
          alCambiar={(v) => cambiar('nota', v)}
          error={errores.nota}
        />
      </div>

      <div className="botones-paso">
        <button type="button" className="btn btn-4 btn-p" onClick={volver}>
          <IcoAtras /> {t.volver}
        </button>
        <button type="submit" className="btn btn-1">
          {t.revisar}
        </button>
      </div>
    </div>
  );
}
