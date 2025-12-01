import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { getDictionary } from "@/lib/get-dictionary"
import { jwtVerify } from "jose"
import { OnboardingClientPage } from "./client-page"

export default async function OnboardingPage({
    params,
    searchParams
}: {
    params: Promise<{ lang: string }>,
    searchParams: Promise<{ token?: string }>
}) {
    const { lang } = await params
    const { token } = await searchParams
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dictionary = await getDictionary(lang as any)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

        if (!dbUser) {
            redirect(`/${lang}/login?error=SessionMismatch`)
        }

        // Critical Check: If onboarding is completed, redirect to dashboard
        if (dbUser.isOnboardingCompleted) {
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
        <OnboardingClientPage dictionary={dictionary} lang={lang} userId={session?.user?.id} />
    )
}