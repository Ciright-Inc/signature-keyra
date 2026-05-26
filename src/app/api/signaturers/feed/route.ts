import { NextResponse } from "next/server";
import { aggregateSignatureFeed } from "@/lib/aggregation/feedAggregator";
import { appendAuditEvent } from "@/lib/audit/auditLog";
import { requireAuthenticatedUid } from "@/lib/auth/requireAuthenticatedUid";
import { querySignatureIndex } from "@/lib/store/signatureIndex";
import type { FeedQueryParams, RoleCategory } from "@/lib/types/documentSignature";

export const dynamic = "force-dynamic";

function parseFeedParams(url: URL): FeedQueryParams {
  const role = url.searchParams.get("role_category");
  return {
    cursor: url.searchParams.get("cursor") ?? undefined,
    limit: url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined,
    world_id: url.searchParams.get("world_id") ?? undefined,
    role_category: (role as RoleCategory | null) ?? undefined,
    signature_status: url.searchParams.get("signature_status") ?? undefined,
    document_status: url.searchParams.get("document_status") ?? undefined,
    date_from: url.searchParams.get("date_from") ?? undefined,
    date_to: url.searchParams.get("date_to") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
  };
}

export async function GET(request: Request) {
  const auth = await requireAuthenticatedUid(request);
  if (!auth.ok) return auth.response;

  const params = parseFeedParams(new URL(request.url));
  const records = await querySignatureIndex(auth.identity, auth.cookieHeader);
  const { items, next_cursor, total_unfiltered } = aggregateSignatureFeed(
    records,
    auth.identity,
    params,
  );

  await appendAuditEvent({
    audit_log_id: `feed-${auth.identity.uid}`,
    document_id: "*",
    uid: auth.identity.uid,
    event_type: "feed_view",
    metadata: { role_category: params.role_category ?? "all" },
  });

  return NextResponse.json({
    uid: auth.identity.uid,
    items,
    next_cursor,
    total_unfiltered,
    page_size: items.length,
  });
}
