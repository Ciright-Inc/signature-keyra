import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  canDownloadDocument,
  canPreviewDocument,
  relationshipsToUser,
} from "./documentPermissions";
import type { AuthenticatedIdentity, DocumentSignatureRecord } from "@/lib/types/documentSignature";

const identity: AuthenticatedIdentity = {
  uid: "uid-1",
  phone_e164: "+1",
  eid_mappings: [
    {
      eid: "eid-1",
      world_id: "world-1",
      world_name: "W",
      person_display_name: "User",
      role_types: [],
    },
  ],
};

const record: DocumentSignatureRecord = {
  record_id: "r1",
  document_id: "d1",
  world_id: "world-1",
  world_name: "W",
  uid: "uid-1",
  eid: "eid-1",
  user_role_on_document: "support",
  person_display_name_from_world: "User",
  document_name: "Doc",
  document_type: "x",
  document_status: "active",
  signature_status: "signed",
  signed_date: null,
  created_date: "2025-01-01",
  purpose: "p",
  created_by_uid: "other",
  created_by_eid: "eid-1",
  signed_by_uid: null,
  signed_by_eid: null,
  lead_uid: null,
  lead_eid: null,
  support_uid: "uid-1",
  support_eid: "eid-1",
  management_uid: null,
  management_eid: null,
  associated_uid_list: [],
  s3_bucket: "b",
  s3_object_key: "keyra-signaturers-vault/uid-1/file.pdf",
  s3_region: "us-east-1",
  checksum_hash: "abc",
  audit_log_id: "a1",
  visibility_scope: "world",
  source_system: "test",
  imported_flag: false,
  imported_by_uid: null,
  imported_date: null,
};

describe("documentPermissions", () => {
  it("support can preview but not download", () => {
    assert.equal(canPreviewDocument(record, identity), true);
    assert.equal(canDownloadDocument(record, identity), false);
  });

  it("relationshipsToUser lists support", () => {
    assert.deepEqual(relationshipsToUser(record, "uid-1"), ["support"]);
  });
});
