"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Clock, FileText, Trophy, Calendar } from "lucide-react"
import { format } from "date-fns"
import { tr, enUS } from "date-fns/locale"

interface StudentViewProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dictionary: any
    lang: string
    stats: {
        completedLessons: number
        pendingHomework: number
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    upcomingLessons: any[]
}

export function StudentView({ user, dictionary, lang, stats, upcomingLessons }: StudentViewProps) {
    const dateLocale = lang === "tr" ? tr : enUS

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">
                    {dictionary.dashboard.student.welcome} {user.name}
                </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {dictionary.dashboard.student.next_lesson}
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {upcomingLessons.length > 0
                                ? format(new Date(upcomingLessons[0].startTime), "p", { locale: dateLocale })
                                : "-"}
                        </div>
                        {upcomingLessons.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(upcomingLessons[0].startTime), "PPP", { locale: dateLocale })}
                            </p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {dictionary.dashboard.student.completed_lessons}
                        </CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completedLessons}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {dictionary.dashboard.student.assignments_todo}
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingHomework}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>{dictionary.dashboard.student.weekly_schedule}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {upcomingLessons.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    {dictionary.dashboard.student.no_upcoming_lessons}
                                </p>
                            ) : (
                                upcomingLessons.map((lesson) => (
                                    <div key={lesson.id} className="flex items-center">
                                        <Calendar className="mr-4 h-4 w-4 text-muted-foreground" />
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {lesson.title || "Lesson"}
                                            </p>
                                            <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                                                {format(new Date(lesson.startTime), "PPP p", { locale: dateLocale })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
