"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function selectRole(role: "TEACHER" | "STUDENT") {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const userId = session.user.id

    // Check if user already has a profile to prevent overwriting
    const existingUser = await db.user.findUnique({
        where: { id: userId },
        include: {
            teacherProfile: true,
            studentProfile: true,
        },
    })

    if (existingUser?.teacherProfile || existingUser?.studentProfile) {
        return redirect("/dashboard")
    }

    try {
        await db.$transaction(async (tx) => {
            // 1. Update User Role
            await tx.user.update({
                where: { id: userId },
                data: { role },
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
    } catch (error) {
        console.error("Onboarding Error:", error)
        throw new Error("Failed to create profile")
    }

    revalidatePath("/")
    redirect("/dashboard")
}
