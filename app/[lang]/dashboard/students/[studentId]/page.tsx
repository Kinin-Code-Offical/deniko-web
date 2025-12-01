import { auth } from "@/auth"
import { getDictionary } from "@/lib/get-dictionary"
import { Locale } from "@/i18n-config"
import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentDetailHeader } from "@/components/students/student-detail-header"
import { StudentLessonsTab } from "@/components/students/student-lessons-tab"
import { StudentFinanceTab } from "@/components/students/student-finance-tab"
import { StudentHomeworkTab } from "@/components/students/student-homework-tab"
import { StudentEditForm } from "@/components/students/student-edit-form"

export default async function StudentDetailPage({
    params,
}: {
    params: Promise<{ lang: Locale; studentId: string }>
}) {
    const { lang, studentId } = await params
    const session = await auth()
    if (!session?.user?.id) redirect(`/${lang}/login`)

    const dictionary = await getDictionary(lang)

    // 1. Fetch Teacher Profile
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { teacherProfile: true },
    })

    if (!user?.teacherProfile) redirect(`/${lang}/dashboard`)

    // 2. Fetch Student Data with Security Check
    // Ensure the student is related to this teacher
    const student = await db.studentProfile.findFirst({
        where: {
            id: studentId,
            teacherRelations: {
                some: {
                    teacherId: user.teacherProfile.id
                }
            }
        },
        include: {
            user: true,
            lessons: {
                where: { teacherId: user.teacherProfile.id },
                orderBy: { startTime: 'desc' }
            },
            payments: {
                where: { teacherId: user.teacherProfile.id },
                orderBy: { date: 'desc' }
            },
            homeworkTrackings: {
                include: {
                    homework: {
                        include: { lesson: true }
                    }
                },
                orderBy: { homework: { dueDate: 'desc' } }
            }
        }
    })

    if (!student) {
        notFound()
    }

    // 3. Calculate Financials
    // Total Lesson Fees (where price is set and not paid? Or just total value?)
    // Usually Balance = (Total Lesson Prices) - (Total Payments Received)

    // Calculate total lesson value
    const totalLessonValue = student.lessons.reduce((acc, lesson) => {
        return acc + (lesson.price ? Number(lesson.price) : 0)
    }, 0)

    // Calculate total payments received
    const totalPayments = student.payments.reduce((acc, payment) => {
        return acc + Number(payment.amount)
    }, 0)

    const balance = totalPayments - totalLessonValue // Positive means student overpaid (credit), Negative means student owes money

    // Combine transactions for the Finance Tab
    // We need to merge Lessons (as debt) and Payments (as credit) into a single timeline
    const transactions = [
        ...student.lessons.map(l => ({
            id: l.id,
            date: l.startTime,
            type: "LESSON_FEE",
            description: l.title,
            amount: l.price ? Number(l.price) : 0
        })),
        ...student.payments.map(p => ({
            id: p.id,
            date: p.date,
            type: "PAYMENT",
            description: p.note || "Payment",
            amount: Number(p.amount)
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <StudentDetailHeader
                student={student}
                dictionary={dictionary}
                totalLessons={student.lessons.length}
                balance={balance}
            />

            <Tabs defaultValue="lessons" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="lessons">{dictionary.dashboard.student_detail.tabs.lessons}</TabsTrigger>
                    <TabsTrigger value="homework">{dictionary.dashboard.student_detail.tabs.homework}</TabsTrigger>
                    <TabsTrigger value="finance">{dictionary.dashboard.student_detail.tabs.finance}</TabsTrigger>
                    <TabsTrigger value="profile">{dictionary.dashboard.student_detail.tabs.profile}</TabsTrigger>
                </TabsList>

                <TabsContent value="lessons" className="space-y-4">
                    <StudentLessonsTab
                        lessons={student.lessons}
                        dictionary={dictionary}
                        lang={lang}
                    />
                </TabsContent>

                <TabsContent value="homework" className="space-y-4">
                    <StudentHomeworkTab
                        homeworks={student.homeworkTrackings}
                        dictionary={dictionary}
                        lang={lang}
                    />
                </TabsContent>

                <TabsContent value="finance" className="space-y-4">
                    <StudentFinanceTab
                        transactions={transactions}
                        dictionary={dictionary}
                        lang={lang}
                    />
                </TabsContent>

                <TabsContent value="profile" className="space-y-4">
                    <StudentEditForm
                        student={student}
                        dictionary={dictionary}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
