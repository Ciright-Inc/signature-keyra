import { NextResponse } from "next/server";
import { appendAuditEvent } from "@/lib/audit/auditLog";
import { canDownloadDocument } from "@/lib/auth/documentPermissions";
import { requireAuthenticatedUid } from "@/lib/auth/requireAuthenticatedUid";
import { signaturersOrigin } from "@/lib/keyraAppUrls";
import { createStorageAccessToken } from "@/lib/s3/signaturersS3";
import { findAuthorizedRecord } from "@/lib/store/signatureIndex";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ document_id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireAuthenticatedUid(request);
  if (!auth.ok) return auth.response;

  const { document_id } = await context.params;
  const record = await findAuthorizedRecord(auth.identity, auth.cookieHeader, document_id);

  if (!record?.s3_object_key) {
    return NextResponse.json(
      { error: "No stored document available for download." },
      { status: 404 },
    );
  }

  if (!canDownloadDocument(record, auth.identity)) {
    return NextResponse.json(
      { error: "You are not authorized to download this document." },
      { status: 403 },
    );
  }

  await appendAuditEvent({
    audit_log_id: record.audit_log_id,
    document_id: record.document_id,
    uid: auth.identity.uid,
    event_type: "download",
    metadata: { stage: "token_issued" },
  });

  const token = await createStorageAccessToken({
    uid: auth.identity.uid,
    document_id: record.document_id,
    s3_object_key: record.s3_object_key,
    purpose: "download",
    checksum_hash: record.checksum_hash,
  });

  const download_url = `${signaturersOrigin()}/api/signaturers/file?token=${encodeURIComponent(token)}`;

  return NextResponse.json({
    download_url,
    expires_in_seconds: 300,
    checksum_hash: record.checksum_hash,
    authorized: true,
  });
}
