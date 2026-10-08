// Panel sin base de datos: los datos de demostración se generan en memoria
// y cada consulta repite lo que hace su función panel_* en SQL (mismos
// filtros, mismo orden, mismas columnas). Es de solo lectura.

import { PRODUCTOS } from '@/datos/semilla';
import type { Producto } from '@/lib/catalogo/tipos';
import { generarDatosDemo, type DatosDemo } from './datos-demo';
import { ESTADOS_PENDIENTES } from './estados';
import { diaMadrid, inicioMesMadrid, sumarDias } from '@/lib/fechas';
import type {
  FichaProductoPanel,
  FilaCliente,
  FilaEncargo,
  FilaMensaje,
  FilaPedido,
  FilaProductoPanel,
  Pagina,
  StockBajo,
} from './filas';
import type { FuentePanel } from './fuente';

const vendido = (estado: string) => estado !== 'cancelado' && estado !== 'reembolsado';

function paginar<T>(filas: T[], limite: number, desplazamiento: number): Pagina<T> {
  const l = Math.min(Math.max(limite, 1), 200);
  const d = Math.max(desplazamiento, 0);
  return { filas: filas.slice(d, d + l), total: filas.length };
}

/** total_filas va en cada fila, como en SQL (count(*) over ()). */
const conTotal = <T>(filas: T[]) => filas.map((f) => ({ ...f, total_filas: filas.length }));

function aFilaProducto(p: Producto): FilaProductoPanel {
  return {
    id: p.slug,
    slug: p.slug,
    nombre: p.nombre,
    categoria: p.categoria,
    estado: 'publicado',
    precio: p.precio,
    antes: p.antes,
    encargo: p.encargo,
    dias: p.dias,
    foto: p.fotos[0]?.src ?? null,
    variantes: p.variantes.map((v, i) => ({
      id: `${p.slug}-${i}`,
      nombre: v.nombre,
      color: v.color,
      sku: null,
      stock: v.stock,
      activa: true,
    })),
  };
}

function aFichaProducto(p: Producto): FichaProductoPanel {
  return {
    ...aFilaProducto(p),
    tipo: p.tipo,
    destacado: p.destacado,
    novedad: p.novedad,
    etiqueta: p.etiqueta,
    corto: p.corto,
    largo: p.largo,
    historia: p.historia,
    materiales: p.materiales,
    cuidados: p.cuidados,
    medidas: p.medidas,
    contenido: p.contenido ?? null,
    personalizacion_etiqueta: p.personalizable?.etiqueta ?? null,
    personalizacion_ejemplo: p.personalizable?.ejemplo ?? null,
    personalizacion_max: p.personalizable?.max ?? null,
    personalizacion_pista: p.personalizable?.pista ?? null,
    fotos: p.fotos.map((f, i) => ({ id: `${p.slug}-${i}`, ruta: f.src, url: f.src, alt: f.alt })),
  };
}

/**
 * Mes en curso y el mismo tramo del mes anterior, como en panel_resumen():
 * del día 1 a la misma fecha y hora, en hora de Madrid. Si el mes pasado
 * era más corto, el tramo acaba con él (el 31 de marzo cuenta febrero entero).
 */
export function periodosComparables(ahora: Date): { mes: string; anterior: string; finAnterior: string } {
  const mes = inicioMesMadrid(ahora);
  const anterior = inicioMesMadrid(ahora, -1);
  const transcurrido = ahora.getTime() - mes.getTime();
  const finAnterior = new Date(Math.min(anterior.getTime() + transcurrido, mes.getTime()));
  return { mes: mes.toISOString(), anterior: anterior.toISOString(), finAnterior: finAnterior.toISOString() };
}

/** `ahora` se puede fijar para que las pruebas den siempre lo mismo. */
export function crearFuenteLocal(ahora: () => Date = () => new Date()): FuentePanel {
  // Se regeneran si cambia el día, para que «hoy» siga siendo hoy.
  let datosDelDia: { dia: string; datos: DatosDemo } | null = null;
  const datos = () => {
    const momento = ahora();
    const dia = diaMadrid(momento);
    if (!datosDelDia || datosDelDia.dia !== dia) datosDelDia = { dia, datos: generarDatosDemo(momento) };
    return datosDelDia.datos;
  };

  const porFechaDesc = <T extends { creado_en: string }>(a: T, b: T) => b.creado_en.localeCompare(a.creado_en);

  return {
    modo: 'local',

    async resumen() {
      const { pedidos, encargos, mensajes, suscriptores } = datos();
      const momento = ahora();
      const { mes, anterior, finAnterior } = periodosComparables(momento);
      const delMes = pedidos.filter((p) => vendido(p.estado) && p.creado_en >= mes);
      const ventasMes = delMes.reduce((s, p) => s + p.total, 0);
      return {
        ventas_mes: ventasMes,
        pedidos_mes: delMes.length,
        ticket_medio_mes: delMes.length ? Math.round(ventasMes / delMes.length) : 0,
        ventas_periodo_anterior: pedidos
          .filter((p) => vendido(p.estado) && p.creado_en >= anterior && p.creado_en < finAnterior)
          .reduce((s, p) => s + p.total, 0),
        pedidos_pendientes: pedidos.filter((p) => ESTADOS_PENDIENTES.includes(p.estado)).length,
        encargos_nuevos: encargos.filter((e) => e.estado === 'nuevo').length,
        mensajes_nuevos: mensajes.filter((m) => m.estado === 'nuevo').length,
        variantes_stock_bajo: PRODUCTOS.filter((p) => !p.encargo)
          .flatMap((p) => p.variantes)
          .filter((v) => v.stock <= 1).length,
        suscriptores,
      };
    },

    async ventasPorDia(dias = 30) {
      const n = Math.min(Math.max(dias, 1), 366);
      const hoy = diaMadrid(ahora());
      const porDia = new Map<string, { pedidos: number; ventas: number }>();
      for (const p of datos().pedidos) {
        if (!vendido(p.estado)) continue;
        const dia = diaMadrid(new Date(p.creado_en));
        const actual = porDia.get(dia) ?? { pedidos: 0, ventas: 0 };
        porDia.set(dia, { pedidos: actual.pedidos + 1, ventas: actual.ventas + p.total });
      }
      return Array.from({ length: n }, (_, i) => {
        const dia = sumarDias(hoy, i - (n - 1));
        return { dia, ...(porDia.get(dia) ?? { pedidos: 0, ventas: 0 }) };
      });
    },

    async stockBajo(umbral = 1) {
      // Lo que se teje por encargo no se repone: su stock es el cupo de encargos.
      const filas: (StockBajo & { posicion: number })[] = PRODUCTOS.filter((p) => !p.encargo).flatMap((p) =>
        p.variantes.map((v, posicion) => ({
          producto_slug: p.slug,
          producto: p.nombre,
          variante: v.nombre,
          color: v.color,
          stock: v.stock,
          encargo: p.encargo,
          posicion,
        })),
      ).filter((f) => f.stock <= Math.max(umbral, 0));
      filas.sort((a, b) => a.stock - b.stock || a.producto.localeCompare(b.producto, 'es') || a.posicion - b.posicion);
      return filas.map((f) => ({
        producto_slug: f.producto_slug,
        producto: f.producto,
        variante: f.variante,
        color: f.color,
        stock: f.stock,
        encargo: f.encargo,
      }));
    },

    async pedidos({ estado, busqueda, limite, desplazamiento }) {
      const q = busqueda?.trim().toLowerCase() ?? '';
      const filas = datos()
        .pedidos.filter((p) => !estado || p.estado === estado)
        .filter(
          (p) =>
            !q ||
            p.numero.toLowerCase().includes(q) ||
            (p.email ?? '').toLowerCase().includes(q) ||
            (p.nombre_cliente ?? '').toLowerCase().includes(q),
        )
        .sort(porFechaDesc)
        .map(
          (p): Omit<FilaPedido, 'total_filas'> => ({
            id: p.id,
            numero: p.numero,
            creado_en: p.creado_en,
            estado: p.estado,
            nombre_cliente: p.nombre_cliente,
            email: p.email ?? '',
            total: p.total,
            unidades: p.lineas.reduce((s, l) => s + l.cantidad, 0),
            metodo_envio_nombre: p.metodo_envio_nombre,
            es_demo: p.es_demo,
          }),
        );
      return paginar(conTotal(filas), limite, desplazamiento);
    },

    async pedido(id) {
      return datos().pedidos.find((p) => p.id === id) ?? null;
    },

    async clientes({ limite, desplazamiento }) {
      const grupos = new Map<string, Omit<FilaCliente, 'total_filas'>>();
      // Del más reciente al más antiguo: el primero de cada correo da el nombre.
      for (const p of [...datos().pedidos].sort(porFechaDesc)) {
        const clave = (p.email ?? '').toLowerCase();
        const g = grupos.get(clave);
        const gastado = vendido(p.estado) ? p.total : 0;
        if (!g) {
          grupos.set(clave, {
            email: p.email ?? '',
            nombre: p.nombre_cliente,
            pedidos: 1,
            gastado,
            primer_pedido: p.creado_en,
            ultimo_pedido: p.creado_en,
            tiene_cuenta: p.tiene_cuenta,
            es_demo: p.es_demo,
          });
        } else {
          g.pedidos += 1;
          g.gastado += gastado;
          g.primer_pedido = p.creado_en;
          g.tiene_cuenta ||= p.tiene_cuenta;
          g.es_demo &&= p.es_demo;
        }
      }
      const filas = [...grupos.values()].sort((a, b) => b.ultimo_pedido.localeCompare(a.ultimo_pedido));
      return paginar(conTotal(filas), limite, desplazamiento);
    },

    async encargos({ estado, limite, desplazamiento }) {
      const filas = datos()
        .encargos.filter((e) => !estado || e.estado === estado)
        .sort(porFechaDesc)
        .map(
          (e): Omit<FilaEncargo, 'total_filas'> => ({
            id: e.id,
            creado_en: e.creado_en,
            estado: e.estado,
            tipo: e.tipo,
            descripcion: e.descripcion,
            fecha_deseada: e.fecha_deseada,
            presupuesto: e.presupuesto,
            colores: e.colores,
            nombre: e.nombre,
            email: e.email,
            instagram: e.instagram,
            fotos: e.fotos,
            es_demo: e.es_demo,
          }),
        );
      return paginar(conTotal(filas), limite, desplazamiento);
    },

    async encargo(id) {
      return datos().encargos.find((e) => e.id === id) ?? null;
    },

    async mensajes({ estado, limite, desplazamiento }) {
      const filas = datos()
        .mensajes.filter((m) => !estado || m.estado === estado)
        .sort(porFechaDesc)
        .map(
          (m): Omit<FilaMensaje, 'total_filas'> => ({
            id: m.id,
            creado_en: m.creado_en,
            estado: m.estado,
            motivo: m.motivo,
            numero_pedido: m.numero_pedido,
            nombre: m.nombre,
            email: m.email,
            mensaje: m.mensaje,
            es_demo: m.es_demo,
          }),
        );
      return paginar(conTotal(filas), limite, desplazamiento);
    },

    async productos() {
      return PRODUCTOS.map(aFilaProducto);
    },

    async producto(slug) {
      const p = PRODUCTOS.find((x) => x.slug === slug);
      return p ? aFichaProducto(p) : null;
    },
  };
}
