"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KeyraLogo } from "@/components/brand/KeyraLogo";
import { KeyraAppLauncher } from "@/components/layout/KeyraAppLauncher";
import { MobileNav } from "@/components/layout/MobileNav";
import { useKeyraSession } from "@/contexts/KeyraSessionContext";
import { buildGetStartedAccessUrl, keyraMarketingOrigin, signaturersOrigin } from "@/lib/keyraAppUrls";

const NAV = [
  { href: "/vault", label: "Vault" },
  { href: "/worlds", label: "Worlds" },
  { href: "/import", label: "Import" },
];

export function SignaturersHeader() {
  const { isAuthenticated, initialized, headerLabel, logout } = useKeyraSession();
  const pathname = usePathname();

  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const accessHref = buildGetStartedAccessUrl(`${signaturersOrigin()}${path}`);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--keyra-border)] bg-[var(--keyra-canvas)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Signaturers home">
          <KeyraLogo />
          <span className="hidden text-sm font-semibold tracking-tight sm:inline">Signaturers</span>
        </Link>

        <MobileNav />

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Signaturers">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "bg-black/[0.06] text-[var(--keyra-ink-on-light)]"
                  : "text-[var(--keyra-ink-muted-on-light)] hover:bg-black/[0.03] hover:text-[var(--keyra-ink-on-light)]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <KeyraAppLauncher />
          {!initialized ? (
            <span className="text-sm text-[var(--keyra-ink-muted-on-light)]">…</span>
          ) : isAuthenticated ? (
            <>
              <span className="hidden max-w-[10rem] truncate text-sm text-[var(--keyra-ink-muted-on-light)] sm:inline">
                {headerLabel}
              </span>
              <button
                type="button"
                onClick={() => void logout()}
                className="keyra-btn keyra-btn-ghost text-sm"
              >
                Sign out
              </button>
            </>
          ) : (
            <a href={accessHref} className="keyra-btn keyra-btn-primary text-sm">
              Sign in
            </a>
          )}
          <a
            href={keyraMarketingOrigin()}
            className="hidden text-sm text-[var(--keyra-ink-muted-on-light)] hover:text-[var(--keyra-ink-on-light)] sm:inline"
          >
            Keyra
          </a>
        </div>
      </div>
    </header>
  );
}
