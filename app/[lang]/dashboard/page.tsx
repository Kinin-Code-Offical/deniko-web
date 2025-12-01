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

    if (user.role === "TEACHER" && user.teacherProfile) {
        const activeStudents = await db.studentTeacherRelation.count({
            where: {
                teacherId: user.teacherProfile.id,
                status: 'ACTIVE'
            }
        })

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todayLessonCount = await db.lesson.count({
            where: {
                teacherId: user.teacherProfile.id,
                startTime: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                status: {
                    not: 'CANCELLED'
                }
            }
        })

        const pendingHomeworkCount = await db.homeworkTracking.count({
            where: {
                homework: {
                    lesson: {
                        teacherId: user.teacherProfile.id
                    }
                },
                status: 'SUBMITTED'
            }
        })

        const todayLessons = await db.lesson.findMany({
            where: {
                teacherId: user.teacherProfile.id,
                startTime: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                status: {
                    not: 'CANCELLED'
                }
            },
            take: 3,
            orderBy: {
                startTime: 'asc'
            },
            include: {
                students: {
                    include: {
                        user: true
                    }
                },
                classroom: true
            }
        })

        return <TeacherView
            user={user}
            dictionary={dictionary}
            stats={{
                activeStudents,
                todayLessonCount,
                pendingHomeworkCount
            }}
            upcomingLessons={todayLessons}
        />
    }

    if (user.role === "STUDENT" && user.studentProfile) {
        const completedLessons = await db.lesson.count({
            where: {
                students: {
                    some: {
                        id: user.studentProfile.id
                    }
                },
                status: 'COMPLETED'
            }
        })

        const upcomingLessons = await db.lesson.findMany({
            where: {
                students: {
                    some: {
                        id: user.studentProfile.id
                    }
                },
                startTime: {
                    gte: new Date()
                }
            },
            take: 5,
            orderBy: {
                startTime: 'asc'
            }
        })

        const pendingHomework = await db.homeworkTracking.count({
            where: {
                studentId: user.studentProfile.id,
                status: 'PENDING'
            }
        })

        return <StudentView
            user={user}
            dictionary={dictionary}
            stats={{
                completedLessons,
                pendingHomework
            }}
            upcomingLessons={upcomingLessons}
        />
    }

    return null
}
