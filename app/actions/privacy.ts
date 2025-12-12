"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import logger from "@/lib/logger";

const privacySchema = z.object({
    isProfilePublic: z.coerce.boolean(),
    showEmailOnProfile: z.coerce.boolean(),
    showCoursesOnProfile: z.coerce.boolean(),
    showAchievementsOnProfile: z.coerce.boolean(),
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

    const parsed = result.data;

    const {
        isProfilePublic,
        showEmailOnProfile: inputShowEmail,
        showCoursesOnProfile: inputShowCourses,
        showAchievementsOnProfile: inputShowAchievements,
    } = parsed;

    // If profile is private, force other visibility settings to false
    const showEmailOnProfile = isProfilePublic ? inputShowEmail : false;
    const showCoursesOnProfile = isProfilePublic ? inputShowCourses : false;
    const showAchievementsOnProfile = isProfilePublic ? inputShowAchievements : false;

    try {
        await db.user.update({
            where: { id: session.user.id },
            data: {
                isProfilePublic,
                showEmailOnProfile,
                showCoursesOnProfile,
                showAchievementsOnProfile,
            },
        });

        revalidatePath("/[lang]/dashboard/settings", "page");

        return { success: true };
    } catch (error) {
        logger.error(error, "Failed to update privacy settings:");
        return { error: dictionary.server.errors.failed_update_profile };
    }
}
