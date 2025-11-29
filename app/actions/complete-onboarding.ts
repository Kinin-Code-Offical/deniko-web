"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { jwtVerify } from "jose"

const onboardingSchema = z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    phoneNumber: z.string().regex(/^\+\d{10,15}$/),
    role: z.enum(["TEACHER", "STUDENT"]),
    password: z.string().min(8),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export async function completeOnboarding(values: z.infer<typeof onboardingSchema>, token?: string | null) {
    const validatedFields = onboardingSchema.safeParse(values)

    if (!validatedFields.success) {
        return { success: false, message: "Invalid fields" }
    }

    const { firstName, lastName, phoneNumber, role, password } = validatedFields.data

    let userId: string | undefined
    let email: string | undefined
    let googleId: string | undefined
    let isNewUser = false

    if (token) {
        try {
            const secret = new TextEncoder().encode(process.env.AUTH_SECRET)
            const { payload } = await jwtVerify(token, secret)
            email = payload.email as string
            googleId = payload.googleId as string
            isNewUser = true
        } catch (e) {
            return { success: false, message: "Invalid or expired token" }
        }
    } else {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, message: "Unauthorized" }
        }
        userId = session.user.id
    }

    try {
        await db.$transaction(async (tx) => {
            const hashedPassword = await bcrypt.hash(password, 10)

            if (isNewUser && email) {
                // Check if user already exists (e.g. double submission or race condition)
                const existingUser = await tx.user.findUnique({ where: { email } })

                if (existingUser) {
                    userId = existingUser.id
                    // Update existing user with new profile info
                    await tx.user.update({
                        where: { id: userId },
                        data: {
                            firstName,
                            lastName,
                            phoneNumber,
                            role,
                            password: hashedPassword,
                            name: `${firstName} ${lastName}`,
                            emailVerified: new Date(), // Ensure verified for Google users
                        }
                    })
                } else {
                    // Create new user
                    const user = await tx.user.create({
                        data: {
                            email,
                            firstName,
                            lastName,
                            phoneNumber,
                            role,
                            password: hashedPassword,
                            name: `${firstName} ${lastName}`,
                            emailVerified: new Date(),
                        },
                    })
                    userId = user.id
                }

                if (googleId) {
                    // Check if account exists to avoid duplicates
                    const existingAccount = await tx.account.findUnique({
                        where: {
                            provider_providerAccountId: {
                                provider: "google",
                                providerAccountId: googleId
                            }
                        }
                    })

                    if (!existingAccount) {
                        await tx.account.create({
                            data: {
                                userId: userId!,
                                type: "oauth",
                                provider: "google",
                                providerAccountId: googleId,
                            }
                        })
                    }
                }
            } else if (userId) {
                // Update existing user
                // First check if user exists in DB (handling session-but-no-db-record case)
                const existingDbUser = await tx.user.findUnique({ where: { id: userId } })

                if (existingDbUser) {
                    await tx.user.update({
                        where: { id: userId },
                        data: {
                            firstName,
                            lastName,
                            phoneNumber,
                            role,
                            password: hashedPassword,
                        },
                    })
                } else {
                    // User has session but not in DB (rare edge case or interrupted flow)
                    // We need email to create user. Try to get it from session if possible, but here we only have userId.
                    // If we can't recover, we should probably throw or return error.
                    // However, since we fixed the middleware, this path should be less likely for new Google users.
                    // But let's try to handle it gracefully if we can, or just fail with a better message.
                    throw new Error("User record not found. Please try signing up again.")
                }
            }

            if (!userId) throw new Error("User ID missing")

            // Create Profile
            if (role === "TEACHER") {
                await tx.teacherProfile.create({
                    data: {
                        userId,
                        branch: "Genel",
                    },
                })
            } else if (role === "STUDENT") {
                await tx.studentProfile.create({
                    data: {
                        userId,
                        isClaimed: true,
                    },
                })
            }
        })
    } catch (error) {
        console.error("Onboarding error:", error)
        return { success: false, message: "Something went wrong" }
    }

    revalidatePath("/")
    return { success: true }
}
