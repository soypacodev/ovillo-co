import Link from 'next/link';
import { BotonPanelDemo } from '@/componentes/cuenta/boton-panel-demo';
import { CATEGORIAS } from '@/datos/semilla';
import { anioMadrid } from '@/lib/fechas';
import { DEMO, rutas } from '@/lib/rutas';

const AYUDA = [
  { href: rutas.envios, texto: 'Envíos y plazos' },
  { href: rutas.devoluciones, texto: 'Devoluciones' },
  { href: rutas.cuidados, texto: 'Cómo cuidar el crochet' },
  { href: rutas.contacto, texto: 'Contacto' },
  { href: rutas.encargos, texto: 'Encargos a medida' },
];

const LEGAL = [
  { href: `${rutas.legal}#aviso`, texto: 'Aviso legal' },
  { href: `${rutas.legal}#privacidad`, texto: 'Privacidad' },
  { href: `${rutas.legal}#cookies`, texto: 'Cookies' },
  { href: `${rutas.legal}#venta`, texto: 'Términos de venta' },
];

export function Pie() {
  const anio = anioMadrid();
  return (
    <footer className="pie-web">
      <div className="wrap">
        <div className="pie-rej">
          <div>
            <p className="pie-marca">Ovillo &amp; Co.</p>
            <p className="pie-lema">
              Crochet hecho a mano en Málaga. Piezas únicas, encargos con calma y ningún atajo.
            </p>
            <p className="mt-3">
              <a href={`mailto:${DEMO.correo}`}>{DEMO.correo}</a>
            </p>
          </div>
          <nav aria-labelledby="pie-tienda">
            <h2 id="pie-tienda">Tienda</h2>
            <ul>
              {CATEGORIAS.map((c) => (
                <li key={c.slug}>
                  <Link href={rutas.categoria(c.slug)}>{c.nombre}</Link>
                </li>
              ))}
              <li>
                <Link href={rutas.ofertas}>Rebajas</Link>
              </li>
            </ul>
          </nav>
          <nav aria-labelledby="pie-ayuda">
            <h2 id="pie-ayuda">Ayuda</h2>
            <ul>
              {AYUDA.map((e) => (
                <li key={e.href}>
                  <Link href={e.href}>{e.texto}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-labelledby="pie-legal">
            <h2 id="pie-legal">Legal</h2>
            <ul>
              {LEGAL.map((e) => (
                <li key={e.href}>
                  <Link href={e.href}>{e.texto}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {/* La tienda es ficticia y no tiene redes propias: el único enlace
            social es el del autor, y dice claramente de quién es. */}
        <section className="pie-demo" aria-labelledby="pie-autor">
          <div>
            <h2 id="pie-autor">¿Quieres una tienda así para tu negocio?</h2>
            <p>
              Esta tienda es una demostración hecha por {DEMO.autor}: catálogo, pagos, envíos, encargos y panel para
              el dueño. Mira cómo se lleva por dentro o escríbeme y lo hablamos.
            </p>
            <ul className="pie-autor-enlaces">
              <li>
                <a href={DEMO.contratar}>{DEMO.correoAutor}</a>
              </li>
              <li>
                <a href={DEMO.instagram} target="_blank" rel="noopener noreferrer">
                  Instagram {DEMO.usuarioInstagram}
                  <span className="oculto-vis"> de {DEMO.autor}, autor de la demo (se abre en otra pestaña)</span>
                </a>
              </li>
              <li>
                <a href={DEMO.enlace} target="_blank" rel="noopener noreferrer">
                  GitHub
                  <span className="oculto-vis"> de {DEMO.autor} (se abre en otra pestaña)</span>
                </a>
              </li>
            </ul>
          </div>
          <BotonPanelDemo className="btn btn-claro btn-p" />
        </section>
        <div className="legal">
          <span>© {anio} Ovillo &amp; Co. Hecho con hilo y paciencia.</span>
          <span>Pagos con Stripe (modo de prueba) · Envíos con Correos</span>
        </div>
      </div>
    </footer>
  );
}
