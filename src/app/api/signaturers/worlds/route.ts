import { NextResponse } from "next/server";
import { requireAuthenticatedUid } from "@/lib/auth/requireAuthenticatedUid";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAuthenticatedUid(request);
  if (!auth.ok) return auth.response;

  return NextResponse.json({
    uid: auth.identity.uid,
    worlds: auth.identity.eid_mappings.map((m) => ({
      world_id: m.world_id,
      world_name: m.world_name,
      eid: m.eid,
      person_display_name: m.person_display_name,
      role_types: m.role_types,
    })),
  });
}
