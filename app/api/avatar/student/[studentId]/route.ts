import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getObjectStream } from "@/lib/storage";
import { NextResponse } from "next/server";
import logger from "@/lib/logger";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ studentId: string }> }
) {
    const { studentId } = await params;
    const session = await auth();

    const student = await db.studentProfile.findUnique({
        where: { id: studentId },
        select: { tempAvatarKey: true, userId: true },
    });

    if (!student || !student.tempAvatarKey) {
        // Return default avatar from GCS
        try {
            const stream = await getObjectStream("default/avatar.png");
            return new NextResponse(stream as unknown as BodyInit, {
                headers: {
                    "Content-Type": "image/png",
                    "Cache-Control": "public, max-age=31536000",
                },
            });
        } catch (error) {
            logger.error({ error }, "Default avatar not found in GCS");
            return new NextResponse("Default avatar not found", { status: 404 });
        }
    }

    // Privacy/Auth Check
    // Who can see a student avatar?
    // 1. The student themselves (if they have a user account linked)
    // 2. The teacher who created the student (creatorTeacherId)
    // 3. Teachers linked to the student via StudentTeacherRelation

    // For simplicity, if the user is logged in, we might allow it if they have a relation.
    // But checking relation is expensive.
    // User said: "Her istekte auth + yetki kontrolü uygula".

    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if requester is the student
    if (student.userId === session.user.id) {
        // Allowed
    } else {
        // Check if requester is a teacher of this student
        const relation = await db.studentTeacherRelation.findFirst({
            where: {
                studentId: studentId,
                teacher: { userId: session.user.id },
            },
        });

        if (!relation) {
            return new NextResponse("Forbidden", { status: 403 });
        }
    }

    // Internal GCS Key
    try {
        const stream = await getObjectStream(student.tempAvatarKey);
        const contentType = student.tempAvatarKey.endsWith(".png") ? "image/png" : "image/jpeg";

        return new NextResponse(stream as unknown as BodyInit, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "private, max-age=300",
            },
        });
    } catch {
        return new NextResponse("Avatar not found", { status: 404 });
    }
}
