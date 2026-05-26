"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DocumentCard } from "@/components/signaturers/DocumentCard";
import {
  DocumentDetailPanel,
  type DocumentPanelMode,
} from "@/components/signaturers/DocumentDetailPanel";
import { RoleCategoryTabs } from "@/components/signaturers/RoleCategoryTabs";
import {
  VaultFilters,
  type VaultFilterState,
} from "@/components/signaturers/VaultFilters";
import { FadeIn } from "@/components/ui/FadeIn";
import { useKeyraSession } from "@/contexts/KeyraSessionContext";
import { buildGetStartedAccessUrl, signaturersOrigin } from "@/lib/keyraAppUrls";
import type { DocumentFeedCard, RoleCategory } from "@/lib/types/documentSignature";

const DEFAULT_FILTERS: VaultFilterState = {
  world_id: "",
  role_category: "all",
  signature_status: "",
  document_status: "",
  date_from: "",
  date_to: "",
  q: "",
};

export function VaultFeed() {
  const { isAuthenticated, initialized } = useKeyraSession();
  const [worlds, setWorlds] = useState<{ world_id: string; world_name: string }[]>([]);
  const [filters, setFilters] = useState<VaultFilterState>(DEFAULT_FILTERS);
  const [debouncedQ, setDebouncedQ] = useState("");
  const [items, setItems] = useState<DocumentFeedCard[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<DocumentPanelMode | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(filters.q), 300);
    return () => clearTimeout(t);
  }, [filters.q]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetch("/api/signaturers/worlds", { credentials: "include" })
      .then((r) => r.json())
      .then((json: { worlds?: { world_id: string; world_name: string }[] }) => {
        setWorlds(json.worlds ?? []);
      })
      .catch(() => setWorlds([]));
  }, [isAuthenticated]);

  const buildQuery = useCallback(
    (nextCursor?: string | null) => {
      const params = new URLSearchParams();
      if (nextCursor) params.set("cursor", nextCursor);
      if (filters.world_id) params.set("world_id", filters.world_id);
      if (filters.role_category !== "all") params.set("role_category", filters.role_category);
      if (filters.signature_status) params.set("signature_status", filters.signature_status);
      if (filters.document_status) params.set("document_status", filters.document_status);
      if (filters.date_from) params.set("date_from", filters.date_from);
      if (filters.date_to) params.set("date_to", filters.date_to);
      if (debouncedQ) params.set("q", debouncedQ);
      params.set("limit", "15");
      return params.toString();
    },
    [filters, debouncedQ],
  );

  const loadFeed = useCallback(
    async (append: boolean, nextCursor?: string | null) => {
      if (!isAuthenticated) return;
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      try {
        const qs = buildQuery(append ? nextCursor : null);
        const res = await fetch(`/api/signaturers/feed?${qs}`, { credentials: "include" });
        if (res.status === 401) throw new Error("Sign in to view your signature vault.");
        if (!res.ok) throw new Error("Unable to load documents.");
        const json = (await res.json()) as {
          items: DocumentFeedCard[];
          next_cursor: string | null;
        };
        setItems((prev) => (append ? [...prev, ...json.items] : json.items));
        setCursor(json.next_cursor);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load feed.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [isAuthenticated, buildQuery],
  );

  useEffect(() => {
    if (!initialized || !isAuthenticated) return;
    setCursor(null);
    void loadFeed(false);
  }, [initialized, isAuthenticated, filters.world_id, filters.role_category, filters.signature_status, filters.document_status, filters.date_from, filters.date_to, debouncedQ, loadFeed]);

  useEffect(() => {
    if (!cursor || loadingMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && cursor && !loadingMore) {
          void loadFeed(true, cursor);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [cursor, loadingMore, loadFeed]);

  const setRoleCategory = (role_category: RoleCategory) => {
    setFilters((f) => ({ ...f, role_category }));
  };

  if (!initialized) {
    return <p className="py-12 text-center text-[var(--keyra-ink-muted-on-light)]">Loading vault…</p>;
  }

  if (!isAuthenticated) {
    const accessHref = buildGetStartedAccessUrl(`${signaturersOrigin()}/vault`);
    return (
      <div className="keyra-card mx-auto max-w-lg p-8 text-center">
        <p className="mb-4 text-[var(--keyra-ink-muted-on-light)]">
          Sign in with your verified Keyra identity to access your unified signature vault across
          all authorized worlds.
        </p>
        <a href={accessHref} className="keyra-btn keyra-btn-primary">
          Sign in to Keyra
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RoleCategoryTabs value={filters.role_category} onChange={setRoleCategory} />
      <VaultFilters worlds={worlds} filters={filters} onChange={setFilters} />

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading && items.length === 0 ? (
        <p className="py-8 text-center text-[var(--keyra-ink-muted-on-light)]">Loading documents…</p>
      ) : items.length === 0 ? (
        <p className="keyra-card py-12 text-center text-[var(--keyra-ink-muted-on-light)]">
          No documents match your filters.
        </p>
      ) : (
        <div className="grid gap-4">
          {items.map((card, i) => (
            <FadeIn key={`${card.world_id}-${card.document_id}`} delay={Math.min(i * 0.04, 0.4)}>
              <DocumentCard
                card={card}
                onOpen={(id, mode) => {
                  setSelectedDoc(id);
                  setPanelMode(mode);
                }}
              />
            </FadeIn>
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-4" aria-hidden />
      {loadingMore && (
        <p className="text-center text-sm text-[var(--keyra-ink-muted-on-light)]">Loading more…</p>
      )}

      <DocumentDetailPanel
        documentId={selectedDoc}
        mode={panelMode}
        onClose={() => {
          setSelectedDoc(null);
          setPanelMode(null);
        }}
      />
    </div>
  );
}
