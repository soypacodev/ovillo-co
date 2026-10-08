import type { Metadata } from 'next';
import Link from 'next/link';
import { AvisoSinCuentas } from '@/componentes/cuenta/aviso-sin-cuentas';
import { FormularioDireccion } from '@/componentes/cuenta/formularios-cuenta';
import { IcoOk } from '@/componentes/iconos';
import { borrarDireccion, predeterminarDireccion } from '@/lib/cuentas/acciones';
import { misDirecciones } from '@/lib/cuentas/datos';
import { MAX_DIRECCIONES } from '@/lib/cuentas/tipos';
import { exigirPerfil } from '@/lib/cuentas/sesion';
import { parametro, type ParametrosUrl } from '@/lib/parametros';
import { rutas } from '@/lib/rutas';

export const metadata: Metadata = { title: 'Tus direcciones' };

export default async function PaginaDirecciones({ searchParams }: { searchParams: ParametrosUrl }) {
  const perfil = await exigirPerfil(rutas.cuentaDirecciones);
  if (!perfil) return <AvisoSinCuentas titulo="Tus direcciones" />;
  const parametros = await searchParams;
  const direcciones = await misDirecciones(perfil.id);
  const editar = parametro(parametros.editar);
  const enEdicion = direcciones.find((d) => d.id === editar);
  const nueva = parametro(parametros.nueva) === '1' || (!direcciones.length && !enEdicion);

  return (
    <section aria-labelledby="titulo-direcciones">
      <div className="cuenta-seccion-cab">
        <h2 id="titulo-direcciones" className="cuenta-seccion">
          Tus direcciones
        </h2>
        {!nueva && !enEdicion && direcciones.length < MAX_DIRECCIONES && (
          <Link className="btn btn-2 btn-p" href={`${rutas.cuentaDirecciones}?nueva=1`}>
            Añadir una dirección
          </Link>
        )}
      </div>

      {parametro(parametros.guardada) === '1' && (
        <p className="aviso aviso-ok mb-6" role="status">
          <IcoOk />
          <span>Dirección guardada.</span>
        </p>
      )}

      {(nueva || enEdicion) && (
        <div className="caja mb-7">
          <h3 className="titulo-mini mb-6">{enEdicion ? 'Cambiar la dirección' : 'Dirección nueva'}</h3>
          <FormularioDireccion key={enEdicion?.id ?? 'nueva'} direccion={enEdicion} />
        </div>
      )}

      {direcciones.length > 0 && (
        <ul className="lista-direcciones">
          {direcciones.map((d) => (
            <li key={d.id} className={d.predeterminada ? 'caja direccion-tarjeta predeterminada' : 'caja direccion-tarjeta'}>
              <div className="direccion-cab">
                <h3>{d.etiqueta || d.ciudad}</h3>
                {d.predeterminada && <span className="pastilla pastilla-en">Por defecto</span>}
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
                <Link className="boton-texto" href={`${rutas.cuentaDirecciones}?editar=${d.id}`}>
                  Cambiar<span className="oculto-vis"> la dirección {d.etiqueta || d.linea1}</span>
                </Link>
                {!d.predeterminada && (
                  <form action={predeterminarDireccion}>
                    <input type="hidden" name="id" value={d.id} />
                    <button type="submit" className="boton-texto">
                      Usar por defecto<span className="oculto-vis">: {d.etiqueta || d.linea1}</span>
                    </button>
                  </form>
                )}
                <form action={borrarDireccion}>
                  <input type="hidden" name="id" value={d.id} />
                  <button type="submit" className="boton-texto">
                    Borrar<span className="oculto-vis"> la dirección {d.etiqueta || d.linea1}</span>
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
