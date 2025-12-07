"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { randomBytes } from "crypto"
import logger from "@/lib/logger"
import { uploadFile, deleteFile } from "@/lib/storage"

const createStudentSchema = z.object({
    name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
    surname: z.string().min(2, "Soyisim en az 2 karakter olmalıdır"),
    studentNo: z.string().optional(),
    grade: z.string().optional(),
    tempPhone: z.string().optional(),
    tempEmail: z.string().email("Geçerli bir e-posta adresi giriniz").optional().or(z.literal("")),
    classroomIds: z.array(z.string()).optional().default([]),
})

/**
 * Creates a new "Shadow Student" profile.
 * This profile is not yet linked to a real user account.
 * 
 * @param formData - The form data containing student details and optional avatar.
 * @returns An object indicating success or failure.
 */
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
    // Token 48 saat geçerli olsun
    const inviteTokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000)

    try {
        await db.$transaction(async (tx: Prisma.TransactionClient) => {
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
                    inviteTokenExpires,
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

type MergePreferences = {
    useTeacherGrade: boolean;
    useTeacherParentInfo: boolean;
    useTeacherClassroom: boolean;
}

/**
 * Claims a student profile using an invitation token.
 * Merges the shadow profile with the authenticated user's profile if needed.
 * 
 * @param token - The invitation token.
 * @param preferences - The user's preferences for merging data.
 * @returns An object indicating success or failure.
 */
export async function claimStudentProfile(token: string, preferences: MergePreferences) {
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

        // Süre kontrolü
        if (targetProfile.inviteTokenExpires && new Date() > targetProfile.inviteTokenExpires) {
            return { success: false, error: "Davet bağlantısının süresi dolmuş. Lütfen öğretmeninizden yeni bir davet isteyin." }
        }

        // Check if user already has a profile
        const existingProfile = await db.studentProfile.findUnique({
            where: { userId: session.user.id }
        })

        await db.$transaction(async (tx: Prisma.TransactionClient) => {
            // 1. Preserve Teacher's View (Custom Name)
            // We want the teacher to keep seeing the name they entered (tempName), 
            // even after the real user (who might have a different name) claims it.
            const shadowRelations = await tx.studentTeacherRelation.findMany({
                where: { studentId: targetProfile.id }
            })

            for (const rel of shadowRelations) {
                const tempName = `${targetProfile.tempFirstName || ''} ${targetProfile.tempLastName || ''}`.trim()
                if (tempName && !rel.customName) {
                    await tx.studentTeacherRelation.update({
                        where: { id: rel.id },
                        data: { customName: tempName }
                    })
                }
            }

            // Prepare data for the final profile (Target Profile)
            
            const dataToUpdate: Prisma.StudentProfileUpdateInput = {
                user: { connect: { id: session.user.id } },
                isClaimed: true,
                inviteToken: null,
                tempFirstName: null,
                tempLastName: null,
            }

            // Logic: We are adopting the Shadow Profile (Target) as the main profile.
            // If the user chooses NOT to use Teacher's data, we overwrite Target with User's existing data (if any).

            if (existingProfile) {
                // Grade / Student No
                if (!preferences.useTeacherGrade) {
                    dataToUpdate.studentNo = existingProfile.studentNo
                    dataToUpdate.gradeLevel = existingProfile.gradeLevel
                }
                // Parent Info
                if (!preferences.useTeacherParentInfo) {
                    dataToUpdate.parentName = existingProfile.parentName
                    dataToUpdate.parentPhone = existingProfile.parentPhone
                    dataToUpdate.parentEmail = existingProfile.parentEmail
                }
                // Classrooms
                if (!preferences.useTeacherClassroom) {
                    dataToUpdate.classrooms = { set: [] }
                }
            } else {
                // No existing profile, so "User's Data" is effectively null/empty.
                // If they unchecked "Use Teacher's Data", we should clear those fields in Target.
                if (!preferences.useTeacherGrade) {
                    dataToUpdate.studentNo = null
                    dataToUpdate.gradeLevel = null
                }
                if (!preferences.useTeacherParentInfo) {
                    dataToUpdate.parentName = null
                    dataToUpdate.parentPhone = null
                    dataToUpdate.parentEmail = null
                }
                if (!preferences.useTeacherClassroom) {
                    dataToUpdate.classrooms = { set: [] }
                }
            }

            // 2. Handle User's Existing Profile
            if (existingProfile && existingProfile.id !== targetProfile.id) {
                // Delete the old profile as we are moving to the new one
                await tx.studentProfile.delete({
                    where: { id: existingProfile.id }
                })
            }

            // 3. Adopt Shadow Profile with merged data
            await tx.studentProfile.update({
                where: { id: targetProfile.id },
                data: dataToUpdate
            })
        })

        revalidatePath("/dashboard")
        return { success: true }

    } catch (error) {
        logger.error({ context: "claimStudentProfile", error }, "Failed to claim profile")
        return { success: false, error: "Failed to claim profile" }
    }
}

/**
 * Retrieves a student profile by its invitation token.
 * 
 * @param token - The invitation token.
 * @returns The student profile or null.
 */
export async function getInviteDetails(token: string) {
    try {
        const studentProfile = await db.studentProfile.findUnique({
            where: { inviteToken: token },
            select: {
                id: true,
                tempFirstName: true,
                tempLastName: true,
                studentNo: true,
                gradeLevel: true,
                parentName: true,
                parentPhone: true,
                inviteTokenExpires: true,
                isClaimed: true,
                teacherRelations: {
                    where: { isCreator: true },
                    take: 1,
                    select: {
                        teacher: {
                            select: {
                                user: {
                                    select: {
                                        name: true,
                                        firstName: true,
                                        lastName: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!studentProfile) return null

        // Extract teacher name safely
        const teacherUser = studentProfile.teacherRelations[0]?.teacher?.user
        const teacherName = teacherUser
            ? (teacherUser.firstName && teacherUser.lastName
                ? `${teacherUser.firstName} ${teacherUser.lastName}`
                : (teacherUser.name || "Bir Öğretmen"))
            : "Bir Öğretmen"

        return {
            ...studentProfile,
            teacherName
        }
    } catch (error) {
        logger.error({ context: "getInviteDetails", error }, "Failed to fetch invite details")
        return null
    }
}

export async function getStudentProfileByToken(token: string) {
    try {
        return await db.studentProfile.findUnique({
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
    } catch (error) {
        logger.error({ context: "getStudentProfileByToken", error }, "Failed to fetch profile by token")
        return null
    }
}



const updateStudentSchema = z.object({
    studentId: z.string(),
    firstName: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
    lastName: z.string().min(2, "Soyisim en az 2 karakter olmalıdır"),
    phone: z.string().optional(),
    avatarUrl: z.string().optional(),
})

/**
 * Updates a student's information.
 * Handles both Shadow and Claimed profiles differently.
 * 
 * @param data - The update data.
 * @returns An object indicating success or failure.
 */
export async function updateStudent(data: z.infer<typeof updateStudentSchema>) {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    const validatedFields = updateStudentSchema.safeParse(data)

    if (!validatedFields.success) {
        return { success: false, error: "Invalid fields" }
    }

    const { studentId, firstName, lastName, phone, avatarUrl } = validatedFields.data

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
            // CLAIMED: Only update Custom Name in Relation
            await db.studentTeacherRelation.update({
                where: {
                    teacherId_studentId: {
                        teacherId: user.teacherProfile.id,
                        studentId: studentId
                    }
                },
                data: {
                    customName: `${firstName} ${lastName}`.trim(),
                }
            })
        } else {
            // SHADOW: Update StudentProfile

            // Check if avatar is changing and delete old one
            if (avatarUrl && studentProfile.tempAvatar && studentProfile.tempAvatar !== avatarUrl && (!studentProfile.tempAvatar.startsWith("http") && !studentProfile.tempAvatar.startsWith("defaults/"))) {
                await deleteFile(studentProfile.tempAvatar)
            }

            await db.studentProfile.update({
                where: { id: studentId },
                data: {
                    tempFirstName: firstName,
                    tempLastName: lastName,
                    tempPhone: phone,
                    tempAvatar: avatarUrl
                }
            })
        }

        revalidatePath("/dashboard/students")
        revalidatePath(`/dashboard/students/${studentId}`)
        return { success: true }

    } catch (error) {
        logger.error({ context: "updateStudent", error }, "Failed to update student")
        return { success: false, error: "Failed to update student" }
    }
}


/**
 * Archives a student relation (soft delete).
 * 
 * @param studentId - The ID of the student to unlink.
 * @returns An object indicating success or failure.
 */
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

/**
 * Deletes a student or relation.
 * If the student is a shadow student created by the teacher, the profile is deleted.
 * Otherwise, only the relation is deleted.
 * 
 * @param studentId - The ID of the student to delete.
 * @returns An object indicating success or failure.
 */
export async function deleteStudent(studentId: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    try {
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            include: { teacherProfile: true },
        })

        if (!user?.teacherProfile) return { success: false, error: "Teacher profile not found" }

        const student = await db.studentProfile.findUnique({
            where: { id: studentId },
            select: { isClaimed: true }
        })

        if (!student) return { success: false, error: "Student not found" }

        if (student.isClaimed) {
            // Scenario B: Unlink (Delete Relation Only)
            await db.studentTeacherRelation.delete({
                where: {
                    teacherId_studentId: {
                        teacherId: user.teacherProfile.id,
                        studentId: studentId
                    }
                }
            })
            revalidatePath("/dashboard/students")
            return { success: true, message: "Öğrenci listenizden çıkarıldı (Bağlantı koparıldı)." }
        } else {
            // Scenario A: Hard Delete (Delete Profile)
            await db.studentProfile.delete({
                where: { id: studentId }
            })
            revalidatePath("/dashboard/students")
            return { success: true, message: "Gölge öğrenci ve verileri tamamen silindi." }
        }

    } catch (error) {
        logger.error({ context: "deleteStudent", error }, "Failed to delete student")
        return { success: false, error: "Silme işlemi başarısız" }
    }
}

const _updateStudentRelationSchema = z.object({
    customName: z.string().optional(),
    privateNotes: z.string().optional(),
    phoneNumber: z.string().optional(),
})

/**
 * Updates the relation details between a teacher and a student.
 * 
 * @param studentId - The student ID.
 * @param data - The update data (custom name, notes, etc.).
 * @returns An object indicating success or failure.
 */
export async function updateStudentRelation(studentId: string, data: z.infer<typeof _updateStudentRelationSchema>) {
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

        await db.$transaction(async (tx: Prisma.TransactionClient) => {
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


/**
 * Deletes a shadow student profile.
 * 
 * @param studentId - The ID of the student to delete.
 * @returns An object indicating success or failure.
 */
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

export async function regenerateInviteToken(studentId: string) {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { teacherProfile: true },
    })

    if (!user?.teacherProfile) {
        return { success: false, error: "Teacher profile not found" }
    }

    // Verify ownership/relation
    const relation = await db.studentTeacherRelation.findUnique({
        where: {
            teacherId_studentId: {
                teacherId: user.teacherProfile.id,
                studentId: studentId,
            },
        },
    })

    if (!relation) {
        return { success: false, error: "Relation not found" }
    }

    const newToken = randomBytes(16).toString("hex")
    const newExpires = new Date(Date.now() + 48 * 60 * 60 * 1000)

    try {
        await db.studentProfile.update({
            where: { id: studentId },
            data: {
                inviteToken: newToken,
                inviteTokenExpires: newExpires,
            },
        })

        revalidatePath("/dashboard/students")
        revalidatePath(`/dashboard/students/${studentId}`)
        return { success: true, message: "Davet bağlantısı yenilendi." }
    } catch (error) {
        logger.error({ context: "regenerateInviteToken", error }, "Failed to regenerate token")
        return { success: false, error: "Failed to regenerate token" }
    }
}

export async function toggleInviteLink(studentId: string, enable: boolean) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { teacherProfile: true },
    })

    if (!user?.teacherProfile) return { success: false, error: "Teacher profile not found" }

    try {
        const relation = await db.studentTeacherRelation.findUnique({
            where: {
                teacherId_studentId: {
                    teacherId: user.teacherProfile.id,
                    studentId: studentId,
                },
            },
        })

        if (!relation) return { success: false, error: "Relation not found" }

        if (enable) {
            const newToken = randomBytes(16).toString("hex")
            const newExpires = new Date(Date.now() + 48 * 60 * 60 * 1000)
            await db.studentProfile.update({
                where: { id: studentId },
                data: { inviteToken: newToken, inviteTokenExpires: newExpires },
            })
        } else {
            await db.studentProfile.update({
                where: { id: studentId },
                data: { inviteToken: null, inviteTokenExpires: null },
            })
        }

        revalidatePath(`/dashboard/students/${studentId}`)
        return { success: true, message: enable ? "Davet bağlantısı açıldı." : "Davet bağlantısı kapatıldı." }
    } catch (error) {
        logger.error({ context: "toggleInviteLink", error }, "Failed to toggle invite link")
        return { success: false, error: "İşlem başarısız" }
    }
}

export async function updateStudentSettings(studentId: string, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { teacherProfile: true },
    })

    if (!user?.teacherProfile) return { success: false, error: "Teacher profile not found" }

    try {
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

        const customName = formData.get("customName") as string
        const privateNotes = formData.get("privateNotes") as string

        const firstName = formData.get("firstName") as string
        const lastName = formData.get("lastName") as string
        const studentNo = formData.get("studentNo") as string
        const gradeLevel = formData.get("gradeLevel") as string
        const phone = formData.get("phone") as string
        const email = formData.get("email") as string

        const parentName = formData.get("parentName") as string
        const parentPhone = formData.get("parentPhone") as string
        const parentEmail = formData.get("parentEmail") as string

        const avatarFile = formData.get("avatar") as File | null
        const avatarUrl = formData.get("avatarUrl") as string | null

        let newAvatarPath = undefined
        if (avatarFile && avatarFile.size > 0) {
            newAvatarPath = await uploadFile(avatarFile, "students")
            // Delete old avatar if it exists and is a file
            if (relation.student.tempAvatar && !relation.student.tempAvatar.startsWith("http") && !relation.student.tempAvatar.startsWith("defaults/")) {
                await deleteFile(relation.student.tempAvatar)
            }
        } else if (avatarUrl) {
            newAvatarPath = avatarUrl
        }

        await db.$transaction(async (tx: Prisma.TransactionClient) => {
            // Update Relation
            await tx.studentTeacherRelation.update({
                where: { id: relation.id },
                data: {
                    customName: customName,
                    privateNotes: privateNotes,
                },
            })

            // Update Profile
            // If claimed, we might restrict some fields, but user asked to edit them.
            // We will update what we can on the profile.
            
            const profileUpdateData: Prisma.StudentProfileUpdateInput = {
                studentNo: studentNo,
                gradeLevel: gradeLevel,
                parentName: parentName,
                parentPhone: parentPhone,
                parentEmail: parentEmail,
            }

            if (!relation.student.isClaimed) {
                profileUpdateData.tempFirstName = firstName
                profileUpdateData.tempLastName = lastName
                profileUpdateData.tempPhone = phone
                profileUpdateData.tempEmail = email
                if (newAvatarPath !== undefined) {
                    profileUpdateData.tempAvatar = newAvatarPath
                }
            } else {
                // If claimed, we generally don't update user's personal info (phone, email, name)
                // But we can update the student profile specific fields (grade, studentNo, parent info)
                // The user asked to edit "Görünen isim" (customName) - handled above.
                // "Profil fotosu" - if claimed, it usually comes from User. 
                // If we want to override it, we'd need a customAvatar field on Relation or Profile.
                // For now, I'll assume we only update avatar if NOT claimed, or if we have a way to override.
                // The current schema has `tempAvatar` on StudentProfile.
                // If `isClaimed` is true, the UI usually shows `user.image`.
                // If the user wants to change the photo of a CLAIMED student, they probably mean the photo THEY see.
                // But `StudentProfile` is shared.
                // Let's stick to: If claimed, we don't update name/avatar/contact of the User.
                // We only update `customName` and `privateNotes`.
                // And `studentNo`, `gradeLevel`, `parent*` on the profile.
            }

            await tx.studentProfile.update({
                where: { id: studentId },
                data: profileUpdateData,
            })
        })

        revalidatePath("/dashboard/students")
        revalidatePath(`/dashboard/students/${studentId}`)
        return { success: true, message: "Bilgiler güncellendi." }

    } catch (error) {
        logger.error({ context: "updateStudentSettings", error }, "Failed to update student settings")
        return { success: false, error: "Güncelleme başarısız" }
    }
}

