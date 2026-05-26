import { NextResponse } from "next/server";
import { getKeyraAdminAppLinks, keyraMarketingOrigin } from "@/lib/keyraAppUrls";

export const dynamic = "force-dynamic";

const PRODUCTION_LAUNCHER = "https://keyra.ie/api/deployments/apps/launcher";

export async function GET() {
  const urls = [
    process.env.KEYRA_LAUNCHER_APPS_URL?.trim(),
    `${keyraMarketingOrigin()}/api/deployments/apps/launcher`,
    PRODUCTION_LAUNCHER,
  ].filter(Boolean) as string[];

  for (const base of urls) {
    try {
      const res = await fetch(`${base.replace(/\/+$/, "")}?t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) continue;
      const data = (await res.json()) as { apps?: unknown[] };
      if (Array.isArray(data.apps) && data.apps.length > 0) {
        return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
      }
    } catch {
      // try next
    }
  }

  return NextResponse.json(
    { apps: getKeyraAdminAppLinks() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
