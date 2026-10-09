'use client';

import { useEffect, useRef, useState, type DragEvent } from 'react';
import { IcoCerrar } from '@/componentes/iconos';
import { LIMITES_FOTOS, megas } from '@/lib/acciones/opciones';
import { textos } from '@/lib/i18n';
import { useIdioma, useTextos } from '@/lib/i18n/cliente';
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

const T = textos(
  {
    caben: (n: number) => `Caben ${n} fotos como mucho.`,
    tipo: (nombre: string) => `«${nombre}» no es JPG, PNG ni WebP.`,
    pesada: (nombre: string, tope: string) => `«${nombre}» pesa más de ${tope}.`,
    total: (tope: string) => `Entre todas no pueden pasar de ${tope}.`,
    titulo: 'Arrastra las fotos aquí o pulsa para elegirlas',
    limites: (n: number, tope: string) => `JPG, PNG o WebP · hasta ${n} fotos de ${tope} cada una`,
    ninguna: 'Ninguna foto elegida todavía.',
    elegidas: (n: number, max: number) => `${n} de ${max} fotos elegidas.`,
    quitar: (nombre: string) => `Quitar la foto ${nombre}`,
  },
  {
    en: {
      caben: (n: number) => `You can add ${n} photos at most.`,
      tipo: (nombre: string) => `“${nombre}” isn’t a JPG, PNG or WebP.`,
      pesada: (nombre: string, tope: string) => `“${nombre}” is larger than ${tope}.`,
      total: (tope: string) => `Together they can’t be more than ${tope}.`,
      titulo: 'Drag your photos here or click to choose them',
      limites: (n: number, tope: string) => `JPG, PNG or WebP · up to ${n} photos of ${tope} each`,
      ninguna: 'No photos chosen yet.',
      elegidas: (n: number, max: number) => `${n} of ${max} photos chosen.`,
      quitar: (nombre: string) => `Remove photo ${nombre}`,
    },
    fr: {
      caben: (n: number) => `${n} photos maximum.`,
      tipo: (nombre: string) => `« ${nombre} » n’est ni un JPG, ni un PNG, ni un WebP.`,
      pesada: (nombre: string, tope: string) => `« ${nombre} » pèse plus de ${tope}.`,
      total: (tope: string) => `Au total, elles ne peuvent pas dépasser ${tope}.`,
      titulo: 'Glissez vos photos ici ou cliquez pour les choisir',
      limites: (n: number, tope: string) => `JPG, PNG ou WebP · jusqu’à ${n} photos de ${tope} chacune`,
      ninguna: 'Aucune photo choisie pour l’instant.',
      elegidas: (n: number, max: number) => `${n} photo${n > 1 ? 's' : ''} choisie${n > 1 ? 's' : ''} sur ${max}.`,
      quitar: (nombre: string) => `Retirer la photo ${nombre}`,
    },
    de: {
      caben: (n: number) => `Höchstens ${n} Fotos möglich.`,
      tipo: (nombre: string) => `„${nombre}“ ist kein JPG, PNG oder WebP.`,
      pesada: (nombre: string, tope: string) => `„${nombre}“ ist größer als ${tope}.`,
      total: (tope: string) => `Zusammen dürfen sie nicht größer als ${tope} sein.`,
      titulo: 'Fotos hierher ziehen oder klicken, um sie auszuwählen',
      limites: (n: number, tope: string) => `JPG, PNG oder WebP · bis zu ${n} Fotos mit je ${tope}`,
      ninguna: 'Noch kein Foto ausgewählt.',
      elegidas: (n: number, max: number) => `${n} von ${max} Fotos ausgewählt.`,
      quitar: (nombre: string) => `Foto ${nombre} entfernen`,
    },
  },
);

/** Zona para arrastrar o elegir fotos, con vista previa. Comprueba aquí
 *  tipo, peso y número para avisar al momento y no mandar megas en balde;
 *  el servidor lo vuelve a comprobar todo. Sin JavaScript queda un input
 *  de archivo normal que se envía con el formulario. */
export function SubidaFotos({ prefijo, error, onCambio }: PropsSubida) {
  const idioma = useIdioma();
  const t = useTextos(T);
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
        avisos.push(t.caben(LIMITES_FOTOS.cantidad));
        break;
      }
      if (!TIPOS.includes(archivo.type)) {
        avisos.push(t.tipo(archivo.name));
        continue;
      }
      if (archivo.size > LIMITES_FOTOS.bytes) {
        avisos.push(t.pesada(archivo.name, megas(LIMITES_FOTOS.bytes, idioma)));
        continue;
      }
      if (total + archivo.size > LIMITES_FOTOS.bytesTotales) {
        avisos.push(t.total(megas(LIMITES_FOTOS.bytesTotales, idioma)));
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
        <span className="subida-titulo">{t.titulo}</span>
        <span className="mini-2">{t.limites(LIMITES_FOTOS.cantidad, megas(LIMITES_FOTOS.bytes, idioma))}</span>
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
        {fotos.length === 0 ? t.ninguna : t.elegidas(fotos.length, LIMITES_FOTOS.cantidad)}
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
              <button type="button" onClick={() => quitar(i)} aria-label={t.quitar(f.archivo.name)}>
                <IcoCerrar width={14} height={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
