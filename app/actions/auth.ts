"use server"

/* The line `import { signIn } from "@/auth"` is importing the `signIn` function from a module located
at the path `@/auth`. This function is likely used for handling user authentication, such as signing
in users using different methods like Google sign-in or credentials sign-in. */
import { signIn, signOut } from "@/auth"
import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"
import { sendVerificationEmail } from "@/lib/email"
import { AuthError } from "next-auth"
import { getDictionary } from "@/lib/get-dictionary"
import { Locale } from "@/i18n-config"

export async function logout() {
    await signOut({ redirectTo: "/login" })
}

export async function googleSignIn() {
    await signIn("google", { redirectTo: "/onboarding" })
}

const loginSchema = z.object({
    email: z.string().email("Geçerli bir e-posta adresi giriniz"),
    password: z.string().min(1, "Şifre gereklidir"),
})

export async function login(formData: z.infer<typeof loginSchema>, lang: string = "tr") {
    const validatedFields = loginSchema.safeParse(formData)

    if (!validatedFields.success) {
        return { success: false, message: "Geçersiz form verileri" }
    }

    const { email, password } = validatedFields.data

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: `/${lang}/dashboard`,
        })
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { success: false, message: "Hatalı e-posta veya şifre." }
                default:
                    // Check if the error message contains "Email not verified"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const cause = error.cause as any
                    if (cause?.err?.message === "Email not verified") {
                        return { success: false, error: "NOT_VERIFIED", email: email, message: "Lütfen e-posta adresinizi doğrulayın." }
                    }
                    return { success: false, message: "Bir hata oluştu." }
            }
        }

        // If we are here, it's likely a successful redirect
        // Clear the cooldown cookie
        const cookieStore = await cookies()
        cookieStore.delete({ name: "resend_cooldown", path: "/" })

        throw error
    }
}

export async function resendVerificationCode(email: string) {
    try {
        const user = await db.user.findUnique({
            where: { email },
        })

        if (!user) {
            return { success: false, message: "Kullanıcı bulunamadı." }
        }

        if (user.emailVerified) {
            return { success: false, message: "E-posta zaten doğrulanmış." }
        }

        // Delete existing tokens
        await db.verificationToken.deleteMany({
            where: { identifier: email },
        })

        // Generate new token
        const token = randomBytes(32).toString("hex")
        const expires = new Date(new Date().getTime() + 24 * 60 * 60 * 1000) // 24 hours

        await db.verificationToken.create({
            data: {
                identifier: email,
                token,
                expires,
            },
        })

        // Send Email
        await sendVerificationEmail(email, token, "tr") // Defaulting to TR for now, or pass lang if needed

        return { success: true, message: "Doğrulama kodu gönderildi." }
    } catch (error) {
        console.error("Resend Verification Error:", error)
        return { success: false, message: "Bir hata oluştu." }
    }
}

const registerSchema = z.object({
    firstName: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
    lastName: z.string().min(2, "Soyad en az 2 karakter olmalıdır"),
    email: z.string().email("Geçerli bir e-posta adresi giriniz"),
    phoneNumber: z.string().regex(/^\+\d{10,15}$/, "Geçerli bir telefon numarası giriniz"),
    role: z.enum(["TEACHER", "STUDENT"]),
    password: z.string()
        .min(8, "Şifre en az 8 karakter olmalıdır")
        .regex(/[A-Z]/, "En az bir büyük harf içermelidir")
        .regex(/[a-z]/, "En az bir küçük harf içermelidir")
        .regex(/[0-9]/, "En az bir rakam içermelidir")
        .regex(/[^A-Za-z0-9]/, "En az bir özel karakter içermelidir"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
})

export async function registerUser(formData: z.infer<typeof registerSchema>, lang: string = "tr") {
    const dict = await getDictionary(lang as Locale)
    const validatedFields = registerSchema.safeParse(formData)

    if (!validatedFields.success) {
        return { success: false, message: dict.auth.register.errors.invalid_data }
    }

    const { email, password, firstName, lastName, role, phoneNumber } = validatedFields.data

    try {
        // 1. Check if user exists
        const existingUser = await db.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return { success: false, message: dict.auth.register.errors.user_exists }
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // 3. Create User & Profile
        await db.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                    role,
                    phoneNumber,
                    name: `${firstName} ${lastName}`,
                    emailVerified: null,
                    isOnboardingCompleted: true,
                },
            })

            if (role === "TEACHER") {
                await tx.teacherProfile.create({
                    data: {
                        userId: user.id,
                        branch: "Genel",
                    },
                })
            } else {
                await tx.studentProfile.create({
                    data: {
                        userId: user.id,
                        isClaimed: true,
                    },
                })
            }
        })

        // 4. Generate Verification Token
        const token = randomBytes(32).toString("hex")
        const expires = new Date(new Date().getTime() + 24 * 60 * 60 * 1000) // 24 hours

        await db.verificationToken.create({
            data: {
                identifier: email,
                token,
                expires,
            },
        })

        // 5. Send Email
        await sendVerificationEmail(email, token, lang as "tr" | "en")

        return { success: true, message: dict.auth.register.success_desc }
    } catch (error) {
        console.error("Registration Error:", error)
        return { success: false, message: dict.auth.register.errors.generic }
    }
}

export async function verifyEmail(token: string) {
    try {
        const verificationToken = await db.verificationToken.findUnique({
            where: { token },
        })

        if (!verificationToken) {
            return { success: false, message: "Geçersiz doğrulama kodu." }
        }

        const hasExpired = new Date(verificationToken.expires) < new Date()

        if (hasExpired) {
            return { success: false, message: "Doğrulama kodunun süresi dolmuş.", email: verificationToken.identifier }
        }

        const existingUser = await db.user.findUnique({
            where: { email: verificationToken.identifier },
        })

        if (!existingUser) {
            return { success: false, message: "Kullanıcı bulunamadı." }
        }

        await db.user.update({
            where: { id: existingUser.id },
            data: {
                emailVerified: new Date(),
                email: existingUser.email, // Required for update, but doesn't change
            },
        })

        await db.verificationToken.delete({
            where: { token: verificationToken.token },
        })

        return { success: true, message: "E-posta adresi başarıyla doğrulandı." }
    } catch (error) {
        return { success: false, message: "Doğrulama sırasında bir hata oluştu." }
    }
}

export async function resendVerificationEmailAction(email: string, lang: string = "tr") {
    try {
        const existingUser = await db.user.findUnique({
            where: { email },
        })

        if (!existingUser) {
            return { success: false, message: "Kullanıcı bulunamadı." }
        }

        if (existingUser.emailVerified) {
            return { success: false, message: "E-posta zaten doğrulanmış." }
        }

        await db.verificationToken.deleteMany({
            where: { identifier: email },
        })

        const token = randomBytes(32).toString("hex")
        const expires = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)

        await db.verificationToken.create({
            data: {
                identifier: email,
                token,
                expires,
            },
        })

        await sendVerificationEmail(email, token, lang as "tr" | "en")
        return { success: true, message: "Doğrulama kodu tekrar gönderildi." }
    } catch (error) {
        return { success: false, message: "Bir hata oluştu." }
    }
}
