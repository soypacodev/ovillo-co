import Link from 'next/link';
import { Aparece } from '@/componentes/aparece';
import { PreguntasFrecuentes } from '@/componentes/contenido/acordeon';
import { CabeceraPagina } from '@/componentes/contenido/cabecera-pagina';
import { Migas } from '@/componentes/contenido/migas';
import { FormularioContacto } from '@/componentes/formularios/formulario-contacto';
import { IcoInsta, IcoPinterest, IcoSobre } from '@/componentes/iconos';
import { PREGUNTAS } from '@/datos/semilla';
import { metadatosPagina } from '@/lib/metadatos';
import { DEMO, rutas } from '@/lib/rutas';
import '@/estilos/contenido.css';

export const metadata = metadatosPagina({
  titulo: 'Contacto y preguntas frecuentes',
  descripcion:
    'Escribe a Ovillo & Co. para dudas, pedidos, arreglos o encargos. Te contestamos en 24–48 horas. Preguntas frecuentes sobre plazos, colores, bebés y devoluciones.',
  ruta: rutas.contacto,
});

const HORARIO: [string, string][] = [
  ['Lunes a viernes', 'por la mañana'],
  ['Sábados', 'a ratos'],
  ['Domingos', 'descansamos'],
];

export default function PaginaContacto() {
  return (
    <div className="wrap">
      <Migas actual="Contacto" />

      <CabeceraPagina etiqueta="Hablamos" titulo="Escríbenos y te contestamos nosotros" ancho={56}>
        <p>
          Sin centralitas ni respuestas automáticas. Leemos todos los mensajes y contestamos en 24–48 horas laborables,
          salvo en los puentes largos.
        </p>
      </CabeceraPagina>

      <div className="con-lateral">
        <div>
          <h2 className="oculto-vis">Formulario de contacto</h2>
          <FormularioContacto />

          <section aria-labelledby="preguntas">
            <Aparece className="cab-sec">
              <div>
                <p className="eyebrow">Antes de escribir</p>
                <h2 className="mt-1" id="preguntas">
                  A lo mejor está aquí
                </h2>
                <p className="lead mt-2">
                  Las preguntas que más nos llegan, contestadas de una vez.
                </p>
              </div>
            </Aparece>
            <PreguntasFrecuentes preguntas={PREGUNTAS} />
            <p className="mini mt-5">
              ¿Dudas con el lavado? Tienes la{' '}
              <Link className="enlace" href={rutas.cuidados}>
                guía de cuidados
              </Link>{' '}
              completa. ¿Plazos y devoluciones? Están en{' '}
              <Link className="enlace" href={rutas.envios}>
                envíos
              </Link>
              .
            </p>
          </section>
        </div>

        <aside aria-label="Otras formas de contacto">
          <div className="caja">
            <h2 className="lista-titulo">
              Otras formas
            </h2>
            <ul className="vias">
              <li>
                <IcoSobre />
                <span>
                  <b>Correo</b>
                  <a className="mini enlace" href={`mailto:${DEMO.correo}`}>
                    {DEMO.correo}
                  </a>
                </span>
              </li>
              <li>
                <IcoInsta />
                <span>
                  <b>Instagram</b>
                  <span className="mini">@ovilloandco (de ejemplo)</span>
                </span>
              </li>
              <li>
                <IcoPinterest />
                <span>
                  <b>Pinterest</b>
                  <span className="mini">Ovillo &amp; Co. (de ejemplo)</span>
                </span>
              </li>
            </ul>
          </div>

          <div className="caja-cl">
            <h2 className="titulo-mini">Cuándo contestamos</h2>
            <table className="tabla tabla-corta mt-2">
              <caption className="oculto-vis">Horario de respuesta</caption>
              <tbody>
                {HORARIO.map(([dia, cuando]) => (
                  <tr key={dia}>
                    <th scope="row">{dia}</th>
                    <td className="derecha">{cuando}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mini-2 mt-3">
              En agosto tardamos algo más: es cuando aprovechamos para tejer sin parar.
            </p>
          </div>

          <div className="banda banda-lateral">
            <h2 className="lista-titulo">
              ¿Se te ha roto algo nuestro?
            </h2>
            <p className="mt-1">
              Te lo arreglamos gratis, aunque lo compraras hace años. Solo pagas el envío de vuelta.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
