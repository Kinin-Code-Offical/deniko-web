import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/shell"
import { getDictionary } from "@/lib/get-dictionary"
import { Locale } from "@/i18n-config"

export default async function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dictionary = await getDictionary(lang as Locale) as any
    const session = await auth()

    if (!session?.user?.id) {
        redirect(`/${lang}/login`)
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: {
            teacherProfile: true,
            studentProfile: true,
        },
    })

    if (!user) {
        redirect(`/${lang}/login`)
    }

    // Enforce Onboarding Completion
    if (!user.isOnboardingCompleted) {
        redirect(`/${lang}/onboarding`)
    }

    return (
        <DashboardShell user={user} dictionary={dictionary} lang={lang}>
            {children}
        </DashboardShell>
    )
}
