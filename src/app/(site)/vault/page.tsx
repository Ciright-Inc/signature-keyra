import { VaultFeed } from "@/components/signaturers/VaultFeed";

export const metadata = {
  title: "Vault",
};

export default function VaultPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <p className="keyra-eyebrow-trust mb-2">Signature vault</p>
        <h1 className="keyra-display-trust text-3xl font-semibold tracking-tight sm:text-4xl">
          My documents & signatures
        </h1>
        <p className="mt-3 max-w-2xl text-[var(--keyra-ink-muted-on-light)]">
          Unified feed across every world where your UID and EID are authorized. Records are
          deduplicated when you hold multiple roles on the same document.
        </p>
      </header>
      <VaultFeed />
    </div>
  );
}
