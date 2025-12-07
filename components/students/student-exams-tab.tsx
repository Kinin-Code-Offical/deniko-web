"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import type { Dictionary } from "@/types/i18n";

interface StudentExamsTabProps {
  dictionary: Dictionary;
  lang: string;
}

export function StudentExamsTab({ dictionary, lang }: StudentExamsTabProps) {
  // Mock data - normally this would come from the relation or a separate fetch
  const exams = [
    /*
        {
            id: "1",
            title: "Matematik 1. Yazılı",
            date: "2024-04-15",
            score: 85,
            totalScore: 100,
            status: "COMPLETED"
        }
        */
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {dictionary.student_detail.tabs.exams ||
              (lang === "tr" ? "Sınavlar" : "Exams")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {exams.length > 0 ? (
            <div className="space-y-4">{/* Exam list would go here */}</div>
          ) : (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
              <FileText className="mb-4 h-12 w-12 opacity-20" />
              <p>
                {dictionary.student_detail.exams?.no_exams ||
                  (lang === "tr"
                    ? "Henüz sınav kaydı bulunmuyor."
                    : "No exams recorded yet.")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
