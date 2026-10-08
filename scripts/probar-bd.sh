#!/usr/bin/env bash
# Prueba la base de datos de principio a fin sin Docker ni cuenta de
# Supabase: levanta un PostgreSQL temporal, simula lo que Supabase da por
# hecho, aplica migraciones y semilla, y ejecuta las pruebas de seguridad.
# Termina con error ante el primer fallo y siempre limpia al salir.
#
# Requiere PostgreSQL 15 o superior (initdb, pg_ctl y psql). Si no están
# en el PATH, se buscan en /usr/lib/postgresql/<versión>/bin o en PG_BIN.

set -euo pipefail

raiz="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
supabase="$raiz/supabase"

# --- binarios ---------------------------------------------------------
if [[ -z "${PG_BIN:-}" ]]; then
  if command -v pg_ctl >/dev/null 2>&1; then
    PG_BIN="$(dirname "$(command -v pg_ctl)")"
  else
    PG_BIN="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -n 1 || true)"
  fi
fi
for binario in initdb pg_ctl psql; do
  if [[ ! -x "$PG_BIN/$binario" ]]; then
    echo "No encuentro $binario. Instala PostgreSQL o indica la carpeta con PG_BIN=…" >&2
    exit 1
  fi
done

# PostgreSQL no arranca como root: en ese caso se usa el usuario postgres.
como_pg=()
if [[ "$(id -u)" == "0" ]]; then
  como_pg=(runuser -u "${PG_USUARIO:-postgres}" --)
fi

# --- semilla al día ---------------------------------------------------
node --no-warnings "$raiz/scripts/generar-semilla.mjs" --comprobar

# --- clúster temporal -------------------------------------------------
dir="$(mktemp -d "${TMPDIR:-/tmp}/ovillo-pg.XXXXXX")"
datos="$dir/datos"
registro="$dir/postgres.log"
puerto="${PG_PUERTO:-54329}"

limpiar() {
  local estado=$?
  if [[ -f "$datos/postmaster.pid" ]]; then
    "${como_pg[@]}" "$PG_BIN/pg_ctl" -D "$datos" -m immediate stop >/dev/null 2>&1 || true
  fi
  if [[ $estado -ne 0 && -f "$registro" ]]; then
    echo "--- últimas líneas del registro de PostgreSQL ---" >&2
    tail -n 20 "$registro" >&2 || true
  fi
  rm -rf "$dir"
  exit $estado
}
trap limpiar EXIT

if [[ ${#como_pg[@]} -gt 0 ]]; then
  chown "${PG_USUARIO:-postgres}" "$dir"
fi

echo "› Creando un PostgreSQL temporal en $dir"
"${como_pg[@]}" "$PG_BIN/initdb" -D "$datos" -U postgres --auth=trust \
  --encoding=UTF8 --locale=C.UTF-8 >/dev/null
"${como_pg[@]}" "$PG_BIN/pg_ctl" -D "$datos" -l "$registro" -w \
  -o "-c listen_addresses='' -c unix_socket_directories='$dir' -p $puerto -c fsync=off" \
  start >/dev/null

psql_ovillo() {
  "$PG_BIN/psql" -X -q -v ON_ERROR_STOP=1 -h "$dir" -p "$puerto" -U postgres -d ovillo "$@"
}

"$PG_BIN/psql" -X -q -h "$dir" -p "$puerto" -U postgres -d postgres -c 'create database ovillo' >/dev/null

echo "› Preparando lo mínimo de Supabase"
psql_ovillo -f "$supabase/pruebas/supabase-minimo.sql" >/dev/null

for migracion in "$supabase"/migrations/*.sql; do
  echo "› Migración $(basename "$migracion")"
  psql_ovillo -f "$migracion" >/dev/null
done

echo "› Semilla"
psql_ovillo -f "$supabase/seed.sql" >/dev/null

echo "› Pruebas de seguridad"
# Solo se muestran los «ok · …» de cada comprobación, sin el prefijo de psql.
psql_ovillo -f "$supabase/pruebas/rls.sql" 2>&1 | sed -E 's/^psql:[^ ]+ (NOTICE|ERROR): +//' 

echo "› Carrera por la última pieza (8 compras a la vez)"
pids=()
for i in 1 2 3 4 5 6 7 8; do
  psql_ovillo -v sesion="carrera_$i" -f "$supabase/pruebas/carrera.sql" >/dev/null 2>&1 &
  pids+=($!)
done
ganadoras=0
for pid in "${pids[@]}"; do
  if wait "$pid"; then ganadoras=$((ganadoras + 1)); fi
done
stock="$(psql_ovillo -At -c "select v.stock from variantes v join productos p on p.id = v.producto_id
  where p.slug = 'guirnalda-corazones' and v.nombre = 'Rosa'")"
pedidos="$(psql_ovillo -At -c "select count(*) from pedidos where email = 'carrera@ovilloandco.example'")"
if [[ "$ganadoras" != "1" || "$stock" != "0" || "$pedidos" != "1" ]]; then
  echo "FALLA: compras con éxito=$ganadoras, pedidos=$pedidos, stock final=$stock (se esperaba 1, 1 y 0)" >&2
  exit 1
fi
echo "ok · de 8 compras simultáneas de la última pieza solo sale una y el stock queda en 0"

echo "› Datos de demostración (dos veces: se puede repetir)"
psql_ovillo -f "$supabase/seed-demo.sql" >/dev/null
psql_ovillo -f "$supabase/seed-demo.sql" >/dev/null

echo "› Pruebas del panel y del rol demo"
psql_ovillo -f "$supabase/pruebas/panel.sql" 2>&1 | sed -E 's/^psql:[^ ]+ (NOTICE|ERROR): +//'

echo "› Pruebas de escritura del panel"
psql_ovillo -f "$supabase/pruebas/panel-escritura.sql" 2>&1 | sed -E 's/^psql:[^ ]+ (NOTICE|ERROR): +//'

echo "✔ Base de datos probada."
