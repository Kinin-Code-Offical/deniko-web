"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { randomBytes } from "crypto"
import logger from "@/lib/logger"
import { uploadFile } from "@/lib/storage"

const createStudentSchema = z.object({
    name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
    surname: z.string().min(2, "Soyisim en az 2 karakter olmalıdır"),
    studentNo: z.string().optional(),
    grade: z.string().optional(),
    tempPhone: z.string().optional(),
    tempEmail: z.string().email("Geçerli bir e-posta adresi giriniz").optional().or(z.literal("")),
    classroomIds: z.array(z.string()).optional().default([]),
})

export async function createStudent(formData: FormData) {
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

    const rawData = {
        name: formData.get("name") as string,
        surname: formData.get("surname") as string,
        studentNo: formData.get("studentNo") as string || undefined,
        grade: formData.get("grade") as string || undefined,
        tempPhone: formData.get("tempPhone") as string || undefined,
        tempEmail: formData.get("tempEmail") as string || undefined,
        classroomIds: formData.getAll("classroomIds") as string[],
    }

    const validatedFields = createStudentSchema.safeParse(rawData)

    if (!validatedFields.success) {
        logger.warn({ context: "createStudent", errors: validatedFields.error }, "Invalid fields")
        return { success: false, error: "Invalid fields" }
    }

    const { name, surname, studentNo, grade, tempPhone, tempEmail, classroomIds } = validatedFields.data

    let avatarUrl: string | undefined

    const file = formData.get("avatar") as File | null
    const selectedAvatar = formData.get("selectedAvatar") as string | null

    if (file && file.size > 0) {
        try {
            avatarUrl = await uploadFile(file, "students")
        } catch (error) {
            logger.error({ context: "createStudent", error }, "Failed to upload avatar")
            return { success: false, error: "Avatar yüklenirken bir hata oluştu" }
        }
    } else if (selectedAvatar) {
        avatarUrl = selectedAvatar
    }

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
                    tempPhone,
                    tempEmail,
                    tempAvatar: avatarUrl,
                    inviteToken,
                    creatorTeacherId: user.teacherProfile!.id,
                    isClaimed: false,
                    classrooms: {
                        connect: classroomIds.map((id) => ({ id })),
                    },
                },
            })

            // 2. Create the Relation
            await tx.studentTeacherRelation.create({
                data: {
                    teacherId: user.teacherProfile!.id,
                    studentId: student.id,
                    isCreator: true,
                    status: "ACTIVE",
                    customName: `${name} ${surname}`,
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

                // C. Handle Classroom (Many-to-Many)
                // Note: Complex merge for M-N classrooms is skipped for now or handled elsewhere.
                // Since classroomId column is removed, we remove the old logic.

                // 3. Delete the shadow profile
                await tx.studentProfile.delete({
                    where: { id: targetProfile.id }
                })

            } else {
                // --- STANDARD CLAIM SCENARIO ---

                // Update customName for creator teacher so they keep seeing the name they know
                if (targetProfile.creatorTeacherId) {
                    const tempName = `${targetProfile.tempFirstName || ''} ${targetProfile.tempLastName || ''}`.trim()

                    const relation = await tx.studentTeacherRelation.findUnique({
                        where: {
                            teacherId_studentId: {
                                teacherId: targetProfile.creatorTeacherId,
                                studentId: targetProfile.id
                            }
                        }
                    })

                    if (relation) {
                        await tx.studentTeacherRelation.update({
                            where: { id: relation.id },
                            data: {
                                // Only set if not already set, or overwrite? Prompt says "Copy...". 
                                // Usually we want to preserve what the teacher sees.
                                customName: relation.customName || tempName
                            }
                        })
                    }
                }

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

const updateStudentSchema = z.object({
    studentId: z.string(),
    name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
    surname: z.string().min(2, "Soyisim en az 2 karakter olmalıdır"),
    studentNo: z.string().optional(),
    grade: z.string().optional(),
    tempPhone: z.string().optional(),
    tempEmail: z.string().email().optional().or(z.literal("")),
    tempAvatar: z.string().optional(),
    parentName: z.string().optional(),
    parentPhone: z.string().optional(),
    parentEmail: z.string().email().optional().or(z.literal("")),
})

export async function updateStudent(data: z.infer<typeof updateStudentSchema>) {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    const validatedFields = updateStudentSchema.safeParse(data)

    if (!validatedFields.success) {
        return { success: false, error: "Invalid fields" }
    }

    const { studentId, name, surname, studentNo, grade, tempPhone, tempEmail, tempAvatar, parentName, parentPhone, parentEmail } = validatedFields.data

    try {
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            include: { teacherProfile: true },
        })

        if (!user?.teacherProfile) {
            return { success: false, error: "Teacher profile not found" }
        }

        const studentProfile = await db.studentProfile.findUnique({
            where: { id: studentId },
        })

        if (!studentProfile) {
            return { success: false, error: "Student not found" }
        }

        // Check if relation exists
        const relation = await db.studentTeacherRelation.findUnique({
            where: {
                teacherId_studentId: {
                    teacherId: user.teacherProfile.id,
                    studentId: studentId
                }
            }
        })

        if (!relation) {
            return { success: false, error: "No relation found with this student" }
        }

        if (studentProfile.isClaimed) {
            // CLAIMED: Only update Custom Name/Avatar in Relation
            await db.studentTeacherRelation.update({
                where: { id: relation.id },
                data: {
                    customName: `${name} ${surname}`,
                }
            })

            revalidatePath(`/dashboard/students/${studentId}`)
            return { success: true, message: "Öğrenci bilgileri güncellendi (Kısıtlı Erişim)" }

        } else {
            // SHADOW: Update Profile directly
            await db.studentProfile.update({
                where: { id: studentId },
                data: {
                    tempFirstName: name,
                    tempLastName: surname,
                    studentNo,
                    gradeLevel: grade,
                    tempPhone,
                    tempEmail,
                    tempAvatar,
                    parentName,
                    parentPhone,
                    parentEmail,
                }
            })

            revalidatePath(`/dashboard/students/${studentId}`)
            return { success: true, message: "Öğrenci bilgileri güncellendi" }
        }

    } catch (error) {
        logger.error({ context: "updateStudent", error }, "Failed to update student")
        return { success: false, error: "Güncelleme başarısız" }
    }
}

export async function unlinkStudent(studentId: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    try {
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            include: { teacherProfile: true },
        })

        if (!user?.teacherProfile) return { success: false, error: "Teacher profile not found" }

        await db.studentTeacherRelation.update({
            where: {
                teacherId_studentId: {
                    teacherId: user.teacherProfile.id,
                    studentId: studentId
                }
            },
            data: { status: "ARCHIVED" }
        })

        revalidatePath("/dashboard/students")
        return { success: true, message: "Öğrenci arşivlendi" }
    } catch (error) {
        logger.error({ context: "unlinkStudent", error }, "Failed to archive student")
        return { success: false, error: "İşlem başarısız" }
    }
}

export async function deleteStudent(studentId: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    try {
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            include: { teacherProfile: true },
        })

        if (!user?.teacherProfile) return { success: false, error: "Teacher profile not found" }

        const studentProfile = await db.studentProfile.findUnique({
            where: { id: studentId }
        })

        if (!studentProfile) return { success: false, error: "Student not found" }

        if (!studentProfile.isClaimed && studentProfile.creatorTeacherId === user.teacherProfile.id) {
            // Shadow student created by this teacher -> Delete Profile (cascades relation)
            await db.studentProfile.delete({
                where: { id: studentId }
            })
        } else {
            // Claimed OR not created by this teacher -> Delete Relation only
            await db.studentTeacherRelation.delete({
                where: {
                    teacherId_studentId: {
                        teacherId: user.teacherProfile.id,
                        studentId: studentId
                    }
                }
            })
        }

        revalidatePath("/dashboard/students")
        return { success: true, message: "Öğrenci silindi" }
    } catch (error) {
        logger.error({ context: "deleteStudent", error }, "Failed to delete student")
        return { success: false, error: "Silme işlemi başarısız" }
    }
}

const updateStudentRelationSchema = z.object({
    customName: z.string().optional(),
    privateNotes: z.string().optional(),
    phoneNumber: z.string().optional(),
})

export async function updateStudentRelation(studentId: string, data: z.infer<typeof updateStudentRelationSchema>) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { teacherProfile: true },
    })

    if (!user?.teacherProfile) return { success: false, error: "Teacher profile not found" }

    try {
        // 1. Check if relation exists
        const relation = await db.studentTeacherRelation.findUnique({
            where: {
                teacherId_studentId: {
                    teacherId: user.teacherProfile.id,
                    studentId: studentId,
                },
            },
            include: { student: true },
        })

        if (!relation) return { success: false, error: "Relation not found" }

        await db.$transaction(async (tx) => {
            // 2. Update Relation
            await tx.studentTeacherRelation.update({
                where: { id: relation.id },
                data: {
                    customName: data.customName,
                    privateNotes: data.privateNotes,
                },
            })

            // 3. If Shadow & Phone provided, update Profile
            if (!relation.student.isClaimed && data.phoneNumber !== undefined) {
                await tx.studentProfile.update({
                    where: { id: studentId },
                    data: { tempPhone: data.phoneNumber },
                })
            }
        })

        revalidatePath("/dashboard/students")
        revalidatePath(`/dashboard/students/${studentId}`)
        return { success: true }
    } catch (error) {
        logger.error({ context: "updateStudentRelation", error }, "Failed to update student")
        return { success: false, error: "Failed to update student" }
    }
}



export async function deleteShadowStudent(studentId: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { teacherProfile: true },
    })

    if (!user?.teacherProfile) return { success: false, error: "Teacher profile not found" }

    try {
        const student = await db.studentProfile.findUnique({
            where: { id: studentId },
        })

        if (!student) return { success: false, error: "Student not found" }
        if (student.isClaimed) return { success: false, error: "Cannot delete claimed student" }

        // Verify ownership/creator if needed, or just allow if relation exists
        // For now, we check if the teacher has a relation
        const relation = await db.studentTeacherRelation.findUnique({
            where: {
                teacherId_studentId: {
                    teacherId: user.teacherProfile.id,
                    studentId: studentId,
                },
            },
        })

        if (!relation) return { success: false, error: "Relation not found" }

        // Delete Profile (Cascades to Relation)
        await db.studentProfile.delete({
            where: { id: studentId },
        })

        revalidatePath("/dashboard/students")
        return { success: true }
    } catch (error) {
        logger.error({ context: "deleteShadowStudent", error }, "Failed to delete student")
        return { success: false, error: "Failed to delete student" }
    }
}
