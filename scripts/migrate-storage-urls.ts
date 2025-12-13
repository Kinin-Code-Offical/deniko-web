import { PrismaClient } from "@prisma/client";
import { env } from "../lib/env";

const db = new PrismaClient();

async function main() {
    console.log("Starting storage URL migration...");

    const bucketName = env.GCS_BUCKET_NAME;
    const prefixes = [
        `https://storage.googleapis.com/${bucketName}/`,
        `https://storage.cloud.google.com/${bucketName}/`,
    ];

    // 1. Migrate Users (Avatar)
    const users = await db.user.findMany({
        where: {
            image: {
                startsWith: "http",
            },
        },
    });

    console.log(`Found ${users.length} users with HTTP images.`);

    for (const user of users) {
        if (!user.image) continue;

        // Skip external providers (Google, etc.) if they are not GCS
        // But wait, if it's Google Auth, it's an external URL we want to KEEP.
        // We only want to migrate OUR GCS URLs.

        let newKey = user.image;
        let migrated = false;

        for (const prefix of prefixes) {
            if (newKey.startsWith(prefix)) {
                newKey = newKey.replace(prefix, "");
                migrated = true;
                break;
            }
        }

        if (migrated) {
            console.log(`Migrating user ${user.id}: ${user.image} -> ${newKey}`);
            await db.user.update({
                where: { id: user.id },
                data: { image: newKey },
            });
        }
    }

    // 2. Migrate Files (if any)
    // Assuming File model has 'url' or 'key' field. 
    // In the new schema, it should be 'key'. 
    // If the migration hasn't run yet, it might be 'url'.
    // But I can't check schema easily here.
    // I'll assume the schema update is applied and we are fixing data in 'key' column if it contains full URL.

    // Check if File model exists
    if ('file' in db) {
        // Dynamic check
        const files = await db.file.findMany({
            where: {
                key: {
                    startsWith: "http"
                }
            }
        });

        console.log(`Found ${files.length} files with HTTP keys.`);

        for (const file of files) {
            let newKey = file.key;
            let migrated = false;

            for (const prefix of prefixes) {
                if (newKey.startsWith(prefix)) {
                    newKey = newKey.replace(prefix, "");
                    migrated = true;
                    break;
                }
            }

            if (migrated) {
                console.log(`Migrating file ${file.id}: ${file.key} -> ${newKey}`);
                // Dynamic check
                await db.file.update({
                    where: { id: file.id },
                    data: { key: newKey }
                });
            }
        }
    }

    console.log("Migration complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
