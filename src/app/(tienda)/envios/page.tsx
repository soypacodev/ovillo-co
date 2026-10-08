import Link from 'next/link';
import { Aparece } from '@/componentes/aparece';
import { PreguntasFrecuentes } from '@/componentes/contenido/acordeon';
import { BandaCierre } from '@/componentes/contenido/banda-cierre';
import { CabeceraPagina } from '@/componentes/contenido/cabecera-pagina';
import { ListaSiNo } from '@/componentes/contenido/lista-si-no';
import { Pasos } from '@/componentes/contenido/pasos';
import { Migas } from '@/componentes/contenido/migas';
import { IcoInfo, IcoOk } from '@/componentes/iconos';
import type { PreguntaFrecuente } from '@/lib/catalogo/tipos';
import { catalogo } from '@/lib/datos';
import { eur } from '@/lib/formato';
import { metadatosPagina } from '@/lib/metadatos';
import { rutas } from '@/lib/rutas';
import '@/estilos/contenido.css';
import { tipografia } from '@/lib/tipografia';

export const metadata = metadatosPagina({
  titulo: 'Envíos y devoluciones',
  descripcion:
    'Precios y plazos de envío de Ovillo & Co., envío gratis, seguimiento del paquete, devoluciones en 14 días y arreglos gratuitos. Sin letra pequeña.',
  ruta: rutas.envios,
});

const SEGUIMIENTO = [
  'Al pagar te llega un correo de confirmación con el número de pedido.',
  'Si hay piezas por encargo, te avisamos el día que empezamos a tejerlas.',
  'Cuando el paquete sale del taller, te mandamos el número de seguimiento de Correos.',
  'Con ese número ves en la web de Correos dónde está, en cualquier momento.',
];

const COMO_DEVOLVER = [
  'Nos escribes diciendo qué quieres devolver (el motivo es opcional).',
  'Te contestamos en menos de 24 horas laborables con la dirección de vuelta.',
  'Lo mandas por Correos, bien envuelto para que no llegue aplastado.',
  'Al recibirlo lo revisamos y te devolvemos el dinero en 3–5 días, por el mismo medio de pago.',
];

const PREGUNTAS: PreguntaFrecuente[] = [
  {
    p: '¿Puedo cambiar la dirección después de pagar?',
    r: 'Sí, mientras el paquete no haya salido del taller. Escríbenos con el número de pedido y la dirección nueva y lo cambiamos.',
  },
  {
    p: '¿Qué pasa si no estoy en casa cuando llega?',
    r: 'Correos deja un aviso y el paquete espera en tu oficina durante quince días. Si vuelve al taller, te lo reenviamos pagando solo el segundo envío.',
  },
  {
    p: '¿Puedo pedir que lo envolváis para regalo?',
    r: 'Todo sale envuelto en papel de seda. Si es un regalo, márcalo al pagar: no incluimos el precio y añadimos la dedicatoria escrita a mano.',
  },
  {
    p: '¿Enviáis a Canarias, Ceuta, Melilla o fuera de España?',
    r: 'De momento, solo a la península y Baleares. Si estás en otro sitio, escríbenos antes de pedir y vemos el coste y los trámites.',
  },
];

export default async function PaginaEnvios() {
  const metodos = await catalogo().metodosEnvio();
  const umbral = metodos.find((m) => m.gratisDesde !== null)?.gratisDesde ?? null;
  const conUmbral = metodos.find((m) => m.gratisDesde === umbral);
  const recogida = metodos.find((m) => m.id === 'recogida');

  return (
    <div className="wrap-m">
      <Migas actual="Envíos y devoluciones" />

      <CabeceraPagina etiqueta="Sin letra pequeña" titulo="Envíos y devoluciones">
        <p>Lo que cuesta, lo que tarda y cómo se devuelve, escrito claro. Si algo no te cuadra, pregúntanos antes de pedir.</p>
      </CabeceraPagina>

      {/* ---------- Precios ---------- */}
      <section aria-labelledby="precios">
        <h2 id="precios">Cuánto cuesta y cuánto tarda</h2>
        <Aparece className="caja caja-tabla mt-5">
          <table className="tabla tabla-corta">
            <caption className="oculto-vis">Métodos de envío con su plazo y su precio</caption>
            <thead>
              <tr>
                <th scope="col">Método</th>
                <th scope="col">Plazo</th>
                <th scope="col" className="derecha">
                  Precio
                </th>
              </tr>
            </thead>
            <tbody>
              {metodos.map((m) => (
                <tr key={m.id}>
                  <th scope="row">{m.nombre}</th>
                  <td>{tipografia(m.plazo)}</td>
                  <td className="derecha precio-envio">
                    {m.precio === 0 ? 'Gratis' : eur(m.precio)}
                    {m.gratisDesde !== null && (
                      <span className="mini-2">
                        gratis desde {eur(m.gratisDesde)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Aparece>
        {umbral !== null && conUmbral && (
          <div className="aviso aviso-ok mt-5">
            <IcoOk />
            <p>
              <b>Envío gratis a partir de {eur(umbral)}</b> con {conUmbral.nombre.toLowerCase()}. Se aplica solo en la
              cesta, sin código, y cuenta lo que pagas por las piezas después de rebajas y códigos: si un código de
              descuento te deja por debajo, la cesta te avisa de cuánto falta.
            </p>
          </div>
        )}
        <p className="mini mt-4">
          Los plazos cuentan desde que el paquete sale del taller, no desde que pagas. Si tu pedido lleva piezas por
          encargo, el reloj empieza cuando terminamos de tejerlas.
        </p>
      </section>

      {/* ---------- Zonas ---------- */}
      <section aria-labelledby="zonas">
        <h2 id="zonas">A dónde llegamos</h2>
        <Aparece efecto="rev-lista" className="cols-2 mt-6">
          <div className="caja tarjeta-info">
            <h3>Península y Baleares</h3>
            <p className="mini">Con los precios de la tabla. A Baleares puede tardar un día más.</p>
          </div>
          <div className="caja tarjeta-info">
            <h3>Canarias, Ceuta y Melilla</h3>
            <p className="mini">El coste es distinto y puede haber trámites de aduana. Escríbenos antes y te damos el precio exacto.</p>
          </div>
          <div className="caja tarjeta-info">
            <h3>Resto de Europa</h3>
            <p className="mini">Caso por caso, según el peso y el país. Pregúntanos antes de hacer el pedido.</p>
          </div>
          {recogida && (
            <div className="caja tarjeta-info">
              <h3>{recogida.nombre}</h3>
              <p className="mini">
                Gratis, en Málaga. Al pagar eliges la recogida y quedamos contigo en un horario que te venga bien.
              </p>
            </div>
          )}
        </Aparece>
      </section>

      {/* ---------- Tipos de pieza ---------- */}
      <section aria-labelledby="plazos">
        <h2 id="plazos">Por qué a veces tardamos más</h2>
        <p className="lead mt-4">
          En la tienda hay dos tipos de pieza, y la ficha siempre dice cuál es:
        </p>
        <Aparece efecto="rev-lista" className="cols-2 mt-6">
          <div className="caja caja-si tarjeta-info">
            <span className="pastilla pastilla-listo">
              Listo para enviar
            </span>
            <h3 className="mt-3">Ya está tejido</h3>
            <p className="mini">Está en la estantería, envuelto y esperando. Sale del taller en 24–48 horas laborables.</p>
          </div>
          <div className="caja tarjeta-info">
            <span className="pastilla pastilla-en">Se teje al pedir</span>
            <h3 className="mt-3">Lo tejemos para ti</h3>
            <p className="mini">
              Entre 7 y 14 días según la pieza; la ficha dice cuántos. Te escribimos cuando lo empezamos y cuando sale.
            </p>
          </div>
        </Aparece>
        <p className="mini mt-5">
          Si mezclas los dos tipos en un pedido, sale todo junto cuando esté la pieza más lenta. Si prefieres recibir
          antes lo que ya está hecho, dínoslo en la nota del pedido y lo separamos sin cobrarte un segundo envío.
        </p>
      </section>

      {/* ---------- Seguimiento ---------- */}
      <section aria-labelledby="seguimiento">
        <h2 id="seguimiento">Cómo sabes dónde está</h2>
        <Aparece className="caja mt-5">
          <Pasos pasos={SEGUIMIENTO} />
        </Aparece>
        <p className="mini mt-4">
          Si pasan cinco días desde el aviso de envío y no ha llegado, escríbenos. Suele estar esperando en la oficina,
          pero la reclamación la ponemos nosotros.
        </p>
      </section>

      {/* ---------- Devoluciones ---------- */}
      <section aria-labelledby="devoluciones">
        <h2 id="devoluciones">Devoluciones y cambios</h2>
        <p className="lead mt-4">
          Tienes <b>14 días naturales</b> desde que recibes el paquete para devolverlo sin dar explicaciones. Es tu
          derecho, y nos parece justo.
        </p>
        <Aparece efecto="rev-lista" className="cols-2 mt-6">
          <ListaSiNo
            tipo="si"
            titulo="Se puede devolver"
            elementos={[
              'Cualquier pieza del catálogo sin personalizar',
              'Piezas sin usar y sin lavar',
              'Packs completos, con todo lo que llevaban',
              'Piezas con un defecto de fabricación, siempre',
            ]}
          />
          <ListaSiNo
            tipo="no"
            titulo="No se puede devolver"
            elementos={[
              'Piezas con nombres, iniciales o fechas bordadas',
              'Encargos tejidos a medida desde cero',
              'Piezas lavadas o con señales claras de uso',
            ]}
          />
        </Aparece>

        <h3 className="subtitulo-guia">Cómo se hace</h3>
        <Aparece className="caja mt-4">
          <Pasos pasos={COMO_DEVOLVER} />
        </Aparece>
        <div className="aviso mt-5">
          <IcoInfo />
          <p>
            El envío de vuelta corre de tu cuenta, salvo si la pieza llegó con un defecto o nos equivocamos nosotros: en
            ese caso lo pagamos todo. Más detalles en las{' '}
            <Link className="enlace" href={`${rutas.legal}#venta`}>
              condiciones de venta
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ---------- Roturas ---------- */}
      <section aria-labelledby="roturas">
        <h2 id="roturas">Si llega roto o se estropea después</h2>
        <div className="prosa mt-4">
          <p>
            <b>Llegó mal:</b> mándanos una foto en los dos días siguientes y te enviamos otra pieza o te devolvemos el
            dinero, lo que prefieras.
          </p>
          <p>
            <b>Se ha soltado un hilo dos años después:</b> te lo arreglamos gratis. Nos lo mandas, lo repasamos y te lo
            devolvemos; solo pagas el envío de vuelta. Esto no caduca.
          </p>
        </div>
      </section>

      {/* ---------- Preguntas ---------- */}
      <section aria-labelledby="preguntas-envios">
        <h2 id="preguntas-envios" className="mb-6">
          Otras preguntas
        </h2>
        <PreguntasFrecuentes preguntas={PREGUNTAS} />
      </section>

      <section>
        <BandaCierre
          titulo="¿Alguna duda con tu envío?"
          acciones={
            <Link className="btn btn-1" href={rutas.contacto}>
              Escribirnos
            </Link>
          }
        >
          Dinos el número de pedido y lo miramos. Si escribes por la mañana, te contestamos en el día.
        </BandaCierre>
      </section>
    </div>
  );
}
