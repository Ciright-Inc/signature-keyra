"use client";

import type { RoleCategory } from "@/lib/types/documentSignature";

export type VaultFilterState = {
  world_id: string;
  role_category: RoleCategory;
  signature_status: string;
  document_status: string;
  date_from: string;
  date_to: string;
  q: string;
};

type Props = {
  worlds: { world_id: string; world_name: string }[];
  filters: VaultFilterState;
  onChange: (next: VaultFilterState) => void;
};

export function VaultFilters({ worlds, filters, onChange }: Props) {
  const set = (patch: Partial<VaultFilterState>) => onChange({ ...filters, ...patch });

  return (
    <div className="keyra-card space-y-4 p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--keyra-ink-muted-on-light)]">Search</span>
          <input
            type="search"
            value={filters.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder="Document, purpose, person, world…"
            className="rounded-lg border border-[var(--keyra-border)] bg-white px-3 py-2 text-[var(--keyra-ink-on-light)] outline-none focus:ring-2 focus:ring-[var(--keyra-ring)]"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--keyra-ink-muted-on-light)]">World</span>
          <select
            value={filters.world_id}
            onChange={(e) => set({ world_id: e.target.value })}
            className="rounded-lg border border-[var(--keyra-border)] bg-white px-3 py-2"
          >
            <option value="">All worlds</option>
            {worlds.map((w) => (
              <option key={w.world_id} value={w.world_id}>
                {w.world_name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--keyra-ink-muted-on-light)]">Signature status</span>
          <select
            value={filters.signature_status}
            onChange={(e) => set({ signature_status: e.target.value })}
            className="rounded-lg border border-[var(--keyra-border)] bg-white px-3 py-2"
          >
            <option value="">Any</option>
            <option value="signed">Signed</option>
            <option value="partially_signed">Partially signed</option>
            <option value="imported">Imported</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--keyra-ink-muted-on-light)]">Document status</span>
          <select
            value={filters.document_status}
            onChange={(e) => set({ document_status: e.target.value })}
            className="rounded-lg border border-[var(--keyra-border)] bg-white px-3 py-2"
          >
            <option value="">Any</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
            <option value="stored">Stored</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--keyra-ink-muted-on-light)]">From date</span>
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => set({ date_from: e.target.value })}
            className="rounded-lg border border-[var(--keyra-border)] bg-white px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--keyra-ink-muted-on-light)]">To date</span>
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => set({ date_to: e.target.value })}
            className="rounded-lg border border-[var(--keyra-border)] bg-white px-3 py-2"
          />
        </label>
      </div>
    </div>
  );
}
