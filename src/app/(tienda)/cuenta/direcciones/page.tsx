import type { Metadata } from 'next';
import { AvisoSinCuentas } from '@/componentes/cuenta/aviso-sin-cuentas';
import { FormularioDireccion } from '@/componentes/cuenta/formularios-cuenta';
import { IcoOk } from '@/componentes/iconos';
import { borrarDireccion, predeterminarDireccion } from '@/lib/cuentas/acciones';
import { misDirecciones } from '@/lib/cuentas/datos';
import { MAX_DIRECCIONES } from '@/lib/cuentas/tipos';
import { exigirPerfil } from '@/lib/cuentas/sesion';
import { textos } from '@/lib/i18n';
import { Enlace } from '@/lib/i18n/enlace';
import { idiomaActual } from '@/lib/i18n/servidor';
import { parametro, type ParametrosUrl } from '@/lib/parametros';
import { rutas } from '@/lib/rutas';

const T = textos(
  {
    titulo: 'Tus direcciones',
    anadir: 'Añadir una dirección',
    guardada: 'Dirección guardada.',
    cambiarTitulo: 'Cambiar la dirección',
    nueva: 'Dirección nueva',
    porDefecto: 'Por defecto',
    cambiar: 'Cambiar',
    cambiarOculto: (nombre: string) => ` la dirección ${nombre}`,
    usarPorDefecto: 'Usar por defecto',
    usarOculto: (nombre: string) => `: ${nombre}`,
    borrar: 'Borrar',
    borrarOculto: (nombre: string) => ` la dirección ${nombre}`,
  },
  {
    en: {
      titulo: 'Your addresses',
      anadir: 'Add an address',
      guardada: 'Address saved.',
      cambiarTitulo: 'Edit the address',
      nueva: 'New address',
      porDefecto: 'Default',
      cambiar: 'Edit',
      cambiarOculto: (nombre: string) => ` the address ${nombre}`,
      usarPorDefecto: 'Make default',
      usarOculto: (nombre: string) => `: ${nombre}`,
      borrar: 'Delete',
      borrarOculto: (nombre: string) => ` the address ${nombre}`,
    },
    fr: {
      titulo: 'Vos adresses',
      anadir: 'Ajouter une adresse',
      guardada: 'Adresse enregistrée.',
      cambiarTitulo: 'Modifier l’adresse',
      nueva: 'Nouvelle adresse',
      porDefecto: 'Par défaut',
      cambiar: 'Modifier',
      cambiarOculto: (nombre: string) => ` l’adresse ${nombre}`,
      usarPorDefecto: 'Utiliser par défaut',
      usarOculto: (nombre: string) => ` : ${nombre}`,
      borrar: 'Supprimer',
      borrarOculto: (nombre: string) => ` l’adresse ${nombre}`,
    },
    de: {
      titulo: 'Ihre Adressen',
      anadir: 'Adresse hinzufügen',
      guardada: 'Adresse gespeichert.',
      cambiarTitulo: 'Adresse ändern',
      nueva: 'Neue Adresse',
      porDefecto: 'Standard',
      cambiar: 'Ändern',
      cambiarOculto: (nombre: string) => `: Adresse ${nombre}`,
      usarPorDefecto: 'Als Standard verwenden',
      usarOculto: (nombre: string) => `: ${nombre}`,
      borrar: 'Löschen',
      borrarOculto: (nombre: string) => `: Adresse ${nombre}`,
    },
  },
);

export async function generateMetadata(): Promise<Metadata> {
  return { title: T[await idiomaActual()].titulo };
}

export default async function PaginaDirecciones({ searchParams }: { searchParams: ParametrosUrl }) {
  const t = T[await idiomaActual()];
  const perfil = await exigirPerfil(rutas.cuentaDirecciones);
  if (!perfil) return <AvisoSinCuentas titulo={t.titulo} />;
  const parametros = await searchParams;
  const direcciones = await misDirecciones(perfil.id);
  const editar = parametro(parametros.editar);
  const enEdicion = direcciones.find((d) => d.id === editar);
  const nueva = parametro(parametros.nueva) === '1' || (!direcciones.length && !enEdicion);

  return (
    <section aria-labelledby="titulo-direcciones">
      <div className="cuenta-seccion-cab">
        <h2 id="titulo-direcciones" className="cuenta-seccion">
          {t.titulo}
        </h2>
        {!nueva && !enEdicion && direcciones.length < MAX_DIRECCIONES && (
          <Enlace className="btn btn-2 btn-p" href={`${rutas.cuentaDirecciones}?nueva=1`}>
            {t.anadir}
          </Enlace>
        )}
      </div>

      {parametro(parametros.guardada) === '1' && (
        <p className="aviso aviso-ok mb-6" role="status">
          <IcoOk />
          <span>{t.guardada}</span>
        </p>
      )}

      {(nueva || enEdicion) && (
        <div className="caja mb-7">
          <h3 className="titulo-mini mb-6">{enEdicion ? t.cambiarTitulo : t.nueva}</h3>
          <FormularioDireccion key={enEdicion?.id ?? 'nueva'} direccion={enEdicion} />
        </div>
      )}

      {direcciones.length > 0 && (
        <ul className="lista-direcciones">
          {direcciones.map((d) => (
            <li key={d.id} className={d.predeterminada ? 'caja direccion-tarjeta predeterminada' : 'caja direccion-tarjeta'}>
              <div className="direccion-cab">
                <h3>{d.etiqueta || d.ciudad}</h3>
                {d.predeterminada && <span className="pastilla pastilla-en">{t.porDefecto}</span>}
              </div>
              <address className="direccion">
                {d.destinatario}
                <br />
                {d.linea1}
                {d.linea2 && (
                  <>
                    <br />
                    {d.linea2}
                  </>
                )}
                <br />
                {d.codigo_postal} {d.ciudad} ({d.provincia})
                {d.telefono && (
                  <>
                    <br />
                    {d.telefono}
                  </>
                )}
              </address>
              <div className="direccion-acciones">
                <Enlace className="boton-texto" href={`${rutas.cuentaDirecciones}?editar=${d.id}`}>
                  {t.cambiar}
                  <span className="oculto-vis">{t.cambiarOculto(d.etiqueta || d.linea1)}</span>
                </Enlace>
                {!d.predeterminada && (
                  <form action={predeterminarDireccion}>
                    <input type="hidden" name="id" value={d.id} />
                    <button type="submit" className="boton-texto">
                      {t.usarPorDefecto}
                      <span className="oculto-vis">{t.usarOculto(d.etiqueta || d.linea1)}</span>
                    </button>
                  </form>
                )}
                <form action={borrarDireccion}>
                  <input type="hidden" name="id" value={d.id} />
                  <button type="submit" className="boton-texto">
                    {t.borrar}
                    <span className="oculto-vis">{t.borrarOculto(d.etiqueta || d.linea1)}</span>
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
