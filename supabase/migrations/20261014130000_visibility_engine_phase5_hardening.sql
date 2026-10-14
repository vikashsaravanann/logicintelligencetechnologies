-- 20261014130000_visibility_engine_phase5_hardening.sql
-- Hardening fixes from the independent technical/content-safety review.
--
--   * visibility_checks.ok  — did the probe call succeed? Failed/skipped probes
--     write ok=false so visibility scores exclude them instead of counting them
--     as genuine invisibility (mentioned=false). (Phase 1 measurement fix.)
--   * visibility_gaps unique(query_id,platform,competitor_id) — dedupe gaps.
--   * recompute_visibility_gaps(jsonb) — replaces all gaps in ONE transaction so
--     a mid-run failure can never leave the table empty/partial (Phase 2 fix).
--
-- Idempotent; service_role-only, matching the rest of the engine.

-- ---------------------------------------------------------------------------
-- visibility_checks.ok
-- ---------------------------------------------------------------------------
alter table visibility_checks add column if not exists ok boolean not null default true;

-- ---------------------------------------------------------------------------
-- visibility_gaps uniqueness (snapshot is wholesale-replaced, so a plain unique
-- key on the natural tuple is enough to prevent duplicates within a snapshot).
-- ---------------------------------------------------------------------------
create unique index if not exists uq_visibility_gaps_query_platform_competitor
  on visibility_gaps (query_id, platform, competitor_id);

-- ---------------------------------------------------------------------------
-- Atomic gap recomputation. Runs delete+insert in a single transaction; on any
-- error the whole function rolls back, leaving the previous snapshot intact.
-- ---------------------------------------------------------------------------
create or replace function recompute_visibility_gaps(gaps jsonb)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare inserted integer;
begin
  delete from visibility_gaps;
  insert into visibility_gaps (query_id, platform, competitor_id, note)
  select (g->>'query_id')::uuid,
         g->>'platform',
         (g->>'competitor_id')::uuid,
         g->>'note'
  from jsonb_array_elements(coalesce(gaps, '[]'::jsonb)) as g
  on conflict (query_id, platform, competitor_id)
    do update set note = excluded.note, computed_at = now();
  get diagnostics inserted = row_count;
  return inserted;
end;
$$;

revoke all on function recompute_visibility_gaps(jsonb) from public, anon, authenticated;
grant execute on function recompute_visibility_gaps(jsonb) to service_role;
