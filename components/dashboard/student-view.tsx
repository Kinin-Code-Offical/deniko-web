"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import type { Dictionary } from "@/types/i18n";
import {
  type Lesson,
  type Homework,
  type User,
  type HomeworkTracking,
  type TeacherProfile,
} from "@prisma/client";

type LessonWithDetails = Lesson & {
  teacher: (TeacherProfile & { user: User }) | null;
  classroom: any;
};

type HomeworkWithDetails = HomeworkTracking & {
  homework: Homework & {
    lesson: Lesson;
  };
};

interface StudentViewProps {
  dictionary: Dictionary;
  lang: string;
  stats: {
    completedLessons: number;
    homeworkCount: number;
  };
  nextLesson: LessonWithDetails | null;
  upcomingLessons: LessonWithDetails[];
  pendingHomeworks: HomeworkWithDetails[];
}

export function StudentView({
  dictionary,
  lang,
  stats,
  nextLesson,
  upcomingLessons,
  pendingHomeworks,
}: StudentViewProps) {
  const dateLocale = lang === "tr" ? tr : enUS;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dictionary.dashboard.student.next_lesson}
            </CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {nextLesson
                ? format(new Date(nextLesson.startTime), "p", {
                    locale: dateLocale,
                  })
                : "-"}
            </div>
            {nextLesson && (
              <p className="text-muted-foreground mt-1 text-xs">
                {format(new Date(nextLesson.startTime), "PPP", {
                  locale: dateLocale,
                })}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dictionary.dashboard.student.completed_lessons}
            </CardTitle>
            <BookOpen className="text-muted-foreground h-4 w-4" />
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
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.homeworkCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>
              {dictionary.dashboard.student.weekly_schedule}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {upcomingLessons.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  {dictionary.dashboard.student.no_upcoming_lessons}
                </p>
              ) : (
                upcomingLessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center">
                    <Calendar className="text-muted-foreground mr-4 h-4 w-4" />
                    <div className="ml-4 space-y-1">
                      <p className="text-sm leading-none font-medium">
                        {lesson.title || "Lesson"}
                      </p>
                      <p
                        className="text-muted-foreground text-sm"
                        suppressHydrationWarning
                      >
                        {format(new Date(lesson.startTime), "PPP p", {
                          locale: dateLocale,
                        })}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {lesson.teacher?.user?.name ||
                        `${lesson.teacher?.user?.firstName} ${lesson.teacher?.user?.lastName}`}
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
              {dictionary.dashboard.student.pending_homework}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {pendingHomeworks.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No pending homework.
                </p>
              ) : (
                pendingHomeworks.map((item) => (
                  <div key={item.id} className="flex items-center">
                    <FileText className="text-muted-foreground mr-4 h-4 w-4" />
                    <div className="ml-4 space-y-1">
                      <p className="text-sm leading-none font-medium">
                        {item.homework.title}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Due:{" "}
                        {format(new Date(item.homework.dueDate), "PPP", {
                          locale: dateLocale,
                        })}
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
  );
}
