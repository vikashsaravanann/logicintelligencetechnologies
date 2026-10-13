"use client";

import { useRouter, useSearchParams } from "next/navigation";

export interface EntityOption {
  id: string;
  name: string;
  type: string;
  domain?: string | null;
}

/**
 * Entity picker for the Visibility dashboard. Navigates with ?entity=<id> so the
 * server component re-renders the scores/trend/table for the chosen entity.
 */
export function EntitySelect({
  entities,
  selectedId,
}: {
  entities: EntityOption[];
  selectedId: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  return (
    <label className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
      Entity
      <select
        value={selectedId}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          next.set("entity", e.target.value);
          router.push(`?${next.toString()}`);
        }}
        className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white px-3 py-2 text-sm font-semibold text-[var(--lit-navy,#0B2545)] shadow-2xs focus:border-[var(--lit-teal,#1FA9A2)] focus:outline-none"
      >
        {entities.map((ent) => (
          <option key={ent.id} value={ent.id}>
            {ent.name}
            {ent.type === "self" ? " (LIT)" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
