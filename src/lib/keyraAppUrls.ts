function trimSlash(s: string): string {
  return s.replace(/\/+$/, "");
}

export function signaturersOrigin(): string {
  return trimSlash(
    process.env.NEXT_PUBLIC_SIGNATURERS_URL?.trim() || "https://signaturers.keyra.ie",
  );
}

export function keyraGetStartedUrl(): string {
  return trimSlash(process.env.NEXT_PUBLIC_GET_STARTED_URL?.trim() || "https://get-started.keyra.ie");
}

export function keyraMarketingOrigin(): string {
  return trimSlash(
    process.env.NEXT_PUBLIC_KEYRA_MARKETING_ORIGIN?.trim() ||
      process.env.NEXT_PUBLIC_KEYRA_SITE_URL?.trim() ||
      "https://keyra.ie",
  );
}

export function buildGetStartedAccessUrl(returnToAbsoluteUrl: string): string {
  const gs = keyraGetStartedUrl();
  return `${gs}/?return=${encodeURIComponent(returnToAbsoluteUrl)}`;
}

export function keyraPlatformAppUrl(): string {
  return trimSlash(process.env.NEXT_PUBLIC_SIMSECURE_URL?.trim() || "https://app.keyra.ie");
}

export function keyraDeveloperPortalUrl(): string {
  return trimSlash(process.env.NEXT_PUBLIC_DEVELOPER_URL?.trim() || "https://developer.keyra.ie");
}

export type KeyraEcosystemAppLink = {
  id: string;
  label: string;
  description: string;
  href: string;
};

export function keyraLauncherAppsApiUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_KEYRA_LAUNCHER_APPS_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  return "/api/deployments/apps/launcher";
}

export function getKeyraAdminAppLinks(): KeyraEcosystemAppLink[] {
  return [
    { id: "keyra", label: "Keyra", description: "Platform hub", href: keyraPlatformAppUrl() },
    { id: "signaturers", label: "Signaturers", description: "Signature vault", href: signaturersOrigin() },
    { id: "get-started", label: "Get Started", description: "Enrollment", href: keyraGetStartedUrl() },
    { id: "developer", label: "Developer", description: "APIs", href: keyraDeveloperPortalUrl() },
    { id: "governments", label: "Governments", description: "Deployment map", href: "https://governments.keyra.ie" },
    { id: "esim", label: "eSIM", description: "eSIM app", href: "https://esim.keyra.ie" },
  ];
}
