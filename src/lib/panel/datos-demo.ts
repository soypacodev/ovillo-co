// Datos de demostración del panel, los mismos que supabase/seed-demo.sql:
// 25 pedidos de los últimos 60 días en todos los estados, 6 encargos y 7
// mensajes. Las fechas se calculan desde `ahora` y los importes con
// totales(), la misma cuenta que hace la cesta, así que siempre cuadran.
// Con el mismo `ahora` el resultado es siempre idéntico.

import { PRODUCTOS } from '@/datos/semilla';
import type { MetodoEnvio } from '@/lib/catalogo/tipos';
import type { LineaCesta } from '@/lib/cesta/tipos';
import { totales } from '@/lib/cesta/totales';
import type { EstadoEncargo, EstadoMensaje, EstadoPedido } from './estados';
import { diaMadrid, inicioDiaMadrid } from '@/lib/fechas';
import type { FichaEncargo, FichaPedido, FilaMensaje } from './filas';

const HORA = 3600 * 1000;
const DIA = 24 * HORA;

const CLIENTES = [
  { nombre: 'Lucía Martín', email: 'lucia.martin@ejemplo.com', telefono: '600 000 101', ciudad: 'Málaga', provincia: 'Málaga', cp: '29002' },
  { nombre: 'Carmen Ruiz', email: 'carmen.ruiz@ejemplo.com', telefono: '600 000 102', ciudad: 'Madrid', provincia: 'Madrid', cp: '28004' },
  { nombre: 'Javier López', email: 'javier.lopez@ejemplo.com', telefono: '600 000 103', ciudad: 'Sevilla', provincia: 'Sevilla', cp: '41003' },
  { nombre: 'Marta Sánchez', email: 'marta.sanchez@ejemplo.com', telefono: '600 000 104', ciudad: 'Granada', provincia: 'Granada', cp: '18001' },
  { nombre: 'Pablo Gómez', email: 'pablo.gomez@ejemplo.com', telefono: '600 000 105', ciudad: 'Córdoba', provincia: 'Córdoba', cp: '14002' },
  { nombre: 'Elena Díaz', email: 'elena.diaz@ejemplo.com', telefono: '600 000 106', ciudad: 'Bilbao', provincia: 'Bizkaia', cp: '48001' },
  { nombre: 'Sergio Moreno', email: 'sergio.moreno@ejemplo.com', telefono: '600 000 107', ciudad: 'Zaragoza', provincia: 'Zaragoza', cp: '50001' },
  { nombre: 'Nuria Romero', email: 'nuria.romero@ejemplo.com', telefono: '600 000 108', ciudad: 'Murcia', provincia: 'Murcia', cp: '30001' },
  { nombre: 'David Navarro', email: 'david.navarro@ejemplo.com', telefono: '600 000 109', ciudad: 'Palma', provincia: 'Illes Balears', cp: '07001' },
  { nombre: 'Ana Torres', email: 'ana.torres@ejemplo.com', telefono: '600 000 110', ciudad: 'Cádiz', provincia: 'Cádiz', cp: '11001' },
  { nombre: 'Raquel Jiménez', email: 'raquel.jimenez@ejemplo.com', telefono: '600 000 111', ciudad: 'Marbella', provincia: 'Málaga', cp: '29601' },
  { nombre: 'Miguel Álvarez', email: 'miguel.alvarez@ejemplo.com', telefono: '600 000 112', ciudad: 'Madrid', provincia: 'Madrid', cp: '28015' },
] as const;

type Linea = [producto: string, variante: string, cantidad: number, personalizacion?: string];
type Envio = MetodoEnvio['id'];

//  n, días, hora, cliente, estado, envío, cupón, líneas
const PEDIDOS: [number, number, number, number, EstadoPedido, Envio, string | null, Linea[]][] = [
  [1, 58, 10, 0, 'entregado', 'ordinario', null, [['pulpito-reversible', 'Gris perla', 1]]],
  [2, 55, 18, 1, 'entregado', 'ordinario', 'HOLA10', [['cojin-relieve', 'Crudo y beis', 1]]],
  [3, 52, 12, 2, 'entregado', 'express', null, [['bolso-red-mercado', 'Crudo', 2]]],
  [4, 49, 20, 3, 'reembolsado', 'ordinario', null, [['cesta-ovillos', 'Zigzag', 1]]],
  [5, 46, 9, 4, 'entregado', 'ordinario', null, [['set-recien-nacido', 'Gris azulado', 1]]],
  [6, 43, 16, 5, 'entregado', 'recogida', null, [['pack-cocina', 'Salvia, coral y crema', 1]]],
  [7, 40, 11, 6, 'cancelado', 'ordinario', null, [['gorro-pompon', 'Azul', 1]]],
  [8, 37, 19, 7, 'entregado', 'ordinario', 'PRIMERA5', [['bolso-red-mercado', 'Rosa palo', 1], ['pulpito-reversible', 'Verde salvia', 1]]],
  [9, 34, 13, 0, 'entregado', 'ordinario', null, [['manta-estrella', 'Menta', 1, 'L.M.']]],
  [10, 31, 17, 8, 'entregado', 'express', null, [['cojin-relieve', 'Crudo y beis', 2]]],
  [11, 28, 10, 9, 'entregado', 'ordinario', 'ENVIOGRATIS', [['pack-cocina', 'Gris', 1]]],
  [12, 25, 21, 10, 'entregado', 'ordinario', null, [['gorro-pompon', 'Gris perla', 1], ['bolso-red-mercado', 'Crudo', 1]]],
  [13, 22, 12, 11, 'entregado', 'ordinario', null, [['pulpito-reversible', 'Gris perla', 2]]],
  [14, 19, 9, 1, 'entregado', 'recogida', null, [['cesta-ovillos', 'Blanca', 2]]],
  [15, 16, 18, 3, 'cancelado', 'ordinario', null, [['set-recien-nacido', 'Gris azulado', 1]]],
  [16, 14, 15, 5, 'enviado', 'ordinario', 'HOLA10', [['manta-estrella', 'Rosa', 1], ['guirnalda-corazones', 'Crudo', 1]]],
  [17, 12, 11, 2, 'entregado', 'express', null, [['bolso-red-mercado', 'Rosa palo', 1]]],
  [18, 10, 20, 6, 'enviado', 'ordinario', null, [['pack-cocina', 'Salvia, coral y crema', 2]]],
  [19, 8, 10, 7, 'enviado', 'ordinario', null, [['cojin-relieve', 'Crudo y beis', 1], ['cesta-ovillos', 'Blanca', 1]]],
  [20, 6, 13, 8, 'en_preparacion', 'ordinario', null, [['set-recien-nacido', 'Gris azulado', 1]]],
  [21, 5, 17, 4, 'en_preparacion', 'express', 'PRIMERA5', [['gorro-pompon', 'Azul', 1]]],
  [22, 3, 9, 9, 'en_preparacion', 'ordinario', null, [['manta-estrella', 'Menta', 1, 'A.T.']]],
  [23, 2, 19, 10, 'pagado', 'ordinario', null, [['pulpito-reversible', 'Verde salvia', 1], ['bolso-red-mercado', 'Crudo', 1]]],
  [24, 1, 12, 11, 'pagado', 'recogida', null, [['cesta-ovillos', 'Zigzag', 1]]],
  [25, 0, 1, 0, 'pagado', 'ordinario', 'HOLA10', [['pack-cocina', 'Gris', 1], ['pulpito-reversible', 'Gris perla', 1]]],
];

/** Identificadores fijos con forma de UUID v4, para que las rutas del panel
 *  y la validación de las acciones funcionen igual que con Supabase. */
const idDemo = (tipo: 'pedido' | 'encargo' | 'mensaje', n: number) =>
  `00000000-0000-4000-${{ pedido: '8', encargo: '9', mensaje: 'a' }[tipo]}000-${String(n).padStart(12, '0')}`;

const numeroDemo = (n: number, creado: Date) => `OV-${diaMadrid(creado).slice(0, 4)}-${String(900 + n).padStart(4, '0')}`;

function lineaCesta([slug, variante, uds, personalizacion = '']: Linea): LineaCesta {
  const p = PRODUCTOS.find((x) => x.slug === slug);
  const v = p?.variantes.find((x) => x.nombre === variante);
  if (!p || !v) throw new Error(`Los datos de demostración piden una pieza que no está en el catálogo: ${slug} / ${variante}`);
  return {
    id: `${slug}|${variante}|${personalizacion}`,
    slug,
    nombre: p.nombre,
    categoria: p.categoria,
    variante,
    color: v.color,
    foto: p.fotos[0] ?? null,
    precio: p.precio,
    encargo: p.encargo,
    dias: p.dias,
    stock: v.stock,
    personalizacion,
    uds,
  };
}

const iso = (ms: number) => new Date(ms).toISOString();

function generarPedidos(ahora: Date): FichaPedido[] {
  const medianoche = inicioDiaMadrid(ahora).getTime();

  return PEDIDOS.map(([n, dias, hora, c, estado, envio, cupon, lineasDemo]) => {
    const cliente = CLIENTES[c];
    const lineas = lineasDemo.map(lineaCesta);
    const t = totales(lineas, cupon, { envioId: envio, fecha: ahora });

    // El último pedido es de hace un rato, sea la hora que sea.
    const creado = dias === 0 ? ahora.getTime() - HORA : medianoche - dias * DIA + hora * HORA;
    const enviado = ['enviado', 'entregado', 'reembolsado'].includes(estado) ? creado + DIA + 5 * HORA : null;
    const entregado = ['entregado', 'reembolsado'].includes(estado) ? creado + 3 * DIA + 2 * HORA : null;
    const cancelado = estado === 'cancelado' ? creado + 20 * HORA : null;
    const conEnvio = envio !== 'recogida';

    const eventos: FichaPedido['eventos'] = (
      [
        ['pagado', creado, true],
        ['en_preparacion', creado + 3 * HORA, ['en_preparacion', 'enviado', 'entregado', 'reembolsado'].includes(estado)],
        ['enviado', enviado, enviado !== null],
        ['entregado', entregado, entregado !== null],
        ['cancelado', cancelado, cancelado !== null],
        ['reembolsado', (entregado ?? 0) + 4 * DIA, estado === 'reembolsado'],
      ] as [EstadoPedido, number | null, boolean][]
    )
      .filter(([, , incluir]) => incluir)
      .map(([e, fecha]) => ({ estado: e, nota: null, creado_en: iso(fecha ?? creado) }));

    return {
      id: idDemo('pedido', n),
      numero: numeroDemo(n, new Date(creado)),
      estado,
      es_demo: true,
      creado_en: iso(creado),
      pagado_en: iso(creado),
      enviado_en: enviado === null ? null : iso(enviado),
      entregado_en: entregado === null ? null : iso(entregado),
      cancelado_en: cancelado === null ? null : iso(cancelado),
      email: cliente.email,
      nombre_cliente: cliente.nombre,
      telefono: cliente.telefono,
      direccion_envio: conEnvio
        ? {
            destinatario: cliente.nombre,
            linea1: `Calle de Ejemplo ${10 + n}`,
            linea2: null,
            ciudad: cliente.ciudad,
            provincia: cliente.provincia,
            codigo_postal: cliente.cp,
            pais: 'ES',
            telefono: cliente.telefono,
          }
        : null,
      nota_cliente: n === 9 || n === 16 ? 'Es para un regalo: si podéis, sin el precio dentro.' : null,
      nota_admin: null,
      subtotal: t.subtotal,
      descuento_automatico: t.rebajaAuto,
      descuento_cupon: t.rebajaCupon,
      envio: t.envio,
      total: t.total,
      codigo_cupon: t.promocionCupon && !t.cuponFaltaMinimo ? t.promocionCupon.codigo : null,
      metodo_envio_nombre: t.metodo.nombre,
      dias_confeccion: t.plazoEncargo,
      transportista: enviado !== null && conEnvio ? 'Correos' : null,
      numero_seguimiento: enviado !== null && conEnvio ? `PK${String(n).padStart(9, '0')}ES` : null,
      tiene_cuenta: false,
      lineas: lineas.map((l) => {
        const descuento = t.rebajaPorLinea[l.id] ?? 0;
        return {
          producto_slug: l.slug,
          nombre_producto: l.nombre,
          nombre_variante: l.variante,
          color: l.color,
          foto_ruta: l.foto?.src ?? null,
          precio_unitario: l.precio,
          cantidad: l.uds,
          descuento,
          total: l.precio * l.uds - descuento,
          personalizacion: l.personalizacion || null,
          encargo: l.encargo,
          dias: l.dias,
        };
      }),
      eventos,
    };
  });
}

const ENCARGOS: [number, string, string, string | null, string, string, number, string | null, EstadoEncargo, string | null, number, string[]][] = [
  [1, 'Amigurumi de mascota', 'Un amigurumi de nuestro perro, un teckel marrón con una mancha blanca en el pecho. Unos 20 cm, sentado.',
    'Para el 20 de diciembre', '25 – 50 €', 'marrón chocolate y blanco', 0, '@lucia.ejemplo', 'nuevo', null, 28, []],
  [2, 'Manta o mantita', 'Una manta para una cuna de 60 × 120 en tonos verdes suaves, con las iniciales del bebé en una esquina.',
    'Sin prisa', '50 – 100 €', 'verde salvia y crudo', 5, null, 'nuevo', null, 55, ['/fotos/productos/manta-estrella-1.jpg']],
  [3, 'Pieza de bebé (gorrito, patucos, guirnalda…)', 'Guirnalda con el nombre «Martina» en letras sueltas y dos corazones a los lados, para la habitación.',
    'Antes de febrero', '25 – 50 €', 'rosa empolvado', 3, null, 'respondido', 'Enviado presupuesto: 38 € y tres semanas.', 144,
    ['/fotos/productos/guirnalda-corazones-1.jpg']],
  [4, 'Pack de regalo a medida', 'Un pack para una compañera que se jubila: cojín, paño de cocina y algo pequeño que tenga que ver con el mar.',
    '15 de noviembre', 'Más de 100 €', 'azules y crudo', 6, null, 'respondido', 'Propuestos dos packs; espera respuesta.', 264, []],
  [5, 'Amigurumi de persona', 'Una muñeca que se parezca a mi abuela: pelo blanco recogido, gafas redondas y su chaqueta de punto azul.',
    'Para su cumpleaños, en un mes', '50 – 100 €', 'azul marino, gris y blanco', 9, '@ana.ejemplo', 'aceptado', 'Aceptado. Empezamos la semana que viene.', 432, []],
  [6, 'Algo para la casa (cojín, cesta, alfombra)', 'Una alfombra redonda de trapillo de dos metros para el salón, en gris oscuro.',
    null, 'Hasta 25 €', 'gris marengo', 8, null, 'descartado', 'No llegamos con ese presupuesto; ofrecida una de 90 cm.', 648, []],
];

function generarEncargos(ahora: Date): FichaEncargo[] {
  return ENCARGOS.map(([n, tipo, descripcion, fecha, presupuesto, colores, c, instagram, estado, nota, horas, fotos]) => ({
    id: idDemo('encargo', n),
    creado_en: iso(ahora.getTime() - horas * HORA),
    estado,
    tipo,
    descripcion,
    fecha_deseada: fecha,
    presupuesto,
    colores,
    nombre: CLIENTES[c].nombre,
    email: CLIENTES[c].email,
    instagram,
    // Sin Storage, las fotos de referencia son fotos de la propia tienda.
    fotos,
    urls_fotos: fotos.map((ruta) => ({ ruta, url: ruta })),
    es_demo: true,
    nota_admin: nota,
  }));
}

// n, motivo, pedido (n del pedido) , cliente, mensaje, estado, nota, horas
const MENSAJES: [number, string, number | null, number, string, EstadoMensaje, string | null, number][] = [
  [1, 'Estado de un pedido que ya hice', 21, 4, '¡Hola! Quería saber si el gorro llegará antes del fin de semana que viene. ¡Gracias!', 'nuevo', null, 5],
  [2, 'Duda sobre un producto', null, 1, '¿La manta estrella se puede hacer en gris perla? No la veo entre los colores.', 'nuevo', null, 26],
  [3, 'Colaboración o prensa', null, 10, 'Escribo desde una revista local de artesanía y nos gustaría contar vuestra historia en el número de primavera.', 'nuevo', null, 54],
  [4, 'Problema con algo que me llegó', 17, 2, 'Al bolso se le ha soltado un punto del asa después de la primera semana. ¿Tiene arreglo?', 'respondido',
    'Le mandamos uno nuevo y nos devuelve el otro para repararlo.', 216],
  [5, 'Devolución o cambio', 4, 3, 'La cesta es más grande de lo que esperaba y no me cabe en la estantería. ¿Puedo devolverla?', 'respondido',
    'Devolución aceptada y reembolsada.', 1056],
  [6, 'Mandaros una foto de mi pieza', null, 7, 'Os mando la foto del pulpito en la cuna: es lo primero que busca al despertarse.', 'respondido',
    'Pedido permiso para compartirla.', 504],
  [7, 'Otra cosa', null, 11, '¿Hacéis talleres para aprender ganchillo? Me gustaría apuntarme con mi hija.', 'archivado', null, 840],
];

type MensajeDemo = Omit<FilaMensaje, 'total_filas'> & { nota_admin: string | null };

function generarMensajes(ahora: Date, pedidos: readonly FichaPedido[]): MensajeDemo[] {
  return MENSAJES.map(([n, motivo, pedido, c, mensaje, estado, nota, horas]) => ({
    id: idDemo('mensaje', n),
    creado_en: iso(ahora.getTime() - horas * HORA),
    estado,
    motivo,
    numero_pedido: pedido === null ? null : (pedidos[pedido - 1]?.numero ?? null),
    nombre: CLIENTES[c].nombre,
    email: CLIENTES[c].email,
    mensaje,
    es_demo: true,
    nota_admin: nota,
  }));
}

export interface DatosDemo {
  pedidos: FichaPedido[];
  encargos: FichaEncargo[];
  mensajes: MensajeDemo[];
  suscriptores: number;
}

export function generarDatosDemo(ahora: Date): DatosDemo {
  const pedidos = generarPedidos(ahora);
  return {
    pedidos,
    encargos: generarEncargos(ahora),
    mensajes: generarMensajes(ahora, pedidos),
    suscriptores: 37,
  };
}
