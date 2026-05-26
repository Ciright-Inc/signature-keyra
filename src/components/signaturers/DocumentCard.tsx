"use client";

import type { DocumentFeedCard } from "@/lib/types/documentSignature";
import { USER_ROLE_LABELS } from "@/lib/types/documentSignature";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-IE", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

type PanelMode = "view" | "preview" | "download" | "audit";

type Props = {
  card: DocumentFeedCard;
  onOpen: (documentId: string, mode: PanelMode) => void;
};

export function DocumentCard({ card, onOpen }: Props) {
  return (
    <article className="keyra-card flex flex-col gap-4 p-5 transition-shadow hover:shadow-[var(--keyra-shadow-hover)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold tracking-tight text-[var(--keyra-ink-on-light)]">
            {card.document_name}
          </h3>
          <p className="mt-1 text-sm text-[var(--keyra-ink-muted-on-light)]">{card.purpose}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-1">
          <span className="keyra-badge">{card.source === "imported" ? "Imported" : "Native"}</span>
          {card.imported_flag && <span className="keyra-badge">Vault</span>}
        </div>
      </div>

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[var(--keyra-ink-muted-on-light)]">World</dt>
          <dd className="font-medium text-[var(--keyra-ink-on-light)]">{card.world_name}</dd>
        </div>
        <div>
          <dt className="text-[var(--keyra-ink-muted-on-light)]">Person (source world)</dt>
          <dd className="font-medium text-[var(--keyra-ink-on-light)]">
            {card.person_display_name_from_world}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--keyra-ink-muted-on-light)]">Signed</dt>
          <dd>{formatDate(card.signed_date)}</dd>
        </div>
        <div>
          <dt className="text-[var(--keyra-ink-muted-on-light)]">Created</dt>
          <dd>{formatDate(card.created_date)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-[var(--keyra-ink-muted-on-light)]">Status</dt>
          <dd>
            {card.document_status} · {card.signature_status}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-1.5">
        {card.roles.map((role) => (
          <span key={role} className="keyra-badge keyra-badge-role">
            {USER_ROLE_LABELS[role]}
          </span>
        ))}
        <span className="keyra-badge keyra-badge-world">{card.world_name}</span>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-[var(--keyra-border)] pt-4">
        <button
          type="button"
          className="keyra-btn keyra-btn-primary text-sm"
          onClick={() => onOpen(card.document_id, "view")}
        >
          View
        </button>
        <button
          type="button"
          className="keyra-btn keyra-btn-secondary text-sm"
          disabled={!card.can_preview}
          title={card.can_preview ? undefined : "No stored file or not authorized"}
          onClick={() => onOpen(card.document_id, "preview")}
        >
          Preview
        </button>
        <button
          type="button"
          className="keyra-btn keyra-btn-secondary text-sm"
          disabled={!card.can_download}
          title={card.can_download ? undefined : "Download not authorized for your role"}
          onClick={() => onOpen(card.document_id, "download")}
        >
          Download
        </button>
        <button
          type="button"
          className="keyra-btn keyra-btn-ghost text-sm"
          onClick={() => onOpen(card.document_id, "audit")}
        >
          Audit
        </button>
      </div>
    </article>
  );
}
