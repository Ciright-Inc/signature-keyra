"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";
import { getKeyraAdminAppLinks } from "@/lib/keyraAppUrls";

type LauncherApp = { id: string; label: string; description: string; href: string };

export function KeyraAppLauncher() {
  const [open, setOpen] = useState(false);
  const [apps, setApps] = useState<LauncherApp[]>(getKeyraAdminAppLinks());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void fetch("/api/deployments/apps/launcher")
      .then((r) => r.json())
      .then((d: { apps?: LauncherApp[] }) => {
        if (d.apps?.length) setApps(d.apps);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="keyra-btn keyra-btn-ghost flex size-9 items-center justify-center p-0"
        aria-label="Keyra apps"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="grid grid-cols-3 gap-0.5" aria-hidden>
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="size-1 rounded-full bg-current opacity-70" />
          ))}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-[var(--keyra-border)] bg-white p-3 shadow-[var(--keyra-shadow-card)]">
          <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-[var(--keyra-ink-muted-on-light)]">
            Keyra apps
          </p>
          <ul className="grid grid-cols-3 gap-1">
            {apps.slice(0, 12).map((app) => (
              <li key={app.id}>
                <a
                  href={app.href}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-center text-xs",
                    "hover:bg-black/[0.04]",
                  )}
                  onClick={() => setOpen(false)}
                >
                  <span className="flex size-9 items-center justify-center rounded-xl border border-[var(--keyra-border)] bg-[var(--keyra-surface-light)] text-[10px] font-semibold">
                    {app.label.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="line-clamp-2 leading-tight">{app.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
