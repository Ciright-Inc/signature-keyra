import Link from "next/link";
import { keyraMarketingOrigin, signaturersOrigin } from "@/lib/keyraAppUrls";

export function SiteFooter() {
  const marketing = keyraMarketingOrigin();
  return (
    <footer className="border-t border-[var(--keyra-border)] bg-[var(--keyra-surface-light)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-medium text-[var(--keyra-ink-on-light)]">Signaturers</p>
          <p className="mt-1 text-sm text-[var(--keyra-ink-muted-on-light)]">
            Secure signature vault · {signaturersOrigin().replace(/^https?:\/\//, "")}
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm" aria-label="Footer">
          <Link href="/vault" className="hover:underline">
            Vault
          </Link>
          <Link href="/import" className="hover:underline">
            Import
          </Link>
          <a href={marketing} className="hover:underline">
            Keyra
          </a>
        </nav>
      </div>
      <p className="border-t border-[var(--keyra-border)] py-4 text-center text-xs text-[var(--keyra-ink-muted-on-light)]">
        UID/EID authorized · World-scoped · Audit logged · No document creation
      </p>
    </footer>
  );
}
