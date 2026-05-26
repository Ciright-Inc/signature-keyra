import { createHash, randomBytes } from "node:crypto";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SignJWT, jwtVerify } from "jose";

export type StorageAccessPurpose = "preview" | "download";

export type StorageAccessClaims = {
  uid: string;
  document_id: string;
  s3_object_key: string;
  purpose: StorageAccessPurpose;
  checksum_hash: string | null;
};

function envFirst(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

function getS3Config() {
  const bucket = envFirst("S3_BUCKET", "AWS_BUCKET_NAME", "AWS_S3_BUCKET");
  const region = envFirst("S3_REGION", "AWS_REGION") || "us-east-1";
  const prefix = (process.env.S3_SIGNATURERS_PREFIX?.trim() || "keyra-signaturers-vault").replace(
    /\/$/,
    "",
  );
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();

  if (!bucket) return null;

  const client = new S3Client({
    region,
    credentials:
      accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
  });

  return { client, bucket, region, prefix };
}

export function isSignaturersS3Configured(): boolean {
  return Boolean(envFirst("S3_BUCKET", "AWS_BUCKET_NAME", "AWS_S3_BUCKET"));
}

export function buildVaultS3Key(uid: string, originalName: string): string {
  const config = getS3Config();
  const prefix = config?.prefix ?? "keyra-signaturers-vault";
  const safeUid = uid.replace(/[^a-zA-Z0-9._-]/g, "_");
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const unique = randomBytes(8).toString("hex");
  return `${prefix}/${safeUid}/${Date.now()}-${unique}-${safeName}`;
}

export function isAllowedVaultKey(key: string, uid: string): boolean {
  const config = getS3Config();
  const prefix = config?.prefix ?? "keyra-signaturers-vault";
  const safeUid = uid.replace(/[^a-zA-Z0-9._-]/g, "_");
  return key.startsWith(`${prefix}/${safeUid}/`) && !key.includes("..");
}

export async function uploadVaultObject(params: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<{ bucket: string; region: string; checksum: string }> {
  const config = getS3Config();
  if (!config) throw new Error("S3 is not configured for Signaturers vault storage.");

  const checksum = createHash("sha256").update(params.body).digest("hex");

  await config.client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
      Metadata: { checksum },
    }),
  );

  return { bucket: config.bucket, region: config.region, checksum };
}

export async function getVaultObject(key: string, uid: string) {
  const config = getS3Config();
  if (!config) throw new Error("S3 is not configured.");
  if (!isAllowedVaultKey(key, uid)) throw new Error("Invalid vault object key.");

  const response = await config.client.send(
    new GetObjectCommand({ Bucket: config.bucket, Key: key }),
  );

  if (!response.Body) throw new Error("Object not found.");

  const metadataChecksum = response.Metadata?.checksum ?? null;

  return {
    body: response.Body,
    contentType: response.ContentType ?? "application/octet-stream",
    contentLength: response.ContentLength,
    metadataChecksum,
  };
}

function accessSecret(): Uint8Array {
  const secret =
    process.env.SIGNATURERS_PREVIEW_SECRET?.trim() ||
    process.env.KEYRA_SESSION_SECRET?.trim() ||
    "__signaturers_dev_preview_secret__";
  return new TextEncoder().encode(secret);
}

export async function createStorageAccessToken(
  params: StorageAccessClaims,
): Promise<string> {
  return new SignJWT({
    uid: params.uid,
    document_id: params.document_id,
    s3_object_key: params.s3_object_key,
    purpose: params.purpose,
    checksum_hash: params.checksum_hash,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(accessSecret());
}

export async function verifyStorageAccessToken(token: string): Promise<StorageAccessClaims> {
  const { payload } = await jwtVerify(token, accessSecret());
  const purpose = payload.purpose;
  if (purpose !== "preview" && purpose !== "download") {
    throw new Error("Invalid access purpose.");
  }
  if (
    typeof payload.uid !== "string" ||
    typeof payload.document_id !== "string" ||
    typeof payload.s3_object_key !== "string"
  ) {
    throw new Error("Invalid access token.");
  }
  return {
    uid: payload.uid,
    document_id: payload.document_id,
    s3_object_key: payload.s3_object_key,
    purpose,
    checksum_hash:
      typeof payload.checksum_hash === "string" ? payload.checksum_hash : null,
  };
}

/** @deprecated Use createStorageAccessToken */
export async function createPreviewAccessToken(params: {
  uid: string;
  document_id: string;
  s3_object_key: string;
}): Promise<string> {
  return createStorageAccessToken({ ...params, purpose: "preview", checksum_hash: null });
}

/** @deprecated Use verifyStorageAccessToken */
export async function verifyPreviewAccessToken(token: string): Promise<{
  uid: string;
  document_id: string;
  s3_object_key: string;
}> {
  const claims = await verifyStorageAccessToken(token);
  return {
    uid: claims.uid,
    document_id: claims.document_id,
    s3_object_key: claims.s3_object_key,
  };
}
