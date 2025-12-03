import { Storage } from "@google-cloud/storage"
import { v4 as uuidv4 } from "uuid"

// Global değişken yerine lazy getter kullanacağız
let storageInstance: Storage | null = null;

function getStorage() {
    if (!storageInstance) {
        storageInstance = new Storage({
            projectId: process.env.GCS_PROJECT_ID,
            credentials: {
                client_email: process.env.GCS_CLIENT_EMAIL,
                // private_key build sırasında undefined olabilir, kontrol ediyoruz
                private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            },
        })
    }
    return storageInstance;
}

const bucketName = process.env.GCS_BUCKET_NAME

export async function uploadFile(file: File, folder: string): Promise<string> {
    if (!bucketName) {
        throw new Error("GCS_BUCKET_NAME is not defined")
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const extension = file.name.split(".").pop()
    const fileName = `${folder}/${uuidv4()}.${extension}`

    // getStorage() kullanarak instance alıyoruz
    const bucket = getStorage().bucket(bucketName)
    const fileRef = bucket.file(fileName)

    await fileRef.save(buffer, {
        contentType: file.type,
        metadata: {
            cacheControl: "private, max-age=3600",
        },
    })

    return fileName
}

export async function getFileStream(path: string) {
    if (!bucketName) {
        throw new Error("GCS_BUCKET_NAME is not defined")
    }

    // getStorage() kullanıyoruz
    const bucket = getStorage().bucket(bucketName)
    const file = bucket.file(path)

    // Performance update: exists kontrolünü kaldırmıştık, direkt stream dönüyoruz
    return file.createReadStream()
}

export async function getFileMetadata(path: string) {
    if (!bucketName) {
        throw new Error("GCS_BUCKET_NAME is not defined")
    }

    const bucket = getStorage().bucket(bucketName)
    const file = bucket.file(path)
    const [metadata] = await file.getMetadata()

    return metadata
}

// Yeni eklediğimiz Signed URL fonksiyonu (Önceki konuşmamızdan)
export async function getSignedUrl(path: string) {
    if (!path) return null;
    if (!bucketName) throw new Error("Bucket name defined")

    const bucket = getStorage().bucket(bucketName);
    const file = bucket.file(path);

    const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000,
    });
    return url;
}

// lib/storage.ts dosyasının sonuna ekleyin:

/**
 * Google Cloud Storage'dan belirtilen yoldaki dosyayı siler.
 * @param path - Silinecek dosyanın veritabanında kayıtlı yolu (örn: "avatars/user123.jpg")
 */
export async function deleteFile(path: string): Promise<boolean> {
    if (!path) return false;

    if (!bucketName) {
        throw new Error("GCS_BUCKET_NAME is not defined")
    }

    try {
        // Eğer Lazy Loading (getStorage) kullanıyorsanız:
        const bucket = getStorage().bucket(bucketName)

        // EĞER Lazy Loading kullanmıyorsanız (Eski kod):
        // const bucket = storage.bucket(bucketName)

        const file = bucket.file(path)

        // Dosya var mı kontrolü yapmaya gerek yok, delete() yoksa hata fırlatır, catch yakalar.
        await file.delete()

        return true
    } catch (error) {
        // Dosya zaten yoksa (404), işlem başarılı sayılabilir veya loglanabilir.
        console.error("GCS Delete Error:", error)
        return false
    }
}