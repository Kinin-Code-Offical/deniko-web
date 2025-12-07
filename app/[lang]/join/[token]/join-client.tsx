"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { claimStudentProfile } from "@/app/actions/student";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Dictionary } from "@/types/i18n";
import type { StudentProfile, User } from "@prisma/client";

interface InviteDetails {
  id: string;
  tempFirstName: string | null;
  tempLastName: string | null;
  studentNo: string | null;
  gradeLevel: string | null;
  parentName: string | null;
  parentPhone: string | null;
  inviteTokenExpires: Date | null;
  isClaimed: boolean;
  teacherName: string;
}

type UserWithProfile = User & {
  studentProfile: StudentProfile | null;
};

interface JoinClientProps {
  dict: Dictionary;
  inviteDetails: InviteDetails;
  userProfile: UserWithProfile | null;
  token: string;
}

export default function JoinClient({
  dict,
  inviteDetails,
  userProfile,
  token,
}: JoinClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [preferences, setPreferences] = useState({
    useTeacherGrade: true,
    useTeacherParentInfo: true,
    useTeacherClassroom: true,
  });

  const handleClaim = async () => {
    setLoading(true);
    try {
      const res = await claimStudentProfile(token, preferences);
      if (res.success) {
        toast.success(dict.dashboard.join.success);
        router.push("/dashboard");
      } else {
        toast.error(res.error || dict.dashboard.join.error);
      }
    } catch {
      toast.error(dict.dashboard.join.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl dark:border-slate-800 dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="dark:text-white">
          {dict.dashboard.join.title}
        </CardTitle>
        <CardDescription className="dark:text-slate-400">
          {dict.dashboard.join.desc} ({inviteDetails.teacherName})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Grade / Student No Comparison */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h4 className="text-muted-foreground font-medium dark:text-slate-400">
              {dict.dashboard.join.teacher_data}
            </h4>
            <div className="rounded-md border p-3 text-sm dark:border-slate-700 dark:text-slate-300">
              <p>
                <span className="font-semibold">
                  {dict.dashboard.join.conflict_grade}:
                </span>{" "}
                {inviteDetails.gradeLevel || "-"} /{" "}
                {inviteDetails.studentNo || "-"}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-muted-foreground font-medium dark:text-slate-400">
              {dict.dashboard.join.your_data}
            </h4>
            <div className="rounded-md border p-3 text-sm dark:border-slate-700 dark:text-slate-300">
              <p>
                <span className="font-semibold">
                  {dict.dashboard.join.conflict_grade}:
                </span>{" "}
                {userProfile?.studentProfile?.gradeLevel || "-"} /{" "}
                {userProfile?.studentProfile?.studentNo || "-"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="useTeacherGrade"
            checked={preferences.useTeacherGrade}
            onCheckedChange={(checked) =>
              setPreferences((prev) => ({
                ...prev,
                useTeacherGrade: checked as boolean,
              }))
            }
            className="dark:border-slate-600 dark:data-[state=checked]:border-blue-600 dark:data-[state=checked]:bg-blue-600"
          />
          <Label htmlFor="useTeacherGrade" className="dark:text-slate-300">
            {dict.dashboard.join.keep_teacher_data}
          </Label>
        </div>

        <div className="my-4 border-t dark:border-slate-800" />

        {/* Parent Info Comparison */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h4 className="text-muted-foreground font-medium dark:text-slate-400">
              {dict.dashboard.join.teacher_data}
            </h4>
            <div className="rounded-md border p-3 text-sm dark:border-slate-700 dark:text-slate-300">
              <p>{inviteDetails.parentName || "-"}</p>
              <p>{inviteDetails.parentPhone || "-"}</p>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-muted-foreground font-medium dark:text-slate-400">
              {dict.dashboard.join.your_data}
            </h4>
            <div className="rounded-md border p-3 text-sm dark:border-slate-700 dark:text-slate-300">
              <p>{userProfile?.studentProfile?.parentName || "-"}</p>
              <p>{userProfile?.studentProfile?.parentPhone || "-"}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="useTeacherParentInfo"
            checked={preferences.useTeacherParentInfo}
            onCheckedChange={(checked) =>
              setPreferences((prev) => ({
                ...prev,
                useTeacherParentInfo: checked as boolean,
              }))
            }
            className="dark:border-slate-600 dark:data-[state=checked]:border-blue-600 dark:data-[state=checked]:bg-blue-600"
          />
          <Label htmlFor="useTeacherParentInfo" className="dark:text-slate-300">
            {dict.dashboard.join.keep_teacher_data}
          </Label>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          {dict.dashboard.join.reject}
        </Button>
        <Button
          onClick={handleClaim}
          disabled={loading}
          className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
        >
          {loading ? "..." : dict.dashboard.join.accept_merge}
        </Button>
      </CardFooter>
    </Card>
  );
}
