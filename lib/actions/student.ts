"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import crypto from "crypto"

const createStudentSchema = z.object({
    name: z.string().min(2),
    surname: z.string().min(2),
    grade: z.string().optional(),
    studentNo: z.string().optional(),
    phoneNumber: z.string().optional(),
    avatarUrl: z.string().optional(),
})

export async function createShadowStudent(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "TEACHER") {
        return { error: "Unauthorized" }
    }

    const rawData = {
        name: formData.get("name"),
        surname: formData.get("surname"),
        grade: formData.get("grade"),
        studentNo: formData.get("studentNo"),
        phoneNumber: formData.get("phoneNumber"),
        avatarUrl: formData.get("avatarUrl"),
    }

    const validatedData = createStudentSchema.safeParse(rawData)

    if (!validatedData.success) {
        return { error: "Invalid data" }
    }

    const { name, surname, grade, studentNo, phoneNumber, avatarUrl } = validatedData.data

    // Generate a unique invite token
    const inviteToken = crypto.randomBytes(16).toString("hex")

    try {
        // Get teacher profile
        const teacherProfile = await db.teacherProfile.findUnique({
            where: { userId: session.user.id },
        })

        if (!teacherProfile) {
            return { error: "Teacher profile not found" }
        }

        // Create StudentProfile and Relation
        await db.studentProfile.create({
            data: {
                tempFirstName: name,
                tempLastName: surname,
                gradeLevel: grade,
                studentNo: studentNo,
                phoneNumber: phoneNumber,
                avatarUrl: avatarUrl,
                inviteToken: inviteToken,
                creatorTeacherId: teacherProfile.id,
                teacherRelations: {
                    create: {
                        teacherId: teacherProfile.id,
                        isCreator: true,
                        status: "ACTIVE",
                    },
                },
            },
        })

        revalidatePath("/dashboard/students")
        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Error creating student:", error)
        return { error: "Failed to create student" }
    }
}
