import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { TeacherView } from "@/components/dashboard/teacher-view"
import { StudentView } from "@/components/dashboard/student-view"
import { getDictionary } from "@/lib/get-dictionary"
import { Locale } from "@/i18n-config"

export default async function DashboardPage({ params }: { params: Promise<{ lang: string }> }) {
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

    // Role Dispatch
    if (user.role === "TEACHER") {
        if (!user.teacherProfile) {
            // Data inconsistency: Teacher role but no profile
            redirect(`/${lang}/onboarding`)
        }

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
            lang={lang}
            stats={{
                activeStudents,
                todayLessonCount,
                pendingHomeworkCount
            }}
            upcomingLessons={todayLessons}
        />
    }

    if (user.role === "STUDENT") {
        if (!user.studentProfile) {
            // Data inconsistency: Student role but no profile
            redirect(`/${lang}/onboarding`)
        }

        const completedLessons = await db.attendance.count({
            where: {
                studentId: user.studentProfile.id,
                status: 'PRESENT'
            }
        })

        const pendingHomework = await db.homeworkTracking.count({
            where: {
                studentId: user.studentProfile.id,
                status: 'PENDING'
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
                teacher: {
                    include: {
                        user: true
                    }
                },
                classroom: true
            }
        })

        return <StudentView
            user={user}
            dictionary={dictionary}
            lang={lang}
            stats={{
                completedLessons,
                pendingHomework
            }}
            upcomingLessons={upcomingLessons}
        />
    }

    // Fallback for other roles or no role
    return (
        <div className="flex flex-col items-center justify-center h-[50vh]">
            <h1 className="text-2xl font-bold">Welcome to Deniko</h1>
            <p className="text-muted-foreground">Please contact support if you see this screen.</p>
        </div>
    )
}
