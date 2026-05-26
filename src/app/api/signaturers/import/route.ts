import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { appendAuditEvent } from "@/lib/audit/auditLog";
import { requireAuthenticatedUid } from "@/lib/auth/requireAuthenticatedUid";
import { appendImportedRecord } from "@/lib/store/persistedVault";
import {
  buildVaultS3Key,
  isSignaturersS3Configured,
  uploadVaultObject,
} from "@/lib/s3/signaturersS3";
import type { DocumentSignatureRecord } from "@/lib/types/documentSignature";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUid(request);
  if (!auth.ok) return auth.response;

  const form = await request.formData();
  const file = form.get("file");
  const document_name = String(form.get("document_name") ?? "").trim();
  const signed_date = String(form.get("signed_date") ?? "").trim() || null;
  const purpose = String(form.get("purpose") ?? "").trim();
  const related_eid = String(form.get("related_eid") ?? "").trim();
  const related_world_id = String(form.get("related_world_id") ?? "").trim();
  const document_type = String(form.get("document_type") ?? "imported").trim();
  const parties_involved = String(form.get("parties_involved") ?? "").trim() || null;
  const notes = String(form.get("notes") ?? "").trim() || null;
  const tagsRaw = String(form.get("tags") ?? "").trim();
  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  if (!document_name) {
    return NextResponse.json({ error: "Document name is required." }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "A signed document file is required." }, { status: 400 });
  }

  const mapping =
    auth.identity.eid_mappings.find((m) => m.eid === related_eid) ??
    auth.identity.eid_mappings.find((m) => m.world_id === related_world_id) ??
    auth.identity.eid_mappings[0];

  const document_id = `import-${randomUUID()}`;
  const record_id = `rec-import-${randomUUID()}`;
  const now = new Date().toISOString();

  let s3_bucket: string | null = null;
  let s3_object_key: string | null = null;
  let s3_region: string | null = null;
  let checksum_hash: string | null = null;

  const buffer = Buffer.from(await file.arrayBuffer());

  if (isSignaturersS3Configured()) {
    const key = buildVaultS3Key(auth.identity.uid, file.name || "document.pdf");
    const uploaded = await uploadVaultObject({
      key,
      body: buffer,
      contentType: file.type || "application/pdf",
    });
    s3_bucket = uploaded.bucket;
    s3_object_key = key;
    s3_region = uploaded.region;
    checksum_hash = uploaded.checksum;
  } else {
    checksum_hash = createHash("sha256").update(buffer).digest("hex");
  }

  const audit_log_id = `audit-import-${record_id}`;

  const record: DocumentSignatureRecord = {
    record_id,
    document_id,
    world_id: mapping?.world_id ?? "vault-personal",
    world_name: mapping?.world_name ?? "Personal Vault",
    uid: auth.identity.uid,
    eid: mapping?.eid ?? `${auth.identity.uid}-vault`,
    user_role_on_document: "imported_vault",
    person_display_name_from_world:
      mapping?.person_display_name ?? auth.identity.display_name ?? "Vault Owner",
    document_name,
    document_type,
    document_status: "stored",
    signature_status: "imported",
    signed_date,
    created_date: now,
    purpose: purpose || "Imported signed document",
    created_by_uid: auth.identity.uid,
    created_by_eid: mapping?.eid ?? `${auth.identity.uid}-vault`,
    signed_by_uid: auth.identity.uid,
    signed_by_eid: mapping?.eid ?? null,
    lead_uid: null,
    lead_eid: null,
    support_uid: null,
    support_eid: null,
    management_uid: null,
    management_eid: null,
    associated_uid_list: [],
    s3_bucket,
    s3_object_key,
    s3_region,
    checksum_hash,
    audit_log_id,
    visibility_scope: "private_vault",
    source_system: "signaturers-import",
    imported_flag: true,
    imported_by_uid: auth.identity.uid,
    imported_date: now,
    parties_involved,
    notes,
    tags,
  };

  await appendImportedRecord(auth.identity.uid, record);

  await appendAuditEvent({
    audit_log_id,
    document_id,
    uid: auth.identity.uid,
    event_type: "import",
    metadata: { document_name },
  });

  return NextResponse.json({ ok: true, document_id, record_id }, { status: 201 });
}
