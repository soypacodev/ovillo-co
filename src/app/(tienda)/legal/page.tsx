import Link from 'next/link';
import type { ReactNode } from 'react';
import { CabeceraPagina } from '@/componentes/contenido/cabecera-pagina';
import { CajaTabla } from '@/componentes/contenido/caja-tabla';
import { IndiceLateral, type EntradaIndice } from '@/componentes/contenido/indice-lateral';
import { Migas } from '@/componentes/contenido/migas';
import { IcoInfo } from '@/componentes/iconos';
import { metadatosPagina } from '@/lib/metadatos';
import { DEMO, rutas } from '@/lib/rutas';
import '@/estilos/contenido.css';

export const metadata = metadatosPagina({
  titulo: 'Información legal',
  descripcion:
    'Aviso legal, política de privacidad, cookies y condiciones de venta de Ovillo & Co., una tienda de demostración: los pedidos no son reales y el pago funciona en modo de prueba.',
  ruta: rutas.legal,
});

const SECCIONES: EntradaIndice[] = [
  { id: 'aviso', texto: 'Aviso legal' },
  { id: 'privacidad', texto: 'Privacidad' },
  { id: 'cookies', texto: 'Cookies' },
  { id: 'venta', texto: 'Condiciones de venta' },
];

/** Dato del titular que en una tienda real habría que sustituir. */
function Ficticio({ children }: { children: ReactNode }) {
  return (
    <span className="ficticio">
      {children}
      <span className="oculto-vis"> (dato ficticio)</span>
    </span>
  );
}

const DATOS: [string, string, string][] = [
  ['Nombre y dirección', 'Enviarte el pedido y emitir la factura', 'Lo que exija la normativa fiscal (en general, 6 años)'],
  ['Correo electrónico', 'Confirmar el pedido, avisarte del envío y contestarte', 'Mientras tengas cuenta o mientras dure la relación'],
  ['Teléfono', 'Que la empresa de transporte pueda localizarte', 'Lo mismo que el pedido'],
  ['Historial de pedidos', 'Que puedas consultarlo y llevar la contabilidad', 'Lo que exija la normativa fiscal'],
  ['Mensajes y encargos', 'Contestarte y preparar el presupuesto', 'Un año desde el último contacto'],
  ['Correo del boletín', 'Mandarte novedades, si te apuntas', 'Hasta que te des de baja'],
];

const ALMACENAMIENTO: [string, string, string][] = [
  ['ovillo.cesta', 'Recordar lo que has metido en la cesta', 'Técnico · almacenamiento local'],
  ['ovillo.favoritos', 'Recordar tus favoritos', 'Técnico · almacenamiento local'],
  ['ovillo.cintaInicio', 'Que la cinta de avisos no salte al cambiar de página', 'Técnico · almacenamiento local'],
  ['sb-…', 'Mantener la sesión si entras en tu cuenta', 'Técnica · cookie propia'],
  ['Stripe', 'Prevenir el fraude en la página de pago', 'Técnica · cookie de terceros'],
];

export default function PaginaLegal() {
  return (
    <div className="wrap">
      <Migas actual="Información legal" />

      <CabeceraPagina etiqueta="Lo obligatorio, en claro" titulo="Información legal">
        <p>Lo hemos escrito tan corto y claro como hemos podido. Si algo no se entiende, pregúntanos.</p>
      </CabeceraPagina>

      <div className="aviso aviso-ficticio" role="note">
        <IcoInfo />
        <p>
          <b>Esto es una tienda de demostración.</b> Ovillo &amp; Co. es una marca ficticia creada por{' '}
          <a className="enlace" href={DEMO.enlace} target="_blank" rel="noopener noreferrer">
            {DEMO.autor}
            <span className="oculto-vis"> (se abre en otra pestaña)</span>
          </a>{' '}
          para enseñar cómo se construye una tienda online. No se vende nada, los pedidos no son reales y el pago
          funciona siempre en modo de prueba. Los datos <span className="ficticio">resaltados</span> son inventados y
          los textos sirven de ejemplo: una tienda real debe adaptarlos a su caso con asesoramiento profesional.
        </p>
      </div>

      <div className="con-indice">
        <IndiceLateral titulo="Secciones" entradas={SECCIONES} />

        <article className="prosa guia">
          {/* ---------- Aviso legal ---------- */}
          <h2 id="aviso">Aviso legal</h2>
          <p>
            En cumplimiento de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico
            (LSSI), estos son los datos del titular de la web:
          </p>
          <ul>
            <li>
              Titular: <Ficticio>Ovillo &amp; Co. Taller Textil, S. L.</Ficticio>
            </li>
            <li>
              NIF: <Ficticio>B00000000</Ficticio>
            </li>
            <li>
              Domicilio: <Ficticio>Calle Ejemplo, 0 · 29000 Málaga</Ficticio>
            </li>
            <li>
              Registro: <Ficticio>Registro Mercantil de Málaga, tomo 0000, folio 0, hoja MA-00000</Ficticio>
            </li>
            <li>
              Correo: <a href={`mailto:${DEMO.correo}`}>{DEMO.correo}</a> (dominio reservado para ejemplos, no recibe
              correo)
            </li>
          </ul>
          <p>La actividad de la web es la venta de piezas de crochet hechas a mano, de catálogo y por encargo.</p>
          <h3>Propiedad intelectual</h3>
          <p>
            Los textos y el diseño de la web son del titular. Las fotografías son de sus autores y se usan con su
            licencia. Puedes compartir el contenido citando la fuente, pero no copiarlo para vender lo mismo. Si ves
            aquí algo tuyo que no debería estar, escríbenos y lo retiramos.
          </p>
          <h3>Responsabilidad</h3>
          <p>
            Cuidamos que la información sea correcta, pero puede haber errores de precio o de disponibilidad. Si
            detectamos un error importante en un pedido, te avisamos antes de cobrar y puedes cancelarlo sin coste.
          </p>

          {/* ---------- Privacidad ---------- */}
          <h2 id="privacidad">Política de privacidad</h2>
          <p>
            El responsable del tratamiento es el titular indicado en el aviso legal. Tratamos tus datos según el
            Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD). Solo pedimos lo que
            hace falta para mandarte el pedido y contestarte, y no vendemos ni cedemos datos a nadie para publicidad.
          </p>
          <h3>Qué datos tratamos, para qué y durante cuánto tiempo</h3>
          <CajaTabla etiqueta="Datos personales: finalidad y conservación">
            <table className="tabla">
              <caption className="oculto-vis">Datos personales: finalidad y conservación</caption>
              <thead>
                <tr>
                  <th scope="col">Dato</th>
                  <th scope="col">Para qué</th>
                  <th scope="col">Cuánto tiempo</th>
                </tr>
              </thead>
              <tbody>
                {DATOS.map(([dato, para, cuanto]) => (
                  <tr key={dato}>
                    <th scope="row">{dato}</th>
                    <td>{para}</td>
                    <td>{cuanto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CajaTabla>
          <h3>Base legal</h3>
          <p>
            La ejecución del contrato para los pedidos; tu consentimiento para los mensajes, los encargos y el boletín
            (lo puedes retirar cuando quieras); y el cumplimiento de obligaciones legales para la facturación.
          </p>
          <h3>Quién más los ve</h3>
          <ul>
            <li>
              <b>Stripe</b>, que procesa los pagos. Los datos de la tarjeta van directamente a Stripe; nosotros no los
              vemos ni los guardamos. En esta demostración funciona en modo de prueba y no se cobra nada.
            </li>
            <li>
              <b>Supabase</b>, que aloja la base de datos de la tienda.
            </li>
            <li>
              <b>La empresa de transporte</b>, que recibe tu nombre, dirección y teléfono para entregarte el paquete.
            </li>
          </ul>
          <h3>Tus derechos</h3>
          <p>
            Puedes pedirnos acceso a tus datos, su rectificación o supresión, limitar u oponerte a su uso y llevártelos a
            otro servicio. Escríbenos a <a href={`mailto:${DEMO.correo}`}>{DEMO.correo}</a> y te contestamos en menos de
            un mes. Si crees que no lo hemos hecho bien, puedes reclamar ante la Agencia Española de Protección de Datos
            (aepd.es).
          </p>

          {/* ---------- Cookies ---------- */}
          <h2 id="cookies">Cookies y almacenamiento local</h2>
          <p>
            Usamos lo mínimo para que la tienda funcione. No hay cookies de publicidad ni de analítica, y nada sirve para
            seguirte por otras webs; por eso no te mostramos un aviso para aceptarlas.
          </p>
          <CajaTabla etiqueta="Cookies y almacenamiento local que usa la web">
            <table className="tabla">
              <caption className="oculto-vis">Cookies y almacenamiento local que usa la web</caption>
              <thead>
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Para qué</th>
                  <th scope="col">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {ALMACENAMIENTO.map(([nombre, para, tipo]) => (
                  <tr key={nombre}>
                    <th scope="row">
                      <code>{nombre}</code>
                    </th>
                    <td>{para}</td>
                    <td>{tipo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CajaTabla>
          <p>
            Puedes borrarlas o bloquearlas desde los ajustes de tu navegador. Si bloqueas el almacenamiento local, la
            cesta y los favoritos se olvidarán al cerrar la pestaña.
          </p>

          {/* ---------- Condiciones de venta ---------- */}
          <h2 id="venta">Condiciones de venta</h2>
          <p>
            Recuerda que esta tienda es una demostración: ningún pedido genera un contrato real. Las condiciones de abajo
            son las que aplicaría una tienda como esta.
          </p>
          <h3>Precios</h3>
          <p>
            Todos los precios están en euros e incluyen el IVA. El envío se suma aparte y lo ves antes de pagar. Si
            cambiamos un precio, no afecta a los pedidos ya hechos.
          </p>
          <h3>Pago</h3>
          <p>
            Con tarjeta a través de Stripe. En esta demostración el pago está siempre en modo de prueba: solo funcionan
            las tarjetas de prueba de Stripe y nunca se cobra nada. No introduzcas los datos de una tarjeta real.
          </p>
          <h3>Cuándo existe el contrato</h3>
          <p>
            Cuando recibes el correo de confirmación del pedido. Si una pieza se agota justo en ese momento, te avisamos
            y te devolvemos su importe en 48 horas.
          </p>
          <h3>Plazos de entrega</h3>
          <p>
            Los que indica la ficha de cada pieza y la página de <Link href={rutas.envios}>envíos</Link>. Si vamos a
            tardar más de lo previsto, te avisamos antes de que tengas que preguntar.
          </p>
          <h3>Derecho de desistimiento</h3>
          <p>
            Tienes 14 días naturales desde que recibes el pedido para devolverlo sin dar motivos. Quedan excluidas las
            piezas personalizadas o hechas a medida, como prevé la ley. Te lo explicamos paso a paso en{' '}
            <Link href={rutas.devoluciones}>devoluciones</Link>.
          </p>
          <h3>Garantía</h3>
          <p>
            Tres años de garantía legal por falta de conformidad. Además, cualquier pieza nuestra que se suelte la
            arreglamos gratis, sin fecha de caducidad; solo pagas el envío de vuelta.
          </p>
          <h3>Reclamaciones</h3>
          <p>
            Escríbenos primero: casi todo se arregla hablando. Si no llegamos a un acuerdo, puedes acudir a la Junta
            Arbitral de Consumo o a los juzgados de tu domicilio.
          </p>

          <p className="mini-2 mt-8">
            Última revisión: 8 de octubre de 2026.
          </p>
        </article>
      </div>
    </div>
  );
}
