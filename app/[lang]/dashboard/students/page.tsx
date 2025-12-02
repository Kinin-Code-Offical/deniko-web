import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { getDictionary } from "@/lib/get-dictionary"
import { Locale } from "@/i18n-config"
import { AddStudentDialog } from "@/components/students/add-student-dialog"
import { StudentTable } from "@/components/students/student-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function StudentsPage({ params }: { params: Promise<{ lang: string }> }) {
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
            teacherProfile: true
        }
    })

    if (!user || user.role !== "TEACHER" || !user.teacherProfile) {
        redirect(`/${lang}/dashboard`)
    }

    const relations = await db.studentTeacherRelation.findMany({
        where: { teacherId: user.teacherProfile.id },
        include: {
            student: {
                include: {
                    user: true,
                    classrooms: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    const classrooms = await db.classroom.findMany({
        where: { teacherId: user.teacherProfile.id },
        select: { id: true, name: true }
    })

    const students = relations.map(rel => ({
        id: rel.student.id,
        user: rel.student.user,
        tempFirstName: rel.student.tempFirstName,
        tempLastName: rel.student.tempLastName,
        relation: { customName: rel.customName },
        name: rel.customName || (rel.student.isClaimed && rel.student.user?.name
            ? rel.student.user.name
            : `${rel.student.tempFirstName || ''} ${rel.student.tempLastName || ''}`.trim()),
        email: rel.student.isClaimed ? rel.student.user?.email : null,
        status: rel.student.isClaimed ? "CLAIMED" : "SHADOW",
        studentNo: rel.student.studentNo,
        inviteToken: rel.student.inviteToken,
        isClaimed: rel.student.isClaimed,
        gradeLevel: rel.student.gradeLevel,
        classrooms: rel.student.classrooms
    }))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">
                    {dictionary.dashboard.students.title}
                </h2>
                <AddStudentDialog dictionary={dictionary} classrooms={classrooms} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{dictionary.dashboard.students.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <StudentTable data={students} dictionary={dictionary} lang={lang} />
                </CardContent>
            </Card>
        </div>
    )
}
