import { NextResponse } from "next/server";
import { appendAuditEvent, listAuditEvents, seedAuditEvents } from "@/lib/audit/auditLog";
import { requireAuthenticatedUid } from "@/lib/auth/requireAuthenticatedUid";
import { findAuthorizedRecord } from "@/lib/store/signatureIndex";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ document_id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireAuthenticatedUid(request);
  if (!auth.ok) return auth.response;

  const { document_id } = await context.params;
  const record = await findAuthorizedRecord(auth.identity, auth.cookieHeader, document_id);

  if (!record) {
    return NextResponse.json({ error: "Document not found or access denied." }, { status: 404 });
  }

  await appendAuditEvent({
    audit_log_id: record.audit_log_id,
    document_id,
    uid: auth.identity.uid,
    event_type: "audit_view",
  });

  const persisted = await listAuditEvents(document_id, auth.identity.uid);
  const events =
    persisted.length > 0
      ? persisted
      : seedAuditEvents(document_id, record.audit_log_id, auth.identity.uid);

  return NextResponse.json({ document_id, events });
}
