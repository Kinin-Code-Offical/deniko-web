import { Storage } from "@google-cloud/storage";
import { env } from "@/lib/env";
import logger from "@/lib/logger";
import { v4 as uuidv4 } from "uuid";

let storageInstance: Storage | null = null;
const bucketName = env.GCS_BUCKET_NAME;
const DEFAULT_SIGNED_URL_TTL_SECONDS = 300; // 5 minutes

function getStorage() {
  if (!storageInstance) {
    storageInstance = new Storage({
      projectId: env.GCS_PROJECT_ID,
      credentials: {
        client_email: env.GCS_CLIENT_EMAIL,
        private_key: env.GCS_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
    });
  }
  return storageInstance;
}

function getBucket() {
  if (!bucketName) throw new Error("GCS_BUCKET_NAME is not defined");
  return getStorage().bucket(bucketName);
}

const ALLOWED_PREFIXES = ["avatars/", "files/", "uploads/", "default/"];

function validateKey(key: string) {
  if (!key) throw new Error("Key is required");

  // Prevent path traversal
  if (key.includes("..") || key.includes("//") || key.includes("\\")) {
    throw new Error("Invalid key format: Path traversal detected");
  }

  // Ensure key starts with allowed prefix
  const hasValidPrefix = ALLOWED_PREFIXES.some((prefix) => key.startsWith(prefix));
  if (!hasValidPrefix) {
    throw new Error(`Invalid key prefix. Allowed: ${ALLOWED_PREFIXES.join(", ")}`);
  }
}

export async function uploadObject(
  key: string,
  data: Buffer | Uint8Array | string,
  options: { contentType: string; cacheControl?: string }
): Promise<void> {
  validateKey(key);

  const file = getBucket().file(key);
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);

  await file.save(buffer, {
    contentType: options.contentType,
    metadata: {
      cacheControl: options.cacheControl || "private, max-age=3600",
    },
  });
}

export async function getObjectStream(key: string) {
  validateKey(key);
  const file = getBucket().file(key);
  const [exists] = await file.exists();
  if (!exists) {
    throw new Error(`File not found: ${key}`);
  }
  return file.createReadStream();
}

export async function getSignedUrlForKey(
  key: string,
  opts?: { expiresInSeconds?: number }
): Promise<string> {
  validateKey(key);

  const file = getBucket().file(key);
  const expiresInSeconds = opts?.expiresInSeconds || DEFAULT_SIGNED_URL_TTL_SECONDS;

  // Max 1 hour allowed for security
  if (expiresInSeconds > 3600) {
    throw new Error("Expiration time cannot exceed 1 hour");
  }

  try {
    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + expiresInSeconds * 1000,
    });
    return url;
  } catch (error) {
    logger.error({ error, key }, "Signed URL Generation Error");
    throw new Error("Failed to generate signed URL");
  }
}

export async function deleteObject(key: string): Promise<boolean> {
  validateKey(key);
  try {
    await getBucket().file(key).delete();
    return true;
  } catch (error) {
    logger.error({ error, key }, "GCS Delete Error");
    return false;
  }
}

// --- Legacy/Helper Wrappers ---

export const deleteFile = deleteObject;

export const getSignedUrl = getSignedUrlForKey;

export async function uploadFile(file: File, folder: "avatars" | "files" | "uploads" = "uploads"): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop();
  const key = `${folder}/${uuidv4()}.${ext}`;

  await uploadObject(key, buffer, {
    contentType: file.type,
  });

  return key;
}
