import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const AUTH_BACKEND = process.env.NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL;
  if (!AUTH_BACKEND) {
    return NextResponse.json({ ok: true });
  }

  const cookieHeader = request.headers.get("cookie") || "";
  try {
    await fetch(`${AUTH_BACKEND.replace(/\/+$/, "")}/auth/logout`, {
      method: "POST",
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
  } catch {
    // best effort
  }
  return NextResponse.json({ ok: true });
}
