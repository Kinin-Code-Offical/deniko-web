"use client";

import { useState, useTransition } from "react";
import { updateStudentRelation } from "@/app/actions/student";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/types/i18n";

interface StudentNotesProps {
  studentId: string;
  initialNotes?: string | null;
  dictionary: Dictionary;
  lang: string;
}

export function StudentNotes({
  studentId,
  initialNotes,
  dictionary,
  lang,
}: StudentNotesProps) {
  const [notes, setNotes] = useState(initialNotes || "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateStudentRelation(studentId, {
        privateNotes: notes,
      });

      if (result.success) {
        toast.success(
          dictionary.common?.saved || (lang === "tr" ? "Kaydedildi" : "Saved")
        );
        router.refresh();
      } else {
        toast.error(
          result.error || (lang === "tr" ? "Hata oluştu" : "An error occurred")
        );
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>
          {dictionary.student_detail.overview?.private_notes ||
            (lang === "tr" ? "Özel Notlar" : "Private Notes")}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          disabled={isPending || notes === (initialNotes || "")}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            dictionary.common?.save || (lang === "tr" ? "Kaydet" : "Save")
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={
            dictionary.student_detail.overview?.private_notes_placeholder ||
            (lang === "tr"
              ? "Öğrenci hakkında özel notlar..."
              : "Private notes about the student...")
          }
          className="min-h-[150px] resize-none"
        />
      </CardContent>
    </Card>
  );
}
