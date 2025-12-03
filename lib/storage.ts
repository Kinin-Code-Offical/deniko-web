import { Storage } from "@google-cloud/storage"
import { v4 as uuidv4 } from "uuid"

// Global değişken yerine bu yapıyı kullanın
let storageInstance: Storage | null = null;

function getStorage() {
    if (!storageInstance) {
        storageInstance = new Storage({
            projectId: process.env.GCS_PROJECT_ID,
            credentials: {
                client_email: process.env.GCS_CLIENT_EMAIL,
                // replace işlemi undefined hatası vermesin diye kontrol ekledik
                private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            },
        })
    }
    return storageInstance;
}

const bucketName = process.env.GCS_BUCKET_NAME

export async function uploadFile(file: File, folder: string): Promise<string> {
    if (!bucketName) throw new Error("GCS_BUCKET_NAME is not defined")

    const buffer = Buffer.from(await file.arrayBuffer())
    const extension = file.name.split(".").pop()
    const fileName = `${folder}/${uuidv4()}.${extension}`

    // getStorage() fonksiyonunu çağırıyoruz
    const bucket = getStorage().bucket(bucketName)
    const fileRef = bucket.file(fileName)

    await fileRef.save(buffer, {
        contentType: file.type,
        metadata: { cacheControl: "private, max-age=3600" },
    })

    return fileName
}

// İmzalı URL (Hızlı Profil Fotoları İçin)
export async function getSignedUrl(path: string) {
    if (!path) return null;
    if (!bucketName) throw new Error("GCS_BUCKET_NAME is not defined")

    const bucket = getStorage().bucket(bucketName);
    const file = bucket.file(path);

    try {
        const [url] = await file.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 60 * 60 * 1000, // 1 Saat
        });
        return url;
    } catch (error) {
        console.error("Signed URL Error:", error);
        return null;
    }
}

export async function getFileStream(path: string) {
    if (!bucketName) throw new Error("GCS_BUCKET_NAME is not defined")
    const bucket = getStorage().bucket(bucketName)
    return bucket.file(path).createReadStream()
}

export async function deleteFile(path: string): Promise<boolean> {
    if (!path) return false;
    if (!bucketName) throw new Error("GCS_BUCKET_NAME is not defined")
    try {
        const bucket = getStorage().bucket(bucketName)
        await bucket.file(path).delete()
        return true
    } catch (error) {
        console.error("GCS Delete Error:", error)
        return false
    }
}