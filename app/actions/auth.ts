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

const loginSchemaBase = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

export async function login(formData: z.infer<typeof loginSchemaBase>, lang: string = "tr") {
    const dict = await getDictionary(lang as Locale)

    const loginSchema = z.object({
        email: z.string().email(dict.auth.login.validation.email_invalid),
        password: z.string().min(1, dict.auth.login.validation.password_required),
    })

    const validatedFields = loginSchema.safeParse(formData)

    if (!validatedFields.success) {
        return { success: false, message: dict.auth.register.errors.invalid_data }
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
                    return { success: false, message: dict.auth.login.validation.invalid_credentials }
                default:
                    // Check if the error message contains "Email not verified"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const cause = error.cause as any
                    if (cause?.err?.message === "Email not verified") {
                        return { success: false, error: "NOT_VERIFIED", email: email, message: dict.auth.verification.unverified_desc }
                    }
                    return { success: false, message: dict.auth.register.errors.generic }
            }
        }

        // If we are here, it's likely a successful redirect
        // Clear the cooldown cookie
        const cookieStore = await cookies()
        cookieStore.delete({ name: "resend_cooldown", path: "/" })

        throw error
    }
}

export async function resendVerificationCode(email: string, lang: string = "tr") {
    const dict = await getDictionary(lang as Locale)
    try {
        const user = await db.user.findUnique({
            where: { email },
        })

        if (!user) {
            return { success: false, message: dict.auth.verification.user_not_found }
        }

        if (user.emailVerified) {
            return { success: false, message: dict.auth.verification.already_verified }
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
        await sendVerificationEmail(email, token, lang as Locale)

        return { success: true, message: dict.auth.verification.success }
    } catch (error) {
        console.error("Resend Verification Error:", error)
        return { success: false, message: dict.auth.register.errors.generic }
    }
}

const registerSchemaBase = z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    phoneNumber: z.string().regex(/^\+\d{10,15}$/),
    role: z.enum(["TEACHER", "STUDENT"]),
    password: z.string()
        .min(8)
        .regex(/[A-Z]/)
        .regex(/[a-z]/)
        .regex(/[0-9]/)
        .regex(/[^A-Za-z0-9]/),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
})

export async function registerUser(formData: z.infer<typeof registerSchemaBase>, lang: string = "tr") {
    const dict = await getDictionary(lang as Locale)
    const d = dict.auth.register.validation

    const registerSchema = z.object({
        firstName: z.string().min(2, d.first_name_min),
        lastName: z.string().min(2, d.last_name_min),
        email: z.string().email(d.email_invalid),
        phoneNumber: z.string().regex(/^\+\d{10,15}$/, d.phone_min),
        role: z.enum(["TEACHER", "STUDENT"]),
        password: z.string()
            .min(8, d.password_min)
            .regex(/[A-Z]/, d.password_regex)
            .regex(/[a-z]/, d.password_regex)
            .regex(/[0-9]/, d.password_regex)
            .regex(/[^A-Za-z0-9]/, d.password_regex),
        confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
        message: d.password_mismatch,
        path: ["confirmPassword"],
    })

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

export async function verifyEmail(token: string, lang: string = "tr") {
    const dict = await getDictionary(lang as Locale)
    const d = dict.auth.verify_page.messages

    try {
        const verificationToken = await db.verificationToken.findUnique({
            where: { token },
        })

        if (!verificationToken) {
            return { success: false, message: d.invalid_token }
        }

        const hasExpired = new Date(verificationToken.expires) < new Date()

        if (hasExpired) {
            return { success: false, message: d.expired_token, email: verificationToken.identifier }
        }

        const existingUser = await db.user.findUnique({
            where: { email: verificationToken.identifier },
        })

        if (!existingUser) {
            return { success: false, message: d.user_not_found }
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

        return { success: true, message: d.success }
    } catch (error) {
        return { success: false, message: d.error }
    }
}

export async function resendVerificationEmailAction(email: string, lang: string = "tr") {
    const dict = await getDictionary(lang as Locale)
    const d = dict.auth.verification

    try {
        const existingUser = await db.user.findUnique({
            where: { email },
        })

        if (!existingUser) {
            return { success: false, message: d.user_not_found }
        }

        if (existingUser.emailVerified) {
            return { success: false, message: d.already_verified }
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

        await sendVerificationEmail(email, token, lang as Locale)
        return { success: true, message: d.success }
    } catch (error) {
        return { success: false, message: d.error }
    }
}
