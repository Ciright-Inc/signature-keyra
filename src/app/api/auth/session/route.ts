import { NextResponse } from "next/server";
import { devBypassIdentity } from "@/lib/identity/devIdentity";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const dev = devBypassIdentity();
  if (dev) {
    return NextResponse.json({
      authenticated: true,
      user: {
        phone: dev.phone_e164,
        uid: dev.uid,
        fullName: dev.display_name,
      },
    });
  }

  const AUTH_BACKEND = process.env.NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL;
  if (!AUTH_BACKEND) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(`${AUTH_BACKEND.replace(/\/+$/, "")}/auth/session`, {
      method: "GET",
      headers: { cookie: cookieHeader },
      signal: controller.signal,
      cache: "no-store",
    });
    const json = await res.json();
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({ authenticated: false, user: null });
  } finally {
    clearTimeout(timeout);
  }
}
