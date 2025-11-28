import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { RoleSelector } from "./role-selector"

export default async function OnboardingPage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect("/login")
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: {
            teacherProfile: true,
            studentProfile: true,
        },
    })

    // Critical Check: If profile exists, redirect to dashboard
    if (user?.teacherProfile || user?.studentProfile) {
        redirect("/dashboard")
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
            <div className="text-center mb-10 space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">
                    Deniko'ya Hoş Geldiniz!
                </h1>
                <p className="text-lg text-slate-600">
                    Devam etmek için lütfen rolünüzü seçin.
                </p>
            </div>

            <RoleSelector />
        </div>
    )
}
