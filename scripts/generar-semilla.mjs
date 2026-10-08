#!/usr/bin/env node
// Genera supabase/seed.sql a partir de src/datos/semilla.ts, para que la
// tienda sin base de datos y la base de datos tengan el mismo catálogo.
//
//   node scripts/generar-semilla.mjs             escribe supabase/seed.sql
//   node scripts/generar-semilla.mjs --comprobar falla si está desfasado
//
// Node 22.18+ carga el .ts directamente (solo quita los tipos).

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destino = path.join(raiz, 'supabase', 'seed.sql');

const { CATEGORIAS, PRODUCTOS, PROMOCIONES, ENVIOS } = await import(
  path.join(raiz, 'src', 'datos', 'semilla.ts')
);

/** Literal de texto SQL, o null. */
const texto = (valor) =>
  valor === null || valor === undefined ? 'null' : `'${String(valor).replaceAll("'", "''")}'`;

const entero = (valor) => {
  if (valor === null || valor === undefined) return 'null';
  if (!Number.isInteger(valor)) throw new Error(`Se esperaba un entero y llegó ${valor}`);
  return String(valor);
};

const booleano = (valor) => (valor ? 'true' : 'false');

const lista = (valores) =>
  valores === null || valores === undefined
    ? 'null'
    : valores.length === 0
      ? `'{}'::text[]`
      : `array[${valores.map(texto).join(', ')}]`;

const categoria = (slug) => `(select id from public.categorias where slug = ${texto(slug)})`;
const producto = (slug) => `(select id from public.productos where slug = ${texto(slug)})`;

/** Ruta en la base de datos: la misma ruta pública que usa la semilla. */
const ruta = (foto) => foto.src;

const bloques = [];

bloques.push(`-- ============================================================
--  Ovillo & Co. · Catálogo de demostración
--
--  Generado por scripts/generar-semilla.mjs a partir de
--  src/datos/semilla.ts. No se edita a mano: cambia la semilla y
--  ejecuta «npm run db:semilla».
-- ============================================================

begin;`);

bloques.push(
  '-- Categorías\n' +
    'insert into public.categorias (slug, nombre, texto, foto_ruta, foto_alt, posicion) values\n' +
    CATEGORIAS.map(
      (c, i) =>
        `  (${texto(c.slug)}, ${texto(c.nombre)}, ${texto(c.texto)}, ${texto(ruta(c.foto))}, ${texto(c.foto.alt)}, ${i})`,
    ).join(',\n') +
    ';',
);

for (const [i, p] of PRODUCTOS.entries()) {
  const per = p.personalizable ?? null;
  bloques.push(`-- ${p.nombre}
insert into public.productos (
  slug, nombre, categoria_id, tipo, estado, precio, antes,
  destacado, novedad, encargo, dias, etiqueta,
  corto, largo, historia, materiales, cuidados, medidas,
  personalizacion_etiqueta, personalizacion_ejemplo, personalizacion_max, personalizacion_pista,
  contenido, posicion, publicado_en
) values (
  ${texto(p.slug)}, ${texto(p.nombre)}, ${categoria(p.categoria)}, ${texto(p.tipo)}, 'publicado', ${entero(p.precio)}, ${entero(p.antes)},
  ${booleano(p.destacado)}, ${booleano(p.novedad)}, ${booleano(p.encargo)}, ${entero(p.dias)}, ${texto(p.etiqueta)},
  ${texto(p.corto)},
  ${texto(p.largo)},
  ${texto(p.historia)},
  ${lista(p.materiales)},
  ${texto(p.cuidados)},
  ${texto(p.medidas)},
  ${texto(per?.etiqueta)}, ${texto(per?.ejemplo)}, ${entero(per?.max)}, ${texto(per?.pista)},
  ${lista(p.contenido ?? null)}, ${i}, now()
);

insert into public.variantes (producto_id, nombre, color, stock, posicion) values
${p.variantes
  .map(
    (v, j) =>
      `  (${producto(p.slug)}, ${texto(v.nombre)}, ${texto(v.color.toUpperCase())}, ${entero(v.stock)}, ${j})`,
  )
  .join(',\n')};

insert into public.fotos_producto (producto_id, ruta, alt, posicion) values
${p.fotos
  .map((f, j) => `  (${producto(p.slug)}, ${texto(ruta(f))}, ${texto(f.alt)}, ${j})`)
  .join(',\n')};`);
}

bloques.push(
  '-- Promociones\n' +
    'insert into public.promociones (nombre, tipo, valor, codigo, minimo, categoria_id, hasta) values\n' +
    PROMOCIONES.map(
      (pr) =>
        `  (${texto(pr.nombre)}, ${texto(pr.tipo)}, ${entero(pr.valor)}, ${texto(pr.codigo)}, ${entero(pr.minimo)}, ${
          pr.categoria ? categoria(pr.categoria) : 'null'
        }, ${pr.hasta ? `${texto(pr.hasta)}::date` : 'null'})`,
    ).join(',\n') +
    ';',
);

bloques.push(
  '-- Métodos de envío\n' +
    'insert into public.metodos_envio (id, nombre, precio, gratis_desde, plazo, posicion) values\n' +
    ENVIOS.map(
      (e, i) =>
        `  (${texto(e.id)}, ${texto(e.nombre)}, ${entero(e.precio)}, ${entero(e.gratisDesde)}, ${texto(e.plazo)}, ${i})`,
    ).join(',\n') +
    ';',
);

bloques.push('commit;');

const sql = bloques.join('\n\n') + '\n';

if (process.argv.includes('--comprobar')) {
  const actual = await readFile(destino, 'utf8').catch(() => '');
  if (actual !== sql) {
    console.error('supabase/seed.sql no coincide con src/datos/semilla.ts. Ejecuta «npm run db:semilla».');
    process.exit(1);
  }
  console.log('supabase/seed.sql está al día.');
} else {
  await writeFile(destino, sql);
  console.log(`Escrito ${path.relative(raiz, destino)}: ${CATEGORIAS.length} categorías, ${PRODUCTOS.length} productos.`);
}
