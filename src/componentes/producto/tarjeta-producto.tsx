import Image from 'next/image';
import Link from 'next/link';
import type { Producto } from '@/lib/catalogo/tipos';
import type { ProductoCesta } from '@/lib/cesta/tipos';
import { eur, porcentajeRebaja } from '@/lib/formato';
import { rutas } from '@/lib/rutas';
import { BotonAnadir } from './boton-anadir';
import { BotonFavorito } from './boton-favorito';
import { tipografia } from '@/lib/tipografia';

const TAMANOS_TARJETA =
  '(max-width: 620px) 92vw, (max-width: 900px) 46vw, (max-width: 1600px) 290px, 340px';

export function stockTotal(p: Pick<Producto, 'variantes'>): number {
  return p.variantes.reduce((suma, v) => suma + v.stock, 0);
}

/** Lo que necesita el botón de añadir: así no viaja el producto entero al cliente. */
export function paraCesta(p: Producto): ProductoCesta {
  return {
    slug: p.slug,
    nombre: p.nombre,
    categoria: p.categoria,
    precio: p.precio,
    encargo: p.encargo,
    dias: p.dias,
    variantes: p.variantes,
    personalizable: p.personalizable,
    fotos: p.fotos.slice(0, 1),
  };
}

export interface PropsTarjeta {
  producto: Producto;
  /** Foto visible al cargar: se pide enseguida y, si es la principal
   *  de la página, con prioridad alta. */
  prioridad?: 'alta' | 'normal';
  sizes?: string;
}

export function TarjetaProducto({ producto: p, prioridad, sizes = TAMANOS_TARJETA }: PropsTarjeta) {
  const dto = porcentajeRebaja(p.antes, p.precio);
  const agotado = stockTotal(p) === 0;
  const href = rutas.producto(p.slug);
  const foto = p.fotos[0];

  const etiquetas: { texto: string; clase: string }[] = [];
  if (agotado) etiquetas.push({ texto: 'Agotado', clase: 'pastilla-ag' });
  else if (p.etiqueta) etiquetas.push({ texto: p.etiqueta, clase: 'pastilla-of' });
  else if (dto) etiquetas.push({ texto: `−${dto} %`, clase: 'pastilla-of' });
  if (!agotado && p.novedad && !p.etiqueta) etiquetas.push({ texto: 'Novedad', clase: 'pastilla-nu' });
  if (!agotado && p.encargo) etiquetas.push({ texto: 'Por encargo', clase: 'pastilla-en' });

  return (
    <article className="tarjeta">
      <div className="marco">
        <Link href={href} tabIndex={-1} aria-hidden="true">
          {foto && (
            <Image
              src={foto.src}
              alt={foto.alt}
              fill
              sizes={sizes}
              loading={prioridad ? 'eager' : 'lazy'}
              fetchPriority={prioridad === 'alta' ? 'high' : undefined}
            />
          )}
        </Link>
        {etiquetas.length > 0 && (
          <div className="esq-i">
            {etiquetas.map((e) => (
              <span key={e.texto} className={`pastilla ${e.clase}`}>
                {e.texto}
              </span>
            ))}
          </div>
        )}
        <BotonFavorito slug={p.slug} nombre={p.nombre} />
        {agotado ? (
          <Link className="rapido" href={href}>
            Avísame cuando vuelva<span className="oculto-vis">: {p.nombre}</span>
          </Link>
        ) : (
          <BotonAnadir producto={paraCesta(p)} className="rapido">
            Añadir a la cesta<span className="oculto-vis">: {p.nombre}</span>
          </BotonAnadir>
        )}
      </div>
      <h3>
        <Link href={href}>{p.nombre}</Link>
      </h3>
      <p className="mini tarjeta-corto">
        {tipografia(p.corto)}
      </p>
      <div className="precios">
        <span className="precio">{eur(p.precio)}</span>
        {p.antes && dto > 0 && (
          <>
            <span className="antes">
              <span className="oculto-vis">Antes </span>
              {eur(p.antes)}
            </span>
            <span className="dto">−{dto} %</span>
          </>
        )}
      </div>
      <div className="puntos">
        {p.variantes.map((v) => (
          <span key={v.nombre} className="punto" style={{ background: v.color }} title={v.nombre} />
        ))}
        <span className="oculto-vis">Colores: {p.variantes.map((v) => v.nombre).join(', ')}</span>
      </div>
    </article>
  );
}
