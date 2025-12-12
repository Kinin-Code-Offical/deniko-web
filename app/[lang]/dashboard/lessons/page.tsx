import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, User } from "lucide-react";

export default async function LessonsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);

  // Mock data
  const lessons = [
    {
      id: 1,
      subject: "Mathematics",
      student: "Alice Smith",
      date: "2023-10-25",
      time: "10:00 AM",
      status: "Upcoming",
    },
    {
      id: 2,
      subject: "Physics",
      student: "Bob Johnson",
      date: "2023-10-26",
      time: "02:00 PM",
      status: "Upcoming",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {dictionary.dashboard.nav.lessons}
        </h1>
        <Button>{dictionary.dashboard.lessons.schedule_lesson}</Button>
      </div>

      <div className="grid gap-4">
        {lessons.map((lesson) => (
          <Card key={lesson.id}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 rounded-full p-3">
                  <CalendarIcon className="text-primary h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{lesson.subject}</h3>
                  <div className="text-muted-foreground mt-1 flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" /> {lesson.student}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {lesson.date}{" "}
                      {dictionary.dashboard.lessons.at} {lesson.time}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {lesson.status}
                </span>
                <Button variant="outline" size="sm">
                  {dictionary.dashboard.lessons.details}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
