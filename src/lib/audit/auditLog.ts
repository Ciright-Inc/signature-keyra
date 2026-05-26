import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type AuditEventType =
  | "feed_view"
  | "document_view"
  | "preview"
  | "download"
  | "import"
  | "audit_view";

export type AuditEvent = {
  id: string;
  audit_log_id: string;
  document_id: string;
  uid: string;
  event_type: AuditEventType;
  timestamp: string;
  metadata?: Record<string, string>;
};

const DATA_DIR = path.join(process.cwd(), ".data", "signaturers-audit");

function auditFile(documentId: string): string {
  const safe = documentId.replace(/[^a-zA-Z0-9._-]/g, "_");
  return path.join(DATA_DIR, `${safe}.jsonl`);
}

async function ensureDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function appendAuditEvent(event: Omit<AuditEvent, "id" | "timestamp">): Promise<AuditEvent> {
  await ensureDir();
  const full: AuditEvent = {
    ...event,
    id: randomUUID(),
    timestamp: new Date().toISOString(),
  };
  await appendFile(auditFile(event.document_id), `${JSON.stringify(full)}\n`, "utf8");
  return full;
}

export async function listAuditEvents(documentId: string, uid: string): Promise<AuditEvent[]> {
  try {
    const raw = await readFile(auditFile(documentId), "utf8");
    const lines = raw.split("\n").filter(Boolean);
    return lines
      .map((line) => JSON.parse(line) as AuditEvent)
      .filter((e) => e.uid === uid)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  } catch {
    return [];
  }
}

export function seedAuditEvents(documentId: string, auditLogId: string, uid: string): AuditEvent[] {
  const now = Date.now();
  return [
    {
      id: `${auditLogId}-1`,
      audit_log_id: auditLogId,
      document_id: documentId,
      uid,
      event_type: "document_view",
      timestamp: new Date(now - 86400000 * 3).toISOString(),
      metadata: { channel: "signaturers" },
    },
    {
      id: `${auditLogId}-2`,
      audit_log_id: auditLogId,
      document_id: documentId,
      uid,
      event_type: "preview",
      timestamp: new Date(now - 86400000 * 2).toISOString(),
      metadata: { channel: "signaturers" },
    },
  ];
}
