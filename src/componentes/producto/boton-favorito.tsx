'use client';

import { IcoCorazon } from '@/componentes/iconos';
import { useFavoritos } from '@/lib/cesta/contexto';
import { textos } from '@/lib/i18n';
import { useTextos } from '@/lib/i18n/cliente';

const T = textos(
  {
    guardarNombre: (nombre: string) => `Guardar ${nombre} en favoritos`,
    guardado: 'Guardado en favoritos',
    guardar: 'Guardar en favoritos',
  },
  {
    en: {
      guardarNombre: (nombre: string) => `Save ${nombre} to favourites`,
      guardado: 'Saved to favourites',
      guardar: 'Save to favourites',
    },
    fr: {
      guardarNombre: (nombre: string) => `Ajouter ${nombre} aux favoris`,
      guardado: 'Ajouté aux favoris',
      guardar: 'Ajouter aux favoris',
    },
    de: {
      guardarNombre: (nombre: string) => `${nombre} zu den Favoriten hinzufügen`,
      guardado: 'In den Favoriten gespeichert',
      guardar: 'Zu den Favoriten hinzufügen',
    },
  },
);

/** Corazón de favoritos. Con `conTexto` muestra también «Guardar» / «Guardado». */
export function BotonFavorito({
  slug,
  nombre,
  className = 'corazon',
  conTexto = false,
}: {
  slug: string;
  nombre: string;
  className?: string;
  conTexto?: boolean;
}) {
  const { esFavorito, alternar } = useFavoritos();
  const guardado = esFavorito(slug);
  const t = useTextos(T);
  return (
    <button
      type="button"
      className={className}
      aria-pressed={guardado}
      aria-label={conTexto ? undefined : t.guardarNombre(nombre)}
      onClick={() => alternar(slug)}
    >
      <IcoCorazon />
      {conTexto && <span>{guardado ? t.guardado : t.guardar}</span>}
    </button>
  );
}
