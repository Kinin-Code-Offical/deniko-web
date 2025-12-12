import { Storage } from "@google-cloud/storage";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

const { GCS_PROJECT_ID, GCS_CLIENT_EMAIL, GCS_PRIVATE_KEY, GCS_BUCKET_NAME } = process.env;

if (!GCS_PROJECT_ID || !GCS_CLIENT_EMAIL || !GCS_PRIVATE_KEY || !GCS_BUCKET_NAME) {
    console.error("Missing GCS environment variables");
    process.exit(1);
}

const storage = new Storage({
    projectId: GCS_PROJECT_ID,
    credentials: {
        client_email: GCS_CLIENT_EMAIL,
        private_key: GCS_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
});

const bucket = storage.bucket(GCS_BUCKET_NAME);

const AVATARS = [
    { name: "avatar-1.png", seed: "Felix" },
    { name: "avatar-2.png", seed: "Aneka" },
    { name: "avatar-3.png", seed: "Zack" },
    { name: "avatar-4.png", seed: "Sarah" },
    { name: "avatar-5.png", seed: "John" },
    { name: "avatar-6.png", seed: "Maya" },
];

async function downloadAndUploadAvatars() {
    console.log("Starting avatar download and upload process...");

    for (const avatar of AVATARS) {
        const destination = `default/avatars/${avatar.name}`;
        const url = `https://api.dicebear.com/9.x/avataaars/png?seed=${avatar.seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

        console.log(`Downloading ${avatar.name} from ${url}...`);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            console.log(`Uploading to ${destination}...`);

            const file = bucket.file(destination);
            await file.save(buffer, {
                contentType: "image/png",
                metadata: {
                    cacheControl: "public, max-age=31536000",
                },
            });

            console.log(`✅ Uploaded ${destination}`);
        } catch (error) {
            console.error(`❌ Failed to process ${destination}:`, error);
        }
    }
}

downloadAndUploadAvatars().catch(console.error);
