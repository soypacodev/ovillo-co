'use client';

import Link from 'next/link';
import { startTransition, useActionState, useRef, type FormEvent } from 'react';
import { enviarEncargo, type EstadoEncargo } from '@/lib/acciones/encargos';
import { PRESUPUESTOS, TIPOS_ENCARGO } from '@/lib/acciones/opciones';
import { ESTADO_INICIAL } from '@/lib/acciones/tipos';
import { tipografia } from '@/lib/tipografia';
import { DEMO, rutas } from '@/lib/rutas';
import { BotonEnviar } from './boton-enviar';
import { Campo, Consentimiento } from './campo';
import { CampoTrampa } from './campo-trampa';
import { Confirmacion } from './confirmacion';
import { ResumenErrores } from './resumen-errores';
import { SubidaFotos } from './subida-fotos';

const PREFIJO = 'encargo';
const inicial: EstadoEncargo = ESTADO_INICIAL;

export function FormularioEncargo() {
  const [estado, accion, enviando] = useActionState(enviarEncargo, inicial);
  const fotos = useRef<File[]>([]);

  // Enviamos a mano para meter las fotos de la vista previa (no las del
  // input) y para que React no vacíe el formulario si hay errores.
  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    datos.delete('fotos');
    for (const foto of fotos.current) datos.append('fotos', foto);
    startTransition(() => accion(datos));
  }

  if (estado.estado === 'enviado') {
    return (
      <Confirmacion
        titulo="Recibido, gracias"
        acciones={
          <>
            <Link className="btn btn-2" href={rutas.tienda}>
              Mirar la tienda mientras
            </Link>
            <Link className="btn btn-4" href={rutas.inicio}>
              Volver al inicio
            </Link>
          </>
        }
      >
        <p className="lead">
          Te contestamos en 24–48 horas al correo que nos has dejado, con precio, plazo y una propuesta de colores. Si en
          tres días no tienes nada nuestro, mira en la carpeta de spam o escríbenos a{' '}
          <a className="enlace" href={`mailto:${DEMO.correo}`}>
            {DEMO.correo}
          </a>
          .
        </p>
        <p className="mini-2">
          {estado.guardado
            ? 'Esta tienda es una demostración: el encargo se ha guardado en una base de datos de prueba, pero nadie va a tejerlo.'
            : 'Esta tienda es una demostración: hemos comprobado el encargo, pero no se guarda ni se envía a nadie.'}
        </p>
      </Confirmacion>
    );
  }

  const errores = estado.estado === 'error' ? estado.errores : {};
  const valores = estado.estado === 'error' ? estado.valores : {};

  return (
    <form action={accion} onSubmit={enviar} noValidate aria-describedby="encargo-nota" className="formulario">
      {estado.estado === 'error' && (
        <ResumenErrores prefijo={PREFIJO} mensaje={estado.mensaje} errores={errores} intento={estado} />
      )}

      <fieldset className="caja">
        <legend className="caja-titulo">Qué quieres</legend>

        <Campo prefijo={PREFIJO} nombre="tipo" etiqueta="¿De qué tipo?" error={errores.tipo}>
          {(aria) => (
            <select {...aria} required defaultValue={valores.tipo ?? ''}>
              <option value="">Elige una opción</option>
              {Object.entries(TIPOS_ENCARGO).map(([valor, texto]) => (
                <option key={valor} value={valor}>
                  {texto}
                </option>
              ))}
            </select>
          )}
        </Campo>

        <Campo
          prefijo={PREFIJO}
          nombre="descripcion"
          etiqueta="Descríbelo con tus palabras"
          pista="Cuanto más concreto, mejor podemos presupuestarlo: colores, tamaño, para quién es."
          error={errores.descripcion}
        >
          {(aria) => (
            <textarea
              {...aria}
              required
              minLength={20}
              maxLength={4000}
              rows={6}
              defaultValue={valores.descripcion}
              placeholder="Es para mi madre: tiene una gata siamesa que se llama Nube y queremos un amigurumi que se le parezca, de unos 20 cm. Lo necesitaría para su cumpleaños, el 14 de octubre."
            />
          )}
        </Campo>

        <div className="par">
          <Campo prefijo={PREFIJO} nombre="fecha" etiqueta="¿Para cuándo lo necesitas?" error={errores.fecha}>
            {(aria) => (
              <input {...aria} type="text" maxLength={80} defaultValue={valores.fecha} placeholder="14 de octubre, o «sin prisa»" />
            )}
          </Campo>
          <Campo prefijo={PREFIJO} nombre="presupuesto" etiqueta="Presupuesto que tienes en mente" error={errores.presupuesto}>
            {(aria) => (
              <select {...aria} defaultValue={valores.presupuesto ?? ''}>
                <option value="">Aún no lo sé</option>
                {PRESUPUESTOS.map((p) => (
                  <option key={p} value={p}>
                    {tipografia(p)}
                  </option>
                ))}
              </select>
            )}
          </Campo>
        </div>

        <Campo prefijo={PREFIJO} nombre="colores" etiqueta="Colores que te gustan" aclaracion="(opcional)" error={errores.colores}>
          {(aria) => (
            <input {...aria} type="text" maxLength={200} defaultValue={valores.colores} placeholder="verde salvia, crudo, nada de rosa" />
          )}
        </Campo>
      </fieldset>

      <fieldset className="caja">
        <legend className="caja-titulo">
          Fotos de referencia <span className="aclaracion">(opcional)</span>
        </legend>
        <p className="mini caja-intro">
          Si es una mascota o una persona, con dos o tres fotos de frente y de perfil nos sobra. También vale la foto de
          algo parecido que te guste.
        </p>
        <SubidaFotos prefijo={PREFIJO} error={errores.fotos} onCambio={(lista) => (fotos.current = lista)} />
      </fieldset>

      <fieldset className="caja">
        <legend className="caja-titulo">Cómo te contestamos</legend>
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
        <Campo
          prefijo={PREFIJO}
          nombre="instagram"
          etiqueta="Instagram"
          aclaracion="(opcional, si te va mejor por ahí)"
          error={errores.instagram}
        >
          {(aria) => (
            <input {...aria} type="text" maxLength={31} autoComplete="off" spellCheck={false} defaultValue={valores.instagram} placeholder="@tuusuario" />
          )}
        </Campo>
        <Consentimiento prefijo={PREFIJO} error={errores.acepta} marcado={valores.acepta === 'on'}>
          Acepto que guardéis mis datos para contestarme, según la{' '}
          <Link href={`${rutas.legal}#privacidad`}>política de privacidad</Link>.
        </Consentimiento>
        <CampoTrampa prefijo={PREFIJO} />
      </fieldset>

      <div className="formulario-pie">
        <BotonEnviar enviando={enviando} texto="Mandar la idea" />
        <p className="mini-2" id="encargo-nota">
          No es un pedido, es una consulta: no se cobra nada hasta que digas que sí al presupuesto.
        </p>
      </div>
    </form>
  );
}
