import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { deduplicateFeedRecords } from "./feedAggregator";
import type { AuthenticatedIdentity, DocumentSignatureRecord } from "@/lib/types/documentSignature";

const identity: AuthenticatedIdentity = {
  uid: "uid-test",
  phone_e164: "+353100000000",
  eid_mappings: [
    {
      eid: "eid-vendor",
      world_id: "world-vendor",
      world_name: "Vendor World",
      person_display_name: "Test User",
      role_types: ["management"],
    },
  ],
};

function baseRecord(overrides: Partial<DocumentSignatureRecord>): DocumentSignatureRecord {
  return {
    record_id: "rec-1",
    document_id: "doc-vendor-agreement",
    world_id: "world-vendor",
    world_name: "Vendor World",
    uid: "uid-test",
    eid: "eid-vendor",
    user_role_on_document: "signed_by_me",
    person_display_name_from_world: "Test User",
    document_name: "Vendor Agreement",
    document_type: "contract",
    document_status: "active",
    signature_status: "signed",
    signed_date: "2025-01-10T00:00:00.000Z",
    created_date: "2025-01-01T00:00:00.000Z",
    purpose: "Procurement",
    created_by_uid: "uid-other",
    created_by_eid: "eid-other",
    signed_by_uid: "uid-test",
    signed_by_eid: "eid-vendor",
    lead_uid: "uid-test",
    lead_eid: "eid-vendor",
    support_uid: null,
    support_eid: null,
    management_uid: "uid-test",
    management_eid: "eid-vendor",
    associated_uid_list: [],
    s3_bucket: null,
    s3_object_key: null,
    s3_region: null,
    checksum_hash: null,
    audit_log_id: "audit-1",
    visibility_scope: "world",
    source_system: "keyra-sig",
    imported_flag: false,
    imported_by_uid: null,
    imported_date: null,
    ...overrides,
  };
}

describe("deduplicateFeedRecords", () => {
  it("merges duplicate document with multiple role badges", () => {
    const records = [
      baseRecord({ record_id: "rec-a", user_role_on_document: "signed_by_me" }),
      baseRecord({
        record_id: "rec-b",
        user_role_on_document: "management",
        management_uid: "uid-test",
      }),
    ];

    const cards = deduplicateFeedRecords(records, identity.uid, identity);
    assert.equal(cards.length, 1);
    assert.equal(cards[0]?.document_name, "Vendor Agreement");
    assert.ok(cards[0]?.roles.includes("signed_by_me"));
    assert.ok(cards[0]?.roles.includes("management"));
    assert.ok(cards[0]?.roles.includes("lead"));
    assert.equal(cards[0]?.world_name, "Vendor World");
  });
});
