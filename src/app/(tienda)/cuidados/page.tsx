import Link from 'next/link';
import { BandaCierre } from '@/componentes/contenido/banda-cierre';
import { CabeceraPagina } from '@/componentes/contenido/cabecera-pagina';
import { CajaTabla } from '@/componentes/contenido/caja-tabla';
import { IndiceLateral, type EntradaIndice } from '@/componentes/contenido/indice-lateral';
import { ListaSiNo } from '@/componentes/contenido/lista-si-no';
import { Migas } from '@/componentes/contenido/migas';
import { IcoInfo } from '@/componentes/iconos';
import { metadatosPagina } from '@/lib/metadatos';
import { rutas } from '@/lib/rutas';
import '@/estilos/contenido.css';

export const metadata = metadatosPagina({
  titulo: 'Cómo lavar y cuidar el crochet',
  descripcion:
    'Guía práctica para lavar, secar y guardar piezas de crochet sin estropearlas: algodón, merino, trapillo, amigurumis y mantas de bebé. Cómo quitar bolitas y arreglar un hilo suelto.',
  ruta: rutas.cuidados,
  tipo: 'article',
});

const APARTADOS: EntradaIndice[] = [
  { id: 'lavar', texto: 'Lavar' },
  { id: 'materiales', texto: 'Según el material' },
  { id: 'secar', texto: 'Secar' },
  { id: 'guardar', texto: 'Guardar' },
  { id: 'bolitas', texto: 'Bolitas y pelusas' },
  { id: 'hilos', texto: 'Un hilo se ha salido' },
  { id: 'amigurumis', texto: 'Amigurumis' },
  { id: 'bebe', texto: 'Piezas de bebé' },
];

const MATERIALES = [
  { fibra: 'Algodón', agua: 'Fría o a 30 °C', maquina: 'Sí, programa delicado y en bolsa de red', ojo: 'Encoge con calor: nada de secadora' },
  { fibra: 'Merino', agua: 'Fría', maquina: 'Solo con programa de lana de verdad', ojo: 'Se enfieltra si se frota o cambia de temperatura' },
  { fibra: 'Trapillo', agua: 'Fría o a 30 °C', maquina: 'Sí, sin centrifugar', ojo: 'Pesa mucho mojado: sécalo bien extendido' },
  { fibra: 'Amigurumi relleno', agua: 'Fría', maquina: 'No', ojo: 'El relleno se apelmaza: mejor limpiar en seco' },
];

const n = (i: number) => `${i + 1}. `;

export default function PaginaCuidados() {
  return (
    <div className="wrap">
      <Migas actual="Cuidados" />

      <CabeceraPagina etiqueta="Guía de cuidados" titulo="Cómo cuidar el crochet sin estropearlo">
        <p>
          Una pieza bien tratada dura décadas; una mal lavada, un verano. Esto es lo que contestamos cada vez que
          alguien nos pregunta, sin tecnicismos y por orden.
        </p>
      </CabeceraPagina>

      <div className="con-indice">
        <IndiceLateral titulo="En esta guía" entradas={APARTADOS} />

        <div>
          <article className="prosa guia">
            <div className="aviso">
              <IcoInfo />
              <p>
                <b>La regla de oro:</b> agua fría, sin retorcer y secado en plano. Solo con eso ya te ahorras el 90 % de
                los disgustos.
              </p>
            </div>

            <h2 id="lavar">{n(0)}Lavar</h2>
            <p>
              A mano casi siempre. Llena un barreño con agua fría o tibia (nunca caliente), echa un chorrito de jabón
              neutro o de champú de bebé y mete la pieza. Apriétala con las manos abiertas, como si amasaras despacio. No
              frotes una parte contra otra: eso es lo que hace que la lana se enfieltre y se quede dura.
            </p>
            <p>
              Déjala cinco minutos, aclara con agua a la misma temperatura y saca el exceso de agua apretando entre las
              palmas o enrollándola en una toalla. <b>Nunca la retuerzas:</b> el peso del agua estira los puntos y la
              pieza se deforma para siempre.
            </p>
            <h3>¿Y en la lavadora?</h3>
            <p>
              Solo si la ficha de la pieza lo dice. El algodón aguanta un programa delicado a 30 °C dentro de una bolsa de
              red, sin centrifugado o al mínimo. La merino, solo si tu lavadora tiene un programa de lana de verdad. Los
              amigurumis, nunca: el relleno se apelmaza y se queda lleno de bultos.
            </p>

            <div className="cols-2">
              <ListaSiNo
                tipo="si"
                titulo="Sí"
                elementos={[
                  'Agua fría o tibia, nunca caliente',
                  'Jabón neutro o champú de bebé',
                  'Apretar con las palmas abiertas',
                  'Escurrir enrollando en una toalla',
                  'Bolsa de red si va a la lavadora',
                ]}
              />
              <ListaSiNo
                tipo="no"
                titulo="No"
                elementos={[
                  'Retorcer para escurrir',
                  'Frotar una parte contra otra',
                  'Lejía, suavizante o quitamanchas',
                  'Secadora, radiador o sol directo',
                  'Meter amigurumis en la lavadora',
                ]}
              />
            </div>

            <h2 id="materiales">{n(1)}Según el material</h2>
            <p>
              Cada ficha de la tienda dice de qué está hecha la pieza. Si has perdido la etiqueta, esta tabla resume lo
              importante:
            </p>
            <CajaTabla etiqueta="Cómo lavar cada material">
              <table className="tabla">
                <caption className="oculto-vis">Cómo lavar cada material</caption>
                <thead>
                  <tr>
                    <th scope="col">Material</th>
                    <th scope="col">Agua</th>
                    <th scope="col">Lavadora</th>
                    <th scope="col">Cuidado con</th>
                  </tr>
                </thead>
                <tbody>
                  {MATERIALES.map((m) => (
                    <tr key={m.fibra}>
                      <th scope="row">{m.fibra}</th>
                      <td>{m.agua}</td>
                      <td>{m.maquina}</td>
                      <td>{m.ojo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CajaTabla>

            <h2 id="secar">{n(2)}Secar</h2>
            <p>
              En plano, siempre. Extiende la pieza sobre una toalla seca encima de una superficie horizontal, dale la forma
              que quieres que tenga y déjala tranquila. Si la cuelgas, el agua tira hacia abajo y la pieza crece varios
              centímetros de largo y pierde ancho.
            </p>
            <p>
              Ni radiador, ni sol directo, ni secadora. El calor encoge el algodón y amarillea los tonos crudos. Una manta
              grande tarda un día entero en secarse y no hay atajo que valga.
            </p>
            <p>
              Un truco: cambia la toalla de debajo a la media hora. Absorbe muchísima agua y el secado se acorta casi a la
              mitad.
            </p>

            <h2 id="guardar">{n(3)}Guardar</h2>
            <p>
              Dobladas, no colgadas: una percha deja marca de hombros en cualquier prenda de punto. Guárdalas en un cajón
              o en una caja de tela, no en bolsas de plástico cerradas, porque la lana necesita respirar o coge olor a
              humedad.
            </p>
            <p>
              Si guardas lana durante el verano, mete en el cajón una pastilla de cedro o una bolsita de lavanda. Las
              polillas no van a por la lana en sí, sino a por los restos de sudor y comida, así que guárdala siempre
              limpia.
            </p>

            <h2 id="bolitas">{n(4)}Bolitas y pelusas</h2>
            <p>
              Salen en las zonas de roce y no significan que la lana sea mala: le pasa hasta al cachemir. Se quitan con
              una maquinilla quitapelusas, pasándola sin apretar, o con un peine fino para lana.
            </p>
            <p>No las cortes con tijeras a lo bruto: te llevas fibra por delante y haces un hueco.</p>

            <h2 id="hilos">{n(5)}Un hilo se ha salido</h2>
            <p>
              Que no cunda el pánico y, sobre todo, <b>no tires del hilo</b>. Coge una aguja lanera o un ganchillo fino y
              empuja el hilo suelto hacia dentro de la pieza, por donde salió. Casi siempre desaparece y no se nota nada.
            </p>
            <p>
              Si se ha soltado un remate o ves un agujero, mándanos una foto y te decimos si puedes arreglarlo tú o si es
              mejor que nos lo mandes. <b>Las piezas nuestras las arreglamos gratis, aunque las compraras hace años.</b>{' '}
              Solo pagas el envío de vuelta.
            </p>

            <h2 id="amigurumis">{n(6)}Amigurumis</h2>
            <p>
              Son los más delicados porque llevan relleno. Lo ideal es limpiarlos en seco: un paño húmedo con jabón neutro
              sobre la mancha y a secar. Si hay que lavarlo entero, a mano y rápido, apretando poco, y luego déjalo secar de
              pie sobre una toalla para que no pierda la forma.
            </p>
            <p>Si con el tiempo el relleno se apelmaza, masajéalo con los dedos para devolverle el aire. Se nota bastante.</p>

            <h2 id="bebe">{n(7)}Piezas de bebé</h2>
            <p>
              Lávalas a mano antes del primer uso, aunque estén nuevas: se quitan restos del tinte y quedan más suaves. Usa
              jabón sin perfume.
            </p>
            <p>
              Y algo importante que no tiene que ver con el lavado: por muy bonita que sea la manta,{' '}
              <b>no dejes nada suelto en la cuna de un bebé menor de un año mientras duerme</b>. Nuestras mantas son para
              el cochecito, el sofá, las fotos y para arropar mientras estáis despiertos. Si tienes dudas, consulta las{' '}
              <Link href={rutas.contacto}>preguntas frecuentes</Link> o escríbenos.
            </p>

          </article>
          <div className="mt-8">
            <BandaCierre
              nivel="h2"
              titulo="¿Te queda alguna duda con tu pieza?"
              acciones={
                <Link className="btn btn-1" href={rutas.contacto}>
                  Escribirnos
                </Link>
              }
            >
              Mándanos una foto y te decimos exactamente qué hacer. Es gratis, y nos gusta saber que las piezas siguen
              vivas por ahí.
            </BandaCierre>
          </div>
        </div>
      </div>
    </div>
  );
}
