import { createHash } from "node:crypto";
import type { AuthenticatedIdentity, EidWorldMapping } from "@/lib/types/documentSignature";

export type AuthSessionPayload = {
  authenticated: boolean;
  user?: {
    phone?: string;
    username?: string | null;
    fullName?: string | null;
    uid?: string | null;
  } | null;
};

function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  return trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
}

/** Deterministic dev UID when identity core is unavailable. */
export function uidFromPhoneE164(phoneE164: string): string {
  const digest = createHash("sha256").update(phoneE164).digest("hex").slice(0, 24);
  return `keyra-uid-${digest}`;
}

async function fetchIdentityFromCore(
  uid: string,
  cookieHeader: string,
): Promise<EidWorldMapping[] | null> {
  const base = process.env.KEYRA_IDENTITY_CORE_URL?.trim();
  if (!base) return null;

  const apiKey = process.env.KEYRA_IDENTITY_CORE_API_KEY?.trim();
  const url = `${base.replace(/\/+$/, "")}/v1/identity/${encodeURIComponent(uid)}/eids`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        cookie: cookieHeader,
        Accept: "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { mappings?: EidWorldMapping[] };
    return Array.isArray(json.mappings) ? json.mappings : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function mockEidMappings(uid: string, displayName?: string): EidWorldMapping[] {
  const name = displayName?.trim() || "Verified Subscriber";
  return [
    {
      eid: `${uid}-eid-ciright-ie`,
      world_id: "world-ciright-ie",
      world_name: "Ciright Ireland",
      person_display_name: name,
      role_types: ["employee", "subscriber"],
    },
    {
      eid: `${uid}-eid-vendor`,
      world_id: "world-ciright-vendor",
      world_name: "Ciright Vendor World",
      person_display_name: name,
      role_types: ["management", "signer"],
    },
    {
      eid: `${uid}-eid-customer`,
      world_id: "world-customer-portal",
      world_name: "Customer Portal World",
      person_display_name: name,
      role_types: ["customer"],
    },
  ];
}

export async function resolveAuthenticatedIdentity(
  session: AuthSessionPayload,
  cookieHeader: string,
): Promise<AuthenticatedIdentity | null> {
  if (!session.authenticated || !session.user?.phone) return null;

  const phone_e164 = normalizePhone(session.user.phone);
  const uid =
    (typeof session.user.uid === "string" && session.user.uid.trim()) ||
    uidFromPhoneE164(phone_e164);

  const displayName =
    (typeof session.user.fullName === "string" && session.user.fullName.trim()) ||
    (typeof session.user.username === "string" && session.user.username.trim()) ||
    undefined;

  const fromCore = await fetchIdentityFromCore(uid, cookieHeader);
  const useMock =
    process.env.SIGNATURERS_USE_MOCK_DATA === "true" ||
    (!fromCore?.length && process.env.NODE_ENV !== "production");

  const eid_mappings = fromCore?.length
    ? fromCore
    : useMock
      ? mockEidMappings(uid, displayName)
      : [];

  if (!eid_mappings.length) return null;

  return { uid, phone_e164, display_name: displayName, eid_mappings };
}

export async function fetchAuthSession(cookieHeader: string): Promise<AuthSessionPayload> {
  const AUTH_BACKEND = process.env.NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL;
  if (!AUTH_BACKEND) {
    return { authenticated: false, user: null };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(`${AUTH_BACKEND.replace(/\/+$/, "")}/auth/session`, {
      method: "GET",
      headers: { cookie: cookieHeader },
      signal: controller.signal,
      cache: "no-store",
    });
    return (await res.json()) as AuthSessionPayload;
  } catch {
    return { authenticated: false, user: null };
  } finally {
    clearTimeout(timeout);
  }
}
