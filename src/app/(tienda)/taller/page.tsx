import Image from 'next/image';
import Link from 'next/link';
import { Aparece } from '@/componentes/aparece';
import { BandaCierre } from '@/componentes/contenido/banda-cierre';
import { CifrasAnimadas } from '@/componentes/contenido/cifras-animadas';
import { ListaSiNo } from '@/componentes/contenido/lista-si-no';
import { Migas } from '@/componentes/contenido/migas';
import { Pasos } from '@/componentes/contenido/pasos';
import { Polaroids } from '@/componentes/contenido/polaroids';
import { IcoCorazonG, IcoEstrella, IcoOk, IcoSobre, IcoTijeras, Ovillo } from '@/componentes/iconos';
import { metadatosPagina } from '@/lib/metadatos';
import { CIFRAS_TALLER } from '@/datos/taller';
import { rutas } from '@/lib/rutas';
import '@/estilos/contenido.css';

export const metadata = metadatosPagina({
  titulo: 'El taller',
  descripcion:
    'Quién teje, cómo y por qué. Ovillo & Co. es un taller pequeño de crochet en Málaga: materiales, tiempos reales y nuestra forma de trabajar.',
  ruta: rutas.taller,
});

const MATERIALES = [
  {
    icono: <IcoEstrella />,
    nombre: 'Algodón peinado',
    texto: 'Para amigurumis, mantas y accesorios. Aguanta lavados, no se deforma y tiene el punto justo de brillo.',
  },
  {
    icono: <IcoCorazonG />,
    nombre: 'Merino extrafina',
    texto: 'Para gorros, capotas y patucos. No pica, ni siquiera en piel de bebé, y abriga muchísimo para lo poco que pesa.',
  },
  {
    icono: <IcoTijeras />,
    nombre: 'Relleno hipoalergénico',
    texto: 'Fibra hueca siliconada: se lava sin apelmazarse y no da problemas a quien tiene alergias.',
  },
  {
    icono: <Ovillo width={22} height={22} />,
    nombre: 'Trapillo reciclado',
    texto: 'Para cestas y alfombras. Se hace con sobrantes de la industria textil: aprovechamos lo que otros tiran.',
  },
  {
    icono: <IcoOk />,
    nombre: 'Ojos bordados',
    texto: 'En los amigurumis y en todo lo de bebé, los ojos van bordados, nunca de plástico. Cero piezas pequeñas que se puedan arrancar.',
  },
  {
    icono: <IcoSobre />,
    nombre: 'Papel y cartón',
    texto: 'Envolvemos en papel de seda y caja de cartón, sin plástico. Todo el embalaje se puede reciclar.',
  },
];

const PROCESO = [
  'Elegimos la lana y tejemos una muestra de 10 × 10 cm para calcular la tensión del punto.',
  'Cada pieza la teje de principio a fin la misma persona: dos manos distintas dan dos tensiones distintas, y se nota.',
  'La lavamos y la bloqueamos con alfileres para que coja su forma definitiva.',
  'Revisamos costuras y remates con lupa. Si algo baila, se deshace y se vuelve a tejer.',
  'Bordamos iniciales, nombres o fechas, si nos los has pedido.',
  'La envolvemos en papel de seda con las instrucciones de lavado escritas a mano.',
];

const SI_HACEMOS = [
  'Cambiar los colores de cualquier pieza del catálogo, sin coste extra.',
  'Bordar nombres, iniciales o fechas.',
  'Amigurumis a partir de fotos de tu mascota.',
  'Ajustar tallas de gorros, bufandas y patucos.',
  'Packs a medida para regalar, con la dedicatoria que quieras.',
  'Arreglar gratis cualquier pieza nuestra que se haya soltado, para siempre.',
];

const NO_HACEMOS = [
  'Copiar el diseño de otra artesana o de una marca.',
  'Más de 15 piezas iguales en un mismo pedido: no llegamos, y preferimos decirlo.',
  'Prendas con patrón complejo, como chaquetas o vestidos.',
  'Encargos nuevos en menos de una semana.',
  'Vender patrones: los nuestros viven en la cabeza y en una libreta llena de tachones.',
];

export default function PaginaTaller() {
  return (
    <div className="wrap">
      <Migas actual="El taller" />

      {/* ---------- Portada ---------- */}
      <section className="dos-hero taller-heroe">
        <div>
          <p className="eyebrow ent ent-1">Taller de crochet · Málaga</p>
          <h1 className="ent ent-2 mt-2">
            Tejemos junto a <em className="destacado">una ventana</em> que da al mar
          </h1>
          <p className="lead ent ent-3 mt-5">
            Ovillo &amp; Co. es un taller pequeño: una mesa grande, cestos de ovillos ordenados por color y la mejor luz
            de la casa. Ni fábrica ni almacén. Todo lo que compras aquí lo tejemos a mano, de principio a fin, en Málaga: casi todo a ganchillo y, cuando
            la pieza lo pide (un gorro, una capota), a dos agujas.
          </p>
          <CifrasAnimadas cifras={CIFRAS_TALLER} className="ent ent-4" />
        </div>
        <div className="arco-foto">
          <div className="arco ent-arco">
            <Image
              src="/fotos/categorias/amigurumis.jpg"
              alt="Osita de ganchillo con vestido lila y bufanda turquesa"
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 880px) min(92vw, 400px), 460px"
            />
          </div>
          <p className="sello sello-texto flota-lento">
            <Ovillo width={22} height={22} /> Una osita así: cinco horas
          </p>
        </div>
      </section>

      {/* ---------- Historia ---------- */}
      <section>
        <div className="dos dos-arr">
          <Aparece efecto="rev-izq" className="prosa">
            <p className="eyebrow">Cómo empezó</p>
            <h2 className="tit-bloque">Un cervatillo dormilón y una lista de espera</h2>
            <p>
              Ovillo &amp; Co. empezó en 2019 con un encargo pequeño: un cervatillo de ganchillo con los ojos cerrados,
              para un bebé que no había manera de que se durmiera. No sabemos si fue el cervatillo o la casualidad,
              pero funcionó.
            </p>
            <p>
              Luego vino otro cervatillo, y una manta, y una lista de espera escrita a lápiz en la puerta de la nevera.
              Cuando la lista dejó de caber en la puerta, montamos el taller.
            </p>
            <p>
              Seguimos siendo pocos y seguimos tejiendo en la misma mesa. Hemos cambiado de agujas, de lanas y de
              paciencia, pero no de manera de trabajar.
            </p>

            <h3>Por qué no lo hacemos más rápido</h3>
            <p>
              Alguna vez nos han preguntado si no podríamos «industrializarlo un poco». Podríamos, claro. Pero entonces
              esto sería otra cosa.
            </p>
            <p>
              Una manta son doce horas. Un amigurumi mediano, cuatro o cinco. Si te decimos diez días es porque son diez
              días de verdad, no un plazo inflado para curarnos en salud.
            </p>
          </Aparece>

          <Polaroids
            grande
            fotos={[
              { src: '/fotos/taller-1.jpg', alt: 'Manos tejiendo una pieza blanca de ganchillo', pie: 'a medias' },
              { src: '/fotos/taller-2.jpg', alt: 'Ovillos de algodón en tonos cálidos junto a unas tijeras', pie: 'ordenados por color' },
              { src: '/fotos/taller-3.jpg', alt: 'Ovillo verde agua y aguja de ganchillo de madera', pie: 'las de siempre' },
            ]}
          />
        </div>
      </section>

      {/* ---------- Materiales ---------- */}
      <section>
        <Aparece className="centro sec-intro">
          <p className="eyebrow">Sin misterio</p>
          <h2 className="mt-1">Con qué trabajamos</h2>
          <p className="lead mt-3 centro">
            Compramos poco y bueno. Sale más caro por pieza, pero es lo que hace que una manta aguante diez años en vez
            de dos.
          </p>
        </Aparece>
        <Aparece efecto="rev-lista" className="cols-3 mt-7">
          {MATERIALES.map((m) => (
            <div key={m.nombre} className="caja tarjeta-info">
              <span className="ico">{m.icono}</span>
              <h3>{m.nombre}</h3>
              <p className="mini">{m.texto}</p>
            </div>
          ))}
        </Aparece>
      </section>

      {/* ---------- Proceso ---------- */}
      <section>
        <Aparece efecto="rev-zoom" className="banda-osc">
          <div className="dos">
            <div>
              <p className="eyebrow">De la lana a tu casa</p>
              <h2 className="mt-1">Cómo nace cada pieza</h2>
              <p className="lead mt-4">
                Siempre en el mismo orden, tanto si es algo del catálogo como un encargo de los raros.
              </p>
            </div>
            <Pasos pasos={PROCESO} />
          </div>
        </Aparece>
      </section>

      {/* ---------- Lo que sí y lo que no ---------- */}
      <section>
        <div className="dos dos-arr">
          <Aparece efecto="rev-izq">
            <p className="eyebrow">Para que no haya malentendidos</p>
            <h2 className="tit-bloque">Lo que sí y lo que no</h2>
            <p className="lead">
              Preferimos decirlo antes de que pidas nada y no llevarnos un chasco ninguno de los dos. Si tienes dudas
              con algo concreto, <Link className="enlace" href={rutas.contacto}>pregúntanos</Link>.
            </p>
          </Aparece>
          <Aparece efecto="rev-der">
            <ListaSiNo tipo="si" titulo="Sí hacemos" elementos={SI_HACEMOS} />
            <ListaSiNo tipo="no" titulo="No hacemos" elementos={NO_HACEMOS} />
          </Aparece>
        </div>
      </section>

      {/* ---------- Cierre ---------- */}
      <section>
        <BandaCierre
          titulo="¿Te decimos si podemos hacer lo que tienes en la cabeza?"
          acciones={
            <>
              <Link className="btn btn-1" href={rutas.encargos}>
                Pedir un encargo
              </Link>
              <Link className="btn btn-2" href={rutas.tienda}>
                Ver la tienda
              </Link>
            </>
          }
        >
          Escríbenos sin compromiso. Te contestamos con la verdad, aunque la verdad sea que no llegamos.
        </BandaCierre>
      </section>
    </div>
  );
}
