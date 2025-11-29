"use server"

import { signIn } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"
import { sendVerificationEmail } from "@/lib/email"
import { AuthError } from "next-auth"

export async function googleSignIn() {
    await signIn("google", { redirectTo: "/onboarding" })
}

const loginSchema = z.object({
    email: z.string().email("Geçerli bir e-posta adresi giriniz"),
    password: z.string().min(1, "Şifre gereklidir"),
})

export async function login(formData: z.infer<typeof loginSchema>) {
    const validatedFields = loginSchema.safeParse(formData)

    if (!validatedFields.success) {
        return { success: false, message: "Geçersiz form verileri" }
    }

    const { email, password } = validatedFields.data

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/dashboard",
        })
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { success: false, message: "Hatalı e-posta veya şifre." }
                default:
                    // Check if the error message contains "Email not verified"
                    if (error.cause?.err?.message === "Email not verified") {
                        return { success: false, message: "Lütfen e-posta adresinizi doğrulayın." }
                    }
                    return { success: false, message: "Bir hata oluştu." }
            }
        }
        throw error
    }
}

const registerSchema = z.object({
    email: z.string().email("Geçerli bir e-posta adresi giriniz"),
    password: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
})

export async function registerUser(formData: z.infer<typeof registerSchema>) {
    const validatedFields = registerSchema.safeParse(formData)

    if (!validatedFields.success) {
        return { success: false, message: "Geçersiz form verileri" }
    }

    const { email, password } = validatedFields.data

    try {
        // 1. Check if user exists
        const existingUser = await db.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return { success: false, message: "Bu e-posta adresi zaten kullanımda" }
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // 3. Create User
        const user = await db.user.create({
            data: {
                email,
                password: hashedPassword,
                emailVerified: null,
            },
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
        await sendVerificationEmail(email, token)

        return { success: true, message: "Doğrulama bağlantısı e-posta adresinize gönderildi." }
    } catch (error) {
        console.error("Registration Error:", error)
        return { success: false, message: "Kayıt sırasında bir hata oluştu." }
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
            return { success: false, message: "Doğrulama kodunun süresi dolmuş." }
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
                email: verificationToken.identifier // Update email just in case it changed during verification flow (unlikely here but good practice)
            },
        })

        await db.verificationToken.delete({
            where: { token },
        })

        return { success: true, message: "E-posta adresiniz başarıyla doğrulandı!" }
    } catch (error) {
        console.error("Verification Error:", error)
        return { success: false, message: "Doğrulama sırasında bir hata oluştu." }
    }
}
