import {
  eidAuthorizedForRecord,
  userTouchesDocument,
} from "@/lib/auth/documentPermissions";
import type { AuthenticatedIdentity, DocumentSignatureRecord } from "@/lib/types/documentSignature";
import { buildMockNativeRecords } from "@/lib/store/mockSeed";
import { loadImportedRecords } from "@/lib/store/persistedVault";

function useMockData(): boolean {
  return (
    process.env.SIGNATURERS_USE_MOCK_DATA === "true" ||
    (!process.env.SIGNATURERS_INDEX_URL?.trim() && process.env.NODE_ENV !== "production")
  );
}

async function fetchUpstreamIndex(
  identity: AuthenticatedIdentity,
  cookieHeader: string,
): Promise<DocumentSignatureRecord[] | null> {
  const base = process.env.SIGNATURERS_INDEX_URL?.trim();
  if (!base) return null;

  const apiKey = process.env.SIGNATURERS_INDEX_API_KEY?.trim();
  const url = `${base.replace(/\/+$/, "")}/v1/signatures/query`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        cookie: cookieHeader,
      },
      body: JSON.stringify({
        uid: identity.uid,
        eids: identity.eid_mappings.map((m) => ({
          eid: m.eid,
          world_id: m.world_id,
        })),
        query: {
          created_by_uid: identity.uid,
          signed_by_uid: identity.uid,
          lead_uid: identity.uid,
          support_uid: identity.uid,
          management_uid: identity.uid,
          associated_uid: identity.uid,
          created_by_eid: identity.eid_mappings.map((m) => m.eid),
          signed_by_eid: identity.eid_mappings.map((m) => m.eid),
          lead_eid: identity.eid_mappings.map((m) => m.eid),
          support_eid: identity.eid_mappings.map((m) => m.eid),
          management_eid: identity.eid_mappings.map((m) => m.eid),
          associated_eid: identity.eid_mappings.map((m) => m.eid),
        },
      }),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { records?: DocumentSignatureRecord[] };
    return Array.isArray(json.records) ? json.records : [];
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function authorizedRecord(
  record: DocumentSignatureRecord,
  identity: AuthenticatedIdentity,
): boolean {
  return userTouchesDocument(record, identity.uid) && eidAuthorizedForRecord(record, identity);
}

/**
 * Aggregates native index records + user vault imports for the authenticated UID.
 * Enforces world/EID authorization before returning.
 */
export async function querySignatureIndex(
  identity: AuthenticatedIdentity,
  cookieHeader: string,
): Promise<DocumentSignatureRecord[]> {
  const imported = await loadImportedRecords(identity.uid);

  let native: DocumentSignatureRecord[] = [];
  const upstream = await fetchUpstreamIndex(identity, cookieHeader);
  if (upstream) {
    native = upstream;
  } else if (useMockData()) {
    native = buildMockNativeRecords(identity);
  }

  const combined = [...imported, ...native];
  return combined.filter((r) => authorizedRecord(r, identity));
}

export async function findAuthorizedRecord(
  identity: AuthenticatedIdentity,
  cookieHeader: string,
  documentId: string,
): Promise<DocumentSignatureRecord | null> {
  const records = await querySignatureIndex(identity, cookieHeader);
  return records.find((r) => r.document_id === documentId) ?? null;
}
