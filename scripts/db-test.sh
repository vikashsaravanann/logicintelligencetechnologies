#!/usr/bin/env bash
# Local migration tests against an isolated Postgres 16. Never touches prod.
# Applies the Supabase stub, the live baseline, every supabase/migration twice
# (proving idempotency), then runs tests/db/*.assert.sql.
set -euo pipefail

# Postgres refuses to run as root. Re-exec under an unprivileged user.
if [ "$(id -u)" = "0" ]; then
  RUNUSER="${DBTEST_USER:-ubuntu}"
  if id "$RUNUSER" >/dev/null 2>&1; then
    exec sudo -u "$RUNUSER" -E env "PATH=$PATH" bash "$0" "$@"
  fi
  echo "db-test must not run as root and no '$RUNUSER' user exists" >&2
  exit 1
fi

PGBIN="${PGBIN:-/usr/lib/postgresql/16/bin}"
PORT="${DBTEST_PORT:-54329}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
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

echo "• stub + baseline"
"${PSQL[@]}" -f "$ROOT/tests/db/00_supabase_stub.sql" >/dev/null
"${PSQL[@]}" -f "$ROOT/tests/db/01_live_baseline.sql" >/dev/null

for pass in 1 2; do
  echo "• migrations (pass $pass — idempotency)"
  for m in "$ROOT"/supabase/migrations/20261006*.sql "$ROOT"/supabase/migrations/20261007*.sql "$ROOT"/supabase/migrations/20261008*.sql "$ROOT"/supabase/migrations/20261009*.sql "$ROOT"/supabase/migrations/20261010*.sql; do
    [ -e "$m" ] || continue
    "${PSQL[@]}" -f "$m" >/dev/null
  done
done

for a in "$ROOT"/tests/db/*.assert.sql; do
  [ -e "$a" ] || continue
  echo "• assert $(basename "$a")"
  "${PSQL[@]}" -f "$a" >/dev/null
done

echo "db-test OK"
