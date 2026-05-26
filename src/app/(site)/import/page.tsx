import { ImportDocumentForm } from "@/components/signaturers/ImportDocumentForm";

export const metadata = {
  title: "Import",
};

export default function ImportPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <p className="keyra-eyebrow-trust mb-2">Vault import</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Import signed document</h1>
      </header>
      <ImportDocumentForm />
    </div>
  );
}
