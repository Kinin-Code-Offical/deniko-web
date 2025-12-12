"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Clock,
  FileText,
  Calendar,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { format } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import Link from "next/link";
import type { Dictionary } from "@/types/i18n";
import {
  type Lesson,
  type Homework,
  type User,
  type HomeworkTracking,
  type TeacherProfile,
} from "@prisma/client";
import { cn } from "@/lib/utils";

type LessonWithDetails = Lesson & {
  teacher: (TeacherProfile & { user: User }) | null;
  classroom: unknown;
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

const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  colorClass,
}: {
  title: string;
  value: number | string;
  subtext?: string;
  icon: LucideIcon;
  colorClass: string;
}) => (
  <Card className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-[0_8px_30px_rgba(15,23,42,0.3)]">
    <div
      className={cn(
        "absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-10 blur-2xl",
        colorClass
      )}
    />
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
        {title}
      </CardTitle>
      <Icon className={cn("h-4 w-4", colorClass.replace("bg-", "text-"))} />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">
        {value}
      </div>
      {subtext && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {subtext}
        </p>
      )}
    </CardContent>
  </Card>
);

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
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title={dictionary.dashboard.student.next_lesson}
          value={
            nextLesson ? format(new Date(nextLesson.startTime), "HH:mm") : "-"
          }
          subtext={
            nextLesson
              ? format(new Date(nextLesson.startTime), "EEEE, d MMMM", {
                  locale: dateLocale,
                })
              : dictionary.dashboard.student.no_upcoming_lessons
          }
          icon={Clock}
          colorClass="bg-blue-500"
        />
        <StatCard
          title={dictionary.dashboard.student.completed_lessons}
          value={stats.completedLessons}
          icon={GraduationCap}
          colorClass="bg-purple-500"
        />
        <StatCard
          title={dictionary.dashboard.student.assignments_todo}
          value={stats.homeworkCount}
          icon={FileText}
          colorClass="bg-amber-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Lessons */}
        <Card className="col-span-1 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {dictionary.dashboard.overview.upcoming_lessons}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-full"
              asChild
            >
              <Link href={`/${lang}/dashboard/schedule`}>
                {dictionary.dashboard.nav.schedule}
                <ArrowRight className="ml-2 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingLessons.length > 0 ? (
              <div className="space-y-4">
                {upcomingLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/50 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-50">
                          {lesson.title || "Lesson"}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {lesson.teacher?.user.name || "Teacher"} •{" "}
                          {format(new Date(lesson.startTime), "EEEE HH:mm", {
                            locale: dateLocale,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <Calendar className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="mt-4 text-sm font-medium text-slate-900 dark:text-slate-50">
                  {dictionary.dashboard.student.no_upcoming_lessons}
                </h3>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Homework */}
        <Card className="col-span-1 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {dictionary.dashboard.student.assignments_todo}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-full"
              asChild
            >
              <Link href={`/${lang}/dashboard/homework`}>
                {dictionary.dashboard.student.view_all}
                <ArrowRight className="ml-2 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {pendingHomeworks.length > 0 ? (
              <div className="space-y-4">
                {pendingHomeworks.map((hw) => (
                  <div
                    key={hw.id}
                    className="flex items-start gap-4 rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/50 dark:hover:bg-slate-800/50"
                  >
                    <div className="mt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                        {hw.homework.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {dictionary.dashboard.student.due}{" "}
                        {format(new Date(hw.homework.dueDate), "PPP", {
                          locale: dateLocale,
                        })}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                      {dictionary.dashboard.student.start}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="mt-4 text-sm font-medium text-slate-900 dark:text-slate-50">
                  {dictionary.dashboard.student.all_caught_up}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {dictionary.dashboard.student.no_pending_homework}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
