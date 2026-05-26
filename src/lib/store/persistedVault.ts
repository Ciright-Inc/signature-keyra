import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { DocumentSignatureRecord } from "@/lib/types/documentSignature";

const DATA_DIR = path.join(process.cwd(), ".data", "signaturers-vault");

function vaultPath(uid: string): string {
  const safe = uid.replace(/[^a-zA-Z0-9._-]/g, "_");
  return path.join(DATA_DIR, `${safe}.json`);
}

async function ensureDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function loadImportedRecords(uid: string): Promise<DocumentSignatureRecord[]> {
  try {
    const raw = await readFile(vaultPath(uid), "utf8");
    const parsed = JSON.parse(raw) as { records?: DocumentSignatureRecord[] };
    return Array.isArray(parsed.records) ? parsed.records : [];
  } catch {
    return [];
  }
}

export async function appendImportedRecord(
  uid: string,
  record: DocumentSignatureRecord,
): Promise<void> {
  await ensureDir();
  const existing = await loadImportedRecords(uid);
  existing.unshift(record);
  await writeFile(vaultPath(uid), JSON.stringify({ records: existing }, null, 2), "utf8");
}

export async function findRecordByDocumentId(
  uid: string,
  documentId: string,
): Promise<DocumentSignatureRecord | null> {
  const records = await loadImportedRecords(uid);
  return records.find((r) => r.document_id === documentId) ?? null;
}
