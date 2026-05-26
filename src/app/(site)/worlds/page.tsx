import { WorldsBrowser } from "@/components/signaturers/WorldsBrowser";

export const metadata = {
  title: "Worlds",
};

export default function WorldsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <p className="keyra-eyebrow-trust mb-2">Identity context</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Browse worlds</h1>
        <p className="mt-3 text-[var(--keyra-ink-muted-on-light)]">
          Every EID mapping tied to your global Keyra UID, with display names preserved from each
          source world.
        </p>
      </header>
      <WorldsBrowser />
    </div>
  );
}
