import { createHash } from "node:crypto";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { appendAuditEvent } from "@/lib/audit/auditLog";
import { getVaultObject, verifyStorageAccessToken } from "@/lib/s3/signaturersS3";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing access token." }, { status: 400 });
  }

  let access: Awaited<ReturnType<typeof verifyStorageAccessToken>>;
  try {
    access = await verifyStorageAccessToken(token);
  } catch {
    return NextResponse.json({ error: "Invalid or expired access token." }, { status: 403 });
  }

  try {
    const object = await getVaultObject(access.s3_object_key, access.uid);

    if (access.checksum_hash && object.metadataChecksum) {
      if (access.checksum_hash !== object.metadataChecksum) {
        return NextResponse.json({ error: "Checksum verification failed." }, { status: 409 });
      }
    }

    await appendAuditEvent({
      audit_log_id: `storage-${access.document_id}`,
      document_id: access.document_id,
      uid: access.uid,
      event_type: access.purpose === "download" ? "download" : "preview",
      metadata: { via: "signed_token", purpose: access.purpose },
    });

    const stream = object.body as Readable;
    const webStream = Readable.toWeb(stream) as ReadableStream;

    const headers: Record<string, string> = {
      "Content-Type": object.contentType,
      "Cache-Control": "private, no-store, max-age=0",
      "X-Checksum-Verified": access.checksum_hash ? "requested" : "skipped",
    };
    if (object.contentLength) headers["Content-Length"] = String(object.contentLength);
    if (access.purpose === "download") {
      headers["Content-Disposition"] = `attachment; filename="document-${access.document_id}"`;
    } else {
      headers["Content-Disposition"] = "inline";
    }

    return new NextResponse(webStream, { headers });
  } catch {
    return NextResponse.json({ error: "Unable to retrieve document." }, { status: 404 });
  }
}

/** Stream hash verification helper for future inline verification. */
export function sha256Hex(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}
