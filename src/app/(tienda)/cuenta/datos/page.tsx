import type { Metadata } from 'next';
import Link from 'next/link';
import { AvisoSinCuentas } from '@/componentes/cuenta/aviso-sin-cuentas';
import { FormularioBorrarCuenta, FormularioDatos } from '@/componentes/cuenta/formularios-cuenta';
import { exigirPerfil } from '@/lib/cuentas/sesion';
import { rutas } from '@/lib/rutas';

export const metadata: Metadata = { title: 'Tus datos' };

export default async function PaginaDatos() {
  const perfil = await exigirPerfil(rutas.cuentaDatos);
  if (!perfil) return <AvisoSinCuentas titulo="Tus datos" />;

  return (
    <div className="cuenta-datos">
      <section className="caja" aria-labelledby="titulo-datos">
        <h2 id="titulo-datos" className="cuenta-seccion">
          Tus datos
        </h2>
        <FormularioDatos perfil={perfil} />
      </section>

      <section className="caja" aria-labelledby="titulo-acceso">
        <h2 id="titulo-acceso" className="cuenta-seccion">
          Acceso
        </h2>
        <dl className="datos-acceso">
          <div>
            <dt>Correo</dt>
            <dd>{perfil.email}</dd>
          </div>
        </dl>
        <p className="mini mt-3">
          Para cambiar el correo, escríbenos desde el que tienes ahora y lo cambiamos nosotros.
        </p>
        <Link className="btn btn-3 btn-p mt-5" href={rutas.nuevaContrasena}>
          Cambiar la contraseña
        </Link>
      </section>

      <section className="caja zona-peligro" aria-labelledby="titulo-borrar">
        <h2 id="titulo-borrar" className="cuenta-seccion">
          Borrar la cuenta
        </h2>
        <p className="mini mt-2">
          Es inmediato y no se puede deshacer. Si solo quieres dejar de recibir correos, desmarca el boletín arriba.
        </p>
        <details className="borrar-detalles">
          <summary>Quiero borrar mi cuenta</summary>
          <FormularioBorrarCuenta />
        </details>
      </section>
    </div>
  );
}
