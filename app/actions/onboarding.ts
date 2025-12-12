"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import * as bcrypt from "bcryptjs";
import logger from "@/lib/logger";

/**
 * Completes the onboarding process for a user.
 * Updates the user's role, phone number, password, and creates the corresponding profile.
 *
 * @param data - The onboarding data (role, phone, password, etc.).
 * @returns An object indicating success or failure.
 */
export async function completeOnboarding(data: {
  role: "TEACHER" | "STUDENT";
  phoneNumber: string;
  password?: string;
  confirmPassword?: string;
  terms?: boolean;
  marketingConsent?: boolean;
  preferredTimezone?: string;
  preferredCountry?: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "session_not_found" };
  }

  const userId = session.user.id;
  const { role, phoneNumber, password, confirmPassword, terms } = data;

  // Validation
  if (!terms) {
    return { success: false, error: "accept_terms" };
  }

  if (!phoneNumber) {
    return { success: false, error: "phone_required" };
  }

  if (!password || !confirmPassword) {
    return { success: false, error: "password_required" };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "passwords_mismatch" };
  }

  if (password.length < 8) {
    return { success: false, error: "password_min_length" };
  }

  // Regex for password complexity: Uppercase, lowercase, number, symbol
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return { success: false, error: "password_complexity" };
  }

  try {
    // Check if user already has a profile to prevent overwriting
    const existingUser = await db.user.findUnique({
      where: { id: userId },
      include: {
        teacherProfile: true,
        studentProfile: true,
      },
    });

    if (existingUser?.teacherProfile || existingUser?.studentProfile) {
      return { success: true };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Update User Role, Phone Number and Password
      await tx.user.update({
        where: { id: userId },
        data: {
          role,
          phoneNumber,
          password: hashedPassword,
          isOnboardingCompleted: true,
          emailVerified: new Date(), // Verify email upon onboarding completion
          isMarketingConsent: data.marketingConsent || false,
          preferredTimezone: data.preferredTimezone || "UTC",
          preferredCountry: data.preferredCountry || "US",
        },
      });

      // 2. Create Profile
      if (role === "TEACHER") {
        await tx.teacherProfile.create({
          data: {
            userId,
            branch: "Genel", // Placeholder, will be updated in settings
          },
        });
      } else if (role === "STUDENT") {
        await tx.studentProfile.create({
          data: {
            userId,
            isClaimed: true, // Since it's a real user signup
          },
        });
      }
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    logger.error({ context: "completeOnboarding", error }, "Onboarding Error");
    return { success: false, error: "onboarding_error" };
  }
}
