'use client';

// Formularios del área de cliente: datos personales, direcciones y
// borrar la cuenta.

import Link from 'next/link';
import { BotonEnviar } from '@/componentes/formularios/boton-enviar';
import { Campo } from '@/componentes/formularios/campo';
import { borrarCuenta, guardarDatos, guardarDireccion } from '@/lib/cuentas/acciones';
import { PALABRA_BORRAR } from '@/lib/cuentas/tipos';
import type { Direccion, Perfil } from '@/lib/cuentas/tipos';
import { NOMBRES_PROVINCIA } from '@/lib/pagos/opciones';
import { rutas } from '@/lib/rutas';
import { AvisoEstado } from './aviso-estado';
import { useFormulario } from './use-formulario';

export function FormularioDatos({ perfil }: { perfil: Pick<Perfil, 'nombre' | 'telefono' | 'aceptaBoletin'> }) {
  const f = useFormulario(guardarDatos);
  const p = 'datos';
  return (
    <form action={f.enviar} onSubmit={f.alEnviar} noValidate className="formulario-cuenta">
      <AvisoEstado estado={f.estado} prefijo={p} />
      <div className="par">
        <Campo prefijo={p} nombre="nombre" etiqueta="Nombre" error={f.errores.nombre}>
          {(aria) => (
            <input {...aria} type="text" required maxLength={120} autoComplete="name" defaultValue={f.valores.nombre ?? perfil.nombre} />
          )}
        </Campo>
        <Campo prefijo={p} nombre="telefono" etiqueta="Teléfono" aclaracion="(opcional)" error={f.errores.telefono}>
          {(aria) => (
            <input {...aria} type="tel" maxLength={30} autoComplete="tel" defaultValue={f.valores.telefono ?? perfil.telefono} />
          )}
        </Campo>
      </div>
      <label className="check" htmlFor={`${p}-boletin`}>
        <input type="checkbox" id={`${p}-boletin`} name="boletin" defaultChecked={perfil.aceptaBoletin} />
        <span>Quiero recibir el boletín cuando haya piezas nuevas (como mucho, uno al mes).</span>
      </label>
      <BotonEnviar enviando={f.enviando} texto="Guardar los datos" />
    </form>
  );
}

export function FormularioDireccion({ direccion }: { direccion?: Direccion }) {
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
        <Campo prefijo={p} nombre="destinatario" etiqueta="A nombre de" error={f.errores.destinatario}>
          {(aria) => <input {...aria} type="text" required maxLength={120} autoComplete="name" defaultValue={v('destinatario')} />}
        </Campo>
        <Campo prefijo={p} nombre="etiqueta" etiqueta="Nombre corto" aclaracion="(opcional)" pista="Casa, trabajo, la de mi madre…" error={f.errores.etiqueta}>
          {(aria) => <input {...aria} type="text" maxLength={40} defaultValue={v('etiqueta')} />}
        </Campo>
      </div>
      <Campo prefijo={p} nombre="linea1" etiqueta="Calle y número" error={f.errores.linea1}>
        {(aria) => <input {...aria} type="text" required maxLength={160} autoComplete="address-line1" defaultValue={v('linea1')} />}
      </Campo>
      <Campo prefijo={p} nombre="linea2" etiqueta="Piso, puerta…" aclaracion="(opcional)" error={f.errores.linea2}>
        {(aria) => <input {...aria} type="text" maxLength={120} autoComplete="address-line2" defaultValue={v('linea2')} />}
      </Campo>
      <div className="par">
        <Campo prefijo={p} nombre="codigo_postal" etiqueta="Código postal" error={f.errores.codigo_postal}>
          {(aria) => (
            <input {...aria} type="text" inputMode="numeric" required maxLength={5} autoComplete="postal-code" defaultValue={v('codigo_postal')} />
          )}
        </Campo>
        <Campo prefijo={p} nombre="ciudad" etiqueta="Localidad" error={f.errores.ciudad}>
          {(aria) => <input {...aria} type="text" required maxLength={80} autoComplete="address-level2" defaultValue={v('ciudad')} />}
        </Campo>
      </div>
      <div className="par">
        <Campo prefijo={p} nombre="provincia" etiqueta="Provincia" error={f.errores.provincia}>
          {(aria) => (
            <select {...aria} required autoComplete="address-level1" defaultValue={v('provincia')}>
              <option value="">Elige la provincia</option>
              {NOMBRES_PROVINCIA.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          )}
        </Campo>
        <Campo prefijo={p} nombre="telefono" etiqueta="Teléfono" aclaracion="(para el repartidor)" error={f.errores.telefono}>
          {(aria) => <input {...aria} type="tel" maxLength={30} autoComplete="tel" defaultValue={v('telefono')} />}
        </Campo>
      </div>
      <label className="check" htmlFor={`${p}-predeterminada`}>
        <input type="checkbox" id={`${p}-predeterminada`} name="predeterminada" defaultChecked={direccion?.predeterminada ?? false} />
        <span>Usar esta dirección por defecto</span>
      </label>
      <div className="acciones-fila">
        <BotonEnviar enviando={f.enviando} texto={direccion ? 'Guardar los cambios' : 'Guardar la dirección'} />
        <Link className="btn btn-4" href={rutas.cuentaDirecciones}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}

export function FormularioBorrarCuenta() {
  const f = useFormulario(borrarCuenta);
  const p = 'borrar';
  return (
    <form action={f.enviar} onSubmit={f.alEnviar} noValidate className="formulario-cuenta">
      <AvisoEstado estado={f.estado} prefijo={p} />
      <Campo
        prefijo={p}
        nombre="confirmacion"
        etiqueta={`Para confirmar, escribe ${PALABRA_BORRAR}`}
        pista="Se borran tu perfil, tus direcciones y tus favoritos. Los pedidos se conservan sin tu cuenta, porque son facturas."
        error={f.errores.confirmacion}
      >
        {(aria) => <input {...aria} type="text" required autoComplete="off" spellCheck={false} className="campo-corto" />}
      </Campo>
      <button type="submit" className="btn btn-peligro" disabled={f.enviando}>
        {f.enviando ? 'Borrando…' : 'Borrar mi cuenta para siempre'}
      </button>
    </form>
  );
}
