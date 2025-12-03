import { auth } from "@/auth"
import { db } from "@/lib/db"
import { getDictionary } from "@/lib/get-dictionary"
import { notFound, redirect } from "next/navigation"
import { StudentHeader } from "@/components/students/student-header"
import { StudentSettingsTab } from "@/components/students/settings-tab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface StudentPageProps {
    params: Promise<{
        lang: string
        studentId: string
    }>
}

export default async function StudentPage({ params }: StudentPageProps) {
    const { lang, studentId } = await params
    const session = await auth()
    const dictionary = await getDictionary(lang as "en" | "tr")

    if (!session?.user?.id) {
        redirect(`/${lang}/login`)
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { teacherProfile: true },
    })

    if (!user?.teacherProfile) {
        redirect(`/${lang}/onboarding`)
    }

    // Fetch Student Relation
    const relation = await db.studentTeacherRelation.findUnique({
        where: {
            teacherId_studentId: {
                teacherId: user.teacherProfile.id,
                studentId: studentId,
            },
        },
        include: {
            student: {
                include: {
                    user: true,
                    lessons: {
                        orderBy: { startTime: 'desc' },
                        take: 5,
                    },
                    payments: {
                        orderBy: { date: 'desc' },
                        take: 5,
                    },
                },
            },
        },
    })

    if (!relation || relation.status === "ARCHIVED") {
        notFound()
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
                    <Link href={`/${lang}/dashboard/students`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {dictionary.common?.back || "Geri"}
                    </Link>
                </Button>
            </div>

            <StudentHeader relation={relation} dictionary={dictionary} lang={lang} />

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
                    <TabsTrigger value="overview">{dictionary.student_detail.tabs.overview}</TabsTrigger>
                    <TabsTrigger value="lessons">{dictionary.student_detail.tabs.lessons}</TabsTrigger>
                    <TabsTrigger value="homework">{dictionary.student_detail.tabs.homework || "Homework"}</TabsTrigger>
                    <TabsTrigger value="settings">{dictionary.student_detail.tabs.settings}</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{dictionary.student_detail.overview.total_lessons}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{relation.student.lessons.length}</div>
                            </CardContent>
                        </Card>
                        {/* Add more stats here */}
                    </div>
                </TabsContent>

                <TabsContent value="lessons" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{dictionary.student_detail.lessons.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{dictionary.student_detail.lessons.empty}</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="homework" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{dictionary.student_detail.tabs.homework || "Homework"}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">No homework assigned yet.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="mt-6">
                    <StudentSettingsTab relation={relation} studentId={studentId} dictionary={dictionary} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

