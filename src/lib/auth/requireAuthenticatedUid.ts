import { NextResponse } from "next/server";
import { devBypassIdentity } from "@/lib/identity/devIdentity";
import { fetchAuthSession, resolveAuthenticatedIdentity } from "@/lib/identity/resolveIdentity";
import type { AuthenticatedIdentity } from "@/lib/types/documentSignature";

export type AuthResult =
  | { ok: true; identity: AuthenticatedIdentity; cookieHeader: string }
  | { ok: false; response: NextResponse };

export async function requireAuthenticatedUid(request: Request): Promise<AuthResult> {
  const devIdentity = devBypassIdentity();
  if (devIdentity) {
    return { ok: true, identity: devIdentity, cookieHeader: "" };
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const session = await fetchAuthSession(cookieHeader);
  const identity = await resolveAuthenticatedIdentity(session, cookieHeader);

  if (!identity) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Authentication required. Sign in with your verified Keyra identity." },
        { status: 401 },
      ),
    };
  }

  return { ok: true, identity, cookieHeader };
}
