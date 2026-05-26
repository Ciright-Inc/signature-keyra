/** Role category filters exposed in the vault UI. */
export type RoleCategory =
  | "created_by_me"
  | "signed_by_me"
  | "lead"
  | "support"
  | "management"
  | "associated"
  | "imported_vault"
  | "all";

export type UserRoleOnDocument =
  | "created_by_me"
  | "signed_by_me"
  | "lead"
  | "support"
  | "management"
  | "associated"
  | "imported_vault";

export type DocumentSignatureRecord = {
  record_id: string;
  document_id: string;
  world_id: string;
  world_name: string;
  uid: string;
  eid: string;
  user_role_on_document: UserRoleOnDocument;
  person_display_name_from_world: string;
  document_name: string;
  document_type: string;
  document_status: string;
  signature_status: string;
  signed_date: string | null;
  created_date: string;
  purpose: string;
  created_by_uid: string;
  created_by_eid: string;
  signed_by_uid: string | null;
  signed_by_eid: string | null;
  lead_uid: string | null;
  lead_eid: string | null;
  support_uid: string | null;
  support_eid: string | null;
  management_uid: string | null;
  management_eid: string | null;
  associated_uid_list: string[];
  s3_bucket: string | null;
  s3_object_key: string | null;
  s3_region: string | null;
  checksum_hash: string | null;
  audit_log_id: string;
  visibility_scope: string;
  source_system: string;
  imported_flag: boolean;
  imported_by_uid: string | null;
  imported_date: string | null;
  parties_involved?: string | null;
  notes?: string | null;
  tags?: string[];
};

/** Unified feed card after deduplication across roles. */
export type DocumentFeedCard = {
  document_id: string;
  world_id: string;
  world_name: string;
  person_display_name_from_world: string;
  document_name: string;
  document_type: string;
  document_status: string;
  signature_status: string;
  signed_date: string | null;
  created_date: string;
  purpose: string;
  roles: UserRoleOnDocument[];
  source: "native" | "imported";
  record_ids: string[];
  sort_date: string;
  imported_flag: boolean;
  /** Human-readable relationship labels for the authenticated user. */
  relationship_to_user: string[];
  can_preview: boolean;
  can_download: boolean;
};

export type EidWorldMapping = {
  eid: string;
  world_id: string;
  world_name: string;
  person_display_name: string;
  role_types: string[];
};

export type AuthenticatedIdentity = {
  uid: string;
  phone_e164: string;
  display_name?: string;
  eid_mappings: EidWorldMapping[];
};

export type FeedCursor = {
  sort_date: string;
  document_id: string;
};

export type FeedQueryParams = {
  cursor?: string;
  limit?: number;
  world_id?: string;
  role_category?: RoleCategory;
  signature_status?: string;
  document_status?: string;
  date_from?: string;
  date_to?: string;
  q?: string;
};

export const ROLE_CATEGORY_LABELS: Record<RoleCategory, string> = {
  created_by_me: "Created by Me",
  signed_by_me: "Signed by Me",
  lead: "I Am Lead",
  support: "I Am Support",
  management: "I Am Management",
  associated: "Associated With Me",
  imported_vault: "Imported Vault Documents",
  all: "All Documents",
};

export const USER_ROLE_LABELS: Record<UserRoleOnDocument, string> = {
  created_by_me: "Created by Me",
  signed_by_me: "Signed by Me",
  lead: "Lead",
  support: "Support",
  management: "Management",
  associated: "Associated",
  imported_vault: "Imported",
};
