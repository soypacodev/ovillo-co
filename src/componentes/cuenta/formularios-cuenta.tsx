'use client';

// Formularios del área de cliente: datos personales, direcciones y
// borrar la cuenta.

import { BotonEnviar } from '@/componentes/formularios/boton-enviar';
import { Campo } from '@/componentes/formularios/campo';
import { borrarCuenta, guardarDatos, guardarDireccion } from '@/lib/cuentas/acciones';
import { PALABRAS_BORRAR } from '@/lib/cuentas/tipos';
import type { Direccion, Perfil } from '@/lib/cuentas/tipos';
import { textos } from '@/lib/i18n';
import { useIdioma, useTextos } from '@/lib/i18n/cliente';
import { Enlace } from '@/lib/i18n/enlace';
import { NOMBRES_PROVINCIA } from '@/lib/pagos/opciones';
import { rutas } from '@/lib/rutas';
import { AvisoEstado } from './aviso-estado';
import { useFormulario } from './use-formulario';

const T = textos(
  {
    nombre: 'Nombre',
    telefono: 'Teléfono',
    opcional: '(opcional)',
    boletin: 'Quiero recibir el boletín cuando haya piezas nuevas (como mucho, uno al mes).',
    guardarDatos: 'Guardar los datos',
    aNombreDe: 'A nombre de',
    nombreCorto: 'Nombre corto',
    pistaNombreCorto: 'Casa, trabajo, la de mi madre…',
    calle: 'Calle y número',
    piso: 'Piso, puerta…',
    codigoPostal: 'Código postal',
    localidad: 'Localidad',
    provincia: 'Provincia',
    eligeProvincia: 'Elige la provincia',
    paraRepartidor: '(para el repartidor)',
    porDefecto: 'Usar esta dirección por defecto',
    guardarCambios: 'Guardar los cambios',
    guardarDireccion: 'Guardar la dirección',
    cancelar: 'Cancelar',
    confirmar: (palabra: string) => `Para confirmar, escribe ${palabra}`,
    pistaBorrar:
      'Se borran tu perfil, tus direcciones y tus favoritos. Los pedidos se conservan sin tu cuenta, porque son facturas.',
    borrando: 'Borrando…',
    borrar: 'Borrar mi cuenta para siempre',
  },
  {
    en: {
      nombre: 'Name',
      telefono: 'Phone',
      opcional: '(optional)',
      boletin: 'I’d like the newsletter when there are new pieces (one a month at most).',
      guardarDatos: 'Save my details',
      aNombreDe: 'Recipient',
      nombreCorto: 'Short name',
      pistaNombreCorto: 'Home, work, my mum’s…',
      calle: 'Street and number',
      piso: 'Floor, flat…',
      codigoPostal: 'Postcode',
      localidad: 'Town or city',
      provincia: 'Province',
      eligeProvincia: 'Choose the province',
      paraRepartidor: '(for the courier)',
      porDefecto: 'Use this as my default address',
      guardarCambios: 'Save the changes',
      guardarDireccion: 'Save the address',
      cancelar: 'Cancel',
      confirmar: (palabra: string) => `To confirm, type ${palabra}`,
      pistaBorrar:
        'Your profile, addresses and favourites will be deleted. Orders are kept without your account, because they are invoices.',
      borrando: 'Deleting…',
      borrar: 'Delete my account for good',
    },
    fr: {
      nombre: 'Nom',
      telefono: 'Téléphone',
      opcional: '(facultatif)',
      boletin: 'Je souhaite recevoir la newsletter quand il y a de nouvelles pièces (une par mois au maximum).',
      guardarDatos: 'Enregistrer mes informations',
      aNombreDe: 'Au nom de',
      nombreCorto: 'Nom court',
      pistaNombreCorto: 'Maison, travail, chez ma mère…',
      calle: 'Rue et numéro',
      piso: 'Étage, porte…',
      codigoPostal: 'Code postal',
      localidad: 'Ville',
      provincia: 'Province',
      eligeProvincia: 'Choisissez la province',
      paraRepartidor: '(pour le livreur)',
      porDefecto: 'Utiliser cette adresse par défaut',
      guardarCambios: 'Enregistrer les modifications',
      guardarDireccion: 'Enregistrer l’adresse',
      cancelar: 'Annuler',
      confirmar: (palabra: string) => `Pour confirmer, tapez ${palabra}`,
      pistaBorrar:
        'Votre profil, vos adresses et vos favoris seront supprimés. Les commandes sont conservées sans votre compte, car ce sont des factures.',
      borrando: 'Suppression…',
      borrar: 'Supprimer mon compte définitivement',
    },
    de: {
      nombre: 'Name',
      telefono: 'Telefon',
      opcional: '(optional)',
      boletin: 'Ich möchte den Newsletter erhalten, wenn es neue Stücke gibt (höchstens einmal im Monat).',
      guardarDatos: 'Daten speichern',
      aNombreDe: 'Empfänger',
      nombreCorto: 'Kurzname',
      pistaNombreCorto: 'Zuhause, Arbeit, bei meiner Mutter…',
      calle: 'Straße und Hausnummer',
      piso: 'Stockwerk, Tür…',
      codigoPostal: 'Postleitzahl',
      localidad: 'Ort',
      provincia: 'Provinz',
      eligeProvincia: 'Provinz wählen',
      paraRepartidor: '(für den Zusteller)',
      porDefecto: 'Diese Adresse als Standard verwenden',
      guardarCambios: 'Änderungen speichern',
      guardarDireccion: 'Adresse speichern',
      cancelar: 'Abbrechen',
      confirmar: (palabra: string) => `Geben Sie zur Bestätigung ${palabra} ein`,
      pistaBorrar:
        'Ihr Profil, Ihre Adressen und Ihre Favoriten werden gelöscht. Die Bestellungen bleiben ohne Ihr Konto erhalten, da es Rechnungen sind.',
      borrando: 'Wird gelöscht…',
      borrar: 'Mein Konto endgültig löschen',
    },
  },
);

export function FormularioDatos({ perfil }: { perfil: Pick<Perfil, 'nombre' | 'telefono' | 'aceptaBoletin'> }) {
  const t = useTextos(T);
  const f = useFormulario(guardarDatos);
  const p = 'datos';
  return (
    <form action={f.enviar} onSubmit={f.alEnviar} noValidate className="formulario-cuenta">
      <AvisoEstado estado={f.estado} prefijo={p} />
      <div className="par">
        <Campo prefijo={p} nombre="nombre" etiqueta={t.nombre} error={f.errores.nombre}>
          {(aria) => (
            <input {...aria} type="text" required maxLength={120} autoComplete="name" defaultValue={f.valores.nombre ?? perfil.nombre} />
          )}
        </Campo>
        <Campo prefijo={p} nombre="telefono" etiqueta={t.telefono} aclaracion={t.opcional} error={f.errores.telefono}>
          {(aria) => (
            <input {...aria} type="tel" maxLength={30} autoComplete="tel" defaultValue={f.valores.telefono ?? perfil.telefono} />
          )}
        </Campo>
      </div>
      <label className="check" htmlFor={`${p}-boletin`}>
        <input type="checkbox" id={`${p}-boletin`} name="boletin" defaultChecked={perfil.aceptaBoletin} />
        <span>{t.boletin}</span>
      </label>
      <BotonEnviar enviando={f.enviando} texto={t.guardarDatos} />
    </form>
  );
}

export function FormularioDireccion({ direccion }: { direccion?: Direccion }) {
  const t = useTextos(T);
  const f = useFormulario(guardarDireccion);
  const p = direccion ? `dir-${direccion.id.slice(0, 8)}` : 'dir-nueva';
  const v = (campo: keyof Direccion) => {
    const valor = f.valores[campo as keyof typeof f.valores];
    if (typeof valor === 'string') return valor;
    const original = direccion?.[campo];
    return typeof original === 'string' ? original : '';
  };

  return (
    <form action={f.enviar} onSubmit={f.alEnviar} noValidate className="formulario-cuenta">
      <AvisoEstado estado={f.estado} prefijo={p} />
      <input type="hidden" name="id" value={direccion?.id ?? ''} />
      <div className="par">
        <Campo prefijo={p} nombre="destinatario" etiqueta={t.aNombreDe} error={f.errores.destinatario}>
          {(aria) => <input {...aria} type="text" required maxLength={120} autoComplete="name" defaultValue={v('destinatario')} />}
        </Campo>
        <Campo prefijo={p} nombre="etiqueta" etiqueta={t.nombreCorto} aclaracion={t.opcional} pista={t.pistaNombreCorto} error={f.errores.etiqueta}>
          {(aria) => <input {...aria} type="text" maxLength={40} defaultValue={v('etiqueta')} />}
        </Campo>
      </div>
      <Campo prefijo={p} nombre="linea1" etiqueta={t.calle} error={f.errores.linea1}>
        {(aria) => <input {...aria} type="text" required maxLength={160} autoComplete="address-line1" defaultValue={v('linea1')} />}
      </Campo>
      <Campo prefijo={p} nombre="linea2" etiqueta={t.piso} aclaracion={t.opcional} error={f.errores.linea2}>
        {(aria) => <input {...aria} type="text" maxLength={120} autoComplete="address-line2" defaultValue={v('linea2')} />}
      </Campo>
      <div className="par">
        <Campo prefijo={p} nombre="codigo_postal" etiqueta={t.codigoPostal} error={f.errores.codigo_postal}>
          {(aria) => (
            <input {...aria} type="text" inputMode="numeric" required maxLength={5} autoComplete="postal-code" defaultValue={v('codigo_postal')} />
          )}
        </Campo>
        <Campo prefijo={p} nombre="ciudad" etiqueta={t.localidad} error={f.errores.ciudad}>
          {(aria) => <input {...aria} type="text" required maxLength={80} autoComplete="address-level2" defaultValue={v('ciudad')} />}
        </Campo>
      </div>
      <div className="par">
        <Campo prefijo={p} nombre="provincia" etiqueta={t.provincia} error={f.errores.provincia}>
          {(aria) => (
            <select {...aria} required autoComplete="address-level1" defaultValue={v('provincia')}>
              <option value="">{t.eligeProvincia}</option>
              {NOMBRES_PROVINCIA.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          )}
        </Campo>
        <Campo prefijo={p} nombre="telefono" etiqueta={t.telefono} aclaracion={t.paraRepartidor} error={f.errores.telefono}>
          {(aria) => <input {...aria} type="tel" maxLength={30} autoComplete="tel" defaultValue={v('telefono')} />}
        </Campo>
      </div>
      <label className="check" htmlFor={`${p}-predeterminada`}>
        <input type="checkbox" id={`${p}-predeterminada`} name="predeterminada" defaultChecked={direccion?.predeterminada ?? false} />
        <span>{t.porDefecto}</span>
      </label>
      <div className="acciones-fila">
        <BotonEnviar enviando={f.enviando} texto={direccion ? t.guardarCambios : t.guardarDireccion} />
        <Enlace className="btn btn-4" href={rutas.cuentaDirecciones}>
          {t.cancelar}
        </Enlace>
      </div>
    </form>
  );
}

export function FormularioBorrarCuenta() {
  const t = useTextos(T);
  const idioma = useIdioma();
  const f = useFormulario(borrarCuenta);
  const p = 'borrar';
  return (
    <form action={f.enviar} onSubmit={f.alEnviar} noValidate className="formulario-cuenta">
      <AvisoEstado estado={f.estado} prefijo={p} />
      <Campo
        prefijo={p}
        nombre="confirmacion"
        etiqueta={t.confirmar(PALABRAS_BORRAR[idioma])}
        pista={t.pistaBorrar}
        error={f.errores.confirmacion}
      >
        {(aria) => <input {...aria} type="text" required autoComplete="off" spellCheck={false} className="campo-corto" />}
      </Campo>
      <button type="submit" className="btn btn-peligro" disabled={f.enviando}>
        {f.enviando ? t.borrando : t.borrar}
      </button>
    </form>
  );
}
