"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { randomBytes } from "crypto"
import logger from "@/lib/logger"

const createStudentSchema = z.object({
    name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
    surname: z.string().min(2, "Soyisim en az 2 karakter olmalıdır"),
    studentNo: z.string().optional(),
    grade: z.string().optional(),
    phoneNumber: z.string().optional(),
})

export async function createStudent(data: z.infer<typeof createStudentSchema>) {
    const session = await auth()

    if (!session?.user?.id) {
        logger.warn({ context: "createStudent" }, "Unauthorized attempt")
        return { success: false, error: "Unauthorized" }
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { teacherProfile: true },
    })

    if (!user?.teacherProfile) {
        logger.warn({ context: "createStudent", userId: session.user.id }, "Teacher profile not found")
        return { success: false, error: "Teacher profile not found" }
    }

    const validatedFields = createStudentSchema.safeParse(data)

    if (!validatedFields.success) {
        logger.warn({ context: "createStudent", errors: validatedFields.error }, "Invalid fields")
        return { success: false, error: "Invalid fields" }
    }

    const { name, surname, studentNo, grade, phoneNumber } = validatedFields.data

    // Generate a unique invite token
    const inviteToken = randomBytes(16).toString("hex")

    try {
        await db.$transaction(async (tx) => {
            // 1. Create the Student Profile (Shadow Account)
            const student = await tx.studentProfile.create({
                data: {
                    tempFirstName: name,
                    tempLastName: surname,
                    studentNo,
                    gradeLevel: grade,
                    phoneNumber,
                    inviteToken,
                    creatorTeacherId: user.teacherProfile!.id,
                    isClaimed: false,
                },
            })

            // 2. Create the Relation
            await tx.studentTeacherRelation.create({
                data: {
                    teacherId: user.teacherProfile!.id,
                    studentId: student.id,
                    isCreator: true,
                    status: "ACTIVE",
                },
            })
        })

        logger.info({ context: "createStudent", teacherId: user.teacherProfile.id }, "Student created successfully")
        revalidatePath("/dashboard/students")
        return { success: true, message: "Öğrenci başarıyla oluşturuldu" }
    } catch (error) {
        logger.error({ context: "createStudent", error }, "Failed to create student")
        return { success: false, error: "Öğrenci oluşturulurken bir hata oluştu" }
    }
}
