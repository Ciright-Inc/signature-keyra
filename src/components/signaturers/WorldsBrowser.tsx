"use client";

import { useEffect, useState } from "react";
import { useKeyraSession } from "@/contexts/KeyraSessionContext";
import { buildGetStartedAccessUrl, signaturersOrigin } from "@/lib/keyraAppUrls";

type WorldRow = {
  world_id: string;
  world_name: string;
  eid: string;
  person_display_name: string;
  role_types: string[];
};

export function WorldsBrowser() {
  const { isAuthenticated, initialized } = useKeyraSession();
  const [worlds, setWorlds] = useState<WorldRow[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetch("/api/signaturers/worlds", { credentials: "include" })
      .then((r) => r.json())
      .then((json: { worlds?: WorldRow[] }) => setWorlds(json.worlds ?? []));
  }, [isAuthenticated]);

  if (!initialized) return <p className="text-[var(--keyra-ink-muted-on-light)]">Loading…</p>;

  if (!isAuthenticated) {
    return (
      <div className="keyra-card p-8 text-center">
        <a href={buildGetStartedAccessUrl(`${signaturersOrigin()}/worlds`)} className="keyra-btn keyra-btn-primary">
          Sign in to browse worlds
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {worlds.map((w) => (
        <article key={w.world_id} className="keyra-card p-5">
          <h3 className="text-lg font-semibold">{w.world_name}</h3>
          <p className="mt-1 text-sm text-[var(--keyra-ink-muted-on-light)]">World ID: {w.world_id}</p>
          <p className="mt-2 text-sm">
            <span className="text-[var(--keyra-ink-muted-on-light)]">Your name in this world: </span>
            <span className="font-medium">{w.person_display_name}</span>
          </p>
          <p className="mt-1 text-sm">
            <span className="text-[var(--keyra-ink-muted-on-light)]">EID: </span>
            <code className="text-xs">{w.eid}</code>
          </p>
          <div className="mt-3 flex flex-wrap gap-1">
            {w.role_types.map((r) => (
              <span key={r} className="keyra-badge">
                {r}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
