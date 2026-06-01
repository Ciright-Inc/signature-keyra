import { getKeyraAdminAppLinks, keyraLauncherAppsApiUrl, type KeyraEcosystemAppLink } from "@/lib/keyraAppUrls";

export type KeyraLauncherApp = KeyraEcosystemAppLink;

export type KeyraLauncherAppsPayload = {
  apps: KeyraLauncherApp[];
  privateApps: KeyraLauncherApp[];
};

/** Canonical 9-dot API — public apps plus privateApps for deployment admins. */
export async function fetchKeyraLauncherApps(): Promise<KeyraLauncherAppsPayload> {
  const fallback = getKeyraAdminAppLinks();
  try {
    const res = await fetch(`${keyraLauncherAppsApiUrl()}?t=${Date.now()}`, {
      cache: "no-store",
      credentials: "include",
    });
    if (!res.ok) return { apps: fallback, privateApps: [] };
    const data = (await res.json()) as { apps?: KeyraLauncherApp[]; privateApps?: KeyraLauncherApp[] };
    const apps = Array.isArray(data?.apps) && data.apps.length > 0 ? data.apps : fallback;
    const privateApps = Array.isArray(data?.privateApps) ? data.privateApps : [];
    return { apps, privateApps };
  } catch {
    return { apps: fallback, privateApps: [] };
  }
}
