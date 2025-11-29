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
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Left Panel - Visual & Brand */}
            <div className="hidden md:flex w-1/2 bg-blue-600 p-12 flex-col justify-between relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                    </svg>
                </div>

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-2 text-white">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-8 w-8"
                        >
                            <path d="M22 10v6M2 10v6" />
                            <path d="M2 10l10-5 10 5-10 5z" />
                            <path d="M6 12v5c3 3 9 3 12 0v-5" />
                        </svg>
                    </div>
                    <span className="text-2xl font-bold tracking-tight">Deniko</span>
                </div>

                {/* Center Illustration / Content */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-blue-500/50 rounded-full blur-2xl"></div>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-64 w-64 text-white relative z-10"
                        >
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                            <path d="M8 7h6" />
                            <path d="M8 11h8" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white max-w-md leading-tight">
                        Eğitimde Yeni Nesil Yönetim ve Takip Sistemi
                    </h2>
                    <p className="text-blue-100 text-lg max-w-sm">
                        Öğretmen ve öğrencileri tek bir platformda buluşturuyoruz.
                    </p>
                </div>

                {/* Footer Tagline */}
                <div className="relative z-10 text-blue-200 text-sm">
                    © 2025 Deniko Education Platform
                </div>
            </div>

            {/* Right Panel - Action */}
            <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center p-8 md:p-12 overflow-y-auto">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center space-y-2">
                        <div className="md:hidden flex justify-center mb-4">
                            <img src="/logo.png" alt="Deniko Logo" className="h-12 w-auto" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            Merhaba! 👋
                        </h1>
                        <p className="text-slate-500 text-lg">
                            Devam etmeden önce lütfen rolünüzü seçin.
                        </p>
                    </div>

                    <RoleSelector />
                </div>
            </div>
        </div>
    )
}