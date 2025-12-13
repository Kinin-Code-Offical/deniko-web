"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import logger from "@/lib/logger";

const privacySchema = z.object({
    profileVisibility: z.enum(["public", "private"]),
    showAvatar: z.boolean(),
    showEmail: z.boolean(),
    showPhone: z.boolean(),
    allowMessages: z.boolean(),
    showCourses: z.boolean(),
});

export async function updateProfilePrivacyAction(input: unknown, lang: string) {
    const dictionary = await getDictionary(lang as Locale);
    const session = await auth();
    if (!session?.user?.id) {
        return { error: dictionary.server.errors.unauthorized };
    }

    const result = privacySchema.safeParse(input);

    if (!result.success) {
        logger.warn({
            event: "privacy_settings_invalid_input",
            errors: result.error.flatten(),
            userId: session.user.id,
            input,
        }, "Invalid input for privacy settings");
        return { error: dictionary.server.errors.invalid_input };
    }

    const {
        profileVisibility,
        showAvatar,
        showEmail,
        showPhone,
        allowMessages,
        showCourses,
    } = result.data;

    try {
        await db.userSettings.upsert({
            where: { userId: session.user.id },
            update: {
                profileVisibility,
                showAvatar,
                showEmail,
                showPhone,
                allowMessages,
                showCourses,
            },
            create: {
                userId: session.user.id,
                profileVisibility,
                showAvatar,
                showEmail,
                showPhone,
                allowMessages,
                showCourses,
            },
        });

        revalidatePath("/[lang]/dashboard/settings", "page");

        return { success: true };
    } catch (error) {
        logger.error(error, "Failed to update privacy settings:");
        return { error: dictionary.server.errors.failed_update_profile };
    }
}
