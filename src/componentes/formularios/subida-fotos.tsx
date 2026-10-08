'use client';

import { useEffect, useRef, useState, type DragEvent } from 'react';
import { IcoCerrar } from '@/componentes/iconos';
import { LIMITES_FOTOS, megas } from '@/lib/acciones/opciones';
import { idCampo } from './campo';

interface Foto {
  archivo: File;
  url: string;
}

interface PropsSubida {
  prefijo: string;
  /** Error que devuelve el servidor para el campo «fotos». */
  error?: string;
  onCambio: (archivos: File[]) => void;
}

const TIPOS: readonly string[] = LIMITES_FOTOS.tipos;

/** Zona para arrastrar o elegir fotos, con vista previa. Comprueba aquí
 *  tipo, peso y número para avisar al momento y no mandar megas en balde;
 *  el servidor lo vuelve a comprobar todo. Sin JavaScript queda un input
 *  de archivo normal que se envía con el formulario. */
export function SubidaFotos({ prefijo, error, onCambio }: PropsSubida) {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [aviso, setAviso] = useState('');
  const [encima, setEncima] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const urls = useRef<string[]>([]);

  const id = idCampo(prefijo, 'fotos');
  const idPista = `${id}-pista`;
  const idError = `${id}-error`;
  const mensaje = aviso || error;

  // Libera las vistas previas al salir de la página.
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  function actualizar(nuevas: Foto[]) {
    setFotos(nuevas);
    onCambio(nuevas.map((f) => f.archivo));
  }

  function anadir(lista: FileList | null) {
    if (!lista) return;
    const avisos: string[] = [];
    const nuevas = [...fotos];
    let total = nuevas.reduce((t, f) => t + f.archivo.size, 0);

    for (const archivo of Array.from(lista)) {
      if (nuevas.length >= LIMITES_FOTOS.cantidad) {
        avisos.push(`Caben ${LIMITES_FOTOS.cantidad} fotos como mucho.`);
        break;
      }
      if (!TIPOS.includes(archivo.type)) {
        avisos.push(`«${archivo.name}» no es JPG, PNG ni WebP.`);
        continue;
      }
      if (archivo.size > LIMITES_FOTOS.bytes) {
        avisos.push(`«${archivo.name}» pesa más de ${megas(LIMITES_FOTOS.bytes)}.`);
        continue;
      }
      if (total + archivo.size > LIMITES_FOTOS.bytesTotales) {
        avisos.push(`Entre todas no pueden pasar de ${megas(LIMITES_FOTOS.bytesTotales)}.`);
        break;
      }
      const url = URL.createObjectURL(archivo);
      urls.current.push(url);
      nuevas.push({ archivo, url });
      total += archivo.size;
    }

    setAviso(avisos.join(' '));
    actualizar(nuevas);
    // Vaciamos el input: la lista buena es la del estado, y así se puede
    // volver a elegir la misma foto después de quitarla.
    if (input.current) input.current.value = '';
  }

  function quitar(i: number) {
    const foto = fotos[i];
    if (!foto) return;
    URL.revokeObjectURL(foto.url);
    urls.current = urls.current.filter((u) => u !== foto.url);
    setAviso('');
    actualizar(fotos.filter((_, j) => j !== i));
    input.current?.focus();
  }

  function soltar(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setEncima(false);
    anadir(e.dataTransfer.files);
  }

  return (
    <div className={mensaje ? 'campo mal' : 'campo'}>
      <label
        htmlFor={id}
        className={encima ? 'subida encima' : 'subida'}
        onDragEnter={(e) => {
          e.preventDefault();
          setEncima(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setEncima(false)}
        onDrop={soltar}
      >
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <path d="M12 16V4M7 9l5-5 5 5" />
          <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
        </svg>
        <span className="subida-titulo">Arrastra las fotos aquí o pulsa para elegirlas</span>
        <span className="mini-2">
          JPG, PNG o WebP · hasta {LIMITES_FOTOS.cantidad} fotos de {megas(LIMITES_FOTOS.bytes)} cada una
        </span>
      </label>
      <input
        ref={input}
        className="oculto-vis subida-input"
        type="file"
        id={id}
        name="fotos"
        accept={TIPOS.join(',')}
        multiple
        aria-invalid={mensaje ? true : undefined}
        aria-describedby={[mensaje && idError, idPista].filter(Boolean).join(' ')}
        onChange={(e) => anadir(e.target.files)}
      />
      <p className="pista" id={idPista} aria-live="polite">
        {fotos.length === 0
          ? 'Ninguna foto elegida todavía.'
          : `${fotos.length} de ${LIMITES_FOTOS.cantidad} fotos elegidas.`}
      </p>
      {mensaje && (
        <p className="error" id={idError} role={aviso ? 'alert' : undefined}>
          {mensaje}
        </p>
      )}

      {fotos.length > 0 && (
        <ul className="previas">
          {fotos.map((f, i) => (
            <li key={f.url} className="previa">
              {/* Vista previa local (blob:), no pasa por el optimizador de imágenes. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt={f.archivo.name} />
              <button type="button" onClick={() => quitar(i)} aria-label={`Quitar la foto ${f.archivo.name}`}>
                <IcoCerrar width={14} height={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
