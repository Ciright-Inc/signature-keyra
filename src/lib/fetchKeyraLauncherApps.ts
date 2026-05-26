import { getKeyraAdminAppLinks, keyraLauncherAppsApiUrl, type KeyraEcosystemAppLink } from "@/lib/keyraAppUrls";

export async function fetchKeyraLauncherApps(): Promise<KeyraEcosystemAppLink[]> {
  try {
    const res = await fetch(`${keyraLauncherAppsApiUrl()}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return getKeyraAdminAppLinks();
    const data = (await res.json()) as { apps?: KeyraEcosystemAppLink[] };
    if (Array.isArray(data?.apps) && data.apps.length > 0) return data.apps;
    return getKeyraAdminAppLinks();
  } catch {
    return getKeyraAdminAppLinks();
  }
}
