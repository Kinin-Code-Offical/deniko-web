"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { randomBytes } from "crypto"

const createStudentSchema = z.object({
    firstName: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
    lastName: z.string().min(2, "Soyisim en az 2 karakter olmalıdır"),
    studentNo: z.string().optional(),
    gradeLevel: z.string().optional(),
    phoneNumber: z.string().optional(),
})

export async function createStudent(data: z.infer<typeof createStudentSchema>) {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { teacherProfile: true },
    })

    if (!user?.teacherProfile) {
        throw new Error("Teacher profile not found")
    }

    const validatedFields = createStudentSchema.safeParse(data)

    if (!validatedFields.success) {
        throw new Error("Invalid fields")
    }

    const { firstName, lastName, studentNo, gradeLevel, phoneNumber } = validatedFields.data

    // Generate a unique invite token
    const inviteToken = randomBytes(16).toString("hex")

    try {
        await db.$transaction(async (tx) => {
            // 1. Create the Student Profile (Shadow Account)
            const student = await tx.studentProfile.create({
                data: {
                    tempFirstName: firstName,
                    tempLastName: lastName,
                    studentNo,
                    gradeLevel,
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

        revalidatePath("/dashboard/students")
        return { success: true, message: "Öğrenci başarıyla oluşturuldu" }
    } catch (error) {
        console.error("Create Student Error:", error)
        return { success: false, message: "Öğrenci oluşturulurken bir hata oluştu" }
    }
}
