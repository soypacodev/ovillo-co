'use client';

import { IcoCorazon } from '@/componentes/iconos';
import { useFavoritos } from '@/lib/cesta/contexto';

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
  return (
    <button
      type="button"
      className={className}
      aria-pressed={guardado}
      aria-label={conTexto ? undefined : `Guardar ${nombre} en favoritos`}
      onClick={() => alternar(slug)}
    >
      <IcoCorazon />
      {conTexto && <span>{guardado ? 'Guardado en favoritos' : 'Guardar en favoritos'}</span>}
    </button>
  );
}
