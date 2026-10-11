#!/usr/bin/env bash
# Local migration tests against an isolated Postgres. Never touches prod.
# Applies the Supabase stub, the live baseline, every supabase/migration twice
# (proving idempotency), then runs tests/db/*.assert.sql.
set -euo pipefail

PGBIN="${PGBIN:-/usr/lib/postgresql/16/bin}"
PORT="${DBTEST_PORT:-54329}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"

if [ -x "$PGBIN/initdb" ]; then
  # Local native postgres binaries
  DATADIR="$WORK/data"
  export PGDATA="$DATADIR"
  cleanup() {
    "$PGBIN/pg_ctl" -D "$DATADIR" -m immediate stop >/dev/null 2>&1 || true
    rm -rf "$WORK"
  }
  trap cleanup EXIT

  "$PGBIN/initdb" -D "$DATADIR" -U postgres --auth=trust >/dev/null
  "$PGBIN/pg_ctl" -D "$DATADIR" -o "-p $PORT -c listen_addresses=localhost -c unix_socket_directories=$WORK" -w start >/dev/null
  PSQL=("$PGBIN/psql" -v ON_ERROR_STOP=1 -h localhost -p "$PORT" -U postgres -d postgres -q)
  EXEC_CMD() {
    local file="$1"
    "${PSQL[@]}" -f "$file"
  }
elif command -v docker >/dev/null 2>&1; then
  # Docker fallback on Mac or developer machines
  echo "• Local Postgres binary not found at $PGBIN; running isolated Docker container..."
  CONTAINER="lit-dbtest-$PORT"
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
  docker run -d --name "$CONTAINER" -e POSTGRES_PASSWORD=postgres postgres:17-alpine >/dev/null
  cleanup() {
    docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
    rm -rf "$WORK"
  }
  trap cleanup EXIT

  for i in $(seq 1 30); do
    if docker exec "$CONTAINER" pg_isready -U postgres >/dev/null 2>&1; then
      break
    fi
    sleep 0.5
  done

  EXEC_CMD() {
    local file="$1"
    docker exec -i "$CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -q < "$file"
  }
else
  echo "Neither $PGBIN/initdb nor docker is available to run database tests." >&2
  exit 1
fi

echo "• stub + baseline"
EXEC_CMD "$ROOT/tests/db/00_supabase_stub.sql"
EXEC_CMD "$ROOT/tests/db/01_live_baseline.sql"

for pass in 1 2; do
  echo "• migrations (pass $pass — idempotency)"
  for m in "$ROOT"/supabase/migrations/20261006*.sql \
           "$ROOT"/supabase/migrations/20261007*.sql \
           "$ROOT"/supabase/migrations/20261008*.sql \
           "$ROOT"/supabase/migrations/20261009*.sql \
           "$ROOT"/supabase/migrations/20261010*.sql \
           "$ROOT"/supabase/migrations/20261011*.sql \
           "$ROOT"/supabase/migrations/20261012*.sql; do
    [ -e "$m" ] || continue
    EXEC_CMD "$m"
  done
done

for a in "$ROOT"/tests/db/*.assert.sql; do
  [ -e "$a" ] || continue
  echo "• assert $(basename "$a")"
  EXEC_CMD "$a"
done

echo "db-test OK"
