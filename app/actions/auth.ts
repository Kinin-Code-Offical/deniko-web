"use server"

import { signIn, signOut } from "@/auth"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { z } from "zod"
import * as bcrypt from "bcryptjs"
import { randomBytes } from "crypto"
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email"
import { AuthError } from "next-auth"
import { getDictionary } from "@/lib/get-dictionary"
import { Locale } from "@/i18n-config"
import logger from "@/lib/logger"

/**
 * Logs out the current user and redirects to the login page.
 */
export async function logout() {
    await signOut({ redirectTo: "/login" })
}

/**
 * Initiates the Google OAuth sign-in flow.
 */
export async function googleSignIn() {
    await signIn("google", { redirectTo: "/onboarding" })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _loginSchemaBase = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

/**
 * Authenticates a user with email and password.
 * 
 * @param formData - The login form data (email, password).
 * @param lang - The current language locale.
 * @returns An object indicating success or failure with a message.
 */
export async function login(formData: z.infer<typeof _loginSchemaBase>, lang: string = "tr") {
    const dict = await getDictionary(lang as Locale)

    const loginSchema = z.object({
        email: z.string().email(dict.auth.login.validation.email_invalid),
        password: z.string().min(1, dict.auth.login.validation.password_required),
    })

    const validatedFields = loginSchema.safeParse(formData)

    if (!validatedFields.success) {
        logger.warn({ msg: "Login validation failed", errors: validatedFields.error.flatten() })
        return { success: false, message: dict.auth.register.errors.invalid_data }
    }

    const { email, password } = validatedFields.data

    logger.info({ msg: "Login attempt", email })

    try {
        await signIn("credentials", {
            email,
            password,
            redirect: false,
        })
    } catch (error) {
        if (error instanceof AuthError) {
            logger.warn({ msg: "Login failed", email, error: error.type })
            switch (error.type) {
                case "CredentialsSignin":
                    return { success: false, message: dict.auth.login.validation.invalid_credentials }
                default:
                    // Check if the error message contains "Email not verified"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const cause = error.cause as any
                    if (cause?.err?.message === "Email not verified") {
                        logger.info({ msg: "Login blocked: Email not verified", email })
                        return { success: false, error: "NOT_VERIFIED", email: email, message: dict.auth.verification.unverified_desc }
                    }
                    return { success: false, message: dict.auth.register.errors.generic }
            }
        }
        throw error
    }

    // If we reached here, login was successful!
    // Delete the cooldown cookie
    const cookieStore = await cookies()
    cookieStore.delete("resend_cooldown")

    redirect(`/${lang}/dashboard`)
}

/**
 * Resends the email verification code to the user.
 * 
 * @param email - The user's email address.
 * @param lang - The current language locale.
 * @returns An object indicating success or failure.
 */
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
        logger.error({ context: "resendVerificationCode", error }, "Resend Verification Error")
        return { success: false, message: dict.auth.register.errors.generic }
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _registerSchemaBase = z.object({
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
    confirmPassword: z.string(),
    terms: z.boolean(),
    marketingConsent: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
})

/**
 * Registers a new user.
 * 
 * @param formData - The registration form data.
 * @param lang - The current language locale.
 * @returns An object indicating success or failure.
 */
export async function registerUser(formData: z.infer<typeof _registerSchemaBase>, lang: string = "tr") {
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
        confirmPassword: z.string(),
        terms: z.boolean().refine(val => val === true, {
            message: dict.legal.validation_terms
        }),
        marketingConsent: z.boolean().optional(),
    }).refine((data) => data.password === data.confirmPassword, {
        message: d.password_mismatch,
        path: ["confirmPassword"],
    })

    const validatedFields = registerSchema.safeParse(formData)

    if (!validatedFields.success) {
        return { success: false, message: dict.auth.register.errors.invalid_data }
    }

    const { email, password, firstName, lastName, role, phoneNumber, marketingConsent } = validatedFields.data

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
                    isMarketingConsent: marketingConsent || false,
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
        logger.error({ context: "registerUser", error }, "Registration Error")
        return { success: false, message: dict.auth.register.errors.generic }
    }
}

/**
 * Verifies a user's email address using a token.
 * 
 * @param token - The verification token.
 * @param lang - The current language locale.
 * @returns An object indicating success or failure.
 */
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
        logger.error({ context: "verifyEmail", error }, "Verification Error")
        return { success: false, message: d.error }
    }
}

/**
 * Resends the verification email (alternative action).
 * 
 * @param email - The user's email address.
 * @param lang - The current language locale.
 * @returns An object indicating success or failure.
 */
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
        logger.error({ context: "resendVerificationEmailAction", error }, "Resend Error")
        return { success: false, message: d.error }
    }
}

/**
 * Initiates the password reset flow.
 * 
 * @param email - The user's email address.
 * @param lang - The current language locale.
 * @returns An object indicating success (always true for security).
 */
export async function forgotPassword(email: string, lang: string = "tr") {
    const dict = await getDictionary(lang as Locale)

    try {
        const emailSchema = z.string().email()
        const validatedEmail = emailSchema.safeParse(email)

        if (!validatedEmail.success) {
            return { success: false, message: dict.auth.register.validation.email_invalid }
        }

        const user = await db.user.findUnique({
            where: { email },
        })

        // Security: Always return success to prevent email enumeration
        if (!user) {
            return { success: true, message: dict.auth.forgot_password.success }
        }

        // If user has no password (OAuth only), we can't reset it
        if (!user.password) {
            // Optional: Send an email saying "You use Google Login"
            return { success: true, message: dict.auth.forgot_password.success }
        }

        // Delete existing tokens
        await db.passwordResetToken.deleteMany({
            where: { email },
        })

        // Generate new token
        const token = randomBytes(32).toString("hex")
        const expires = new Date(new Date().getTime() + 60 * 60 * 1000) // 1 hour

        await db.passwordResetToken.create({
            data: {
                email,
                token,
                expires,
            },
        })

        await sendPasswordResetEmail(email, token, lang)

        return { success: true, message: dict.auth.forgot_password.success }
    } catch (error) {
        logger.error({ context: "forgotPassword", error }, "Forgot Password Error")
        return { success: false, message: dict.auth.register.errors.generic }
    }
}

/**
 * Resets the user's password using a token.
 * 
 * @param token - The reset token.
 * @param newPassword - The new password.
 * @param lang - The current language locale.
 * @returns An object indicating success or failure.
 */
export async function resetPassword(token: string, newPassword: string, lang: string = "tr") {
    const dict = await getDictionary(lang as Locale)
    const d = dict.auth.register.validation

    try {
        const passwordSchema = z.string()
            .min(8, d.password_min)
            .regex(/[A-Z]/, d.password_regex)
            .regex(/[a-z]/, d.password_regex)
            .regex(/[0-9]/, d.password_regex)
            .regex(/[^A-Za-z0-9]/, d.password_regex)

        const validatedPassword = passwordSchema.safeParse(newPassword)

        if (!validatedPassword.success) {
            return { success: false, message: validatedPassword.error.issues[0].message }
        }

        const existingToken = await db.passwordResetToken.findUnique({
            where: { token },
        })

        if (!existingToken) {
            return { success: false, message: dict.auth.reset_password.invalid_token }
        }

        const hasExpired = new Date() > existingToken.expires
        if (hasExpired) {
            return { success: false, message: dict.auth.reset_password.expired_token }
        }

        const existingUser = await db.user.findUnique({
            where: { email: existingToken.email },
        })

        if (!existingUser) {
            return { success: false, message: dict.auth.reset_password.user_not_found }
        }

        // Check if new password is same as old password
        if (existingUser.password) {
            const isSamePassword = await bcrypt.compare(newPassword, existingUser.password)
            if (isSamePassword) {
                return { success: false, message: dict.auth.reset_password.same_password }
            }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await db.user.update({
            where: { id: existingUser.id },
            data: { password: hashedPassword },
        })

        await db.passwordResetToken.delete({
            where: { id: existingToken.id },
        })

        return { success: true, message: dict.auth.reset_password.success }
    } catch (error) {
        logger.error({ context: "resetPassword", error }, "Reset Password Error")
        return { success: false, message: dict.auth.register.errors.generic }
    }
}

