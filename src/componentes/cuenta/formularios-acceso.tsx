'use client';

// Formularios para entrar, crear la cuenta y recuperar la contraseña.
// Todos envían a acciones de servidor; la sesión queda en cookies.

import Link from 'next/link';
import { BotonEnviar } from '@/componentes/formularios/boton-enviar';
import { Campo, Consentimiento } from '@/componentes/formularios/campo';
import {
  cambiarContrasena,
  entrar,
  enviarEnlace,
  recuperarContrasena,
  registrarse,
} from '@/lib/cuentas/acciones-acceso';
import { MIN_CONTRASENA } from '@/lib/cuentas/tipos';
import { rutas } from '@/lib/rutas';
import { AvisoEstado } from './aviso-estado';
import { useFormulario } from './use-formulario';

export function FormularioEntrar({ siguiente }: { siguiente: string }) {
  const f = useFormulario(entrar);
  const p = 'entrar';
  return (
    <form action={f.enviar} onSubmit={f.alEnviar} noValidate className="formulario-cuenta">
      <AvisoEstado estado={f.estado} prefijo={p} />
      <input type="hidden" name="siguiente" value={siguiente} />
      <Campo prefijo={p} nombre="correo" etiqueta="Correo electrónico" error={f.errores.correo}>
        {(aria) => (
          <input
            {...aria}
            type="email"
            required
            autoComplete="email"
            spellCheck={false}
            defaultValue={f.valores.correo}
            placeholder="tunombre@correo.com"
          />
        )}
      </Campo>
      <Campo prefijo={p} nombre="contrasena" etiqueta="Contraseña" error={f.errores.contrasena}>
        {(aria) => <input {...aria} type="password" required autoComplete="current-password" />}
      </Campo>
      <p className="olvido">
        <Link className="mini enlace" href={rutas.recuperar}>
          He olvidado la contraseña
        </Link>
      </p>
      <BotonEnviar enviando={f.enviando} texto="Entrar" />
    </form>
  );
}

export function FormularioEnlace({ siguiente }: { siguiente: string }) {
  const f = useFormulario(enviarEnlace);
  const p = 'enlace';
  if (f.estado.estado === 'ok') return <AvisoEstado estado={f.estado} prefijo={p} />;
  return (
    <form action={f.enviar} onSubmit={f.alEnviar} noValidate className="formulario-cuenta">
      <AvisoEstado estado={f.estado} prefijo={p} />
      <input type="hidden" name="siguiente" value={siguiente} />
      <Campo
        prefijo={p}
        nombre="correo"
        etiqueta="Correo electrónico"
        pista="Sin contraseñas: te llega un enlace y entras con un clic."
        error={f.errores.correo}
      >
        {(aria) => (
          <input {...aria} type="email" required autoComplete="email" spellCheck={false} defaultValue={f.valores.correo} />
        )}
      </Campo>
      <button type="submit" className="btn btn-3 btn-bloque" disabled={f.enviando}>
        {f.enviando ? 'Enviando…' : 'Mandarme un enlace al correo'}
      </button>
    </form>
  );
}

export function FormularioRegistro() {
  const f = useFormulario(registrarse);
  const p = 'registro';
  if (f.estado.estado === 'ok') return <AvisoEstado estado={f.estado} prefijo={p} />;
  return (
    <form action={f.enviar} onSubmit={f.alEnviar} noValidate className="formulario-cuenta">
      <AvisoEstado estado={f.estado} prefijo={p} />
      <Campo prefijo={p} nombre="nombre" etiqueta="Tu nombre" error={f.errores.nombre}>
        {(aria) => <input {...aria} type="text" required maxLength={120} autoComplete="name" defaultValue={f.valores.nombre} />}
      </Campo>
      <Campo prefijo={p} nombre="correo" etiqueta="Correo electrónico" error={f.errores.correo}>
        {(aria) => (
          <input
            {...aria}
            type="email"
            required
            autoComplete="email"
            spellCheck={false}
            defaultValue={f.valores.correo}
            placeholder="tunombre@correo.com"
          />
        )}
      </Campo>
      <Campo
        prefijo={p}
        nombre="contrasena"
        etiqueta="Contraseña"
        pista={`Mínimo ${MIN_CONTRASENA} caracteres. Mejor larga que complicada.`}
        error={f.errores.contrasena}
      >
        {(aria) => <input {...aria} type="password" required minLength={MIN_CONTRASENA} autoComplete="new-password" />}
      </Campo>
      <Consentimiento prefijo={p} error={f.errores.acepta} marcado={f.valores.acepta === 'on'}>
        Acepto la <Link href={`${rutas.legal}#privacidad`}>política de privacidad</Link> y los{' '}
        <Link href={`${rutas.legal}#venta`}>términos de venta</Link>.
      </Consentimiento>
      <label className="check" htmlFor={`${p}-boletin`}>
        <input type="checkbox" id={`${p}-boletin`} name="boletin" defaultChecked={f.valores.boletin === 'on'} />
        <span>Avisadme cuando haya piezas nuevas (como mucho, un correo al mes).</span>
      </label>
      <BotonEnviar enviando={f.enviando} texto="Crear la cuenta" />
    </form>
  );
}

export function FormularioRecuperar() {
  const f = useFormulario(recuperarContrasena);
  const p = 'recuperar';
  if (f.estado.estado === 'ok') return <AvisoEstado estado={f.estado} prefijo={p} />;
  return (
    <form action={f.enviar} onSubmit={f.alEnviar} noValidate className="formulario-cuenta">
      <AvisoEstado estado={f.estado} prefijo={p} />
      <Campo prefijo={p} nombre="correo" etiqueta="Correo de tu cuenta" error={f.errores.correo}>
        {(aria) => (
          <input {...aria} type="email" required autoComplete="email" spellCheck={false} defaultValue={f.valores.correo} />
        )}
      </Campo>
      <BotonEnviar enviando={f.enviando} texto="Mandarme el enlace" />
    </form>
  );
}

export function FormularioNuevaContrasena() {
  const f = useFormulario(cambiarContrasena);
  const p = 'nueva';
  if (f.estado.estado === 'ok') {
    return (
      <>
        <AvisoEstado estado={f.estado} prefijo={p} />
        <Link className="btn btn-1 mt-6" href={rutas.cuenta}>
          Ir a mi cuenta
        </Link>
      </>
    );
  }
  return (
    <form action={f.enviar} onSubmit={f.alEnviar} noValidate className="formulario-cuenta">
      <AvisoEstado estado={f.estado} prefijo={p} />
      <Campo
        prefijo={p}
        nombre="contrasena"
        etiqueta="Contraseña nueva"
        pista={`Mínimo ${MIN_CONTRASENA} caracteres.`}
        error={f.errores.contrasena}
      >
        {(aria) => <input {...aria} type="password" required minLength={MIN_CONTRASENA} autoComplete="new-password" />}
      </Campo>
      <Campo prefijo={p} nombre="repetida" etiqueta="Repítela" error={f.errores.repetida}>
        {(aria) => <input {...aria} type="password" required autoComplete="new-password" />}
      </Campo>
      <BotonEnviar enviando={f.enviando} texto="Guardar la contraseña" />
    </form>
  );
}
