import { SignaturersHeader } from "@/components/layout/SignaturersHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { KeyraSessionProvider } from "@/contexts/KeyraSessionContext";

export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <KeyraSessionProvider>
      <SignaturersHeader />
      <main className="min-w-0 flex-1">{children}</main>
      <SiteFooter />
    </KeyraSessionProvider>
  );
}
