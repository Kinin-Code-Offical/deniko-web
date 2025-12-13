"use server";

import { auth } from "@/auth";
import { uploadFile } from "@/lib/storage";
import logger from "@/lib/logger";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";

export async function uploadAvatarAction(formData: FormData, lang: string) {
    logger.info({ event: "upload_avatar_start", lang });
    const dictionary = await getDictionary(lang as Locale);
    const session = await auth();
    if (!session?.user?.id) {
        logger.warn({ event: "upload_avatar_unauthorized" });
        return { error: dictionary.server.errors.unauthorized };
    }

    const file = formData.get("file") as File;
    if (!file) {
        logger.warn({ event: "upload_avatar_no_file" });
        return { error: dictionary.server.errors.no_file_provided };
    }

    logger.info({ event: "upload_avatar_file_info", size: file.size, type: file.type });

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
        return { error: dictionary.server.errors.invalid_file_type };
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        return { error: dictionary.server.errors.file_size_too_large };
    }

    try {
        // Upload new file
        const path = await uploadFile(file, "avatars");
        logger.info({ event: "upload_avatar_success", path });

        // Return API URL with timestamp to bust cache
        // We don't return signed URL anymore to prevent leakage
        const url = `/api/avatar/${session.user.id}?t=${Date.now()}`;

        return { success: true, path, url };
    } catch (error) {
        logger.error({ event: "upload_avatar_failed", error });
        return { error: dictionary.server.errors.failed_upload_avatar };
    }
}
