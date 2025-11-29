import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { OnboardingForm } from "@/components/auth/onboarding-form"
import { getDictionary } from "@/lib/get-dictionary"
import { jwtVerify } from "jose"

export default async function OnboardingPage({
    params,
    searchParams
}: {
    params: Promise<{ lang: string }>,
    searchParams: Promise<{ token?: string }>
}) {
    const { lang } = await params
    const { token } = await searchParams
    const dictionary = await getDictionary(lang as any)

    let user: any = null
    let session = null

    if (token) {
        try {
            const secret = new TextEncoder().encode(process.env.AUTH_SECRET)
            const { payload } = await jwtVerify(token, secret)
            user = {
                firstName: (payload.name as string)?.split(" ")[0],
                lastName: (payload.name as string)?.split(" ").slice(1).join(" "),
                email: payload.email as string,
                image: payload.image as string,
            }
        } catch (e) {
            redirect(`/${lang}/login`)
        }
    } else {
        session = await auth()
        if (!session?.user?.id) {
            redirect(`/${lang}/login`)
        }

        const dbUser = await db.user.findUnique({
            where: { id: session.user.id },
            include: {
                teacherProfile: true,
                studentProfile: true,
            },
        })

        // If user is in session but not in DB, redirect to login to restart flow
        // This handles the edge case where middleware dropped the token but session was somehow established
        // or if the user was deleted from DB but has a valid session cookie.
        if (!dbUser) {
            // Optionally sign out? But we can't do that easily in server component.
            // Redirecting to login might just loop if session persists.
            // But since our signIn callback prevents login for new users, this state should be rare.
            // If we are here, it means auth() returned a session.
            // Let's allow them to see the form, but completeOnboarding will fail if we don't handle it.
            // Actually, if dbUser is null, we can't pre-fill much.
            // Let's redirect to login with error.
            redirect(`/${lang}/login?error=SessionMismatch`)
        }

        // Critical Check: If profile exists, redirect to dashboard
        if (dbUser?.teacherProfile || dbUser?.studentProfile) {
            redirect(`/${lang}/dashboard`)
        }

        user = {
            firstName: dbUser?.firstName || session.user.name?.split(" ")[0],
            lastName: dbUser?.lastName || session.user.name?.split(" ").slice(1).join(" "),
            email: dbUser?.email,
            image: dbUser?.image
        }
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
                        {dictionary.auth.onboarding.title}
                    </h2>
                    <p className="text-blue-100 text-lg max-w-sm">
                        {dictionary.auth.onboarding.subtitle}
                    </p>
                </div>

                {/* Footer Tagline */}
                <div className="relative z-10 text-blue-200 text-sm">
                    © 2025 Deniko Education Platform
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
                <OnboardingForm
                    dictionary={dictionary}
                    user={user}
                    token={token}
                />
            </div>
        </div>
    )
}