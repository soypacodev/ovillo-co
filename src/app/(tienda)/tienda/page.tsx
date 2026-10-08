import type { Metadata } from 'next';
import Link from 'next/link';
import { Aparece } from '@/componentes/aparece';
import { BarraResultados, BotonQuitarFiltros, ZonaResultados } from '@/componentes/catalogo/barra-resultados';
import { ProveedorFiltros } from '@/componentes/catalogo/contexto-filtros';
import { PanelFiltros } from '@/componentes/catalogo/panel-filtros';
import { Migas } from '@/componentes/contenido/migas';
import { Ovillo } from '@/componentes/iconos';
import { TarjetaProducto } from '@/componentes/producto/tarjeta-producto';
import type { Categoria } from '@/lib/catalogo/tipos';
import { catalogo, leerFiltros, type FiltrosCatalogo, type ParametrosBusqueda } from '@/lib/datos';
import { metadatosPagina } from '@/lib/metadatos';
import { rutas } from '@/lib/rutas';

import '@/estilos/catalogo.css';

interface PropsTienda {
  searchParams: Promise<ParametrosBusqueda>;
}

const TITULO_GENERAL = 'Toda la tienda';
const TEXTO_GENERAL =
  'Lo que está hecho sale en 24–48 horas. Lo que pone «por encargo» lo tejemos cuando lo pides, y te decimos el plazo antes.';

/** Con una sola categoría, la página entera pasa a ser esa categoría. */
async function categoriaUnica(filtros: FiltrosCatalogo): Promise<Categoria | null> {
  if (filtros.categorias?.length !== 1) return null;
  return catalogo().categoria(filtros.categorias[0]);
}

export async function generateMetadata({ searchParams }: PropsTienda): Promise<Metadata> {
  const filtros = leerFiltros(await searchParams);
  const categoria = await categoriaUnica(filtros);
  if (categoria) {
    return metadatosPagina({
      titulo: categoria.nombre,
      descripcion: `${categoria.nombre} de crochet tejidos a mano en Málaga. ${categoria.texto}`,
      ruta: rutas.categoria(categoria.slug),
      imagen: { url: categoria.foto.src, alt: categoria.foto.alt },
    });
  }
  // Búsquedas, órdenes y otros filtros apuntan a la tienda entera como
  // canónica: son vistas de la misma página, no páginas distintas.
  return metadatosPagina({
    titulo: 'Tienda',
    descripcion:
      'Todo el catálogo de crochet hecho a mano: amigurumis, piezas de bebé, accesorios, hogar y packs de regalo.',
    ruta: rutas.tienda,
  });
}

export default async function Tienda({ searchParams }: PropsTienda) {
  const filtros = leerFiltros(await searchParams);
  const fuente = catalogo();
  const [categorias, productos, categoria] = await Promise.all([
    fuente.categorias(),
    fuente.productos(filtros),
    categoriaUnica(filtros),
  ]);
  const paraFiltros = categorias.map(({ slug, nombre }) => ({ slug, nombre }));

  return (
    <div className="wrap">
      <Migas
        actual={categoria?.nombre ?? 'Tienda'}
        camino={categoria ? [{ texto: 'Tienda', href: rutas.tienda }] : []}
      />

      <header className="cab-tienda">
        <h1 className="ent ent-1">{categoria?.nombre ?? TITULO_GENERAL}</h1>
        <p className="lead ent ent-2">{categoria?.texto ?? TEXTO_GENERAL}</p>
      </header>

      <ProveedorFiltros filtros={filtros} total={productos.length}>
        <div className="layout-tienda">
          <PanelFiltros categorias={paraFiltros} />

          <div className="resultados">
            <h2 className="oculto-vis">Piezas del catálogo</h2>
            <BarraResultados categorias={paraFiltros} />
            <ZonaResultados>
              {productos.length > 0 ? (
                <div className="rejilla">
                  {productos.map((p, i) => (
                    <TarjetaProducto
                      key={p.slug}
                      producto={p}
                      // La primera fila se ve al cargar; en móvil, solo la primera tarjeta.
                      prioridad={i === 0 ? 'alta' : i < 3 ? 'normal' : undefined}
                    />
                  ))}
                </div>
              ) : (
                <div className="sin-resultados">
                  <Ovillo width={56} height={56} className="sin-resultados-ovillo" />
                  <h2>Aquí no hay nada con esos filtros</h2>
                  <p className="lead">Prueba a quitar alguno, o escríbenos y te lo tejemos a medida.</p>
                  <div className="sin-resultados-botones">
                    <BotonQuitarFiltros />
                    <Link className="btn btn-1" href={rutas.encargos}>
                      Pedirlo a medida
                    </Link>
                  </div>
                </div>
              )}
            </ZonaResultados>
          </div>
        </div>
      </ProveedorFiltros>

      <section aria-labelledby="titulo-ayuda">
        <Aparece efecto="rev-zoom" className="banda dos-cta">
          <div>
            <h2 id="titulo-ayuda" className="banda-titulo">
              ¿No encuentras lo que buscas?
            </h2>
            <p className="banda-texto">
              Cuéntanos qué tienes en la cabeza (color, tamaño, para quién) y te decimos si podemos hacerlo y cuánto
              tardaríamos.
            </p>
          </div>
          <Link className="btn btn-1" href={rutas.encargos}>
            Pedir un encargo
          </Link>
        </Aparece>
      </section>
    </div>
  );
}
