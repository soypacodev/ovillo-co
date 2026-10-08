import type { Metadata } from 'next';
import Form from 'next/form';
import Link from 'next/link';
import { Aparece } from '@/componentes/aparece';
import { BandaCierre } from '@/componentes/contenido/banda-cierre';
import { HiloSuelto } from '@/componentes/contenido/hilo-suelto';
import { IcoLupa } from '@/componentes/iconos';
import { MarcoTienda } from '@/componentes/marco/marco-tienda';
import { TarjetaProducto } from '@/componentes/producto/tarjeta-producto';
import { catalogo } from '@/lib/datos';
import { rutas } from '@/lib/rutas';
import '@/estilos/contenido.css';

export const metadata: Metadata = {
  title: 'Aquí se ha soltado un hilo',
  description: 'La página que buscas no existe o ha cambiado de sitio.',
};

export default async function NoEncontrada() {
  const sugerencias = (await catalogo().productos()).slice(0, 4);

  // Una dirección que no existe no pasa por ningún layout de grupo: el
  // marco de la tienda se pone aquí para no dejar la página sin menú.
  return (
    <MarcoTienda>
      <div className="wrap">
        <section className="pagina-error">
          <div className="ent ent-1">
            <HiloSuelto />
          </div>
          <p className="eyebrow ent ent-2">Error 404</p>
          <h1 className="ent ent-3 mt-2">
            Aquí se ha soltado un hilo
          </h1>
          <p className="lead ent ent-4">
            Esta página no existe, o existía y la hemos movido. No pasa nada: volvemos al principio y seguimos por buen
            camino.
          </p>

          <div className="acciones-fila ent ent-5">
            <Link className="btn btn-1" href={rutas.inicio}>
              Volver al inicio
            </Link>
            <Link className="btn btn-2" href={rutas.tienda}>
              Ir a la tienda
            </Link>
          </div>

          <Form action={rutas.tienda} role="search" className="busca ent ent-6">
            <label htmlFor="busca-404" className="oculto-vis">
              Buscar en la tienda
            </label>
            <IcoLupa width={17} height={17} />
            <input type="search" id="busca-404" name="q" placeholder="¿Qué estabas buscando?" autoComplete="off" />
          </Form>
        </section>

        {sugerencias.length > 0 && (
          <section aria-labelledby="sugerencias">
            <Aparece className="cab-sec">
              <div>
                <p className="eyebrow">Por si acaso</p>
                <h2 className="mt-1" id="sugerencias">
                  Lo que más se busca
                </h2>
              </div>
              <Link className="enlace" href={rutas.tienda}>
                Ver todo el catálogo
              </Link>
            </Aparece>
            <Aparece efecto="rev-lista" className="rejilla rejilla-4 sugerencias-error">
              {sugerencias.map((p) => (
                <TarjetaProducto key={p.slug} producto={p} />
              ))}
            </Aparece>
          </section>
        )}

        <section>
          <BandaCierre
            titulo="¿Llegaste desde un enlace nuestro?"
            acciones={
              <Link className="btn btn-1" href={rutas.contacto}>
                Avisarnos
              </Link>
            }
          >
            Entonces el roto es nuestro. Dinos de dónde venías y lo arreglamos.
          </BandaCierre>
        </section>
      </div>
    </MarcoTienda>
  );
}
