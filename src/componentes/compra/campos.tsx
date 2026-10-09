'use client';

// Campos del formulario de pago. Cada uno lleva su etiqueta real y, si
// hay error, lo enlaza con aria-describedby para que el lector de
// pantalla lo lea al enfocar el campo.

import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { textos } from '@/lib/i18n';
import { useTextos } from '@/lib/i18n/cliente';

const T = textos(
  {
    opcional: ' (opcional)',
    quedan: (n: number) => (n === 1 ? 'Queda 1 carácter' : `Quedan ${n} caracteres`),
  },
  {
    en: { opcional: ' (optional)', quedan: (n: number) => (n === 1 ? '1 character left' : `${n} characters left`) },
    fr: {
      opcional: ' (facultatif)',
      quedan: (n: number) => (n === 1 ? '1 caractère restant' : `${n} caractères restants`),
    },
    de: { opcional: ' (optional)', quedan: (n: number) => (n === 1 ? 'Noch 1 Zeichen' : `Noch ${n} Zeichen`) },
  },
);

export const idCampo = (nombre: string) => `pago-${nombre}`;

interface PropsBase {
  nombre: string;
  etiqueta: ReactNode;
  error?: string;
  pista?: ReactNode;
  opcional?: boolean;
  className?: string;
}

function describir(nombre: string, error?: string, pista?: ReactNode): string | undefined {
  const ids = [pista ? `${idCampo(nombre)}-pista` : null, error ? `${idCampo(nombre)}-error` : null].filter(Boolean);
  return ids.length ? ids.join(' ') : undefined;
}

function Envoltorio({ nombre, etiqueta, error, pista, opcional, className, children }: PropsBase & { children: ReactNode }) {
  const id = idCampo(nombre);
  const t = useTextos(T);
  return (
    <div className={['campo', error && 'mal', className].filter(Boolean).join(' ')}>
      <label htmlFor={id}>
        {etiqueta}
        {opcional && <span className="opcional">{t.opcional}</span>}
      </label>
      {children}
      {pista && (
        <p className="pista" id={`${id}-pista`}>
          {pista}
        </p>
      )}
      {error && (
        <p className="error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

type PropsEntrada = PropsBase & {
  valor: string;
  alCambiar: (valor: string) => void;
} & Omit<ComponentPropsWithoutRef<'input'>, 'value' | 'onChange' | 'name' | 'id'>;

export function CampoTexto({ nombre, etiqueta, error, pista, opcional, className, valor, alCambiar, type = 'text', ...resto }: PropsEntrada) {
  return (
    <Envoltorio {...{ nombre, etiqueta, error, pista, opcional, className }}>
      <input
        id={idCampo(nombre)}
        name={nombre}
        type={type}
        value={valor}
        onChange={(e) => alCambiar(e.target.value)}
        required={!opcional}
        aria-required={!opcional || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describir(nombre, error, pista)}
        {...resto}
      />
    </Envoltorio>
  );
}

type PropsArea = PropsBase & {
  valor: string;
  alCambiar: (valor: string) => void;
  max: number;
} & Omit<ComponentPropsWithoutRef<'textarea'>, 'value' | 'onChange' | 'name' | 'id' | 'maxLength'>;

export function CampoArea({ nombre, etiqueta, error, pista, opcional, className, valor, alCambiar, max, ...resto }: PropsArea) {
  const quedan = max - valor.length;
  const t = useTextos(T);
  return (
    <Envoltorio
      {...{ nombre, error, opcional, className }}
      etiqueta={etiqueta}
      pista={
        <>
          {pista}
          <span className="contador-letras" aria-live={quedan <= 20 ? 'polite' : 'off'}>
            {t.quedan(quedan)}
          </span>
        </>
      }
    >
      <textarea
        id={idCampo(nombre)}
        name={nombre}
        value={valor}
        maxLength={max}
        onChange={(e) => alCambiar(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describir(nombre, error, true)}
        {...resto}
      />
    </Envoltorio>
  );
}

type PropsSelect = PropsBase & {
  valor: string;
  alCambiar: (valor: string) => void;
  opciones: readonly string[];
  vacio: string;
} & Omit<ComponentPropsWithoutRef<'select'>, 'value' | 'onChange' | 'name' | 'id'>;

export function CampoSelect({ nombre, etiqueta, error, pista, opcional, className, valor, alCambiar, opciones, vacio, ...resto }: PropsSelect) {
  return (
    <Envoltorio {...{ nombre, etiqueta, error, pista, opcional, className }}>
      <select
        id={idCampo(nombre)}
        name={nombre}
        value={valor}
        onChange={(e) => alCambiar(e.target.value)}
        required={!opcional}
        aria-invalid={error ? true : undefined}
        aria-describedby={describir(nombre, error, pista)}
        {...resto}
      >
        <option value="">{vacio}</option>
        {opciones.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </Envoltorio>
  );
}
