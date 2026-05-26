import { canDownloadDocument, canPreviewDocument } from "@/lib/auth/documentPermissions";
import type {
  AuthenticatedIdentity,
  DocumentFeedCard,
  DocumentSignatureRecord,
  FeedCursor,
  FeedQueryParams,
  RoleCategory,
  UserRoleOnDocument,
} from "@/lib/types/documentSignature";
import { USER_ROLE_LABELS } from "@/lib/types/documentSignature";

function parseCursor(cursor?: string): FeedCursor | null {
  if (!cursor?.trim()) return null;
  try {
    const json = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as FeedCursor;
    if (json.sort_date && json.document_id) return json;
  } catch {
    // invalid cursor
  }
  return null;
}

export function encodeCursor(cursor: FeedCursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

function rolesForRecord(record: DocumentSignatureRecord, uid: string): UserRoleOnDocument[] {
  const roles = new Set<UserRoleOnDocument>();

  if (record.imported_flag) roles.add("imported_vault");
  if (record.created_by_uid === uid) roles.add("created_by_me");
  if (record.signed_by_uid === uid) roles.add("signed_by_me");
  if (record.lead_uid === uid) roles.add("lead");
  if (record.support_uid === uid) roles.add("support");
  if (record.management_uid === uid) roles.add("management");
  if (record.associated_uid_list.includes(uid)) roles.add("associated");

  if (!roles.size && record.user_role_on_document) {
    roles.add(record.user_role_on_document);
  }

  return [...roles];
}

function matchesRoleCategory(roles: UserRoleOnDocument[], category?: RoleCategory): boolean {
  if (!category || category === "all") return true;
  if (category === "imported_vault") return roles.includes("imported_vault");
  return roles.includes(category);
}

function relevantSortDate(record: DocumentSignatureRecord): string {
  return record.signed_date || record.created_date || record.imported_date || "";
}

function relationshipLabels(roles: UserRoleOnDocument[]): string[] {
  return roles.map((r) => USER_ROLE_LABELS[r]);
}

function mergePermissions(
  existing: Pick<DocumentFeedCard, "can_preview" | "can_download">,
  record: DocumentSignatureRecord,
  identity: AuthenticatedIdentity,
): Pick<DocumentFeedCard, "can_preview" | "can_download"> {
  return {
    can_preview: existing.can_preview || canPreviewDocument(record, identity),
    can_download: existing.can_download || canDownloadDocument(record, identity),
  };
}

export function deduplicateFeedRecords(
  records: DocumentSignatureRecord[],
  uid: string,
  identity?: AuthenticatedIdentity,
): DocumentFeedCard[] {
  const authIdentity = identity ?? ({ uid, phone_e164: "", eid_mappings: [] } as AuthenticatedIdentity);
  const byDoc = new Map<string, DocumentFeedCard>();

  for (const record of records) {
    const key = `${record.world_id}::${record.document_id}`;
    const roles = rolesForRecord(record, uid);
    const sort_date = relevantSortDate(record);

    const existing = byDoc.get(key);
    if (!existing) {
      byDoc.set(key, {
        document_id: record.document_id,
        world_id: record.world_id,
        world_name: record.world_name,
        person_display_name_from_world: record.person_display_name_from_world,
        document_name: record.document_name,
        document_type: record.document_type,
        document_status: record.document_status,
        signature_status: record.signature_status,
        signed_date: record.signed_date,
        created_date: record.created_date,
        purpose: record.purpose,
        roles: [...roles],
        source: record.imported_flag ? "imported" : "native",
        record_ids: [record.record_id],
        sort_date,
        imported_flag: record.imported_flag,
        relationship_to_user: relationshipLabels(roles),
        can_preview: canPreviewDocument(record, authIdentity),
        can_download: canDownloadDocument(record, authIdentity),
      });
      continue;
    }

    for (const role of roles) {
      if (!existing.roles.includes(role)) existing.roles.push(role);
    }
    if (!existing.record_ids.includes(record.record_id)) {
      existing.record_ids.push(record.record_id);
    }
    if (sort_date > existing.sort_date) existing.sort_date = sort_date;
    if (record.signed_date && (!existing.signed_date || record.signed_date > existing.signed_date)) {
      existing.signed_date = record.signed_date;
    }
    existing.imported_flag = existing.imported_flag || record.imported_flag;
    existing.source = existing.imported_flag ? "imported" : existing.source;
    existing.relationship_to_user = relationshipLabels(existing.roles);
    const perms = mergePermissions(existing, record, authIdentity);
    existing.can_preview = perms.can_preview;
    existing.can_download = perms.can_download;
  }

  return [...byDoc.values()].sort((a, b) => {
    if (a.sort_date === b.sort_date) {
      return b.document_id.localeCompare(a.document_id);
    }
    return b.sort_date.localeCompare(a.sort_date);
  });
}

function matchesSearch(card: DocumentFeedCard, q?: string): boolean {
  if (!q?.trim()) return true;
  const needle = q.trim().toLowerCase();
  const haystack = [
    card.document_name,
    card.purpose,
    card.person_display_name_from_world,
    card.world_name,
    card.signed_date ?? "",
    card.created_date,
    card.document_type,
    ...card.roles,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

export function paginateFeed(
  cards: DocumentFeedCard[],
  params: FeedQueryParams,
): { items: DocumentFeedCard[]; next_cursor: string | null } {
  const limit = Math.min(Math.max(params.limit ?? 20, 1), 50);
  const cursor = parseCursor(params.cursor);

  let filtered = cards.filter((card) => {
    if (params.world_id && card.world_id !== params.world_id) return false;
    if (!matchesRoleCategory(card.roles, params.role_category)) return false;
    if (params.signature_status && card.signature_status !== params.signature_status) return false;
    if (params.document_status && card.document_status !== params.document_status) return false;
    if (params.date_from && card.sort_date < params.date_from) return false;
    if (params.date_to && card.sort_date > params.date_to) return false;
    if (!matchesSearch(card, params.q)) return false;
    return true;
  });

  if (cursor) {
    const idx = filtered.findIndex(
      (c) => c.sort_date === cursor.sort_date && c.document_id === cursor.document_id,
    );
    if (idx >= 0) filtered = filtered.slice(idx + 1);
    else {
      filtered = filtered.filter(
        (c) =>
          c.sort_date < cursor.sort_date ||
          (c.sort_date === cursor.sort_date && c.document_id < cursor.document_id),
      );
    }
  }

  const items = filtered.slice(0, limit);
  const last = items[items.length - 1];
  const next_cursor =
    filtered.length > limit && last
      ? encodeCursor({ sort_date: last.sort_date, document_id: last.document_id })
      : null;

  return { items, next_cursor };
}

export function aggregateSignatureFeed(
  records: DocumentSignatureRecord[],
  identity: AuthenticatedIdentity,
  params: FeedQueryParams,
): { items: DocumentFeedCard[]; next_cursor: string | null; total_unfiltered: number } {
  const deduped = deduplicateFeedRecords(records, identity.uid, identity);
  const { items, next_cursor } = paginateFeed(deduped, params);
  return { items, next_cursor, total_unfiltered: deduped.length };
}
