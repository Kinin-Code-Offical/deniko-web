import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { TeacherView } from "@/components/dashboard/teacher-view"
import { StudentView } from "@/components/dashboard/student-view"
import { getDictionary } from "@/lib/get-dictionary"
import { Locale } from "@/i18n-config"

export default async function DashboardPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params
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

    if (user.role === "TEACHER") {
        return <TeacherView user={user} dictionary={dictionary} />
    }

    if (user.role === "STUDENT") {
        return <StudentView user={user} dictionary={dictionary} />
    }

    return null
}
