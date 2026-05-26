export default function RootLoading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4">
      <div
        className="size-2 animate-pulse rounded-full bg-[var(--keyra-ink-on-light)] opacity-40"
        style={{ animationDuration: "1.2s" }}
        aria-hidden
      />
      <p className="text-sm text-[var(--keyra-ink-muted-on-light)]">Loading Signaturers…</p>
    </div>
  );
}
