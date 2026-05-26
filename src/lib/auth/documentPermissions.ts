import type { AuthenticatedIdentity, DocumentSignatureRecord } from "@/lib/types/documentSignature";

/** User has a verified UID relationship on this record. */
export function userTouchesDocument(record: DocumentSignatureRecord, uid: string): boolean {
  return (
    record.uid === uid ||
    record.created_by_uid === uid ||
    record.signed_by_uid === uid ||
    record.lead_uid === uid ||
    record.support_uid === uid ||
    record.management_uid === uid ||
    record.associated_uid_list.includes(uid) ||
    (record.imported_flag && record.imported_by_uid === uid)
  );
}

/** EID authorization for native world records. */
export function eidAuthorizedForRecord(
  record: DocumentSignatureRecord,
  identity: AuthenticatedIdentity,
): boolean {
  const allowedEids = new Set(identity.eid_mappings.map((m) => m.eid));
  const allowedWorlds = new Set(identity.eid_mappings.map((m) => m.world_id));

  if (record.imported_flag && record.imported_by_uid === identity.uid) return true;
  if (!allowedWorlds.has(record.world_id)) return false;

  const eidFields = [
    record.eid,
    record.created_by_eid,
    record.signed_by_eid,
    record.lead_eid,
    record.support_eid,
    record.management_eid,
  ].filter(Boolean) as string[];

  if (!eidFields.length) return userTouchesDocument(record, identity.uid);
  return eidFields.some((eid) => allowedEids.has(eid));
}

export function canViewDocument(
  record: DocumentSignatureRecord,
  identity: AuthenticatedIdentity,
): boolean {
  return userTouchesDocument(record, identity.uid) && eidAuthorizedForRecord(record, identity);
}

export function canPreviewDocument(
  record: DocumentSignatureRecord,
  identity: AuthenticatedIdentity,
): boolean {
  return canViewDocument(record, identity) && Boolean(record.s3_object_key);
}

/** Download: creator, signer, lead, management, or vault importer — not support-only. */
export function canDownloadDocument(
  record: DocumentSignatureRecord,
  identity: AuthenticatedIdentity,
): boolean {
  if (!canPreviewDocument(record, identity)) return false;

  const { uid } = identity;
  if (record.imported_flag && record.imported_by_uid === uid) return true;
  if (record.created_by_uid === uid) return true;
  if (record.signed_by_uid === uid) return true;
  if (record.lead_uid === uid) return true;
  if (record.management_uid === uid) return true;
  return false;
}

export function relationshipsToUser(
  record: DocumentSignatureRecord,
  uid: string,
): string[] {
  const out: string[] = [];
  if (record.imported_flag && record.imported_by_uid === uid) out.push("imported_vault");
  if (record.created_by_uid === uid) out.push("created_by_me");
  if (record.signed_by_uid === uid) out.push("signed_by_me");
  if (record.lead_uid === uid) out.push("lead");
  if (record.support_uid === uid) out.push("support");
  if (record.management_uid === uid) out.push("management");
  if (record.associated_uid_list.includes(uid)) out.push("associated");
  return out;
}
