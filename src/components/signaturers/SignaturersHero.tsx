"use client";

import Link from "next/link";
import { FadeIn } from "@/components/ui/FadeIn";
import { useKeyraSession } from "@/contexts/KeyraSessionContext";
import { buildGetStartedAccessUrl, signaturersOrigin } from "@/lib/keyraAppUrls";

export function SignaturersHero() {
  const { isAuthenticated, initialized } = useKeyraSession();
  const accessHref = buildGetStartedAccessUrl(`${signaturersOrigin()}/vault`);

  return (
    <section className="keyra-hero keyra-readable-on-light px-4 py-20 sm:px-6 sm:py-28">
      <FadeIn className="mx-auto max-w-3xl text-center">
        <p className="keyra-eyebrow-trust mb-4">Signaturers · Keyra</p>
        <h1 className="keyra-display-trust mb-6 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          Your secure Keyra signature vault
        </h1>
        <p className="keyra-prose-trust mx-auto mb-10 max-w-2xl text-base leading-relaxed sm:text-lg">
          Signaturers is your secure Keyra signature vault. It brings together every document you
          have created, signed, managed, supported, led, or been associated with across every Keyra
          world where your UID and EID are authorized. It gives individuals, employees, customers,
          managers, and businesses one trusted place to view, search, retrieve, and preserve signed
          documents.
        </p>

        <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {initialized && isAuthenticated ? (
            <Link href="/vault" className="keyra-btn keyra-btn-primary">
              View My Signatures
            </Link>
          ) : (
            <a href={accessHref} className="keyra-btn keyra-btn-primary">
              View My Signatures
            </a>
          )}
          <Link href="/import" className="keyra-btn keyra-btn-secondary">
            Import Signed Document
          </Link>
          <Link href="/worlds" className="keyra-btn keyra-btn-secondary">
            Browse Worlds
          </Link>
          <Link href="/vault" className="keyra-btn keyra-btn-ghost">
            Open Vault
          </Link>
        </div>
      </FadeIn>
    </section>
  );
}
