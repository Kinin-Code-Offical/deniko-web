import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { StudentTable } from "@/components/students/student-table"
import { AddStudentDialog } from "@/components/students/add-student-dialog"
import { getDictionary } from "@/lib/get-dictionary"
import { Locale } from "@/i18n-config"

export default async function StudentsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params
    const dictionary = await getDictionary(lang as Locale) as any
    const session = await auth()

    if (!session?.user?.id) {
        redirect(`/${lang}/login`)
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { teacherProfile: true },
    })

    if (!user?.teacherProfile) {
        // If not a teacher, redirect to dashboard (or show error)
        redirect(`/${lang}/dashboard`)
    }

    const students = await db.studentTeacherRelation.findMany({
        where: {
            teacherId: user.teacherProfile.id,
            status: "ACTIVE", // Only show active students
        },
        include: {
            student: {
                include: {
                    user: true, // To get real name if claimed
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{dictionary.dashboard.teacher.students.title}</h2>
                    <p className="text-muted-foreground">
                        {dictionary.dashboard.teacher.students.subtitle}
                    </p>
                </div>
                <AddStudentDialog dictionary={dictionary} />
            </div>

            <StudentTable data={students} dictionary={dictionary} />
        </div>
    )
}
