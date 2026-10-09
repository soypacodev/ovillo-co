'use client';

// Cinta de avisos en bucle sin costura. La tira son dos mitades
// idénticas y la animación la desplaza un 50 %: el salto cae en un
// período exacto. Aquí se calcula cuántas copias hacen falta para que
// media tira cubra la pantalla, la duración para ir siempre a la misma
// velocidad y un retardo negativo para que, al volver a cargar, la cinta
// siga donde iba en lugar de empezar de cero.

import { useEffect, useRef, useState } from 'react';
import { ENVIO_GRATIS_DESDE } from '@/datos/semilla';
import { guardarLocal, leerLocal } from '@/lib/almacen-local';

import { eur } from '@/lib/formato';
import { textos, type Idioma } from '@/lib/i18n';
import { useIdioma, useTextos } from '@/lib/i18n/cliente';

const T = textos(
  {
    avisos: (gratis: string) => [
      'Hecho a mano en Málaga',
      `Envío gratis desde ${gratis}`,
      'Encargos personalizados',
      'Piezas únicas',
    ],
  },
  {
    en: {
      avisos: (gratis: string) => [
        'Handmade in Málaga',
        `Free shipping over ${gratis}`,
        'Custom orders',
        'One-of-a-kind pieces',
      ],
    },
    fr: {
      avisos: (gratis: string) => [
        'Fait main à Málaga',
        `Livraison offerte dès ${gratis}`,
        'Commandes sur mesure',
        'Pièces uniques',
      ],
    },
    de: {
      avisos: (gratis: string) => [
        'Handgemacht in Málaga',
        `Kostenloser Versand ab ${gratis}`,
        'Auftragsarbeiten',
        'Unikate',
      ],
    },
  },
);

/** «50 €» sin decimales: en la cinta sobran. */
const importeRedondo = (centimos: number, idioma: Idioma) => eur(centimos, idioma).replace(/[.,]00(?=\D|$)/, '');
const VELOCIDAD = 17; // píxeles por segundo
const MARGEN_REDIMENSION = 40;

function inicioCinta(): number {
  const ahora = Date.now();
  const guardado = Number(leerLocal('cintaInicio'));
  if (Number.isFinite(guardado) && guardado > 0 && guardado <= ahora) return guardado;
  guardarLocal('cintaInicio', ahora);
  return ahora;
}

export function CintaAvisos() {
  const idioma = useIdioma();
  const AVISOS = useTextos(T).avisos(importeRedondo(ENVIO_GRATIS_DESDE, idioma));
  const tira = useRef<HTMLUListElement>(null);
  const [copias, setCopias] = useState(1);

  // Ancho de un bloque de avisos: cada aviso lleva su espacio en el
  // relleno, así que el bloque mide lo mismo en cualquier posición.
  const medirBloque = () => {
    const items = tira.current?.children;
    if (!items) return 0;
    let ancho = 0;
    for (let i = 0; i < AVISOS.length && i < items.length; i++) {
      ancho += items[i].getBoundingClientRect().width;
    }
    return ancho;
  };

  useEffect(() => {
    let ultimoAncho = 0;
    let reloj: ReturnType<typeof setTimeout> | undefined;
    const calcular = () => {
      const bloque = medirBloque();
      if (!bloque) return;
      ultimoAncho = window.innerWidth;
      setCopias(Math.max(1, Math.ceil(window.innerWidth / bloque)));
    };
    const alRedimensionar = () => {
      if (Math.abs(window.innerWidth - ultimoAncho) < MARGEN_REDIMENSION) return;
      clearTimeout(reloj);
      reloj = setTimeout(calcular, 180);
    };
    const marco = requestAnimationFrame(calcular);
    window.addEventListener('resize', alRedimensionar);
    return () => {
      cancelAnimationFrame(marco);
      clearTimeout(reloj);
      window.removeEventListener('resize', alRedimensionar);
    };
  }, []);

  useEffect(() => {
    const ul = tira.current;
    const bloque = medirBloque();
    if (!ul || !bloque) return;
    const duracion = (bloque * copias) / VELOCIDAD;
    const desfase = ((Date.now() - inicioCinta()) / 1000) % duracion;
    ul.style.setProperty('--cinta-dur', `${duracion.toFixed(2)}s`);
    ul.style.setProperty('--cinta-retardo', `-${desfase.toFixed(3)}s`);
  }, [copias]);

  const tiraCompleta = Array.from({ length: copias * 2 }, () => AVISOS).flat();

  return (
    <div className="cinta">
      <p className="oculto-vis">{AVISOS.join('. ')}.</p>
      <ul ref={tira} aria-hidden="true">
        {tiraCompleta.map((aviso, i) => (
          <li key={i}>{aviso}</li>
        ))}
      </ul>
    </div>
  );
}
