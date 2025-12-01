"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, BookCheck, Plus, UserPlus, FileText } from "lucide-react"
import { format } from "date-fns"
import { tr, enUS } from "date-fns/locale"
import Link from "next/link"

interface TeacherViewProps {
    user: any
    dictionary: any
    stats: {
        activeStudents: number
        todayLessonCount: number
        pendingHomeworkCount: number
    }
    upcomingLessons: any[]
}

export function TeacherView({ user, dictionary, stats, upcomingLessons }: TeacherViewProps) {
    const dateLocale = dictionary.lang === "tr" ? tr : enUS

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">
                    {dictionary.dashboard.teacher.welcome} {user.name}
                </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {dictionary.dashboard.teacher.active_students}
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeStudents}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {dictionary.dashboard.teacher.today_lessons_count}
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.todayLessonCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {dictionary.dashboard.teacher.pending_homework_count}
                        </CardTitle>
                        <BookCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingHomeworkCount}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>{dictionary.dashboard.teacher.upcoming_lessons}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {upcomingLessons.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                    <p className="text-muted-foreground">
                                        {dictionary.dashboard.teacher.no_lessons_today}
                                    </p>
                                </div>
                            ) : (
                                upcomingLessons.map((lesson) => (
                                    <div key={lesson.id} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="ml-4 space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {lesson.title || lesson.students[0]?.user?.name || "Lesson"}
                                                </p>
                                                <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                                                    {format(new Date(lesson.startTime), "p", { locale: dateLocale })} - {format(new Date(lesson.endTime), "p", { locale: dateLocale })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="font-medium hidden md:block">
                                                {lesson.students.map((s: any) => s.user?.name || s.tempFirstName).join(", ")}
                                            </div>
                                            <Button size="sm" variant="secondary">
                                                {dictionary.dashboard.teacher.take_attendance}
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>{dictionary.dashboard.teacher.quick_actions.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Button asChild className="w-full justify-start" variant="outline">
                            <Link href={`/${dictionary.lang}/dashboard/students`}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                {dictionary.dashboard.teacher.quick_actions.add_student}
                            </Link>
                        </Button>
                        <Button asChild className="w-full justify-start" variant="outline">
                            <Link href={`/${dictionary.lang}/dashboard/schedule`}>
                                <Plus className="mr-2 h-4 w-4" />
                                {dictionary.dashboard.teacher.quick_actions.add_lesson}
                            </Link>
                        </Button>
                        <Button asChild className="w-full justify-start" variant="outline">
                            <Link href={`/${dictionary.lang}/dashboard/homework`}>
                                <FileText className="mr-2 h-4 w-4" />
                                {dictionary.dashboard.teacher.quick_actions.create_homework}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
