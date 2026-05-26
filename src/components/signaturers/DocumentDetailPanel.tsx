"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuditEvent } from "@/lib/audit/auditLog";

type DocumentDetail = {
  document_id: string;
  document_name: string;
  world_name: string;
  person_display_name_from_world: string;
  purpose: string;
  document_status: string;
  signature_status: string;
  signed_date: string | null;
  created_date: string;
  imported_flag: boolean;
  has_storage: boolean;
  checksum_hash?: string | null;
  can_preview: boolean;
  can_download: boolean;
  relationship_to_user: string[];
  parties_involved?: string | null;
  notes?: string | null;
  tags?: string[];
};

export type DocumentPanelMode = "view" | "preview" | "download" | "audit";

type Props = {
  documentId: string | null;
  mode: DocumentPanelMode | null;
  onClose: () => void;
};

export function DocumentDetailPanel({ documentId, mode, onClose }: Props) {
  const [detail, setDetail] = useState<DocumentDetail | null>(null);
  const [audit, setAudit] = useState<AuditEvent[]>([]);
  const [accessUrl, setAccessUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!documentId || !mode) return;
    setLoading(true);
    setError(null);
    setAccessUrl(null);
    try {
      const docRes = await fetch(`/api/signaturers/document/${encodeURIComponent(documentId)}`, {
        credentials: "include",
      });
      if (!docRes.ok) throw new Error("Unable to load document.");
      const docJson = (await docRes.json()) as { document: DocumentDetail };
      setDetail(docJson.document);

      if (mode === "audit") {
        const auditRes = await fetch(
          `/api/signaturers/audit/${encodeURIComponent(documentId)}`,
          { credentials: "include" },
        );
        if (auditRes.ok) {
          const auditJson = (await auditRes.json()) as { events: AuditEvent[] };
          setAudit(auditJson.events);
        }
      }

      if (mode === "preview" && docJson.document.can_preview) {
        const prevRes = await fetch(
          `/api/signaturers/document/${encodeURIComponent(documentId)}/preview`,
          { credentials: "include" },
        );
        if (!prevRes.ok) throw new Error("Preview not available.");
        const prevJson = (await prevRes.json()) as { preview_url: string };
        setAccessUrl(prevJson.preview_url);
      }

      if (mode === "download" && docJson.document.can_download) {
        const dlRes = await fetch(
          `/api/signaturers/document/${encodeURIComponent(documentId)}/download`,
          { credentials: "include" },
        );
        if (!dlRes.ok) throw new Error("Download not authorized.");
        const dlJson = (await dlRes.json()) as { download_url: string };
        setAccessUrl(dlJson.download_url);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, [documentId, mode]);

  useEffect(() => {
    if (documentId && mode) void load();
    else {
      setDetail(null);
      setAudit([]);
      setAccessUrl(null);
    }
  }, [documentId, mode, load]);

  if (!documentId || !mode) return null;

  const title =
    mode === "audit"
      ? "Audit trail"
      : mode === "preview"
        ? "Secure preview"
        : mode === "download"
          ? "Secure download"
          : "Document detail";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/30 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button type="button" className="absolute inset-0" aria-label="Close" onClick={onClose} />
      <div className="keyra-card relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl p-6 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">{detail?.document_name ?? title}</h2>
          <button type="button" className="keyra-btn keyra-btn-ghost text-sm" onClick={onClose}>
            Close
          </button>
        </div>

        {loading && <p className="text-sm text-[var(--keyra-ink-muted-on-light)]">Loading…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {detail && !loading && (
          <div className="space-y-4 text-sm">
            <p>
              <span className="text-[var(--keyra-ink-muted-on-light)]">World: </span>
              {detail.world_name}
            </p>
            <p>
              <span className="text-[var(--keyra-ink-muted-on-light)]">Person: </span>
              {detail.person_display_name_from_world}
            </p>
            <p>
              <span className="text-[var(--keyra-ink-muted-on-light)]">Purpose: </span>
              {detail.purpose}
            </p>
            <p>
              <span className="text-[var(--keyra-ink-muted-on-light)]">Status: </span>
              {detail.document_status} · {detail.signature_status}
            </p>
            <p>
              <span className="text-[var(--keyra-ink-muted-on-light)]">Your relationship: </span>
              {detail.relationship_to_user.join(", ") || "—"}
            </p>
            {detail.checksum_hash && (
              <p className="break-all font-mono text-xs text-[var(--keyra-ink-muted-on-light)]">
                SHA-256: {detail.checksum_hash}
              </p>
            )}

            {accessUrl && mode === "preview" && (
              <a
                href={accessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="keyra-btn keyra-btn-secondary inline-flex text-sm"
              >
                Open preview (expires in 5 min)
              </a>
            )}

            {accessUrl && mode === "download" && (
              <a href={accessUrl} className="keyra-btn keyra-btn-primary inline-flex text-sm">
                Download file (expires in 5 min)
              </a>
            )}

            {mode === "audit" && (
              <ul className="space-y-2">
                {audit.map((e) => (
                  <li
                    key={e.id}
                    className="rounded-lg border border-[var(--keyra-border)] px-3 py-2"
                  >
                    <span className="font-medium">{e.event_type}</span>
                    <span className="ml-2 text-[var(--keyra-ink-muted-on-light)]">
                      {new Date(e.timestamp).toLocaleString("en-IE")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
