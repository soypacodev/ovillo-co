'use client';

import Link from 'next/link';
import { startTransition, useActionState, useState, type FormEvent } from 'react';
import { enviarContacto, type EstadoContacto } from '@/lib/acciones/contacto';
import { MOTIVOS_CONTACTO, MOTIVOS_CON_PEDIDO, type MotivoContacto } from '@/lib/acciones/opciones';
import { ESTADO_INICIAL } from '@/lib/acciones/tipos';
import { rutas } from '@/lib/rutas';
import { BotonEnviar } from './boton-enviar';
import { Campo, Consentimiento } from './campo';
import { CampoTrampa } from './campo-trampa';
import { Confirmacion } from './confirmacion';
import { ResumenErrores } from './resumen-errores';

const PREFIJO = 'contacto';
const inicial: EstadoContacto = ESTADO_INICIAL;

const pidePedido = (motivo: string) => MOTIVOS_CON_PEDIDO.includes(motivo as MotivoContacto);

export function FormularioContacto() {
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
        titulo="Mensaje enviado"
        acciones={
          <Link className="btn btn-2" href={rutas.inicio}>
            Volver al inicio
          </Link>
        }
      >
        <p className="lead">Te contestamos en 24–48 horas laborables. Si es urgente, dilo al principio del mensaje la próxima vez y lo miramos antes.</p>
        <p className="mini-2">
          {estado.guardado
            ? 'Esta tienda es una demostración: el mensaje se ha guardado en una base de datos de prueba y se ve en el panel del taller.'
            : 'Esta tienda es una demostración: hemos comprobado el mensaje, pero no se guarda ni se envía a nadie.'}
        </p>
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
        <Campo prefijo={PREFIJO} nombre="motivo" etiqueta="¿De qué se trata?" error={errores.motivo}>
          {(aria) => (
            <select {...aria} required defaultValue={valores.motivo ?? ''} onChange={(e) => setMotivo(e.target.value)}>
              <option value="">Elige el motivo</option>
              {Object.entries(MOTIVOS_CONTACTO).map(([valor, texto]) => (
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
            etiqueta="Número de pedido"
            aclaracion="(si lo tienes a mano)"
            pista="Está en el correo de confirmación y empieza por OV."
            error={errores.pedido}
          >
            {(aria) => (
              <input {...aria} type="text" maxLength={20} autoComplete="off" spellCheck={false} defaultValue={valores.pedido} placeholder="OV-2026-1042" />
            )}
          </Campo>
        )}

        <div className="par">
          <Campo prefijo={PREFIJO} nombre="nombre" etiqueta="Tu nombre" error={errores.nombre}>
            {(aria) => <input {...aria} type="text" required maxLength={120} autoComplete="name" defaultValue={valores.nombre} />}
          </Campo>
          <Campo prefijo={PREFIJO} nombre="correo" etiqueta="Correo electrónico" error={errores.correo}>
            {(aria) => (
              <input
                {...aria}
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                spellCheck={false}
                defaultValue={valores.correo}
                placeholder="tunombre@correo.com"
              />
            )}
          </Campo>
        </div>

        <Campo prefijo={PREFIJO} nombre="mensaje" etiqueta="Cuéntanos" error={errores.mensaje}>
          {(aria) => (
            <textarea {...aria} required minLength={10} maxLength={3000} rows={6} defaultValue={valores.mensaje} placeholder="Escribe aquí con toda la confianza." />
          )}
        </Campo>

        <Consentimiento prefijo={PREFIJO} error={errores.acepta} marcado={valores.acepta === 'on'}>
          Acepto que guardéis mis datos para contestarme, según la{' '}
          <Link href={`${rutas.legal}#privacidad`}>política de privacidad</Link>.
        </Consentimiento>
        <CampoTrampa prefijo={PREFIJO} />

        <div className="formulario-pie">
          <BotonEnviar enviando={enviando} texto="Enviar el mensaje" />
        </div>
      </div>
    </form>
  );
}
