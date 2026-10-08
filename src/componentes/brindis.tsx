'use client';

// Aviso flotante de confirmación («añadido a la cesta», «mensaje
// enviado»…). La región aria-live existe desde el principio y solo cambia
// su contenido: así los lectores de pantalla anuncian cada aviso.

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { IcoOk } from './iconos';

const DURACION_MS = 2600;

type Avisar = (texto: string) => void;

const ContextoBrindis = createContext<Avisar | null>(null);

export function ProveedorBrindis({ children }: { children: ReactNode }) {
  const [aviso, setAviso] = useState<{ texto: string; n: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const reloj = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const avisar = useCallback<Avisar>((texto) => {
    setAviso((previo) => ({ texto, n: (previo?.n ?? 0) + 1 }));
    setVisible(true);
    clearTimeout(reloj.current);
    reloj.current = setTimeout(() => setVisible(false), DURACION_MS);
  }, []);

  useEffect(() => () => clearTimeout(reloj.current), []);

  return (
    <ContextoBrindis.Provider value={avisar}>
      {children}
      <div className={visible ? 'brindis visible' : 'brindis'} role="status" aria-live="polite">
        {aviso && (
          <span key={aviso.n} style={{ display: 'contents' }}>
            <IcoOk />
            <span>{aviso.texto}</span>
          </span>
        )}
      </div>
    </ContextoBrindis.Provider>
  );
}

/** Devuelve `avisar(texto)` para mostrar un aviso flotante. */
export function useBrindis(): Avisar {
  const avisar = useContext(ContextoBrindis);
  if (!avisar) throw new Error('useBrindis necesita <ProveedorBrindis>.');
  return avisar;
}
