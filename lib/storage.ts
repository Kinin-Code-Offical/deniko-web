import { Storage } from "@google-cloud/storage";
import { v4 as uuidv4 } from "uuid";
import { env } from "@/lib/env";
import logger from "@/lib/logger";

let storageInstance: Storage | null = null;
const bucketName = env.GCS_BUCKET_NAME;
const SIGNED_URL_TTL_MS = 60 * 60 * 1000; // 1 saat cache için yeterli

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

export async function uploadFile(file: File, folder: string): Promise<string> {
  if (!bucketName) throw new Error("GCS_BUCKET_NAME is not defined");
  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = file.name.split(".").pop();
  const fileName = `${folder}/${uuidv4()}.${extension}`;

  const fileRef = getBucket().file(fileName);

  await fileRef.save(buffer, {
    contentType: file.type,
    metadata: { cacheControl: "private, max-age=3600" },
  });

  return fileName;
}

export async function getSignedUrl(path: string): Promise<string | null> {
  if (!path) return null;
  const file = getBucket().file(path);

  try {
    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + SIGNED_URL_TTL_MS,
    });
    return url;
  } catch (error) {
    logger.error({ error }, "Signed URL Error");
    return null;
  }
}

export async function getFileStream(path: string) {
  if (!bucketName) throw new Error("GCS_BUCKET_NAME is not defined");
  return getBucket().file(path).createReadStream();
}

export async function deleteFile(path: string): Promise<boolean> {
  if (!path) return false;
  if (!bucketName) throw new Error("GCS_BUCKET_NAME is not defined");
  try {
    await getBucket().file(path).delete();
    return true;
  } catch (error) {
    logger.error({ error }, "GCS Delete Error");
    return false;
  }
}
