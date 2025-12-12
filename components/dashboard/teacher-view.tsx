"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  BookCheck,
  UserPlus,
  ArrowRight,
  Clock,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { format } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import Link from "next/link";
import type { Dictionary } from "@/types/i18n";
import { type Lesson, type StudentProfile, type User } from "@prisma/client";
import { cn } from "@/lib/utils";

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

const StatCard = ({
  title,
  value,
  icon: Icon,
  colorClass,
}: {
  title: string;
  value: number | string;
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
    </CardContent>
  </Card>
);

export function TeacherView({
  dictionary,
  lang,
  stats,
  schedule,
}: TeacherViewProps) {
  const dateLocale = lang === "tr" ? tr : enUS;

  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title={dictionary.dashboard.teacher.active_students}
          value={stats.activeStudentsCount}
          icon={Users}
          colorClass="bg-blue-500"
        />
        <StatCard
          title={dictionary.dashboard.teacher.today_lessons_count}
          value={stats.todayLessonsCount}
          icon={Calendar}
          colorClass="bg-purple-500"
        />
        <StatCard
          title={dictionary.dashboard.teacher.pending_homework_count}
          value={stats.pendingHomeworkCount}
          icon={BookCheck}
          colorClass="bg-amber-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Schedule */}
        <Card className="col-span-1 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                {dictionary.dashboard.overview.upcoming_lessons}
              </CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {format(new Date(), "EEEE, d MMMM", { locale: dateLocale })}
              </p>
            </div>
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
            {schedule.length > 0 ? (
              <div className="space-y-4">
                {schedule.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/50 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-50">
                          {lesson.students
                            .map((s) => s.user?.name || "Student")
                            .join(", ")}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {format(new Date(lesson.startTime), "HH:mm")} -{" "}
                          {format(new Date(lesson.endTime), "HH:mm")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        {lesson.title || "Lesson"}
                      </span>
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
                  {dictionary.dashboard.teacher.no_lessons_today}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {dictionary.dashboard.teacher.check_schedule_desc}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tasks / Quick Actions */}
        <Card className="col-span-1 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {dictionary.dashboard.overview.recent_activity}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Mock Tasks */}
              <div className="flex items-start gap-4 rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                <div className="mt-0.5">
                  <CheckCircle2 className="h-5 w-5 text-slate-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                    {dictionary.dashboard.teacher.mock_task_1}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {dictionary.dashboard.teacher.mock_task_1_sub}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  {dictionary.dashboard.teacher.review}
                </Button>
              </div>

              <div className="flex items-start gap-4 rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                <div className="mt-0.5">
                  <UserPlus className="h-5 w-5 text-slate-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                    {dictionary.dashboard.teacher.mock_task_2}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {dictionary.dashboard.teacher.mock_task_2_sub}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  {dictionary.dashboard.teacher.view}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
