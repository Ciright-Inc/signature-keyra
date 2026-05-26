"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useKeyraSession } from "@/contexts/KeyraSessionContext";
import { buildGetStartedAccessUrl, signaturersOrigin } from "@/lib/keyraAppUrls";

type WorldOption = {
  world_id: string;
  world_name: string;
  eid: string;
};

export function ImportDocumentForm() {
  const router = useRouter();
  const { isAuthenticated, initialized } = useKeyraSession();
  const [worlds, setWorlds] = useState<WorldOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetch("/api/signaturers/worlds", { credentials: "include" })
      .then((r) => r.json())
      .then(
        (json: {
          worlds?: { world_id: string; world_name: string; eid: string }[];
        }) => setWorlds(json.worlds ?? []),
      );
  }, [isAuthenticated]);

  if (!initialized) {
    return <p className="text-[var(--keyra-ink-muted-on-light)]">Loading…</p>;
  }

  if (!isAuthenticated) {
    return (
      <div className="keyra-card p-8 text-center">
        <p className="mb-4 text-[var(--keyra-ink-muted-on-light)]">Sign in to import documents into your vault.</p>
        <a href={buildGetStartedAccessUrl(`${signaturersOrigin()}/import`)} className="keyra-btn keyra-btn-primary">
          Sign in
        </a>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch("/api/signaturers/import", {
        method: "POST",
        credentials: "include",
        body: data,
      });
      const json = (await res.json()) as { error?: string; document_id?: string };
      if (!res.ok) throw new Error(json.error ?? "Import failed.");
      setSuccess(true);
      form.reset();
      if (json.document_id) {
        setTimeout(() => router.push("/vault"), 1200);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="keyra-card mx-auto max-w-xl space-y-4 p-6 sm:p-8">
      <h2 className="text-xl font-semibold">Import signed document</h2>
      <p className="text-sm text-[var(--keyra-ink-muted-on-light)]">
        Store an external signed document in your secure Keyra vault. Files are tied to your UID and
        optionally to an EID / world context.
      </p>

      <label className="flex flex-col gap-1 text-sm">
        Document name *
        <input name="document_name" required className="rounded-lg border border-[var(--keyra-border)] px-3 py-2" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Signed date
        <input type="date" name="signed_date" className="rounded-lg border border-[var(--keyra-border)] px-3 py-2" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Purpose
        <input name="purpose" className="rounded-lg border border-[var(--keyra-border)] px-3 py-2" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Related world
        <select name="related_world_id" className="rounded-lg border border-[var(--keyra-border)] px-3 py-2">
          <option value="">Personal vault (no world)</option>
          {worlds.map((w) => (
            <option key={w.world_id} value={w.world_id}>
              {w.world_name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Related EID
        <select name="related_eid" className="rounded-lg border border-[var(--keyra-border)] px-3 py-2">
          <option value="">Auto from world</option>
          {worlds.map((w) => (
            <option key={w.eid} value={w.eid}>
              {w.eid} — {w.world_name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Document type
        <input name="document_type" defaultValue="imported" className="rounded-lg border border-[var(--keyra-border)] px-3 py-2" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Parties involved
        <input name="parties_involved" className="rounded-lg border border-[var(--keyra-border)] px-3 py-2" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Notes
        <textarea name="notes" rows={3} className="rounded-lg border border-[var(--keyra-border)] px-3 py-2" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Tags (comma-separated)
        <input name="tags" placeholder="contract, 2024" className="rounded-lg border border-[var(--keyra-border)] px-3 py-2" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Upload file *
        <input type="file" name="file" required accept=".pdf,.png,.jpg,.jpeg" className="text-sm" />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-700">Document imported successfully.</p>}

      <button type="submit" disabled={submitting} className="keyra-btn keyra-btn-primary w-full sm:w-auto">
        {submitting ? "Importing…" : "Import to vault"}
      </button>
    </form>
  );
}
