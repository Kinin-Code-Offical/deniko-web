"use server";

import { signOut } from "@/auth";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import logger from "@/lib/logger";

/**
 * Signs out the current user and redirects to the login page.
 */
export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function updateUsername(formData: FormData, lang: string) {
  const dictionary = await getDictionary(lang as Locale);
  const session = await auth();
  if (!session?.user?.id) {
    return { error: dictionary.server.errors.unauthorized };
  }

  const usernameSchema = z
    .string()
    .min(3, dictionary.server.errors.username_min_length)
    .max(20, dictionary.server.errors.username_max_length)
    .regex(
      /^[a-zA-Z0-9._]+$/,
      dictionary.server.errors.username_pattern
    );

  const username = formData.get("username");
  const result = usernameSchema.safeParse(username);

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const newUsername = result.data.toLowerCase();

  // Check if username is taken
  const existingUser = await db.user.findUnique({
    where: { username: newUsername },
  });

  if (existingUser && existingUser.id !== session.user.id) {
    return { error: dictionary.server.errors.username_taken };
  }

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: { username: newUsername },
    });

    revalidatePath("/[lang]/dashboard/settings", "page");
    revalidatePath(`/[lang]/users/${newUsername}`, "page");
    return { success: true };
  } catch (error) {
    logger.error(error, "Failed to update username:");
    return { error: dictionary.server.errors.failed_update_username };
  }
}
