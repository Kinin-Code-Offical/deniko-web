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

export async function claimStudentProfile(token: string) {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const targetProfile = await db.studentProfile.findUnique({
            where: { inviteToken: token },
        })

        if (!targetProfile) {
            return { success: false, error: "Invalid or expired token" }
        }

        if (targetProfile.userId) {
            return { success: false, error: "Profile already claimed" }
        }

        // Check if user already has a profile
        const existingProfile = await db.studentProfile.findUnique({
            where: { userId: session.user.id }
        })

        await db.$transaction(async (tx) => {
            if (existingProfile) {
                // --- MERGE SCENARIO ---
                // User already has a profile, so we merge the shadow profile into it.

                // 1. Move Teacher Relations
                const targetRelations = await tx.studentTeacherRelation.findMany({
                    where: { studentId: targetProfile.id }
                })

                for (const rel of targetRelations) {
                    // Check if relation already exists
                    const existingRel = await tx.studentTeacherRelation.findUnique({
                        where: {
                            teacherId_studentId: {
                                teacherId: rel.teacherId,
                                studentId: existingProfile.id
                            }
                        }
                    })

                    if (existingRel) {
                        // Already related, delete the shadow relation
                        await tx.studentTeacherRelation.delete({ where: { id: rel.id } })
                    } else {
                        // Move relation to existing profile
                        await tx.studentTeacherRelation.update({
                            where: { id: rel.id },
                            data: { studentId: existingProfile.id }
                        })
                    }
                }

                // 2. Move all other related entities

                // A. Handle Many-to-Many Relations (Lesson)
                // Find lessons where targetProfile is a participant
                const targetLessons = await tx.lesson.findMany({
                    where: { students: { some: { id: targetProfile.id } } }
                })

                for (const lesson of targetLessons) {
                    // Connect existingProfile to these lessons
                    // We use 'connect' which is safe even if already connected (in some Prisma versions, but better check or just try)
                    // Actually, if already connected, connect might throw or do nothing.
                    // To be safe, we can check or just ignore error? 
                    // Better: check if existingProfile is already in the lesson.

                    const isAlreadyInLesson = await tx.lesson.findFirst({
                        where: {
                            id: lesson.id,
                            students: { some: { id: existingProfile.id } }
                        }
                    })

                    if (!isAlreadyInLesson) {
                        await tx.lesson.update({
                            where: { id: lesson.id },
                            data: {
                                students: {
                                    connect: { id: existingProfile.id }
                                }
                            }
                        })
                    }
                }

                // B. Handle One-to-Many Relations (Update studentId)
                await tx.payment.updateMany({
                    where: { studentId: targetProfile.id },
                    data: { studentId: existingProfile.id }
                })
                await tx.homeworkTracking.updateMany({
                    where: { studentId: targetProfile.id },
                    data: { studentId: existingProfile.id }
                })
                await tx.homeworkSubmission.updateMany({
                    where: { studentId: targetProfile.id },
                    data: { studentId: existingProfile.id }
                })
                await tx.attendance.updateMany({
                    where: { studentId: targetProfile.id },
                    data: { studentId: existingProfile.id }
                })
                await tx.schoolExam.updateMany({
                    where: { studentId: targetProfile.id },
                    data: { studentId: existingProfile.id }
                })
                await tx.trialExam.updateMany({
                    where: { studentId: targetProfile.id },
                    data: { studentId: existingProfile.id }
                })

                // C. Handle Classroom (One-to-Many)
                // If existingProfile has no classroom, and targetProfile has one, take it.
                if (!existingProfile.classroomId && targetProfile.classroomId) {
                    await tx.studentProfile.update({
                        where: { id: existingProfile.id },
                        data: { classroomId: targetProfile.classroomId }
                    })
                }

                // 3. Delete the shadow profile
                await tx.studentProfile.delete({
                    where: { id: targetProfile.id }
                })

            } else {
                // --- STANDARD CLAIM SCENARIO ---
                // Link profile to user
                await tx.studentProfile.update({
                    where: { id: targetProfile.id },
                    data: {
                        userId: session.user.id,
                        isClaimed: true,
                        inviteToken: null
                    }
                })
            }
        })

        revalidatePath("/dashboard")
        return { success: true }

    } catch (error) {
        logger.error({ context: "claimStudentProfile", error }, "Failed to claim profile")
        return { success: false, error: "Failed to claim profile" }
    }
}

export async function getStudentProfileByToken(token: string) {
    try {
        const studentProfile = await db.studentProfile.findUnique({
            where: { inviteToken: token },
            include: {
                teacherRelations: {
                    include: {
                        teacher: {
                            include: {
                                user: true
                            }
                        }
                    }
                }
            }
        })
        return studentProfile
    } catch (error) {
        logger.error({ context: "getStudentProfileByToken", error }, "Failed to fetch profile by token")
        return null
    }
}
