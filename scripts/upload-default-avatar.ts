// Load environment variables before imports
if (process.env.NODE_ENV !== 'production') {
    try {
        process.loadEnvFile();
    } catch (error) {
        console.log("No .env file found or error loading it", error);
    }
}

async function main() {
    const { uploadObject } = await import("@/lib/storage");

    console.log("Downloading default avatar...");
    const response = await fetch("https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&s=200");

    if (!response.ok) {
        throw new Error(`Failed to download avatar: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("Uploading to GCS...");
    await uploadObject("default/avatar.png", buffer, {
        contentType: "image/png",
        cacheControl: "public, max-age=31536000", // 1 year cache
    });

    console.log("Successfully uploaded default/avatar.png to GCS");
}

main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
