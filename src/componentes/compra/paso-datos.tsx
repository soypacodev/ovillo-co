'use client';

import Link from 'next/link';
import { IcoAtras } from '@/componentes/iconos';
import { rutas } from '@/lib/rutas';
import { CampoTexto } from './campos';
import type { PropsPaso } from './datos-pago';

/** Paso 1: quién pide y cómo avisarle. */
export function PasoDatos({ datos, errores, cambiar, titulo }: PropsPaso) {
  return (
    <div className="paso-pago">
      <div className="caja">
        <h2 ref={titulo} tabIndex={-1}>
          Tus datos
        </h2>
        <p className="mini">Solo lo necesario para mandarte el paquete y avisarte.</p>
        <CampoTexto
          nombre="email"
          etiqueta="Correo electrónico"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="tunombre@correo.com"
          valor={datos.email}
          alCambiar={(v) => cambiar('email', v)}
          error={errores.email}
        />
        <div className="par">
          <CampoTexto
            nombre="nombre"
            etiqueta="Nombre"
            autoComplete="given-name"
            valor={datos.nombre}
            alCambiar={(v) => cambiar('nombre', v)}
            error={errores.nombre}
          />
          <CampoTexto
            nombre="apellidos"
            etiqueta="Apellidos"
            autoComplete="family-name"
            valor={datos.apellidos}
            alCambiar={(v) => cambiar('apellidos', v)}
            error={errores.apellidos}
          />
        </div>
        <CampoTexto
          nombre="telefono"
          etiqueta="Teléfono"
          type="tel"
          autoComplete="tel"
          placeholder="600 000 000"
          opcional
          pista="Solo para el reparto o para darte cita si lo recoges."
          valor={datos.telefono}
          alCambiar={(v) => cambiar('telefono', v)}
          error={errores.telefono}
        />
      </div>
      <div className="botones-paso">
        <Link className="btn btn-4 btn-p" href={rutas.cesta}>
          <IcoAtras /> Volver a la cesta
        </Link>
        <button type="submit" className="btn btn-1">
          Continuar a la entrega
        </button>
      </div>
    </div>
  );
}
