'use client';

// Fotos de un producto: subir nuevas a Storage, elegir la principal y
// quitar. Cada acción es un formulario propio; el servidor valida tipo
// real (por los primeros bytes), peso y cantidad.

import Image from 'next/image';
import { startTransition, useActionState, type FormEvent } from 'react';
import { megas } from '@/lib/acciones/opciones';
import { hacerFotoPrincipal, quitarFoto, subirFotosProducto } from '@/lib/panel/acciones';
import { LIMITES_FOTOS_PRODUCTO } from '@/lib/panel/limites';
import type { FotoProductoPanel } from '@/lib/panel/filas';
import { PANEL_INICIAL, type ResultadoPanel } from '@/lib/panel/tipos-accion';
import { AvisoPanel } from './aviso-panel';
import { BotonGuardar } from './boton-guardar';

type Accion = (previo: ResultadoPanel, datos: FormData) => Promise<ResultadoPanel>;

function useAccion(accion: Accion, bloqueado: string | null) {
  const [resultado, enviar, enviando] = useActionState(accion, PANEL_INICIAL);
  const alEnviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (bloqueado) return;
    const datos = new FormData(e.currentTarget);
    startTransition(() => enviar(datos));
  };
  return { resultado, enviar, enviando, alEnviar };
}

function AccionesFoto({ foto, productoId, principal, bloqueado }: { foto: FotoProductoPanel; productoId: string; principal: boolean; bloqueado: string | null }) {
  const portada = useAccion(hacerFotoPrincipal, bloqueado);
  const quitar = useAccion(quitarFoto, bloqueado);
  return (
    <div className="foto-acciones">
      {!principal && (
        <form action={portada.enviar} onSubmit={portada.alEnviar}>
          <input type="hidden" name="id" value={foto.id} />
          <input type="hidden" name="producto_id" value={productoId} />
          <BotonGuardar
            texto={
              <>
                Hacer principal<span className="oculto-vis">: {foto.alt}</span>
              </>
            }
            enviando={portada.enviando}
            bloqueado={bloqueado}
            motivoVisible={false}
            className="boton-texto"
          />
        </form>
      )}
      <form action={quitar.enviar} onSubmit={quitar.alEnviar}>
        <input type="hidden" name="id" value={foto.id} />
        <input type="hidden" name="producto_id" value={productoId} />
        <BotonGuardar
          texto={
            <>
              Quitar<span className="oculto-vis"> la foto: {foto.alt}</span>
            </>
          }
          enviando={quitar.enviando}
          bloqueado={bloqueado}
          motivoVisible={false}
          className="boton-texto"
        />
      </form>
      {[portada.resultado, quitar.resultado].map((r, i) => r.estado === 'error' && <AvisoPanel key={i} resultado={r} />)}
    </div>
  );
}

export function FotosProducto({ productoId, fotos, bloqueado }: { productoId: string; fotos: FotoProductoPanel[]; bloqueado: string | null }) {
  const subir = useAccion(subirFotosProducto, bloqueado);
  const errores = subir.resultado.estado === 'error' ? subir.resultado.errores : {};

  return (
    <div className="fotos-producto">
      {fotos.length ? (
        <ul className="galeria-panel">
          {fotos.map((f, i) => (
            <li key={f.id}>
              <span className="galeria-foto">
                <Image src={f.url} alt={f.alt} fill sizes="(max-width: 620px) 45vw, 180px" />
                {i === 0 && <span className="pastilla pastilla-of galeria-principal">Principal</span>}
              </span>
              <AccionesFoto foto={f} productoId={productoId} principal={i === 0} bloqueado={bloqueado} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mini">Sin fotos todavía: la tarjeta de la tienda saldrá vacía.</p>
      )}

      <form action={subir.enviar} onSubmit={subir.alEnviar} className="panel-form subir-fotos" encType="multipart/form-data" noValidate>
        <AvisoPanel resultado={subir.resultado} />
        <input type="hidden" name="producto_id" value={productoId} />
        <div className={errores.fotos ? 'campo mal' : 'campo'}>
          <label htmlFor="fotos-nuevas">Añadir fotos</label>
          <input
            id="fotos-nuevas"
            name="fotos"
            type="file"
            multiple
            accept={LIMITES_FOTOS_PRODUCTO.tipos.join(',')}
            aria-describedby="fotos-nuevas-ayuda"
            aria-invalid={errores.fotos ? true : undefined}
          />
          <p className={errores.fotos ? 'error' : 'pista'} id="fotos-nuevas-ayuda">
            {errores.fotos ??
              `JPG, PNG o WebP. Hasta ${LIMITES_FOTOS_PRODUCTO.cantidad} cada vez, ${megas(LIMITES_FOTOS_PRODUCTO.bytes)} por foto. Mejor en vertical (4:5).`}
          </p>
        </div>
        <div className={errores.alt ? 'campo mal' : 'campo'}>
          <label htmlFor="fotos-alt">Qué se ve en la foto</label>
          <input
            id="fotos-alt"
            name="alt"
            type="text"
            maxLength={200}
            placeholder="Pulpito gris perla sentado sobre una manta"
            aria-describedby="fotos-alt-ayuda"
            aria-invalid={errores.alt ? true : undefined}
          />
          <p className={errores.alt ? 'error' : 'pista'} id="fotos-alt-ayuda">
            {errores.alt ?? 'Es el texto que leen los lectores de pantalla y los buscadores.'}
          </p>
        </div>
        <BotonGuardar texto="Subir las fotos" enviando={subir.enviando} bloqueado={bloqueado} className="btn btn-2 btn-p" />
      </form>
    </div>
  );
}
