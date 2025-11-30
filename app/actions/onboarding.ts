"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function completeOnboarding(data: {
    role: "TEACHER" | "STUDENT",
    phoneNumber: string,
    password?: string,
    confirmPassword?: string,
    userId?: string, // Fallback for debugging
    terms?: boolean,
    marketingConsent?: boolean
}) {
    const session = await auth()
    console.log("Session in Action:", session)

    // Prioritize session ID, fallback to provided userId (DEBUG ONLY)
    const userId = session?.user?.id || data.userId

    if (!userId) {
        return { success: false, error: "Oturum bulunamadı. Lütfen tekrar giriş yapın." }
    }

    const { role, phoneNumber, password, confirmPassword, terms } = data

    // Validation
    if (!terms) {
        return { success: false, error: "Kullanım koşullarını kabul etmelisiniz." }
    }

    if (!phoneNumber) {
        return { success: false, error: "Telefon numarası gereklidir." }
    }

    if (!password || !confirmPassword) {
        return { success: false, error: "Şifre alanları gereklidir." }
    }

    if (password !== confirmPassword) {
        return { success: false, error: "Şifreler eşleşmiyor." }
    }

    if (password.length < 8) {
        return { success: false, error: "Şifre en az 8 karakter olmalıdır." }
    }

    // Regex for password complexity: Uppercase, lowercase, number, symbol
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return { success: false, error: "Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir." }
    }

    // Check if user already has a profile to prevent overwriting
    const existingUser = await db.user.findUnique({
        where: { id: userId },
        include: {
            teacherProfile: true,
            studentProfile: true,
        },
    })

    if (existingUser?.teacherProfile || existingUser?.studentProfile) {
        return { success: true }
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.$transaction(async (tx) => {
            // 1. Update User Role, Phone Number and Password
            await tx.user.update({
                where: { id: userId },
                data: {
                    role,
                    phoneNumber,
                    password: hashedPassword,
                    isOnboardingCompleted: true,
                    emailVerified: new Date(), // Verify email upon onboarding completion
                    isMarketingConsent: data.marketingConsent || false
                },
            })

            // 2. Create Profile
            if (role === "TEACHER") {
                await tx.teacherProfile.create({
                    data: {
                        userId,
                        branch: "Genel", // Placeholder, will be updated in settings
                    },
                })
            } else if (role === "STUDENT") {
                await tx.studentProfile.create({
                    data: {
                        userId,
                        isClaimed: true, // Since it's a real user signup
                    },
                })
            }
        })

        revalidatePath("/")
        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Onboarding Error:", error)
        return { success: false, error: "Bir hata oluştu. Lütfen tekrar deneyin." }
    }
}
