import { auth } from "@/auth"
import { getFileMetadata, getFileStream } from "@/lib/storage"
import { NextRequest, NextResponse } from "next/server"

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
        const stream = await getFileStream(filePath)

        if (!stream) {
            return new NextResponse("File not found", { status: 404 })
        }

        const metadata = await getFileMetadata(filePath)
        const contentType = metadata.contentType || "application/octet-stream"

        // Convert the Node.js ReadableStream to a Web ReadableStream
        const webStream = new ReadableStream({
            start(controller) {
                stream.on("data", (chunk) => controller.enqueue(chunk))
                stream.on("end", () => controller.close())
                stream.on("error", (err) => controller.error(err))
            },
        })

        return new NextResponse(webStream as any, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "private, max-age=3600",
            },
        })
    } catch (error) {
        console.error("Error serving file:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
