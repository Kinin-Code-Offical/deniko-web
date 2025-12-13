"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { randomBytes } from "crypto";
import logger from "@/lib/logger";
import { uploadFile, deleteFile } from "@/lib/storage";

const createStudentSchema = z.object({
  name: z.string().min(2, "name_min_length"),
  surname: z.string().min(2, "surname_min_length"),
  studentNo: z.string().optional(),
  grade: z.string().optional(),
  tempPhone: z.string().optional(),
  tempEmail: z.string().email("invalid_email").optional().or(z.literal("")),
  classroomIds: z.array(z.string()).optional().default([]),
});

/**
 * Creates a new "Shadow Student" profile.
 * This profile is not yet linked to a real user account.
 *
 * @param formData - The form data containing student details and optional avatar.
 * @returns An object indicating success or failure.
 */
export async function createStudent(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    logger.warn({ context: "createStudent" }, "Unauthorized attempt");
    return { success: false, error: "unauthorized" };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { teacherProfile: true },
  });

  if (!user?.teacherProfile) {
    logger.warn(
      { context: "createStudent", userId: session.user.id },
      "Teacher profile not found"
    );
    return { success: false, error: "teacher_profile_not_found" };
  }

  const rawData = {
    name: formData.get("name") as string,
    surname: formData.get("surname") as string,
    studentNo: (formData.get("studentNo") as string) || undefined,
    grade: (formData.get("grade") as string) || undefined,
    tempPhone: (formData.get("tempPhone") as string) || undefined,
    tempEmail: (formData.get("tempEmail") as string) || undefined,
    classroomIds: formData.getAll("classroomIds") as string[],
  };

  const validatedFields = createStudentSchema.safeParse(rawData);

  if (!validatedFields.success) {
    logger.warn(
      { context: "createStudent", errors: validatedFields.error },
      "Invalid fields"
    );
    return { success: false, error: "invalid_fields" };
  }

  const {
    name,
    surname,
    studentNo,
    grade,
    tempPhone,
    tempEmail,
    classroomIds,
  } = validatedFields.data;

  let avatarUrl: string | undefined;

  const file = formData.get("avatar") as File | null;
  const selectedAvatar = formData.get("selectedAvatar") as string | null;

  if (file && file.size > 0) {
    try {
      avatarUrl = await uploadFile(file, "avatars");
    } catch (error) {
      logger.error(
        { context: "createStudent", error },
        "Failed to upload avatar"
      );
      return { success: false, error: "failed_to_upload_avatar" };
    }
  } else if (selectedAvatar) {
    avatarUrl = selectedAvatar;
  }

  // Generate a unique invite token
  const inviteToken = randomBytes(16).toString("hex");
  // Token 48 saat geçerli olsun
  const inviteTokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000);

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
          tempAvatarKey: avatarUrl,
          inviteToken,
          inviteTokenExpires,
          creatorTeacherId: user.teacherProfile!.id,
          isClaimed: false,
          classrooms: {
            connect: classroomIds.map((id) => ({ id })),
          },
        },
      });

      // 2. Create the Relation
      await tx.studentTeacherRelation.create({
        data: {
          teacherId: user.teacherProfile!.id,
          studentId: student.id,
          isCreator: true,
          status: "ACTIVE",
          customName: `${name} ${surname}`,
        },
      });
    });

    logger.info(
      { context: "createStudent", teacherId: user.teacherProfile.id },
      "Student created successfully"
    );
    revalidatePath("/dashboard/students");
    return { success: true, message: "student_created" };
  } catch (error) {
    logger.error(
      { context: "createStudent", error },
      "Failed to create student"
    );
    return { success: false, error: "failed_to_create_student" };
  }
}

type MergePreferences = {
  useTeacherGrade: boolean;
  useTeacherParentInfo: boolean;
  useTeacherClassroom: boolean;
  useTeacherName?: boolean;
};

/**
 * Claims a student profile using an invitation token.
 * Merges the shadow profile with the authenticated user's profile if needed.
 *
 * @param token - The invitation token.
 * @param preferences - The user's preferences for merging data.
 * @returns An object indicating success or failure.
 */
export async function claimStudentProfile(
  token: string,
  preferences: MergePreferences
) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "unauthorized" };
  }

  try {
    const targetProfile = await db.studentProfile.findUnique({
      where: { inviteToken: token },
    });

    if (!targetProfile) {
      return { success: false, error: "invalid_token" };
    }

    if (targetProfile.userId) {
      return { success: false, error: "profile_already_claimed" };
    }

    // Süre kontrolü
    if (
      targetProfile.inviteTokenExpires &&
      new Date() > targetProfile.inviteTokenExpires
    ) {
      return { success: false, error: "invite_expired" };
    }

    // Check if user already has a profile
    const existingProfile = await db.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Preserve Teacher's View (Custom Name)
      const shadowRelations = await tx.studentTeacherRelation.findMany({
        where: { studentId: targetProfile.id },
      });

      for (const rel of shadowRelations) {
        const tempName =
          `${targetProfile.tempFirstName || ""} ${targetProfile.tempLastName || ""}`.trim();
        if (tempName && !rel.customName) {
          await tx.studentTeacherRelation.update({
            where: { id: rel.id },
            data: { customName: tempName },
          });
        }
      }

      if (existingProfile && existingProfile.id !== targetProfile.id) {
        // MERGE LOGIC: Move relations from Shadow to Existing
        for (const rel of shadowRelations) {
          const existingRel = await tx.studentTeacherRelation.findUnique({
            where: {
              teacherId_studentId: {
                teacherId: rel.teacherId,
                studentId: existingProfile.id,
              },
            },
          });

          if (existingRel) {
            // Already connected. Update customName if needed, then delete shadow relation.
            if (!existingRel.customName && rel.customName) {
              await tx.studentTeacherRelation.update({
                where: { id: existingRel.id },
                data: { customName: rel.customName },
              });
            }
            await tx.studentTeacherRelation.delete({ where: { id: rel.id } });
          } else {
            // Move relation to existing profile
            await tx.studentTeacherRelation.update({
              where: { id: rel.id },
              data: { studentId: existingProfile.id },
            });
          }
        }

        // Update Existing Profile Data based on preferences
        const updateForExisting: Prisma.StudentProfileUpdateInput = {};

        if (preferences.useTeacherGrade) {
          updateForExisting.studentNo = targetProfile.studentNo;
          updateForExisting.gradeLevel = targetProfile.gradeLevel;
        }
        if (preferences.useTeacherParentInfo) {
          updateForExisting.parentName = targetProfile.parentName;
          updateForExisting.parentPhone = targetProfile.parentPhone;
          updateForExisting.parentEmail = targetProfile.parentEmail;
        }

        if (Object.keys(updateForExisting).length > 0) {
          await tx.studentProfile.update({
            where: { id: existingProfile.id },
            data: updateForExisting,
          });
        }

        // Classrooms Logic for Merge
        if (preferences.useTeacherClassroom) {
          const targetClassrooms = await tx.classroom.findMany({
            where: { students: { some: { id: targetProfile.id } } },
            select: { id: true },
          });

          if (targetClassrooms.length > 0) {
            await tx.studentProfile.update({
              where: { id: existingProfile.id },
              data: {
                classrooms: {
                  connect: targetClassrooms.map((c) => ({ id: c.id })),
                },
              },
            });
          }
        }

        // Move Relations (Preserve customName)
        const targetRelations = await tx.studentTeacherRelation.findMany({
          where: { studentId: targetProfile.id },
        });

        for (const relation of targetRelations) {
          const existingRelation = await tx.studentTeacherRelation.findUnique({
            where: {
              teacherId_studentId: {
                teacherId: relation.teacherId,
                studentId: existingProfile.id,
              },
            },
          });

          if (existingRelation) {
            if (relation.customName) {
              await tx.studentTeacherRelation.update({
                where: { id: existingRelation.id },
                data: {
                  customName: relation.customName,
                  isCreator: relation.isCreator || existingRelation.isCreator,
                },
              });
            }
          } else {
            await tx.studentTeacherRelation.update({
              where: { id: relation.id },
              data: {
                studentId: existingProfile.id,
              },
            });
          }
        }

        // Delete Shadow Profile
        await tx.studentProfile.delete({ where: { id: targetProfile.id } });
      } else {
        // NO EXISTING PROFILE: Claim the Shadow Profile
        const dataToUpdate: Prisma.StudentProfileUpdateInput = {
          user: { connect: { id: session.user.id } },
          isClaimed: true,
          inviteToken: null,
          tempFirstName: null,
          tempLastName: null,
        };

        if (!preferences.useTeacherGrade) {
          dataToUpdate.studentNo = null;
          dataToUpdate.gradeLevel = null;
        }
        if (!preferences.useTeacherParentInfo) {
          dataToUpdate.parentName = null;
          dataToUpdate.parentPhone = null;
          dataToUpdate.parentEmail = null;
        }
        if (!preferences.useTeacherClassroom) {
          dataToUpdate.classrooms = { set: [] };
        }

        await tx.studentProfile.update({
          where: { id: targetProfile.id },
          data: dataToUpdate,
        });
      }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    logger.error(
      { context: "claimStudentProfile", error },
      "Failed to claim profile"
    );
    return { success: false, error: "failed_to_claim_profile" };
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
        tempPhone: true,
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
                    id: true,
                    name: true,
                    firstName: true,
                    lastName: true,
                    image: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!studentProfile) return null;

    // Extract teacher name safely
    const teacherUser = studentProfile.teacherRelations[0]?.teacher?.user;
    const teacherName = teacherUser
      ? teacherUser.firstName && teacherUser.lastName
        ? `${teacherUser.firstName} ${teacherUser.lastName}`
        : teacherUser.name || null
      : null;
    const teacherImage = teacherUser?.image || null;
    const teacherEmail = teacherUser?.email || null;
    const teacherId = teacherUser?.id || null;

    return {
      ...studentProfile,
      teacherName,
      teacherImage,
      teacherEmail,
      teacherId,
    };
  } catch (error) {
    logger.error(
      { context: "getInviteDetails", error },
      "Failed to fetch invite details"
    );
    return null;
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
                user: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    logger.error(
      { context: "getStudentProfileByToken", error },
      "Failed to fetch profile by token"
    );
    return null;
  }
}

const updateStudentSchema = z.object({
  studentId: z.string(),
  firstName: z.string().min(2, "name_min_length"),
  lastName: z.string().min(2, "surname_min_length"),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
});

/**
 * Updates a student's information.
 * Handles both Shadow and Claimed profiles differently.
 *
 * @param data - The update data.
 * @returns An object indicating success or failure.
 */
export async function updateStudent(data: z.infer<typeof updateStudentSchema>) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "unauthorized" };
  }

  const validatedFields = updateStudentSchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, error: "invalid_fields" };
  }

  const { studentId, firstName, lastName, phone, avatarUrl } =
    validatedFields.data;

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { teacherProfile: true },
    });

    if (!user?.teacherProfile) {
      return { success: false, error: "teacher_profile_not_found" };
    }

    const studentProfile = await db.studentProfile.findUnique({
      where: { id: studentId },
    });

    if (!studentProfile) {
      return { success: false, error: "student_not_found" };
    }

    // Check if relation exists
    const relation = await db.studentTeacherRelation.findUnique({
      where: {
        teacherId_studentId: {
          teacherId: user.teacherProfile.id,
          studentId: studentId,
        },
      },
    });

    if (!relation) {
      return { success: false, error: "no_relation_found" };
    }

    if (studentProfile.isClaimed) {
      // CLAIMED: Only update Custom Name in Relation
      await db.studentTeacherRelation.update({
        where: {
          teacherId_studentId: {
            teacherId: user.teacherProfile.id,
            studentId: studentId,
          },
        },
        data: {
          customName: `${firstName} ${lastName}`.trim(),
        },
      });
    } else {
      // SHADOW: Update StudentProfile

      // Check if avatar is changing and delete old one
      if (
        avatarUrl &&
        studentProfile.tempAvatarKey &&
        studentProfile.tempAvatarKey !== avatarUrl &&
        !studentProfile.tempAvatarKey.startsWith("http") &&
        !studentProfile.tempAvatarKey.startsWith("defaults/")
      ) {
        await deleteFile(studentProfile.tempAvatarKey);
      }

      await db.studentProfile.update({
        where: { id: studentId },
        data: {
          tempFirstName: firstName,
          tempLastName: lastName,
          tempPhone: phone,
          tempAvatarKey: avatarUrl,
        },
      });
    }

    revalidatePath("/dashboard/students");
    revalidatePath(`/dashboard/students/${studentId}`);
    return { success: true };
  } catch (error) {
    logger.error(
      { context: "updateStudent", error },
      "Failed to update student"
    );
    return { success: false, error: "failed_to_update_student" };
  }
}

/**
 * Archives a student relation (soft delete).
 *
 * @param studentId - The ID of the student to unlink.
 * @returns An object indicating success or failure.
 */
export async function unlinkStudent(studentId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "unauthorized" };

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { teacherProfile: true },
    });

    if (!user?.teacherProfile)
      return { success: false, error: "teacher_profile_not_found" };

    await db.studentTeacherRelation.update({
      where: {
        teacherId_studentId: {
          teacherId: user.teacherProfile.id,
          studentId: studentId,
        },
      },
      data: { status: "ARCHIVED" },
    });

    revalidatePath("/dashboard/students");
    return { success: true, message: "student_archived" };
  } catch (error) {
    logger.error(
      { context: "unlinkStudent", error },
      "Failed to archive student"
    );
    return { success: false, error: "failed_to_archive_student" };
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
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "unauthorized" };

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { teacherProfile: true },
    });

    if (!user?.teacherProfile)
      return { success: false, error: "teacher_profile_not_found" };

    const student = await db.studentProfile.findUnique({
      where: { id: studentId },
      select: { isClaimed: true },
    });

    if (!student) return { success: false, error: "student_not_found" };

    if (student.isClaimed) {
      // Scenario B: Unlink (Delete Relation Only)
      await db.studentTeacherRelation.delete({
        where: {
          teacherId_studentId: {
            teacherId: user.teacherProfile.id,
            studentId: studentId,
          },
        },
      });
      revalidatePath("/dashboard/students");
      return { success: true, message: "student_unlinked" };
    } else {
      // Scenario A: Hard Delete (Delete Profile)
      await db.studentProfile.delete({
        where: { id: studentId },
      });
      revalidatePath("/dashboard/students");
      return { success: true, message: "shadow_student_deleted" };
    }
  } catch (error) {
    logger.error(
      { context: "deleteStudent", error },
      "Failed to delete student"
    );
    return { success: false, error: "failed_to_delete_student" };
  }
}

interface UpdateStudentRelationData {
  customName?: string;
  privateNotes?: string;
  phoneNumber?: string;
}

/**
 * Updates the relation details between a teacher and a student.
 *
 * @param studentId - The student ID.
 * @param data - The data to update.
 * @returns An object indicating success or failure.
 */
export async function updateStudentRelation(
  studentId: string,
  data: UpdateStudentRelationData
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "unauthorized" };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { teacherProfile: true },
  });

  if (!user?.teacherProfile)
    return { success: false, error: "teacher_profile_not_found" };

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
    });

    if (!relation) return { success: false, error: "relation_not_found" };

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      // 2. Update Relation
      await tx.studentTeacherRelation.update({
        where: { id: relation.id },
        data: {
          customName: data.customName,
          privateNotes: data.privateNotes,
        },
      });

      // 3. If Shadow & Phone provided, update Profile
      if (!relation.student.isClaimed && data.phoneNumber !== undefined) {
        await tx.studentProfile.update({
          where: { id: studentId },
          data: { tempPhone: data.phoneNumber },
        });
      }
    });

    revalidatePath("/dashboard/students");
    revalidatePath(`/dashboard/students/${studentId}`);
    return { success: true };
  } catch (error) {
    logger.error(
      { context: "updateStudentRelation", error },
      "Failed to update student"
    );
    return { success: false, error: "Failed to update student" };
  }
}

/**
 * Deletes a shadow student profile.
 *
 * @param studentId - The ID of the student to delete.
 * @returns An object indicating success or failure.
 */
export async function deleteShadowStudent(studentId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "unauthorized" };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { teacherProfile: true },
  });

  if (!user?.teacherProfile)
    return { success: false, error: "teacher_profile_not_found" };

  try {
    const student = await db.studentProfile.findUnique({
      where: { id: studentId },
    });

    if (!student) return { success: false, error: "student_not_found" };
    if (student.isClaimed)
      return { success: false, error: "cannot_delete_claimed" };

    // Verify ownership/creator if needed, or just allow if relation exists
    // For now, we check if the teacher has a relation
    const relation = await db.studentTeacherRelation.findUnique({
      where: {
        teacherId_studentId: {
          teacherId: user.teacherProfile.id,
          studentId: studentId,
        },
      },
    });

    if (!relation) return { success: false, error: "relation_not_found" };

    // Delete Profile (Cascades to Relation)
    await db.studentProfile.delete({
      where: { id: studentId },
    });

    revalidatePath("/dashboard/students");
    return { success: true };
  } catch (error) {
    logger.error(
      { context: "deleteShadowStudent", error },
      "Failed to delete student"
    );
    return { success: false, error: "failed_to_delete_student" };
  }
}

export async function regenerateInviteToken(studentId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "unauthorized" };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { teacherProfile: true },
  });

  if (!user?.teacherProfile) {
    return { success: false, error: "teacher_profile_not_found" };
  }

  // Verify ownership/relation
  const relation = await db.studentTeacherRelation.findUnique({
    where: {
      teacherId_studentId: {
        teacherId: user.teacherProfile.id,
        studentId: studentId,
      },
    },
  });

  if (!relation) {
    return { success: false, error: "relation_not_found" };
  }

  const newToken = randomBytes(16).toString("hex");
  const newExpires = new Date(Date.now() + 48 * 60 * 60 * 1000);

  try {
    await db.studentProfile.update({
      where: { id: studentId },
      data: {
        inviteToken: newToken,
        inviteTokenExpires: newExpires,
      },
    });

    revalidatePath("/dashboard/students");
    revalidatePath(`/dashboard/students/${studentId}`);
    return { success: true, message: "invite_regenerated" };
  } catch (error) {
    logger.error(
      { context: "regenerateInviteToken", error },
      "Failed to regenerate token"
    );
    return { success: false, error: "failed_to_regenerate_token" };
  }
}

export async function toggleInviteLink(studentId: string, enable: boolean) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "unauthorized" };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { teacherProfile: true },
  });

  if (!user?.teacherProfile)
    return { success: false, error: "teacher_profile_not_found" };

  try {
    const relation = await db.studentTeacherRelation.findUnique({
      where: {
        teacherId_studentId: {
          teacherId: user.teacherProfile.id,
          studentId: studentId,
        },
      },
    });

    if (!relation) return { success: false, error: "relation_not_found" };

    if (enable) {
      const newToken = randomBytes(16).toString("hex");
      const newExpires = new Date(Date.now() + 48 * 60 * 60 * 1000);
      await db.studentProfile.update({
        where: { id: studentId },
        data: { inviteToken: newToken, inviteTokenExpires: newExpires },
      });
    } else {
      await db.studentProfile.update({
        where: { id: studentId },
        data: { inviteToken: null, inviteTokenExpires: null },
      });
    }

    revalidatePath(`/dashboard/students/${studentId}`);
    return {
      success: true,
      message: enable ? "invite_opened" : "invite_closed",
    };
  } catch (error) {
    logger.error(
      { context: "toggleInviteLink", error },
      "Failed to toggle invite link"
    );
    return { success: false, error: "failed_to_toggle_invite" };
  }
}

export async function updateStudentSettings(
  studentId: string,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "unauthorized" };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { teacherProfile: true },
  });

  if (!user?.teacherProfile)
    return { success: false, error: "teacher_profile_not_found" };

  try {
    const relation = await db.studentTeacherRelation.findUnique({
      where: {
        teacherId_studentId: {
          teacherId: user.teacherProfile.id,
          studentId: studentId,
        },
      },
      include: { student: true },
    });

    if (!relation) return { success: false, error: "relation_not_found" };

    const customName = formData.get("customName") as string;
    const privateNotes = formData.get("privateNotes") as string;

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const studentNo = formData.get("studentNo") as string;
    const gradeLevel = formData.get("gradeLevel") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;

    const parentName = formData.get("parentName") as string;
    const parentPhone = formData.get("parentPhone") as string;
    const parentEmail = formData.get("parentEmail") as string;

    const avatarFile = formData.get("avatar") as File | null;
    const avatarUrl = formData.get("avatarUrl") as string | null;

    let newAvatarPath = undefined;
    if (avatarFile && avatarFile.size > 0) {
      newAvatarPath = await uploadFile(avatarFile, "avatars");
      // Delete old avatar if it exists and is a file
      if (
        relation.student.tempAvatarKey &&
        !relation.student.tempAvatarKey.startsWith("http") &&
        !relation.student.tempAvatarKey.startsWith("defaults/")
      ) {
        await deleteFile(relation.student.tempAvatarKey);
      }
    } else if (avatarUrl) {
      newAvatarPath = avatarUrl;
    }

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update Relation
      await tx.studentTeacherRelation.update({
        where: { id: relation.id },
        data: {
          customName: customName,
          privateNotes: privateNotes,
        },
      });

      // Update Profile
      // If claimed, we might restrict some fields, but user asked to edit them.
      // We will update what we can on the profile.

      const profileUpdateData: Prisma.StudentProfileUpdateInput = {
        studentNo: studentNo,
        gradeLevel: gradeLevel,
        parentName: parentName,
        parentPhone: parentPhone,
        parentEmail: parentEmail,
      };

      if (!relation.student.isClaimed) {
        profileUpdateData.tempFirstName = firstName;
        profileUpdateData.tempLastName = lastName;
        profileUpdateData.tempPhone = phone;
        profileUpdateData.tempEmail = email;
        if (newAvatarPath !== undefined) {
          profileUpdateData.tempAvatarKey = newAvatarPath;
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
      });
    });

    revalidatePath("/dashboard/students");
    revalidatePath(`/dashboard/students/${studentId}`);
    return { success: true, message: "info_updated" };
  } catch (error) {
    logger.error(
      { context: "updateStudentSettings", error },
      "Failed to update student settings"
    );
    return { success: false, error: "failed_to_update_settings" };
  }
}
