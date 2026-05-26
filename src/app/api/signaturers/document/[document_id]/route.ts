import { NextResponse } from "next/server";
import { appendAuditEvent, seedAuditEvents } from "@/lib/audit/auditLog";
import {
  canDownloadDocument,
  canPreviewDocument,
  relationshipsToUser,
} from "@/lib/auth/documentPermissions";
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
    document_id: record.document_id,
    uid: auth.identity.uid,
    event_type: "document_view",
  });

  const { s3_bucket, s3_object_key, s3_region, ...safe } = record;

  return NextResponse.json({
    document: {
      ...safe,
      has_storage: Boolean(s3_object_key),
      storage_region: s3_region,
      relationship_to_user: relationshipsToUser(record, auth.identity.uid),
      can_preview: canPreviewDocument(record, auth.identity),
      can_download: canDownloadDocument(record, auth.identity),
    },
    audit_preview: seedAuditEvents(record.document_id, record.audit_log_id, auth.identity.uid),
  });
}
