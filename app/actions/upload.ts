"use server";

import { auth } from "@/auth";
import { uploadFile } from "@/lib/storage";
import logger from "@/lib/logger";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";

export async function uploadAvatarAction(formData: FormData, lang: string) {
    const dictionary = await getDictionary(lang as Locale);
    const session = await auth();
    if (!session?.user?.id) {
        return { error: dictionary.server.errors.unauthorized };
    }

    const file = formData.get("file") as File;
    if (!file) {
        return { error: dictionary.server.errors.no_file_provided };
    }

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

        // Get signed URL for immediate display
        const { getSignedUrl } = await import("@/lib/storage");
        const url = await getSignedUrl(path);

        return { success: true, path, url };
    } catch (error) {
        logger.error({ event: "upload_avatar_failed", error });
        return { error: dictionary.server.errors.failed_upload_avatar };
    }
}
