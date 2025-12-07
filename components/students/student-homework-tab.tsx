"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import type { Dictionary } from "@/types/i18n";
import {
  type Homework,
  type HomeworkTracking,
  type Lesson,
} from "@prisma/client";

type HomeworkWithTracking = HomeworkTracking & {
  homework: Homework & {
    lesson: Lesson;
  };
};

interface StudentHomeworkTabProps {
  homeworks: HomeworkWithTracking[];
  dictionary: Dictionary;
  lang: string;
}

export function StudentHomeworkTab({
  homeworks,
  dictionary,
  lang,
}: StudentHomeworkTabProps) {
  const dateLocale = lang === "tr" ? tr : enUS;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{dictionary.student_detail.homework.title}</CardTitle>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          {dictionary.student_detail.homework.assign_homework}
        </Button>
      </CardHeader>
      <CardContent>
        {homeworks.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            {dictionary.student_detail.homework.no_homework}
          </div>
        ) : (
          <Table>
            <TableCaption>
              {dictionary.student_detail.homework.title}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {dictionary.student_detail.homework.table.due_date}
                </TableHead>
                <TableHead>
                  {dictionary.student_detail.homework.table.title}
                </TableHead>
                <TableHead>
                  {dictionary.student_detail.homework.table.status}
                </TableHead>
                <TableHead>
                  {dictionary.student_detail.homework.table.lesson}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {homeworks.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {format(new Date(item.homework.dueDate), "PPP", {
                      locale: dateLocale,
                    })}
                  </TableCell>
                  <TableCell>{item.homework.title}</TableCell>
                  <TableCell>
                    {item.status === "PENDING" ? (
                      <Badge
                        variant="outline"
                        className="border-yellow-200 bg-yellow-50 text-yellow-700"
                      >
                        {dictionary.student_detail.homework.status.pending}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-green-200 bg-green-50 text-green-700"
                      >
                        {dictionary.student_detail.homework.status.completed}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {item.homework.lesson.title}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
