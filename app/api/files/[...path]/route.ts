import { auth } from "@/auth"
import { getFileStream } from "@/lib/storage"
import { NextRequest, NextResponse } from "next/server"
import pathModule from "path" // Node.js path modülünü ekleyin

// Basit MIME type belirleyici
function getMimeType(filename: string) {
    const ext = pathModule.extname(filename).toLowerCase();
    const types: Record<string, string> = {
        '.png': 'image/png',
        '.jpg': 'imamge/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
    };
    return types[ext] || 'application/octet-stream';
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const session = await auth()

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const { path } = await params
    const filePath = path.join("/")

    try {
        // 2. Metadata sorgusunu (getFileMetadata) KALDIRDIK.
        const contentType = getMimeType(filePath);

        // 3. Doğrudan stream istiyoruz.
        const stream = await getFileStream(filePath);

        if (!stream) {
            return new NextResponse("File not found", { status: 404 })
        }

        const webStream = new ReadableStream({
            start(controller) {
                stream.on("data", (chunk) => controller.enqueue(chunk))
                stream.on("end", () => controller.close())
                stream.on("error", (err) => {
                    // Dosya yoksa stream burada hata fırlatır
                    console.error("Stream error:", err);
                    controller.error(err);
                })
            },
        })

        
        return new NextResponse(webStream, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        })
    } catch (error) {
        console.error("Error serving file:", error)
        return new NextResponse("File not found or Error", { status: 404 })
    }
}
