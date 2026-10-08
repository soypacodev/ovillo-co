'use client';

// Alta y edición de un producto con sus variantes. El servidor vuelve a
// validarlo todo (y la base de datos, con sus restricciones); aquí solo se ayuda:
// porcentaje de rebaja en vivo, dirección sugerida a partir del nombre y
// filas de variantes que se añaden sin recargar.

import { startTransition, useActionState, useState, type FormEvent, type ReactNode } from 'react';
import { guardarProducto } from '@/lib/panel/acciones';
import { CATEGORIAS } from '@/datos/semilla';
import { porcentajeRebaja } from '@/lib/formato';
import { NOMBRE_ESTADO_PRODUCTO, ESTADOS_PRODUCTO } from '@/lib/panel/estados';
import type { FichaProductoPanel } from '@/lib/panel/filas';
import { PANEL_INICIAL } from '@/lib/panel/tipos-accion';
import { AvisoPanel } from './aviso-panel';
import { BotonGuardar } from './boton-guardar';

const aEuros = (c: number | null | undefined) => (c == null ? '' : (c / 100).toFixed(2).replace('.', ','));
const deEuros = (t: string) => {
  const n = Number(t.replace(/[€\s]/g, '').replace(',', '.'));
  return Number.isFinite(n) && t.trim() !== '' ? Math.round(n * 100) : null;
};
const sugerirSlug = (nombre: string) =>
  nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

interface FilaVariante {
  clave: number;
  id: string;
  nombre: string;
  color: string;
  sku: string;
  stock: string;
  activa: boolean;
}

interface PropsFormulario {
  producto: FichaProductoPanel | null;
  bloqueado: string | null;
}

export function FormularioProducto({ producto: p, bloqueado }: PropsFormulario) {
  const [resultado, enviar, enviando] = useActionState(guardarProducto, PANEL_INICIAL);
  const errores = resultado.estado === 'error' ? resultado.errores : {};

  const [nombre, setNombre] = useState(p?.nombre ?? '');
  const [slugTocado, setSlugTocado] = useState(Boolean(p));
  const [slug, setSlug] = useState(p?.slug ?? '');
  const [tipo, setTipo] = useState(p?.tipo ?? 'simple');
  const [precio, setPrecio] = useState(aEuros(p?.precio));
  const [antes, setAntes] = useState(aEuros(p?.antes));
  const [encargo, setEncargo] = useState(p?.encargo ?? false);
  const [variantes, setVariantes] = useState<FilaVariante[]>(() =>
    (p?.variantes.length ? p.variantes : [{ id: '', nombre: '', color: '#EDE6DA', sku: '', stock: 0, activa: true }]).map((v, i) => ({
      clave: i,
      id: v.id ?? '',
      nombre: v.nombre,
      color: v.color,
      sku: v.sku ?? '',
      stock: String(v.stock),
      activa: v.activa,
    })),
  );
  const [siguiente, setSiguiente] = useState(variantes.length);

  const dto = porcentajeRebaja(deEuros(antes), deEuros(precio) ?? 0);

  function alEnviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (bloqueado) return;
    const datos = new FormData(e.currentTarget);
    startTransition(() => enviar(datos));
  }

  function cambiarVariante(clave: number, cambios: Partial<FilaVariante>) {
    setVariantes((vs) => vs.map((v) => (v.clave === clave ? { ...v, ...cambios } : v)));
  }

  const ayuda = (campo: string, texto?: ReactNode) => {
    const error = errores[campo];
    if (error) {
      return (
        <p className="error visible" id={`p-${campo}-ayuda`}>
          {error}
        </p>
      );
    }
    return texto ? (
      <p className="pista" id={`p-${campo}-ayuda`}>
        {texto}
      </p>
    ) : null;
  };
  const aria = (campo: string, conPista = false) => ({
    id: `p-${campo}`,
    name: campo,
    'aria-invalid': errores[campo] ? (true as const) : undefined,
    'aria-describedby': errores[campo] || conPista ? `p-${campo}-ayuda` : undefined,
  });

  return (
    <form action={enviar} onSubmit={alEnviar} className="panel-form form-producto" noValidate>
      <AvisoPanel resultado={resultado} />
      <input type="hidden" name="id" value={p?.id && p.id !== p.slug ? p.id : ''} />
      <input type="hidden" name="slug_original" value={p?.slug ?? ''} />

      <fieldset className="panel-caja">
        <legend className="panel-caja-titulo">Lo básico</legend>
        <div className="campo">
          <label htmlFor="p-nombre">Nombre</label>
          <input
            {...aria('nombre')}
            type="text"
            required
            maxLength={120}
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              if (!slugTocado) setSlug(sugerirSlug(e.target.value));
            }}
          />
          {ayuda('nombre')}
        </div>
        <div className="campo">
          <label htmlFor="p-slug">Dirección en la tienda</label>
          <div className="prefijo-campo">
            <span aria-hidden="true">/tienda/</span>
            <input
              {...aria('slug', true)}
              type="text"
              maxLength={80}
              spellCheck={false}
              value={slug}
              onChange={(e) => {
                setSlugTocado(true);
                setSlug(e.target.value);
              }}
            />
          </div>
          {ayuda('slug', 'Minúsculas, números y guiones. Si la cambias, los enlaces antiguos dejan de funcionar.')}
        </div>
        <div className="par">
          <div className="campo">
            <label htmlFor="p-categoria">Categoría</label>
            <select {...aria('categoria')} defaultValue={p?.categoria ?? ''}>
              <option value="">Elige una</option>
              {CATEGORIAS.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.nombre}
                </option>
              ))}
            </select>
            {ayuda('categoria')}
          </div>
          <div className="campo">
            <label htmlFor="p-tipo">Tipo</label>
            <select {...aria('tipo')} value={tipo} onChange={(e) => setTipo(e.target.value === 'pack' ? 'pack' : 'simple')}>
              <option value="simple">Pieza suelta</option>
              <option value="pack">Pack (varias piezas)</option>
            </select>
          </div>
        </div>
        <fieldset className="opciones-estado">
          <legend>En la tienda</legend>
          {ESTADOS_PRODUCTO.map((e) => (
            <label key={e} className="opcion opcion-p">
              <input type="radio" name="estado" value={e} defaultChecked={(p?.estado ?? 'borrador') === e} />
              <span>
                {NOMBRE_ESTADO_PRODUCTO[e]}
                <span className="mini-2">
                  {e === 'publicado' ? 'Se ve y se vende' : e === 'borrador' ? 'Solo aquí, en el panel' : 'Retirado, se conserva'}
                </span>
              </span>
            </label>
          ))}
        </fieldset>
      </fieldset>

      <fieldset className="panel-caja">
        <legend className="panel-caja-titulo">Precio</legend>
        <div className="par">
          <div className="campo">
            <label htmlFor="p-precio">Precio (€)</label>
            <input {...aria('precio')} type="text" inputMode="decimal" required value={precio} onChange={(e) => setPrecio(e.target.value)} />
            {ayuda('precio')}
          </div>
          <div className="campo">
            <label htmlFor="p-antes">
              Precio anterior (€) <span className="aclaracion">(si está rebajado)</span>
            </label>
            <input {...aria('antes', true)} type="text" inputMode="decimal" value={antes} onChange={(e) => setAntes(e.target.value)} />
            {ayuda('antes', dto ? `Se verá tachado, con un −${dto} %.` : 'Déjalo vacío si no hay rebaja.')}
          </div>
        </div>
        <div className="par">
          <div className="campo">
            <label htmlFor="p-etiqueta">
              Etiqueta <span className="aclaracion">(opcional)</span>
            </label>
            <input {...aria('etiqueta', true)} type="text" maxLength={30} defaultValue={p?.etiqueta ?? ''} placeholder="Último" />
            {ayuda('etiqueta', 'Sale sobre la foto. Si la dejas vacía y hay rebaja, se ve el porcentaje.')}
          </div>
          <div className="campo campo-casillas">
            <label className="check">
              <input type="checkbox" name="destacado" defaultChecked={p?.destacado} />
              <span>Destacado en la portada</span>
            </label>
            <label className="check">
              <input type="checkbox" name="novedad" defaultChecked={p?.novedad} />
              <span>Marcar como novedad</span>
            </label>
          </div>
        </div>
      </fieldset>

      <fieldset className="panel-caja">
        <legend className="panel-caja-titulo">Variantes y stock</legend>
        {errores.variantes && <p className="error visible">{errores.variantes}</p>}
        <div className="variantes-tabla" role="group" aria-label="Variantes">
          <div className="variantes-cab" aria-hidden="true">
            <span>Color</span>
            <span>Nombre</span>
            <span>SKU</span>
            <span>Stock</span>
            <span>Activa</span>
            <span />
          </div>
          {variantes.map((v, i) => {
            const pre = `variantes.${i}`;
            const errNombre = errores[`${pre}.nombre`];
            const errStock = errores[`${pre}.stock`];
            const errColor = errores[`${pre}.color`];
            const quien = v.nombre || `variante ${i + 1}`;
            return (
              <div key={v.clave} className={v.activa ? 'variante-fila' : 'variante-fila inactiva'}>
                <input type="hidden" name={`${pre}.id`} value={v.id} />
                <label className="variante-color">
                  <span className="oculto-vis">Color de {quien}</span>
                  <input type="color" name={`${pre}.color`} value={v.color} onChange={(e) => cambiarVariante(v.clave, { color: e.target.value })} aria-invalid={errColor ? true : undefined} />
                </label>
                <label className="v-nombre">
                  <span className="oculto-vis">Nombre de la variante {i + 1}</span>
                  <input
                    type="text"
                    name={`${pre}.nombre`}
                    maxLength={60}
                    value={v.nombre}
                    placeholder="Gris perla"
                    onChange={(e) => cambiarVariante(v.clave, { nombre: e.target.value })}
                    aria-invalid={errNombre ? true : undefined}
                  />
                </label>
                <label className="v-sku">
                  <span className="oculto-vis">SKU de {quien}</span>
                  <input type="text" name={`${pre}.sku`} maxLength={40} value={v.sku} placeholder="Opcional" spellCheck={false} onChange={(e) => cambiarVariante(v.clave, { sku: e.target.value })} />
                </label>
                <label className="v-stock">
                  <span className="oculto-vis">Stock de {quien}</span>
                  <input
                    type="number"
                    name={`${pre}.stock`}
                    min={0}
                    max={9999}
                    inputMode="numeric"
                    value={v.stock}
                    onChange={(e) => cambiarVariante(v.clave, { stock: e.target.value })}
                    aria-invalid={errStock ? true : undefined}
                  />
                </label>
                <label className="variante-activa">
                  <input type="checkbox" name={`${pre}.activa`} checked={v.activa} onChange={(e) => cambiarVariante(v.clave, { activa: e.target.checked })} />
                  <span className="oculto-vis">{quien} activa</span>
                  <span className="solo-estrecho" aria-hidden="true">
                    Activa
                  </span>
                </label>
                {v.id ? (
                  <span />
                ) : (
                  <button
                    type="button"
                    className="boton-texto"
                    disabled={variantes.length === 1}
                    onClick={() => setVariantes((vs) => vs.filter((x) => x.clave !== v.clave))}
                  >
                    Quitar<span className="oculto-vis"> {quien}</span>
                  </button>
                )}
                {(errNombre || errStock || errColor) && <p className="error visible variante-error">{errNombre ?? errStock ?? errColor}</p>}
              </div>
            );
          })}
        </div>
        <div className="acciones-fila mt-4">
          <button
            type="button"
            className="btn btn-3 btn-p"
            disabled={variantes.length >= 20}
            onClick={() => {
              setVariantes((vs) => [...vs, { clave: siguiente, id: '', nombre: '', color: '#EDE6DA', sku: '', stock: '0', activa: true }]);
              setSiguiente((n) => n + 1);
            }}
          >
            Añadir variante
          </button>
        </div>
        <p className="pista mt-3">
          Las variantes guardadas no se borran (hay pedidos y cestas que las nombran): para retirarlas, desmarca «Activa».
        </p>

        <div className="par mt-6">
          <label className="check">
            <input type="checkbox" name="encargo" checked={encargo} onChange={(e) => setEncargo(e.target.checked)} />
            <span>Se teje por encargo (no hay unidades hechas)</span>
          </label>
          {encargo && (
            <div className="campo">
              <label htmlFor="p-dias">Días de confección</label>
              <input {...aria('dias')} type="number" min={1} max={90} inputMode="numeric" defaultValue={p?.dias ?? ''} />
              {ayuda('dias')}
            </div>
          )}
        </div>
      </fieldset>

      <fieldset className="panel-caja">
        <legend className="panel-caja-titulo">Textos de la ficha</legend>
        <div className="campo">
          <label htmlFor="p-corto">Frase corta</label>
          <input {...aria('corto', true)} type="text" maxLength={160} defaultValue={p?.corto ?? ''} />
          {ayuda('corto', 'Sale debajo del nombre en las tarjetas.')}
        </div>
        <div className="campo">
          <label htmlFor="p-largo">Descripción</label>
          <textarea {...aria('largo')} rows={5} maxLength={4000} defaultValue={p?.largo ?? ''} />
          {ayuda('largo')}
        </div>
        <div className="campo">
          <label htmlFor="p-historia">
            Cómo se hace <span className="aclaracion">(opcional)</span>
          </label>
          <textarea {...aria('historia')} rows={3} maxLength={2000} defaultValue={p?.historia ?? ''} />
          {ayuda('historia')}
        </div>
        <div className="par">
          <div className="campo">
            <label htmlFor="p-materiales">Materiales</label>
            <textarea {...aria('materiales', true)} rows={4} defaultValue={p?.materiales.join('\n') ?? ''} />
            {ayuda('materiales', 'Uno por línea.')}
          </div>
          <div className="campo">
            <label htmlFor="p-medidas">Medidas</label>
            <textarea {...aria('medidas')} rows={4} maxLength={300} defaultValue={p?.medidas ?? ''} />
            {ayuda('medidas')}
          </div>
        </div>
        <div className="campo">
          <label htmlFor="p-cuidados">Cuidados</label>
          <textarea {...aria('cuidados')} rows={3} maxLength={1000} defaultValue={p?.cuidados ?? ''} />
          {ayuda('cuidados')}
        </div>
        {tipo === 'pack' && (
          <div className="campo">
            <label htmlFor="p-contenido">Qué incluye el pack</label>
            <textarea {...aria('contenido', true)} rows={4} defaultValue={p?.contenido?.join('\n') ?? ''} />
            {ayuda('contenido', 'Una pieza por línea.')}
          </div>
        )}
      </fieldset>

      <fieldset className="panel-caja">
        <legend className="panel-caja-titulo">Personalización</legend>
        <p className="pista mb-6">Para piezas que llevan un nombre o unas iniciales. Déjalo vacío si no se personaliza.</p>
        <div className="par">
          <div className="campo">
            <label htmlFor="p-personalizacion_etiqueta">Qué se pide</label>
            <input {...aria('personalizacion_etiqueta')} type="text" maxLength={60} defaultValue={p?.personalizacion_etiqueta ?? ''} placeholder="Iniciales bordadas" />
            {ayuda('personalizacion_etiqueta')}
          </div>
          <div className="campo">
            <label htmlFor="p-personalizacion_max">Máximo de letras</label>
            <input {...aria('personalizacion_max')} type="number" min={1} max={60} defaultValue={p?.personalizacion_max ?? ''} />
            {ayuda('personalizacion_max')}
          </div>
        </div>
        <div className="par">
          <div className="campo">
            <label htmlFor="p-personalizacion_ejemplo">Ejemplo</label>
            <input {...aria('personalizacion_ejemplo')} type="text" maxLength={60} defaultValue={p?.personalizacion_ejemplo ?? ''} placeholder="L.M." />
          </div>
          <div className="campo">
            <label htmlFor="p-personalizacion_pista">Pista para el cliente</label>
            <input {...aria('personalizacion_pista')} type="text" maxLength={160} defaultValue={p?.personalizacion_pista ?? ''} />
          </div>
        </div>
      </fieldset>

      <div className="barra-guardar">
        <BotonGuardar texto={p ? 'Guardar cambios' : 'Crear el producto'} enviando={enviando} bloqueado={bloqueado} />
      </div>
    </form>
  );
}
