"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, BookCheck, UserPlus, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import Link from "next/link";
import type { Dictionary } from "@/types/i18n";
import { type Lesson, type StudentProfile, type User } from "@prisma/client";

type LessonWithStudents = Lesson & {
  students: (StudentProfile & { user: User | null })[];
};

interface TeacherViewProps {
  dictionary: Dictionary;
  lang: string;
  stats: {
    activeStudentsCount: number;
    todayLessonsCount: number;
    pendingHomeworkCount: number;
  };

  schedule: LessonWithStudents[];
}

export function TeacherView({
  dictionary,
  lang,
  stats,
  schedule,
}: TeacherViewProps) {
  const dateLocale = lang === "tr" ? tr : enUS;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dictionary.dashboard.teacher.active_students}
            </CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeStudentsCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dictionary.dashboard.teacher.today_lessons_count}
            </CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayLessonsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dictionary.dashboard.teacher.pending_homework_count}
            </CardTitle>
            <BookCheck className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.pendingHomeworkCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>
              {dictionary.dashboard.teacher.upcoming_lessons}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {schedule.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="text-muted-foreground/50 mb-4 h-12 w-12" />
                  <p className="text-muted-foreground">
                    {dictionary.dashboard.teacher.no_lessons_today}
                  </p>
                </div>
              ) : (
                schedule.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="ml-4 space-y-1">
                        <p className="text-sm leading-none font-medium">
                          {lesson.title ||
                            lesson.students[0]?.user?.name ||
                            "Lesson"}
                        </p>
                        <p
                          className="text-muted-foreground text-sm"
                          suppressHydrationWarning
                        >
                          {format(new Date(lesson.startTime), "p", {
                            locale: dateLocale,
                          })}{" "}
                          -{" "}
                          {format(new Date(lesson.endTime), "p", {
                            locale: dateLocale,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden font-medium md:block">
                        {lesson.students
                          .map((s) => s.user?.name || s.tempFirstName)
                          .join(", ")}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>
              {dictionary.dashboard.teacher.quick_actions.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link href={`/${lang}/dashboard/students`}>
              <Button className="w-full justify-start" variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                {dictionary.dashboard.teacher.quick_actions.add_student}
              </Button>
            </Link>
            <Link href={`/${lang}/dashboard/schedule`}>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                {dictionary.dashboard.teacher.quick_actions.add_lesson}
              </Button>
            </Link>
            <Link href={`/${lang}/dashboard/finance`}>
              <Button className="w-full justify-start" variant="outline">
                <CreditCard className="mr-2 h-4 w-4" />
                {dictionary.dashboard.teacher.quick_actions.receive_payment}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
