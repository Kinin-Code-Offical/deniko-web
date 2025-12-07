"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import type { Dictionary } from "@/types/i18n";

interface StudentAttendanceTabProps {
  dictionary: Dictionary;
  lang: string;
}

export function StudentAttendanceTab({
  dictionary,
  lang,
}: StudentAttendanceTabProps) {
  // Mock data
  const attendanceStats = {
    present: 0,
    absent: 0,
    late: 0,
    total: 0,
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dictionary.student_detail.attendance?.present ||
                (lang === "tr" ? "Katılım" : "Present")}
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats.present}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dictionary.student_detail.attendance?.absent ||
                (lang === "tr" ? "Devamsızlık" : "Absent")}
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats.absent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dictionary.student_detail.attendance?.late ||
                (lang === "tr" ? "Geç Kalma" : "Late")}
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats.late}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {dictionary.student_detail.tabs.attendance ||
              (lang === "tr" ? "Devamsızlık Geçmişi" : "Attendance History")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
            <Clock className="mb-4 h-12 w-12 opacity-20" />
            <p>
              {dictionary.student_detail.attendance?.no_records ||
                (lang === "tr"
                  ? "Henüz devamsızlık kaydı bulunmuyor."
                  : "No attendance records found.")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
