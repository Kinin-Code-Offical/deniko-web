"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth, signOut } from "@/auth";
import { revalidatePath } from "next/cache";
import * as bcrypt from "bcryptjs";
import { deleteUserAndRelatedData } from "@/lib/account-deletion";
import { v4 as uuidv4 } from "uuid";
import { sendEmailChangeVerificationEmail } from "@/lib/email";
import { Prisma } from "@prisma/client";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/get-dictionary";
import logger from "@/lib/logger";
import { deleteFile } from "@/lib/storage";

// --- Schemas ---

const profileBasicSchema = z.object({
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(2).max(50).optional(),
    username: z.string().min(3).max(30).optional(),
    phoneNumber: z.string().optional().nullable(),
    preferredCountry: z.string().optional().nullable(),
    preferredTimezone: z.string().optional().nullable(),
    notificationEmailEnabled: z.boolean().optional(),
    notificationInAppEnabled: z.boolean().optional(),
    isMarketingConsent: z.boolean().optional(),
    // Teacher fields
    branch: z.string().optional().nullable(),
    bio: z.string().optional().nullable(),
    // Student fields
    studentNo: z.string().optional().nullable(),
    gradeLevel: z.string().optional().nullable(),
    parentName: z.string().optional().nullable(),
    parentPhone: z.string().optional().nullable(),
    parentEmail: z.string().email().optional().nullable().or(z.literal("")),
});

const emailChangeSchema = z.object({
    newEmail: z.string().email(),
});

// --- Actions ---

export async function updateProfileBasicAction(input: unknown, lang: string) {
    const dictionary = await getDictionary(lang as Locale);
    const session = await auth();
    if (!session?.user?.id) return { error: dictionary.server.errors.unauthorized };

    const result = profileBasicSchema.safeParse(input);
    if (!result.success) return { error: dictionary.server.errors.invalid_input };

    try {
        const updateData: Prisma.UserUpdateInput = {};
        if (result.data.firstName) updateData.firstName = result.data.firstName;
        if (result.data.lastName) updateData.lastName = result.data.lastName;
        if (result.data.firstName && result.data.lastName) updateData.name = `${result.data.firstName} ${result.data.lastName}`;
        if (result.data.username) updateData.username = result.data.username;
        if (result.data.phoneNumber !== undefined) updateData.phoneNumber = result.data.phoneNumber;
        if (result.data.preferredCountry !== undefined) updateData.preferredCountry = result.data.preferredCountry;
        if (result.data.preferredTimezone !== undefined) updateData.preferredTimezone = result.data.preferredTimezone;
        if (result.data.notificationEmailEnabled !== undefined) updateData.notificationEmailEnabled = result.data.notificationEmailEnabled;
        if (result.data.notificationInAppEnabled !== undefined) updateData.notificationInAppEnabled = result.data.notificationInAppEnabled;
        if (result.data.isMarketingConsent !== undefined) updateData.isMarketingConsent = result.data.isMarketingConsent;

        await db.user.update({
            where: { id: session.user.id },
            data: updateData,
        });

        // Update Teacher Profile if exists
        if (result.data.branch !== undefined || result.data.bio !== undefined) {
            const teacherProfile = await db.teacherProfile.findUnique({
                where: { userId: session.user.id },
            });

            if (teacherProfile) {
                await db.teacherProfile.update({
                    where: { userId: session.user.id },
                    data: {
                        branch: result.data.branch || teacherProfile.branch,
                        bio: result.data.bio,
                    },
                });
            }
        }

        // Update Student Profile if exists
        if (
            result.data.studentNo !== undefined ||
            result.data.gradeLevel !== undefined ||
            result.data.parentName !== undefined ||
            result.data.parentPhone !== undefined ||
            result.data.parentEmail !== undefined
        ) {
            const studentProfile = await db.studentProfile.findUnique({
                where: { userId: session.user.id },
            });

            if (studentProfile) {
                await db.studentProfile.update({
                    where: { userId: session.user.id },
                    data: {
                        studentNo: result.data.studentNo,
                        gradeLevel: result.data.gradeLevel,
                        parentName: result.data.parentName,
                        parentPhone: result.data.parentPhone,
                        parentEmail: result.data.parentEmail === "" ? null : result.data.parentEmail,
                    },
                });
            }
        }

        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (error) {
        logger.error({ event: "update_profile_error", error, userId: session.user.id });
        return { error: dictionary.server.errors.failed_update_profile };
    }
}

export async function changePasswordAction(input: unknown, lang: string) {
    const dictionary = await getDictionary(lang as Locale);

    const changePasswordSchema = z
        .object({
            currentPassword: z.string().min(1),
            newPassword: z
                .string()
                .min(8)
                .regex(/[A-Z]/)
                .regex(/[a-z]/)
                .regex(/[0-9]/)
                .regex(/[!@#$%^&*(),.?":{}|<>]/),
            confirmPassword: z.string().min(8),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
            message: dictionary.validation.passwords_do_not_match,
            path: ["confirmPassword"],
        });

    const session = await auth();
    if (!session?.user?.id) return { error: dictionary.server.errors.unauthorized };

    const result = changePasswordSchema.safeParse(input);
    if (!result.success) return { error: dictionary.server.errors.invalid_input };

    const { currentPassword, newPassword } = result.data;

    if (currentPassword === newPassword) {
        return { error: dictionary.server.errors.same_password };
    }

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user || !user.password) return { error: dictionary.server.errors.user_not_found_password };

    const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordsMatch) return { error: dictionary.server.errors.incorrect_password };

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
        await db.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword },
        });
        logger.info({ event: "password_changed", userId: session.user.id });
        return { success: true };
    } catch (error) {
        logger.error({ event: "change_password_error", error, userId: session.user.id });
        return { error: dictionary.server.errors.failed_update_password };
    }
}

export async function requestEmailChangeAction(newEmail: string, lang: string) {
    const dictionary = await getDictionary(lang as Locale);
    const session = await auth();
    if (!session?.user?.id) return { error: dictionary.server.errors.unauthorized };

    const result = emailChangeSchema.safeParse({ newEmail });
    if (!result.success) return { error: dictionary.server.errors.invalid_email };

    // Check if email is already taken
    const existingUser = await db.user.findUnique({ where: { email: newEmail } });
    if (existingUser) return { error: dictionary.server.errors.email_in_use };

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) return { error: dictionary.server.errors.user_not_found };

    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // 24 hours

    try {
        // Create EmailChangeRequest
        await db.emailChangeRequest.create({
            data: {
                userId: user.id,
                newEmail,
                token,
                expires,
            },
        });

        await sendEmailChangeVerificationEmail(newEmail, token, lang as Locale);

        logger.info({
            event: "email_change_requested",
            userId: user.id,
            newEmail,
        });

        return { success: true };
    } catch (error) {
        logger.error({ event: "request_email_change_error", error, userId: user.id });
        return { error: dictionary.server.errors.failed_request_email_change };
    }
}

export async function deactivateAccountAction(lang: string) {
    const dictionary = await getDictionary(lang as Locale);
    const session = await auth();
    if (!session?.user?.id) return { error: dictionary.server.errors.unauthorized };

    try {
        await db.user.update({
            where: { id: session.user.id },
            data: {
                isActive: false,
            },
        });

        await db.userSettings.upsert({
            where: { userId: session.user.id },
            create: {
                userId: session.user.id,
                profileVisibility: "private",
                showAvatar: false,
                showEmail: false,
                showPhone: false,
                allowMessages: false,
            },
            update: {
                profileVisibility: "private",
                showAvatar: false,
                showEmail: false,
                showPhone: false,
                allowMessages: false,
            },
        });
        await signOut({ redirectTo: "/" });
        logger.info({
            event: "account_deactivated",
            userId: session.user.id,
            reason: "user_initiated",
        });
        return { success: true };
    } catch (error) {
        logger.error({ event: "deactivate_account_error", error, userId: session.user.id });
        return { error: dictionary.server.errors.failed_deactivate };
    }
}

export async function deleteAccountAction(lang: string) {
    const dictionary = await getDictionary(lang as Locale);
    const session = await auth();
    if (!session?.user?.id) return { error: dictionary.server.errors.unauthorized };

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) return { error: dictionary.server.errors.user_not_found };

    try {
        await deleteUserAndRelatedData(user.id);
        await signOut({ redirectTo: "/" });
        logger.info({ event: "account_deleted", userId: user.id });
        return { success: true };
    } catch (error) {
        logger.error({ event: "delete_account_error", userId: user.id, error: (error as Error).message });
        return { error: dictionary.server.errors.failed_delete };
    }
}

// --- New Settings Actions ---

const notificationPreferencesSchema = z.object({
    emailEnabled: z.boolean(),
    inAppEnabled: z.boolean(),
});

const regionTimezoneSchema = z.object({
    country: z.string(),
    timezone: z.string(),
});

const cookiePreferencesSchema = z.object({
    analyticsEnabled: z.boolean(),
    marketingEnabled: z.boolean(),
});

const avatarUpdateSchema = z.object({
    type: z.enum(["uploaded", "default"]),
    url: z.string().optional(),
    key: z.string().optional(),
});

const DEFAULT_AVATAR_KEYS = [
    "default/avatars/avatar-1.png",
    "default/avatars/avatar-2.png",
    "default/avatars/avatar-3.png",
    "default/avatars/avatar-4.png",
    "default/avatars/avatar-5.png",
    "default/avatars/avatar-6.png",
];

export async function getDefaultAvatarsAction() {
    // Return API routes instead of signed URLs
    return DEFAULT_AVATAR_KEYS.map((key) => {
        // key is like "default/avatars/avatar-1.png"
        // route is /api/avatars/default/[...path]
        // we want /api/avatars/default/avatars/avatar-1.png
        // so we strip "default/" from the key
        const path = key.replace(/^default\//, "");
        return {
            key,
            url: `/api/avatars/default/${path}`
        };
    });
}


export async function updateNotificationPreferencesAction(input: unknown, lang: string) {
    const dictionary = await getDictionary(lang as Locale);
    const session = await auth();
    if (!session?.user?.id) return { error: dictionary.server.errors.unauthorized };

    const result = notificationPreferencesSchema.safeParse(input);
    if (!result.success) return { error: dictionary.server.errors.invalid_input };

    try {
        await db.user.update({
            where: { id: session.user.id },
            data: {
                notificationEmailEnabled: result.data.emailEnabled,
                notificationInAppEnabled: result.data.inAppEnabled,
            },
        });

        logger.info({
            event: "user_notification_preferences_updated",
            userId: session.user.id,
            emailEnabled: result.data.emailEnabled,
            inAppEnabled: result.data.inAppEnabled,
        });

        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (error) {
        logger.error({ event: "update_notification_preferences_failed", error });
        return { error: dictionary.server.errors.failed_update_notification_preferences };
    }
}

export async function updateRegionTimezonePreferencesAction(input: unknown, lang: string) {
    const dictionary = await getDictionary(lang as Locale);
    const session = await auth();
    if (!session?.user?.id) return { error: dictionary.server.errors.unauthorized };

    const result = regionTimezoneSchema.safeParse(input);
    if (!result.success) return { error: dictionary.server.errors.invalid_input };

    try {
        await db.user.update({
            where: { id: session.user.id },
            data: {
                preferredCountry: result.data.country,
                preferredTimezone: result.data.timezone,
            },
        });

        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (error) {
        logger.error({ event: "update_region_timezone_failed", error });
        return { error: dictionary.server.errors.failed_update_region_timezone };
    }
}

export async function updateCookiePreferencesAction(input: unknown, lang: string) {
    const dictionary = await getDictionary(lang as Locale);
    const session = await auth();
    if (!session?.user?.id) return { error: dictionary.server.errors.unauthorized };

    const result = cookiePreferencesSchema.safeParse(input);
    if (!result.success) return { error: dictionary.server.errors.invalid_input };

    try {
        await db.user.update({
            where: { id: session.user.id },
            data: {
                cookieAnalyticsEnabled: result.data.analyticsEnabled,
                isMarketingConsent: result.data.marketingEnabled,
            },
        });

        logger.info({
            event: "user_cookie_preferences_updated",
            userId: session.user.id,
            analyticsEnabled: result.data.analyticsEnabled,
            marketingEnabled: result.data.marketingEnabled,
        });

        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (error) {
        logger.error({ event: "update_cookie_preferences_failed", error });
        return { error: dictionary.server.errors.failed_update_cookie_preferences };
    }
}

export async function updateAvatarAction(input: unknown, lang: string) {
    const dictionary = await getDictionary(lang as Locale);
    const session = await auth();
    if (!session?.user?.id) return { error: dictionary.server.errors.unauthorized };

    const result = avatarUpdateSchema.safeParse(input);
    if (!result.success) return { error: dictionary.server.errors.invalid_input };

    try {
        let imagePath = result.data.url;
        if (result.data.type === "default") {
            imagePath = result.data.key;
        }

        if (!imagePath) return { error: dictionary.server.errors.no_image_provided };

        // Get current user to check for existing avatar
        const currentUser = await db.user.findUnique({
            where: { id: session.user.id },
            select: { image: true },
        });

        await db.user.update({
            where: { id: session.user.id },
            data: {
                image: imagePath,
                avatarVersion: { increment: 1 }
            },
        });

        // Delete old avatar if it exists, is not the new one, and is not a default avatar
        if (
            currentUser?.image &&
            currentUser.image !== imagePath &&
            !currentUser.image.startsWith("http") &&
            !currentUser.image.startsWith("default/")
        ) {
            try {
                await deleteFile(currentUser.image);
            } catch (err) {
                logger.warn({ event: "delete_old_avatar_failed", error: err, path: currentUser.image });
            }
        }

        logger.info({
            event: "profile_avatar_updated",
            userId: session.user.id,
            avatarType: result.data.type,
        });

        revalidatePath("/dashboard/settings");
        revalidatePath("/dashboard/profile");
        return { success: true };
    } catch (error) {
        logger.error({ event: "update_avatar_failed", error });
        return { error: dictionary.server.errors.failed_update_avatar };
    }
}
